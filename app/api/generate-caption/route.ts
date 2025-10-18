import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { config } from "@/lib/config"
import { validateCaptionRequest, sanitizeInput } from "@/lib/validation"
import { checkRateLimit } from "@/lib/rate-limit"
import {
  handleError,
  AuthenticationError,
  NotFoundError,
  InsufficientCreditsError,
  ValidationError,
  RateLimitError,
} from "@/lib/error-handler"

// ===== Tipos =====
interface CaptionRequest {
  businessDescription: string
  tone: string
  platform: string
  goal: string
  numVariations: number
}
interface CaptionResult {
  caption: string
  cta: string
  hashtags: string[]
}

// ===== Constantes =====
const RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses"
const MODEL = () => config.openai.models.caption
const MAX_VARIATIONS = 10
const MIN_VARIATIONS = 1

const MAX_OUTPUT_TOKENS_JSON = 420
const MAX_OUTPUT_TOKENS_TEXT = 360

// ===== Utils =====
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
const slice = (s: string, n = 280) => (s && s.length > n ? `${s.slice(0, n)}...` : s || "")
const toErr = (e: unknown) => (e instanceof Error ? e.message : (() => {
  try {
    return JSON.stringify(e)
  } catch {
    return String(e)
  }
})())

function stripCodeFences(s: string): string {
  const m = s.match(/```json\s*([\s\S]*?)```/i) || s.match(/```\s*([\s\S]*?)```/i)
  return (m ? m[1] : s).trim()
}
function normalizeQuotes(s: string): string {
  return s.replace(/[\u201C\u201D\u2033]/g, '"').replace(/[\u2018\u2019\u2032]/g, "'")
}
function removeTrailingCommas(s: string): string {
  return s.replace(/,\s*([}\]])/g, "$1")
}
function coerceSingleToDoubleQuotes(s: string): string {
  let t = s.replace(/'(\w+?)'\s*:/g, '"$1":')
  t = t.replace(/:\s*'([^']*)'/g, ': "$1"')
  return t
}
function replaceArrows(s: string): string {
  return s.replace(/\u2192/g, ":")
}

function isValidCaption(item: unknown): item is CaptionResult {
  if (!item || typeof item !== "object") return false
  const candidate = item as CaptionResult
  return (
    typeof candidate.caption === "string" && candidate.caption.trim().length > 0 &&
    typeof candidate.cta === "string" && candidate.cta.trim().length > 0 &&
    Array.isArray(candidate.hashtags) &&
    candidate.hashtags.length === 5 &&
    candidate.hashtags.every((h) => typeof h === "string" && h.trim().length > 0)
  )
}

function tryParseLoose(raw: string): unknown | undefined {
  let t = stripCodeFences(raw)
  t = normalizeQuotes(t)
  t = replaceArrows(t)
  try {
    return JSON.parse(t)
  } catch {}
  try {
    return JSON.parse(removeTrailingCommas(t))
  } catch {}
  try {
    return JSON.parse(coerceSingleToDoubleQuotes(removeTrailingCommas(t)))
  } catch {}
  return undefined
}

function extractResponsePayload(resp: any): { text?: string; json?: unknown } {
  if (typeof resp?.output_text === "string" && resp.output_text.trim()) {
    return { text: resp.output_text.trim() }
  }

  let textConcat = ""
  let firstJson: unknown
  const outs = Array.isArray(resp?.output) ? resp.output : []

  for (const o of outs) {
    const content = Array.isArray(o?.content) ? o.content : []
    for (const c of content) {
      if (typeof c?.text === "string" && c.text.trim()) textConcat += c.text
      if (!firstJson && c?.json && typeof c.json === "object") firstJson = c.json
      if (!firstJson && c?.object && typeof c.object === "object") firstJson = c.object
      if (typeof c?.output_text === "string" && c.output_text.trim()) textConcat += c.output_text
    }
  }

  if (!textConcat && !firstJson && outs.length > 0) firstJson = outs[0]
  const text = textConcat.trim() || undefined
  return { text, json: firstJson }
}

async function callOpenAI(payload: unknown, timeoutMs = 20000) {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), timeoutMs)
  try {
    const res = await fetch(RESPONSES_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openai.apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: ac.signal,
    })

    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      const err = (body as any)?.error?.message || `OpenAI HTTP ${res.status}`
      throw new Error(err)
    }
    return body
  } finally {
    clearTimeout(timer)
  }
}

function makePromptOne(desc: string, tone: string, platform: string, goal: string) {
  return (
    `Gere 1 legenda PT-BR.\n` +
    `Negócio: ${desc}\n` +
    `Tom: ${tone || "neutro/profissional"} | Plataforma: ${platform || "Instagram"} | Objetivo: ${goal || "engajamento"}\n` +
    `Formato JSON EXATO: {"caption":"(≤150 chars)","cta":"(1 linha)","hashtags":["#tag1","#tag2","#tag3","#tag4","#tag5"]}\n` +
    `Não inclua markdown. Apenas JSON.`
  )
}

const payloadJsonObj = (prompt: string) => ({
  model: MODEL(),
  instructions: "Retorne exclusivamente um JSON válido e completo.",
  input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
  max_output_tokens: MAX_OUTPUT_TOKENS_JSON,
  // Configuração oficial da Responses API para JSON estruturado.
  text: { format: { type: "json_object" as const } },
})

const payloadText = (prompt: string) => ({
  model: MODEL(),
  instructions: "Retorne exclusivamente um JSON válido e completo (sem markdown).",
  input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
  max_output_tokens: MAX_OUTPUT_TOKENS_TEXT,
  // Fallback quando o modo json_object sinaliza truncamento.
  text: { format: { type: "text" as const } },
})

async function generateOneVariation(desc: string, tone: string, platform: string, goal: string): Promise<CaptionResult> {
  const prompt = makePromptOne(desc, tone, platform, goal)

  // 1) Tenta primeiro com text.format:"json_object" para evitar parse manual.
  let ai = await callOpenAI(payloadJsonObj(prompt))
  let status: string | undefined = ai?.status
  let reason: string | undefined = ai?.incomplete_details?.reason
  let { text, json } = extractResponsePayload(ai)

  // 2) Se a API marcar truncamento/saída vazia, refaz no modo plain text.
  if (status !== "completed" && (reason === "max_output_tokens" || (!text && !json))) {
    ai = await callOpenAI(payloadText(prompt))
    status = ai?.status
    reason = ai?.incomplete_details?.reason
    const extracted = extractResponsePayload(ai)
    text = extracted.text
    json = extracted.json
  }

  // 3) Decodifica qualquer estrutura devolvida pela Responses API.
  let root: unknown = json
  if (!root && text) root = tryParseLoose(text)
  if (!root) {
    const diag = `status=${status || "?"}, reason=${reason || "?"}`
    throw new Error(`Falha ao decodificar variação (JSON inválido) — ${diag}, preview: ${slice(text || JSON.stringify(json) || "", 220)}`)
  }

  // 4) Procura objetos com o shape correto em níveis diferentes.
  let item: unknown = root
  if (root && typeof root === "object") {
    const rootObj = root as Record<string, unknown>
    if (Array.isArray((rootObj as any).results) && (rootObj as any).results.length > 0) {
      item = (rootObj as any).results[0]
    } else if (Array.isArray((rootObj as any).items) && (rootObj as any).items.length > 0) {
      item = (rootObj as any).items[0]
    }
    if (!isValidCaption(item)) {
      for (const value of Object.values(rootObj)) {
        if (isValidCaption(value)) {
          item = value
          break
        }
      }
    }
  }

  if (!isValidCaption(item)) {
    const preview = typeof root === "string" ? root : JSON.stringify(root)
    throw new Error(`Modelo não retornou campos válidos — preview: ${slice(preview, 220)}`)
  }

  const normalizedHashtags = item.hashtags.map((h) => (h.startsWith("#") ? h : `#${h.replace(/\s+/g, "")}`))

  return {
    caption: String(item.caption).trim(),
    cta: String(item.cta).trim(),
    hashtags: normalizedHashtags,
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new AuthenticationError()

    const rateLimit = checkRateLimit(`caption:${user.id}`, 10, 3_600_000)
    if (!rateLimit.allowed) throw new RateLimitError(rateLimit.resetAt)

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()
    if (userError || !userData) throw new NotFoundError("Usuário")

    const isAdmin = userData.role === "admin" || user.email === config.admin.email

    const body = (await request.json()) as CaptionRequest
    const validation = validateCaptionRequest(body)
    if (!validation.valid) throw new ValidationError(validation.error ?? "Requisição inválida")

    const tone = sanitizeInput(String(body.tone || "").trim())
    const platform = sanitizeInput(String(body.platform || "").trim())
    const businessDescription = sanitizeInput(String(body.businessDescription || "").trim())
    const goal = sanitizeInput(String(body.goal || "").trim())
    const numVariations = clamp(Number(body.numVariations || 1), MIN_VARIATIONS, MAX_VARIATIONS)

    if (!isAdmin && (userData.credits ?? 0) < 1) {
      throw new InsufficientCreditsError(1, userData.credits ?? 0)
    }

    const results: CaptionResult[] = []
    for (let i = 0; i < numVariations; i++) {
      try {
        const one = await generateOneVariation(businessDescription, tone, platform, goal)
        results.push(one)
      } catch (err) {
        console.error("Erro na geração de legenda: ", toErr(err))
        try {
          const retry = await generateOneVariation(businessDescription, tone, platform, goal)
          results.push(retry)
        } catch (retryErr) {
          console.error("Retry falhou: ", toErr(retryErr))
          if (results.length === 0) throw retryErr
          break
        }
      }
    }

    if (results.length === 0) {
      throw new Error("Não foi possível gerar nenhuma legenda (modelo retornou saída vazia ou inválida).")
    }

    const costEstimate = 0
    let creditsRemaining = userData.credits ?? 0

    if (!isAdmin) {
      const newCredits = Math.max(0, (userData.credits ?? 0) - 1)
      const { error: updateError } = await supabase
        .from("users")
        .update({ credits: newCredits })
        .eq("id", user.id)
      if (updateError) throw new Error("Erro ao processar créditos")
      creditsRemaining = newCredits
    }

    try {
      const first = results[0]
      if (first) {
        await supabase.from("posts").insert({
          user_id: user.id,
          caption: first.caption,
          hashtags: first.hashtags,
          cta: first.cta,
          tone,
          platform,
          credits_used: isAdmin ? 0 : 1,
        })
      }
    } catch (err) {
      console.error("Erro ao salvar post: ", toErr(err))
    }

    try {
      await supabase.from("usage_logs").insert({
        user_id: user.id,
        action: "generate_caption",
        credits_used: isAdmin ? 0 : 1,
        cost_usd: costEstimate,
        metadata: {
          tone,
          platform,
          goal,
          model: MODEL(),
          numVariations,
          strategy: "per-variation-calls",
        },
      })
    } catch (err) {
      console.error("Erro ao registrar uso: ", toErr(err))
    }

    return NextResponse.json({
      results,
      creditsRemaining: isAdmin ? "∞" : creditsRemaining,
      isAdmin,
      rateLimit: { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt },
    })
  } catch (error) {
    const errorResponse = handleError(error)
    return NextResponse.json(
      { error: errorResponse.message, code: errorResponse.code },
      { status: errorResponse.statusCode },
    )
  }
}
