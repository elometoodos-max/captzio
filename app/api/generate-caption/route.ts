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
const MAX_VARIATIONS = 10
const MIN_VARIATIONS = 1
const RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses"
const MODEL = () => config.openai.models.caption // ex.: "gpt-5-nano"

// ===== Utils =====
function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}
function toErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  try { return JSON.stringify(e) } catch { return String(e) }
}
async function safeJson(res: Response) {
  try { return await res.json() } catch { return null }
}
function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)) }

function stripCodeFences(s: string): string {
  const m = s.match(/```json\s*([\s\S]*?)```/i) || s.match(/```\s*([\s\S]*?)```/i)
  return m ? m[1].trim() : s.trim()
}

function firstNonEmptyString(...vals: Array<any>): string | undefined {
  for (const v of vals) if (typeof v === "string" && v.trim()) return v.trim()
  return undefined
}

// Extrai texto/JSON de todas as variantes da Responses API
function extractResponsePayload(resp: any): { text?: string; json?: any } {
  // 1) atalhos diretos
  const t1 = typeof resp?.output_text === "string" ? resp.output_text.trim() : ""
  // 2) varre output[].content[]
  let t2 = ""
  let j1: any = undefined
  const outputs = Array.isArray(resp?.output) ? resp.output : []
  for (const o of outputs) {
    const content = Array.isArray(o?.content) ? o.content : []
    for (const c of content) {
      if (typeof c?.text === "string" && c.text.trim()) t2 += c.text
      if (typeof c?.type === "string") {
        if (c.type === "output_text" && typeof c?.text === "string" && c.text.trim()) t2 += c.text
        if (c.type === "text" && typeof c?.text === "string" && c.text.trim()) t2 += c.text
        if (c.type === "json" && c?.json && typeof c.json === "object") j1 = c.json
      }
    }
  }
  const text = firstNonEmptyString(t1, t2)
  return { text, json: j1 }
}

function isValidCaptionArray(arr: any): arr is CaptionResult[] {
  if (!Array.isArray(arr) || arr.length < 1) return false
  return arr.every((item) =>
    item &&
    typeof item.caption === "string" && item.caption.trim().length > 0 &&
    typeof item.cta === "string" && item.cta.trim().length > 0 &&
    Array.isArray(item.hashtags) &&
    item.hashtags.length >= 3 && item.hashtags.length <= 10 &&
    item.hashtags.every((h: any) => typeof h === "string" && h.trim().length > 0)
  )
}

// ===== OpenAI (timeout + retries) =====
async function callOpenAIWithRetries(payload: any, opts?: { retries?: number; timeoutMs?: number }) {
  const retries = Math.max(0, opts?.retries ?? 2)
  const timeoutMs = Math.max(1_000, opts?.timeoutMs ?? 25_000)
  let lastErr: any = null

  for (let attempt = 0; attempt <= retries; attempt++) {
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
      clearTimeout(timer)

      if (res.ok) return res.json()
      if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
        lastErr = await safeJson(res)
        const backoff = 500 * Math.pow(2, attempt)
        await sleep(backoff)
        continue
      }
      const body = await safeJson(res)
      throw new Error(body?.error?.message || `OpenAI HTTP ${res.status}`)
    } catch (err: any) {
      clearTimeout(timer)
      if (attempt < retries) {
        const backoff = 500 * Math.pow(2, attempt)
        await sleep(backoff)
        lastErr = err
        continue
      }
      throw err
    }
  }
  throw new Error(toErrorMessage(lastErr) || "Falha ao chamar OpenAI após retries")
}

// ===== Handler =====
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) throw new AuthenticationError()

    // rate limit (10/h)
    const rateLimit = checkRateLimit(`caption:${user.id}`, 10, 3600000)
    if (!rateLimit.allowed) throw new RateLimitError(rateLimit.resetAt)

    // user + credits
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()
    if (userError || !userData) throw new NotFoundError("Usuário")
    const isAdmin = userData.role === "admin" || user.email === config.admin.email

    // body + validação
    const body: CaptionRequest = await request.json()
    const validation = validateCaptionRequest(body)
    if (!validation.valid) throw new ValidationError(validation.error!)

    const tone = String(body.tone || "").trim()
    const platform = String(body.platform || "").trim()
    const businessDescription = String(body.businessDescription || "").trim()
    const goal = String(body.goal || "").trim()
    const numVariations = clamp(Number(body.numVariations || 1), MIN_VARIATIONS, MAX_VARIATIONS)

    const sanitizedDescription = sanitizeInput(businessDescription)
    const sanitizedGoal = sanitizeInput(goal)

    if (!isAdmin && (userData.credits ?? 0) < 1) {
      throw new InsufficientCreditsError(1, userData.credits ?? 0)
    }

    // prompt
    const userPrompt =
      `Você é um copywriter brasileiro especializado em redes sociais.\n` +
      `Gere ${numVariations} variantes de legenda em português para o negócio: ${sanitizedDescription}.\n` +
      `Tom: ${tone || "neutro/profissional"}.\n` +
      `Plataforma: ${platform || "Instagram"}.\n` +
      `Objetivo: ${sanitizedGoal || "engajamento e conversão"}.\n` +
      `Cada legenda deve ter: 1–3 emojis, 1 linha de CTA e 5 hashtags relevantes.\n` +
      `Responda APENAS um JSON com a propriedade "results" contendo um array de objetos { "caption": string, "cta": string, "hashtags": string[] }.`

    // 1ª tentativa: saída como JSON-obj (modelo deve devolver objeto)
    const payloadPrimary = {
      model: MODEL(),
      instructions: "Responda exclusivamente com JSON válido.",
      input: userPrompt,                   // usar string simples ajuda alguns modelos
      max_output_tokens: 1000,
      text: { format: { type: "json_object" } },
    }

    let ai = await callOpenAIWithRetries(payloadPrimary, { retries: 1, timeoutMs: 25_000 })
    let { text: outText, json: outJson } = extractResponsePayload(ai)

    // Fallback: se o modelo não preencher, tenta como texto livre e extrai JSON do texto
    if (!outText && !outJson) {
      const payloadFallback = {
        model: MODEL(),
        instructions: "Responda exatamente com um JSON válido (sem comentários, sem markdown).",
        input: userPrompt,
        max_output_tokens: 1000,
        text: { format: { type: "text" } },
      }
      ai = await callOpenAIWithRetries(payloadFallback, { retries: 1, timeoutMs: 25_000 })
      ;({ text: outText, json: outJson } = extractResponsePayload(ai))
    }

    if (!outText && !outJson) {
      console.error("[caption] empty model output", ai)
      throw new Error("Resposta vazia da IA")
    }

    // Parse + validação
    let results: CaptionResult[]
    try {
      const parsedRoot = outJson ?? JSON.parse(stripCodeFences(outText!))
      const arr = parsedRoot?.results
      if (!isValidCaptionArray(arr)) {
        throw new Error("JSON não corresponde ao formato esperado (object.results[])")
      }
      results = arr as CaptionResult[]
    } catch (e) {
      console.error("[caption] JSON parse/shape error", { raw: outText ?? outJson, error: toErrorMessage(e) })
      throw new Error("Erro ao processar resposta da IA (JSON inválido)")
    }

    // uso/custo (estimativa simples)
    const usage = ai?.usage ?? {}
    const tokensUsed =
      usage?.total_tokens ??
      ((usage?.output_tokens ?? 0) + (usage?.input_tokens ?? 0))
    const costEstimate = (tokensUsed / 1_000_000) * 0.45

    // débito de crédito
    let creditsRemaining = userData.credits
    if (!isAdmin) {
      const newCredits = Math.max(0, (userData.credits ?? 0) - 1)
      const { error: updateError } = await supabase
        .from("users")
        .update({ credits: newCredits })
        .eq("id", user.id)
      if (updateError) throw new Error("Erro ao processar créditos")
      creditsRemaining = newCredits
    }

    // persistência do primeiro resultado
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
    } catch (saveError) {
      console.error("[caption] save error:", saveError)
    }

    // log de uso (não bloqueante)
    try {
      await supabase.from("usage_logs").insert({
        user_id: user.id,
        action: "generate_caption",
        credits_used: isAdmin ? 0 : 1,
        cost_usd: costEstimate,
        metadata: {
          tone,
          platform,
          goal: sanitizedGoal,
          tokensUsed,
          model: MODEL(),
          numVariations,
          rateLimit: {
            remaining: rateLimit.remaining,
            resetAt: rateLimit.resetAt,
          },
        },
      })
    } catch (logErr) {
      console.error("[caption] usage log error:", logErr)
    }

    return NextResponse.json({
      results,
      creditsRemaining: isAdmin ? "∞" : creditsRemaining,
      isAdmin,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt,
      },
    })
  } catch (error) {
    console.error("[caption] error:", error)
    const errorResponse = handleError(error)
    return NextResponse.json(
      { error: errorResponse.message, code: errorResponse.code },
      { status: errorResponse.statusCode }
    )
  }
}
