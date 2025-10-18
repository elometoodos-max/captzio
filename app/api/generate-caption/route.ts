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
const MAX_TOKENS_PRIMARY = 900   // manter abaixo de 1000 para nano
const MAX_TOKENS_FALLBACK = 700  // em fallback, economizamos mais

// ===== Utils de texto/JSON =====
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
const slice = (s: string, n = 300) => (s && s.length > n ? s.slice(0, n) + "..." : s || "")

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

function extractResponsePayload(resp: any): { text?: string; json?: any } {
  // 1) output_text direto
  if (typeof resp?.output_text === "string" && resp.output_text.trim()) {
    return { text: resp.output_text.trim() }
  }
  // 2) varre output[].content[]
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
  if (!textConcat && !firstJson && outs.length > 0) {
    // Fallback duro: usa o objeto do output como JSON bruto
    firstJson = outs[0]
  }
  const text = textConcat.trim() || undefined
  return { text, json: firstJson }
}

function tryParseLoose(raw: string): any | undefined {
  let t = stripCodeFences(raw)
  t = normalizeQuotes(t)
  // 1) direto
  try { return JSON.parse(t) } catch {}
  // 2) remove vírgulas finais
  try { return JSON.parse(removeTrailingCommas(t)) } catch {}
  // 3) aspas simples → duplas
  try { return JSON.parse(coerceSingleToDoubleQuotes(removeTrailingCommas(t))) } catch {}
  return undefined
}

// ===== OpenAI (Responses API) =====
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

// ===== Payload builders =====
function makePrompt(desc: string, tone: string, platform: string, goal: string, n: number) {
  // Enxuto e com limites de tamanho para não estourar tokens:
  return (
    `Gere ${n} legendas PT-BR para: ${desc}.\n` +
    `Tom: ${tone || "neutro/profissional"} | Plataforma: ${platform || "Instagram"} | Objetivo: ${goal || "engajamento"}.\n` +
    `Regras (curtas): cada "caption" ≤ 180 chars; "cta" 1 linha; 5 hashtags curtas. ` +
    `Retorne APENAS JSON: {"results":[{"caption":"","cta":"","hashtags":["#...","#...","#...","#...","#..."]}]}`
  )
}

const payloadJsonObj = (prompt: string, maxTokens: number) => ({
  model: MODEL(),
  instructions: "Retorne somente JSON válido e completo.",
  input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
  max_output_tokens: maxTokens,
  text: { format: { type: "json_object" } },
})

const payloadText = (prompt: string, maxTokens: number) => ({
  model: MODEL(),
  instructions: "Retorne um JSON válido e completo (sem markdown).",
  input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
  max_output_tokens: maxTokens,
  text: { format: { type: "text" } },
})

// ===== Uma rodada de geração, com política de fallback =====
async function generateOnce(prompt: string, opts: { maxTokens: number; format: "json_object" | "text" }) {
  const payload = opts.format === "json_object"
    ? payloadJsonObj(prompt, opts.maxTokens)
    : payloadText(prompt, opts.maxTokens)

  const ai = await callOpenAI(payload)
  const status: string | undefined = ai?.status
  const incompleteReason: string | undefined = ai?.incomplete_details?.reason

  const { text, json } = extractResponsePayload(ai)
  return { ai, text, json, status, incompleteReason }
}

// ===== Handler principal =====
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
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()
    if (userError || !userData) throw new NotFoundError("Usuário")
    const isAdmin = userData.role === "admin" || user.email === config.admin.email

    // body
    const body: CaptionRequest = await request.json()
    const validation = validateCaptionRequest(body)
    if (!validation.valid) throw new ValidationError(validation.error!)

    let tone = String(body.tone || "").trim()
    let platform = String(body.platform || "").trim()
    const businessDescription = String(body.businessDescription || "").trim()
    let goal = String(body.goal || "").trim()
    let n = clamp(Number(body.numVariations || 1), MIN_VARIATIONS, MAX_VARIATIONS)

    if (!isAdmin && (userData.credits ?? 0) < 1) throw new InsufficientCreditsError(1, userData.credits ?? 0)

    const desc = sanitizeInput(businessDescription)
    tone = sanitizeInput(tone)
    platform = sanitizeInput(platform)
    goal = sanitizeInput(goal)

    // ===== Tentativa 1: json_object, n original =====
    let prompt = makePrompt(desc, tone, platform, goal, n)
    let r1 = await generateOnce(prompt, { maxTokens: MAX_TOKENS_PRIMARY, format: "json_object" })

    // Se truncou por max_output_tokens, reduzimos n e tentamos de novo
    if (r1.status !== "completed" && (r1.incompleteReason === "max_output_tokens" || !r1.text && !r1.json)) {
      n = Math.max(1, Math.floor(n / 2)) // reduz pela metade
      prompt = makePrompt(desc, tone, platform, goal, n)
      r1 = await generateOnce(prompt, { maxTokens: MAX_TOKENS_FALLBACK, format: "json_object" })
    }

    // Se ainda vier incompleto, troca para TEXT (menos overhead) e mantém n reduzido
    if (r1.status !== "completed" && (r1.incompleteReason === "max_output_tokens" || !r1.text && !r1.json)) {
      r1 = await generateOnce(prompt, { maxTokens: MAX_TOKENS_FALLBACK, format: "text" })
    }

    const ai = r1.ai
    let root = r1.json
    if (!root && r1.text) {
      const t = normalizeQuotes(removeTrailingCommas(stripCodeFences(r1.text)))
      root = tryParseLoose(t)
    }

    if (!root) {
      const diag = `status=${ai?.status || "?"}, reason=${ai?.incomplete_details?.reason || "?"}, output.len=${Array.isArray(ai?.output) ? ai.output.length : 0}`
      throw new Error(`Erro ao processar resposta da IA (JSON inválido) — diag: ${diag}, preview: ${slice(r1.text || JSON.stringify(r1.json) || "", 260)}`)
    }

    const results = findCaptionsAnywhere(root)
    if (!results) {
      const diag = `status=${ai?.status || "?"}, reason=${ai?.incomplete_details?.reason || "?"}`
      throw new Error(`Erro ao processar resposta da IA (JSON inválido) — ${diag}, preview: ${slice(r1.text || JSON.stringify(root) || "", 260)}`)
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
          tone, platform, goal, tokensUsed, model: MODEL(), numVariations: n,
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
