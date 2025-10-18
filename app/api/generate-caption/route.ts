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
function keySummary(obj: any): string {
  try {
    const keys = Object.keys(obj || {})
    const sample = Array.isArray(obj?.output) ? ` output.len=${obj.output.length}` : ""
    return `keys=[${keys.join(",")}],${sample}`
  } catch { return "keys=?"; }
}

// ===== Extrator recursivo ultra-tolerante =====
type Extracted = { text?: string; json?: any }
function extractResponsePayload(resp: any): Extracted {
  const out: Extracted = {}
  const texts: string[] = []

  const visit = (node: any) => {
    if (!node) return
    const typ = typeof node

    if (typ === "string") {
      const t = node.trim()
      if (t) texts.push(t)
      return
    }

    if (Array.isArray(node)) {
      for (const item of node) visit(item)
      return
    }

    if (typ === "object") {
      // Campos comuns
      if (typeof node.text === "string" && node.text.trim()) texts.push(node.text.trim())
      if (!out.json && node.json && typeof node.json === "object") out.json = node.json
      if (!out.json && node.object && typeof node.object === "object") out.json = node.object
      if (!out.json && node.data && typeof node.data === "object") out.json = node.data
      if (!out.json && node.result && typeof node.result === "object") out.json = node.result

      // Alguns modelos devolvem tudo em output_text na raiz
      if (typeof node.output_text === "string" && node.output_text.trim()) texts.push(node.output_text.trim())

      // Varre todos os campos recursivamente
      for (const k of Object.keys(node)) {
        const v = (node as any)[k]
        if (v && (typeof v === "object" || typeof v === "string")) visit(v)
      }
    }
  }

  // Caminhos prováveis
  visit(resp)
  // Consolida texto
  const joined = texts.join("").trim()
  if (joined) out.text = joined
  return out
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

// ===== OpenAI (timeout simples) =====
async function callOpenAI(payload: any, { timeoutMs = 25000 }: { timeoutMs?: number } = {}) {
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
    if (!res.ok) {
      const body = await safeJson(res)
      throw new Error(body?.error?.message || `OpenAI HTTP ${res.status}`)
    }
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

// ===== Payloads =====
function payloadJsonObject(userPrompt: string) {
  return {
    model: MODEL(),
    instructions: "Responda exclusivamente com JSON válido.",
    input: [
      { role: "user", content: [{ type: "input_text", text: userPrompt }] },
    ],
    max_output_tokens: 1000,
    text: { format: { type: "json_object" } },
  }
}
function payloadText(userPrompt: string) {
  return {
    model: MODEL(),
    instructions: "Responda com um JSON válido (sem markdown).",
    input: [{ role: "user", content: [{ type: "input_text", text: userPrompt }] }],
    max_output_tokens: 1000,
    text: { format: { type: "text" } },
  }
}

// ===== Handler =====
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new AuthenticationError()

    // Rate limit
    const rateLimit = checkRateLimit(`caption:${user.id}`, 10, 3600000)
    if (!rateLimit.allowed) throw new RateLimitError(rateLimit.resetAt)

    // User + créditos
    const { data: userData, error: userError } = await supabase
      .from("users").select("*").eq("id", user.id).single()
    if (userError || !userData) throw new NotFoundError("Usuário")
    const isAdmin = userData.role === "admin" || user.email === config.admin.email

    // Body + validação
    const body: CaptionRequest = await request.json()
    const validation = validateCaptionRequest(body)
    if (!validation.valid) throw new ValidationError(validation.error!)

    const tone = String(body.tone || "").trim()
    const platform = String(body.platform || "").trim()
    const businessDescription = String(body.businessDescription || "").trim()
    const goal = String(body.goal || "").trim()
    const numVariations = clamp(Number(body.numVariations || 1), MIN_VARIATIONS, MAX_VARIATIONS)

    if (!isAdmin && (userData.credits ?? 0) < 1)
      throw new InsufficientCreditsError(1, userData.credits ?? 0)

    const sanitizedDescription = sanitizeInput(businessDescription)
    const sanitizedGoal = sanitizeInput(goal)

    // Prompt
    const userPrompt =
      `Você é um copywriter brasileiro especializado em redes sociais.\n` +
      `Gere ${numVariations} variantes de legenda em português para: ${sanitizedDescription}.\n` +
      `Tom: ${tone || "neutro/profissional"}.\nPlataforma: ${platform || "Instagram"}.\n` +
      `Objetivo: ${sanitizedGoal || "engajamento e conversão"}.\n` +
      `Cada legenda: 1–3 emojis, 1 linha de CTA e 5 hashtags relevantes.\n` +
      `Responda APENAS um JSON com "results": [{ "caption": string, "cta": string, "hashtags": string[] }].`

    // 1) Tenta JSON-obj
    let ai = await callOpenAI(payloadJsonObject(userPrompt))
    let { text: outText, json: outJson } = extractResponsePayload(ai)

    // 2) Fallback: texto livre
    if (!outText && !outJson) {
      ai = await callOpenAI(payloadText(userPrompt))
      ;({ text: outText, json: outJson } = extractResponsePayload(ai))
    }

    if (!outText && !outJson) {
      const diag = keySummary(ai)
      throw new Error(`Resposta vazia da IA (diag: ${diag})`)
    }

    // Parse + validação
    let results: CaptionResult[]
    try {
      const root = outJson ?? JSON.parse(stripCodeFences(outText!))
      const arr = root?.results
      if (!isValidCaptionArray(arr))
        throw new Error("JSON não corresponde ao formato esperado (object.results[])")
      results = arr as CaptionResult[]
    } catch (e) {
      const diag = keySummary(ai)
      console.error("[caption] JSON parse/shape error", { diag, rawText: outText, rawJson: outJson, err: toErrorMessage(e) })
      throw new Error("Erro ao processar resposta da IA (JSON inválido)")
    }

    // Uso/custo (estimativa simples)
    const usage = ai?.usage ?? {}
    const tokensUsed = usage?.total_tokens ?? ((usage?.output_tokens ?? 0) + (usage?.input_tokens ?? 0))
    const costEstimate = (tokensUsed / 1_000_000) * 0.45

    // Créditos
    let creditsRemaining = userData.credits
    if (!isAdmin) {
      const newCredits = Math.max(0, (userData.credits ?? 0) - 1)
      const { error: updateError } = await supabase.from("users")
        .update({ credits: newCredits }).eq("id", user.id)
      if (updateError) throw new Error("Erro ao processar créditos")
      creditsRemaining = newCredits
    }

    // Persistência do primeiro resultado
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

    // Log de uso (não bloqueante)
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
