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
const MODEL = () => config.openai.models.caption // ex.: "gpt-5-nano"
const MAX_VARIATIONS = 10
const MIN_VARIATIONS = 1

// Para Nano: saída curtíssima por variação
const MAX_OUTPUT_TOKENS_SCHEMA = 200  // schema costuma ser mais enxuto
const MAX_OUTPUT_TOKENS_TEXT   = 220  // fallback em texto simples

// ===== Utils =====
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
const slice = (s: string, n = 240) => (s && s.length > n ? s.slice(0, n) + "..." : s || "")
const toErr = (e: unknown) => (e instanceof Error ? e.message : (() => { try { return JSON.stringify(e) } catch { return String(e) } })())

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
  s = s.replace(/'(\w+?)'\s*:/g, '"$1":')
  s = s.replace(/:\s*'([^']*)'/g, ': "$1"')
  return s
}

function isValidCaption(item: any): item is CaptionResult {
  return (
    item &&
    typeof item.caption === "string" && item.caption.trim() &&
    typeof item.cta === "string" && item.cta.trim() &&
    Array.isArray(item.hashtags) &&
    item.hashtags.length >= 3 && item.hashtags.length <= 5 &&
    item.hashtags.every((h: any) => typeof h === "string" && h.trim())
  )
}

function tryParseLoose(raw: string): any | undefined {
  let t = stripCodeFences(raw)
  t = normalizeQuotes(t)
  try { return JSON.parse(t) } catch {}
  try { return JSON.parse(removeTrailingCommas(t)) } catch {}
  try { return JSON.parse(coerceSingleToDoubleQuotes(removeTrailingCommas(t))) } catch {}
  return undefined
}

// Extrai texto/JSON de formatos comuns do Responses API
function extractResponsePayload(resp: any): { text?: string; json?: any } {
  if (typeof resp?.output_text === "string" && resp.output_text.trim()) {
    return { text: resp.output_text.trim() }
  }
  let textConcat = ""
  let firstJson: any
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

async function callOpenAI(payload: any, timeoutMs = 18000) {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), timeoutMs)
  try {
    const res = await fetch(RESPONSES_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.openai.apiKey}` },
      body: JSON.stringify(payload),
      signal: ac.signal,
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error((body as any)?.error?.message || `OpenAI HTTP ${res.status}`)
    return body
  } finally {
    clearTimeout(timer)
  }
}

// ===== Prompts e payloads (1 variação por chamada) =====
function promptOne(desc: string, tone: string, platform: string, goal: string) {
  // ultra curto para não estourar tokens
  return (
    `1 legenda PT-BR. Negócio: ${desc}. Tom: ${tone || "neutro"}. Plataforma: ${platform || "Instagram"}. Objetivo: ${goal || "engajamento"}.\n` +
    `Sem explicações. Apenas o JSON final.`
  )
}

// JSON Schema mínimo (saída beeem curta)
const captionJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["caption", "cta", "hashtags"],
  properties: {
    caption: { type: "string", maxLength: 100 }, // <= 100 chars
    cta: { type: "string", maxLength: 80 },      // 1 linha curta
    hashtags: {
      type: "array",
      minItems: 3,
      maxItems: 3, // 3 para reduzir tokens
      items: { type: "string", maxLength: 20 }
    }
  }
} as const

const payloadSchema = (prompt: string) => ({
  model: MODEL(),
  instructions: "Devolva somente JSON válido que satisfaça o schema. Não explique. Não use markdown.",
  input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
  max_output_tokens: MAX_OUTPUT_TOKENS_SCHEMA,
  text: {
    format: {
      type: "json_schema",
      name: "Caption",
      schema: captionJsonSchema
    }
  }
})

const payloadText = (prompt: string) => ({
  model: MODEL(),
  instructions: `Retorne apenas: {"caption":"","cta":"","hashtags":["#a","#b","#c"]} (JSON válido).`,
  input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
  max_output_tokens: MAX_OUTPUT_TOKENS_TEXT,
  text: { format: { type: "text" as const } },
})

// Gera UMA variação com 2 tentativas (schema -> text)
async function generateOneVariation(desc: string, tone: string, platform: string, goal: string): Promise<CaptionResult> {
  const prompt = promptOne(desc, tone, platform, goal)

  // 1) Schema (curto e estrito)
  let ai = await callOpenAI(payloadSchema(prompt))
  let status: string | undefined = ai?.status
  let reason: string | undefined = ai?.incomplete_details?.reason
  let { text, json } = extractResponsePayload(ai)

  // 2) Se incompleto/truncado, força TEXT minimalista
  if (status !== "completed" && (reason === "max_output_tokens" || (!text && !json))) {
    ai = await callOpenAI(payloadText(prompt))
    status = ai?.status
    reason = ai?.incomplete_details?.reason
    const p = extractResponsePayload(ai)
    text = p.text
    json = p.json
  }

  // 3) Decodifica resultado
  let root: any = json
  if (!root && text) root = tryParseLoose(text)
  if (!root) {
    const diag = `status=${status || "?"}, reason=${reason || "?"}`
    throw new Error(`Falha ao decodificar variação (JSON inválido) — ${diag}, preview: ${slice(text || JSON.stringify(json) || "", 200)}`)
  }

  // 4) Normaliza objeto final
  let item: any = root
  if (item && typeof item === "object") {
    if (Array.isArray(item.results) && item.results.length) item = item.results[0]
    else if (Array.isArray(item.items) && item.items.length) item = item.items[0]
  }
  if (!isValidCaption(item)) {
    // tentativa superficial em campos internos
    if (root && typeof root === "object") {
      for (const v of Object.values(root)) {
        if (isValidCaption(v)) { item = v; break }
      }
    }
  }
  if (!isValidCaption(item)) {
    const preview = typeof root === "string" ? root : JSON.stringify(root)
    throw new Error(`Modelo não retornou campos válidos — preview: ${slice(preview, 200)}`)
  }

  // força "#"
  const hashtags = item.hashtags.map((h: string) => (h.startsWith("#") ? h : `#${h.replace(/\s+/g, "")}`))

  return {
    caption: String(item.caption).trim(),
    cta: String(item.cta).trim(),
    hashtags,
  }
}

// ===== Handler principal =====
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new AuthenticationError()

    // rate limit
    const rateLimit = checkRateLimit(`caption:${user.id}`, 10, 3_600_000)
    if (!rateLimit.allowed) throw new RateLimitError(rateLimit.resetAt)

    // usuário
    const { data: userData, error: userError } = await supabase
      .from("users").select("*").eq("id", user.id).single()
    if (userError || !userData) throw new NotFoundError("Usuário")
    const isAdmin = userData.role === "admin" || user.email === config.admin.email

    // body
    const body = (await request.json()) as CaptionRequest
    const validation = validateCaptionRequest(body)
    if (!validation.valid) throw new ValidationError(validation.error ?? "Requisição inválida")

    const tone = sanitizeInput(String(body.tone || "").trim())
    const platform = sanitizeInput(String(body.platform || "").trim())
    const businessDescription = sanitizeInput(String(body.businessDescription || "").trim())
    const goal = sanitizeInput(String(body.goal || "").trim())
    const numVariations = clamp(Number(body.numVariations || 1), MIN_VARIATIONS, MAX_VARIATIONS)

    if (!isAdmin && (userData.credits ?? 0) < 1) throw new InsufficientCreditsError(1, userData.credits ?? 0)

    // geração iterativa (1 variação por chamada)
    const results: CaptionResult[] = []
    for (let i = 0; i < numVariations; i++) {
      try {
        const one = await generateOneVariation(businessDescription, tone, platform, goal)
        results.push(one)
      } catch (err) {
        // tenta 1 retry (ainda curtíssimo)
        try {
          const one = await generateOneVariation(businessDescription, tone, platform, goal)
          results.push(one)
        } catch (retryErr) {
          if (results.length === 0) throw retryErr
          break
        }
      }
    }
    if (results.length === 0) {
      throw new Error("Não foi possível gerar nenhuma legenda (saída vazia/inválida).")
    }

    // débito 1 crédito por requisição
    let creditsRemaining = userData.credits ?? 0
    if (!isAdmin) {
      const newCredits = Math.max(0, (userData.credits ?? 0) - 1)
      const { error: updateError } = await supabase.from("users").update({ credits: newCredits }).eq("id", user.id)
      if (updateError) throw new Error("Erro ao processar créditos")
      creditsRemaining = newCredits
    }

    // salva primeiro
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
    } catch {}

    // log de uso (opcional)
    try {
      await supabase.from("usage_logs").insert({
        user_id: user.id,
        action: "generate_caption",
        credits_used: isAdmin ? 0 : 1,
        cost_usd: 0,
        metadata: {
          tone, platform, goal,
          model: MODEL(),
          numVariations,
          strategy: "per-variation-calls + json_schema",
        },
      })
    } catch {}

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
