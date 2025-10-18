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

const MAX_VARIATIONS = 10
const MIN_VARIATIONS = 1
const RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses"
const MODEL = () => config.openai.models.caption // ex.: "gpt-5-nano"

// ---------------- utils ----------------
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
const slice = (s: string, n = 350) => (s && s.length > n ? s.slice(0, n) + "..." : s || "")

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
function isValidCaptionArray(arr: any): arr is CaptionResult[] {
  return Array.isArray(arr) && arr.length > 0 && arr.every(isValidCaption)
}

function findCaptionsAnywhere(root: any): CaptionResult[] | undefined {
  if (!root) return
  if (isValidCaptionArray(root)) return root
  if (isValidCaptionArray((root as any).results)) return (root as any).results
  if (isValidCaptionArray((root as any).items)) return (root as any).items
  if (isValidCaption(root)) return [root]
  if (Array.isArray(root)) {
    for (const v of root) {
      const f = findCaptionsAnywhere(v)
      if (f) return f
    }
  } else if (typeof root === "object") {
    for (const k of Object.keys(root)) {
      const f = findCaptionsAnywhere((root as any)[k])
      if (f) return f
    }
  }
  return
}

// --------- Responses API extractors ---------
type Extracted = { text?: string; json?: any }

/**
 * Tenta extrair texto/JSON de toda a estrutura conhecida da Responses API.
 * NOVO: se nada encontrado mas houver `output`, usa o próprio `output` (ou o item 0) como JSON bruto.
 */
function extractResponsePayload(resp: any): Extracted {
  const out: Extracted = {}
  const texts: string[] = []

  const visit = (node: any) => {
    if (!node) return
    if (typeof node === "string") {
      const t = node.trim()
      if (t) texts.push(t)
      return
    }
    if (Array.isArray(node)) {
      for (const v of node) visit(v)
      return
    }
    if (typeof node === "object") {
      if (typeof (node as any).text === "string" && (node as any).text.trim()) texts.push((node as any).text.trim())
      if (!out.json && (node as any).json && typeof (node as any).json === "object") out.json = (node as any).json
      if (!out.json && (node as any).object && typeof (node as any).object === "object") out.json = (node as any).object
      if (!out.json && (node as any).data && typeof (node as any).data === "object") out.json = (node as any).data
      if (!out.json && (node as any).result && typeof (node as any).result === "object") out.json = (node as any).result
      if (typeof (node as any).output_text === "string" && (node as any).output_text.trim()) texts.push((node as any).output_text.trim())
      for (const k of Object.keys(node)) visit((node as any)[k])
    }
  }
  visit(resp)

  // fallback duro: se nada encontrado e houver output, usa output bruto:
  if (!out.text && !out.json && Array.isArray(resp?.output) && resp.output.length > 0) {
    // alguns modelos devolvem tudo estruturado dentro desse objeto
    out.json = resp.output[0] ?? resp.output
  }

  const joined = texts.join("").trim()
  if (joined) out.text = joined
  return out
}

function tryParseLoose(raw: string): any | undefined {
  let t = stripCodeFences(raw)
  t = normalizeQuotes(t)
  // 1) direto
  try { return JSON.parse(t) } catch {}
  // 2) remove vírgulas finais
  try { return JSON.parse(removeTrailingCommas(t)) } catch {}
  // 3) converte aspas simples heurístico
  try { return JSON.parse(coerceSingleToDoubleQuotes(removeTrailingCommas(t))) } catch {}
  return undefined
}

// --------- OpenAI (Responses API) ---------
async function callOpenAI(payload: any, timeoutMs = 25000) {
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
      throw new Error((body as any)?.error?.message || `OpenAI HTTP ${res.status}`)
    }
    return body
  } finally {
    clearTimeout(timer)
  }
}

const payloadJsonObj = (prompt: string) => ({
  model: MODEL(),
  instructions: "Responda exclusivamente com JSON válido.",
  input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
  max_output_tokens: 1000,
  text: { format: { type: "json_object" } },
})
const payloadText = (prompt: string) => ({
  model: MODEL(),
  instructions: "Responda com um JSON válido (sem markdown).",
  input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
  max_output_tokens: 1000,
  text: { format: { type: "text" } },
})

// ---------------- handler ----------------
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new AuthenticationError()

    // rate limit
    const rateLimit = checkRateLimit(`caption:${user.id}`, 10, 3600000)
    if (!rateLimit.allowed) throw new RateLimitError(rateLimit.resetAt)

    // usuário
    const { data: userData, error: userError } = await supabase
      .from("users").select("*").eq("id", user.id).single()
    if (userError || !userData) throw new NotFoundError("Usuário")
    const isAdmin = userData.role === "admin" || user.email === config.admin.email

    // body
    const body: CaptionRequest = await request.json()
    const validation = validateCaptionRequest(body)
    if (!validation.valid) throw new ValidationError(validation.error!)

    const tone = String(body.tone || "").trim()
    const platform = String(body.platform || "").trim()
    const businessDescription = String(body.businessDescription || "").trim()
    const goal = String(body.goal || "").trim()
    const numVariations = clamp(Number(body.numVariations || 1), MIN_VARIATIONS, MAX_VARIATIONS)

    if (!isAdmin && (userData.credits ?? 0) < 1) throw new InsufficientCreditsError(1, userData.credits ?? 0)

    const sanitizedDescription = sanitizeInput(businessDescription)
    const sanitizedGoal = sanitizeInput(goal)

    const prompt =
      `Você é um copywriter brasileiro especializado em redes sociais.\n` +
      `Gere ${numVariations} variantes de legenda em português para: ${sanitizedDescription}.\n` +
      `Tom: ${tone || "neutro/profissional"}.\nPlataforma: ${platform || "Instagram"}.\n` +
      `Objetivo: ${sanitizedGoal || "engajamento e conversão"}.\n` +
      `Cada legenda: 1–3 emojis, 1 linha de CTA e 5 hashtags relevantes.\n` +
      `Responda APENAS um JSON com "results": [{ "caption": string, "cta": string, "hashtags": string[] }].`

    // 1) tenta json_object
    let ai = await callOpenAI(payloadJsonObj(prompt))
    let { text, json } = extractResponsePayload(ai)

    // 2) fallback texto
    if (!text && !json) {
      ai = await callOpenAI(payloadText(prompt))
      ;({ text, json } = extractResponsePayload(ai))
    }

    if (!text && !json) {
      const diag = `keys=[${Object.keys(ai || {}).join(",")}], output.len=${Array.isArray(ai?.output) ? ai.output.length : 0}`
      throw new Error(`Resposta vazia da IA (diag: ${diag})`)
    }

    // --------- parse final ---------
    let root: any = json
    if (!root && text) {
      const t = normalizeQuotes(removeTrailingCommas(stripCodeFences(text)))
      root = tryParseLoose(t)
    }
    if (!root) {
      throw new Error(`Erro ao processar resposta da IA (JSON inválido) — preview: ${slice(text || JSON.stringify(json) || "", 220)}`)
    }

    const results = findCaptionsAnywhere(root)
    if (!results) {
      throw new Error(`Erro ao processar resposta da IA (JSON inválido) — preview: ${slice(text || JSON.stringify(root) || "", 220)}`)
    }

    // uso/custo (estimativa simples)
    const usage = ai?.usage ?? {}
    const tokensUsed = usage?.total_tokens ?? ((usage?.output_tokens ?? 0) + (usage?.input_tokens ?? 0))
    const costEstimate = (tokensUsed / 1_000_000) * 0.45

    // créditos
    let creditsRemaining = userData.credits
    if (!isAdmin) {
      const newCredits = Math.max(0, (userData.credits ?? 0) - 1)
      const { error: updateError } = await supabase.from("users").update({ credits: newCredits }).eq("id", user.id)
      if (updateError) throw new Error("Erro ao processar créditos")
      creditsRemaining = newCredits
    }

    // persiste primeiro
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

    // log
    try {
      await supabase.from("usage_logs").insert({
        user_id: user.id,
        action: "generate_caption",
        credits_used: isAdmin ? 0 : 1,
        cost_usd: costEstimate,
        metadata: {
          tone, platform, goal: sanitizedGoal, tokensUsed, model: MODEL(), numVariations,
          rateLimit: { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt },
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
