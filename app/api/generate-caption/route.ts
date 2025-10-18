// app/api/generate-caption/route.ts
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

// Para Nano, mantenha a saída pequena por chamada:
const MAX_OUTPUT_TOKENS_JSON = 320  // pequeno e suficiente para 1 variação
const MAX_OUTPUT_TOKENS_TEXT = 280  // fallback em "text"

// ===== Utils =====
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
const slice = (s: string, n = 280) => (s && s.length > n ? s.slice(0, n) + "..." : s || "")
const toErr = (e: unknown) => (e instanceof Error ? e.message : (()=>{try{return JSON.stringify(e)}catch{return String(e)}})())

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
    item.hashtags.length >= 3 && item.hashtags.length <= 10 &&
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

// Extrai texto/JSON em qualquer formato razoável
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

async function callOpenAI(payload: any, timeoutMs = 20000) {
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

// ===== Prompt e payloads (1 variação por chamada) =====
function makePromptOne(desc: string, tone: string, platform: string, goal: string) {
  return (
    `Gere 1 legenda PT-BR.\n` +
    `Negócio: ${desc}\n` +
    `Tom: ${tone || "neutro/profissional"} | Plataforma: ${platform || "Instagram"} | Objetivo: ${goal || "engajamento"}\n` +
    `Formato JSON EXATO: {"caption":"(≤180 chars)","cta":"(1 linha)","hashtags":["#tag1","#tag2","#tag3","#tag4","#tag5"]}\n` +
    `Não inclua markdown. Apenas JSON.`
  )
}

const payloadJsonObj = (prompt: string) => ({
  model: MODEL(),
  instructions: "Retorne exclusivamente um JSON válido e completo.",
  input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
  max_output_tokens: MAX_OUTPUT_TOKENS_JSON,
  text: { format: { type: "json_object" } },
})

const payloadText = (prompt: string) => ({
  model: MODEL(),
  instructions: "Retorne exclusivamente um JSON válido e completo (sem markdown).",
  input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
  max_output_tokens: MAX_OUTPUT_TOKENS_TEXT,
  text: { format: { type: "text" } },
})

// Gera UMA variação (com fallback) e retorna CaptionResult
async function generateOneVariation(desc: string, tone: string, platform: string, goal: string): Promise<CaptionResult> {
  const prompt = makePromptOne(desc, tone, platform, goal)

  // 1) Tenta json_object (ideal)
  let ai = await callOpenAI(payloadJsonObj(prompt))
  let status: string | undefined = ai?.status
  let reason: string | undefined = ai?.incomplete_details?.reason
  let { text, json } = extractResponsePayload(ai)

  // Se truncou/incompleto, tenta em "text" (saída menor)
  if (status !== "completed" && (reason === "max_output_tokens" || (!text && !json))) {
    ai = await callOpenAI(payloadText(prompt))
    status = ai?.status
    reason = ai?.incomplete_details?.reason
    const p = extractResponsePayload(ai)
    text = p.text
    json = p.json
  }

  // Decodifica
  let root: any = json
  if (!root && text) {
    root = tryParseLoose(text)
  }
  if (!root) {
    const diag = `status=${status || "?"}, reason=${reason || "?"}`
    throw new Error(`Falha ao decodificar variação (JSON inválido) — ${diag}, preview: ${slice(text || JSON.stringify(json) || "", 220)}`)
  }

  // Normaliza possíveis formatos
  let item: any = root
  if (root && typeof root === "object") {
    if (Array.isArray(root.results) && root.results.length > 0) item = root.results[0]
    else if (Array.isArray(root.items) && root.items.length > 0) item = root.items[0]
  }
  if (!isValidCaption(item)) {
    // Alguns modelos devolvem {caption, cta, hashtags} diretamente
    // ou o objeto está dentro de algum campo; vasculha superficialmente:
    if (root && typeof root === "object") {
      for (const k of Object.keys(root)) {
        const v = (root as any)[k]
        if (isValidCaption(v)) { item = v; break }
      }
    }
  }
  if (!isValidCaption(item)) {
    throw new Error(`Modelo não retornou campos válidos — preview: ${slice(typeof root === "string" ? root : JSON.stringify(root), 220)}`)
  }

  // Força hashtags começarem com "#"
  item.hashtags = item.hashtags.map((h: string) => (h.startsWith("#") ? h : `#${h.replace(/\s+/g, "")}`))
  return {
    caption: String(item.caption).trim(),
    cta: String(item.cta).trim(),
    hashtags: item.hashtags,
  }
}

// ===== Handler principal =====
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new AuthenticationError()

    // rate limit (10/h)
    const rateLimit = checkRateLimit(`caption:${user.id}`, 10, 3600000)
    if (!rateLimit.allowed) throw new RateLimitError(rateLimit.resetAt)

    // usuário + créditos
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()
    if (userError || !userData) throw new NotFoundError("Usuário")
    const isAdmin = userData.role === "admin" || user.email === config.admin.email

    // body + validação
    const body: CaptionRequest = await request.json()
    const validation = validateCaptionRequest(body)
    if (!validation.valid) throw new ValidationError(validation.error!)

    const tone = sanitizeInput(String(body.tone || "").trim())
    const platform = sanitizeInput(String(body.platform || "").trim())
    const businessDescription = sanitizeInput(String(body.businessDescription || "").trim())
    const goal = sanitizeInput(String(body.goal || "").trim())
    const numVariations = clamp(Number(body.numVariations || 1), MIN_VARIATIONS, MAX_VARIATIONS)

    if (!isAdmin && (userData.credits ?? 0) < 1) throw new InsufficientCreditsError(1, userData.credits ?? 0)

    // ===== Geração iterativa: 1 variação por chamada interna =====
    const results: CaptionResult[] = []
    for (let i = 0; i < numVariations; i++) {
      try {
        const one = await generateOneVariation(businessDescription, tone, platform, goal)
        results.push(one)
      } catch (err) {
        // Se uma variação falhar, tenta mais uma vez para essa posição em "text"
        try {
          const one = await generateOneVariation(businessDescription, tone, platform, goal)
          results.push(one)
        } catch (err2) {
          // Para Nano, não estoura a requisição inteira por 1 falha; segue adiante.
          // Mas se nenhuma variação foi gerada, propaga o erro.
          if (results.length === 0) throw err2
          break
        }
      }
    }
    if (results.length === 0) {
      throw new Error("Não foi possível gerar nenhuma legenda (modelo retornou saída vazia ou inválida).")
    }

    // uso/custo (sem acesso a usage somado por variação — use estimativa simples ou zere)
    const costEstimate = 0 // se quiser estimar tokens, você pode acumular usage de cada chamada

    // Debita 1 crédito total por requisição HTTP
    let creditsRemaining = userData.credits
    if (!isAdmin) {
      const newCredits = Math.max(0, (userData.credits ?? 0) - 1)
      const { error: updateError } = await supabase.from("users").update({ credits: newCredits }).eq("id", user.id)
      if (updateError) throw new Error("Erro ao processar créditos")
      creditsRemaining = newCredits
    }

    // salva o primeiro resultado
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

    // log (opcional)
    try {
      await supabase.from("usage_logs").insert({
        user_id: user.id,
        action: "generate_caption",
        credits_used: isAdmin ? 0 : 1,
        cost_usd: costEstimate,
        metadata: {
          tone, platform, goal,
          model: MODEL(),
          numVariations,
          strategy: "per-variation-calls",
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
      { status: errorResponse.statusCode }
    )
  }
}
