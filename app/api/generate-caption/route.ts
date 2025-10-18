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

type OpenAIJson = Record<string, any>

// ===== Constantes =====
const MAX_VARIATIONS = 10
const MIN_VARIATIONS = 1
const RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses"
const MODEL = () => config.openai.models.caption // ex.: "gpt-5-nano"

// ===== Utils =====
function extractResponseText(resp: any): string | undefined {
  // Formatos comuns da Responses API
  const t1 = resp?.output_text
  if (typeof t1 === "string" && t1.trim()) return t1.trim()

  const t2 = resp?.output?.[0]?.content?.[0]?.text
  if (typeof t2 === "string" && t2.trim()) return t2.trim()

  if (Array.isArray(resp?.data)) {
    const parts: string[] = []
    for (const item of resp.data) {
      const piece = item?.output_text || item?.output?.[0]?.content?.[0]?.text
      if (typeof piece === "string") parts.push(piece)
    }
    const joined = parts.join("").trim()
    if (joined) return joined
  }
  return undefined
}

function isValidCaptionArray(arr: any): arr is CaptionResult[] {
  if (!Array.isArray(arr) || arr.length < 1) return false
  return arr.every((item) => {
    const ok =
      item &&
      typeof item.caption === "string" &&
      item.caption.trim().length > 0 &&
      typeof item.cta === "string" &&
      item.cta.trim().length > 0 &&
      Array.isArray(item.hashtags) &&
      item.hashtags.length >= 3 &&
      item.hashtags.length <= 10 &&
      item.hashtags.every((h: any) => typeof h === "string" && h.trim().length > 0)
    return ok
  })
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

function toErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  try {
    return JSON.stringify(e)
  } catch {
    return String(e)
  }
}

// ===== OpenAI call com timeout + retries =====
async function callOpenAIWithRetries(payload: OpenAIJson, opts?: { retries?: number; timeoutMs?: number }) {
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

      if (res.ok) {
        return res.json()
      }

      // Trata 429/5xx com retry exponencial
      if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
        lastErr = await safeJson(res)
        const backoff = 500 * Math.pow(2, attempt)
        await sleep(backoff)
        continue
      }

      // Erros 4xx/fora do retry
      const body = await safeJson(res)
      throw new Error(body?.error?.message || `OpenAI HTTP ${res.status}`)
    } catch (err: any) {
      clearTimeout(timer)
      // AbortError / rede / timeout: tenta novamente
      if (attempt < retries) {
        const backoff = 500 * Math.pow(2, attempt)
        await sleep(backoff)
        lastErr = err
        continue
      }
      throw err
    }
  }
  // Se saiu do loop sem sucesso
  throw new Error(toErrorMessage(lastErr) || "Falha ao chamar OpenAI após retries")
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function safeJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

// ===== Handler =====
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) throw new AuthenticationError()

    // Rate limit (10/hora)
    const rateLimit = checkRateLimit(`caption:${user.id}`, 10, 3600000)
    if (!rateLimit.allowed) throw new RateLimitError(rateLimit.resetAt)

    // Usuário + créditos
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()
    if (userError || !userData) throw new NotFoundError("Usuário")
    const isAdmin = userData.role === "admin" || user.email === config.admin.email

    // Body + validação primária
    const body: CaptionRequest = await request.json()
    const validation = validateCaptionRequest(body)
    if (!validation.valid) throw new ValidationError(validation.error!)

    // Sanitização + clamp de variações
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

    // Prompt (clean)
    const userPrompt =
      `Você é um copywriter brasileiro especializado em redes sociais.\n` +
      `Gere ${numVariations} variantes de legenda em português para o negócio: ${sanitizedDescription}.\n` +
      `Tom: ${tone || "neutro/profissional"}.\n` +
      `Plataforma: ${platform || "Instagram"}.\n` +
      `Objetivo: ${sanitizedGoal || "engajamento e conversão"}.\n` +
      `Cada legenda deve ter: 1–3 emojis, 1 linha de CTA e 5 hashtags relevantes.\n` +
      `Responda APENAS no formato do schema fornecido.`

    // Payload da Responses API (sem temperature; usa text.format)
    const payload: OpenAIJson = {
      model: MODEL(),
      instructions: "Responda exclusivamente com JSON válido conforme o schema.",
      input: [{ role: "user", content: userPrompt }],
      max_output_tokens: 1000,
      text: {
        format: {
          type: "json_schema",
          name: "CaptionArray",
          strict: true,
          schema: {
            type: "array",
            minItems: 1,
            maxItems: MAX_VARIATIONS,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["caption", "cta", "hashtags"],
              properties: {
                caption: { type: "string", minLength: 1 },
                cta: { type: "string", minLength: 1 },
                hashtags: {
                  type: "array",
                  minItems: 3,
                  maxItems: 10,
                  items: { type: "string", pattern: "^#?\\w[\\w\\d_]*$" },
                },
              },
            },
          },
        },
      },
    }

    // Chamada com retry/timeout
    const ai = await callOpenAIWithRetries(payload, { retries: 2, timeoutMs: 25_000 })

    // Extrai texto
    const text = extractResponseText(ai)
    if (!text) {
      // Se o modelo devolveu algo fora do esperado, loga bruto p/ debug
      console.error("[caption] empty model output", ai)
      throw new Error("Resposta vazia da IA")
    }

    // Parse + validação de estrutura
    let results: CaptionResult[]
    try {
      const parsed = JSON.parse(text)
      results = Array.isArray(parsed) ? parsed : [parsed]
      if (!isValidCaptionArray(results)) {
        throw new Error("JSON não corresponde ao schema esperado")
      }
    } catch (e) {
      console.error("[caption] JSON parse/shape error", { text, error: toErrorMessage(e) })
      throw new Error("Erro ao processar resposta da IA (JSON inválido)")
    }

    // Uso/custo (estimativa; ajuste conforme pricing real do modelo)
    const usage = ai?.usage ?? {}
    const tokensUsed =
      usage?.total_tokens ??
      ((usage?.output_tokens ?? 0) + (usage?.input_tokens ?? 0))
    const costEstimate = (tokensUsed / 1_000_000) * 0.45

    // Debita 1 crédito (não-admin)
    let creditsRemaining = userData.credits
    if (!isAdmin) {
      const newCredits = Math.max(0, (userData.credits ?? 0) - 1)
      const { error: updateError } = await supabase
        .from("users")
        .update({ credits: newCredits })
        .eq("id", user.id)
      if (updateError) {
        console.error("[caption] credit update error:", updateError)
        throw new Error("Erro ao processar créditos")
      }
      creditsRemaining = newCredits
    }

    // Persiste o primeiro resultado (se existir)
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
      // não bloqueia a resposta
    }

    // Log de uso
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

    // Resposta final
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
