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

const RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses"
const MODEL = "gpt-5-nano" // GPT-5 nano: fastest and cheapest
const MAX_VARIATIONS = 10
const MIN_VARIATIONS = 1

const MAX_OUTPUT_TOKENS = 500

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

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)

async function callOpenAIResponses(
  businessDescription: string,
  tone: string,
  platform: string,
  goal: string,
): Promise<any> {
  const prompt = `Crie uma legenda em português brasileiro para ${platform}.

Negócio/Conteúdo: ${businessDescription}
Tom: ${tone}
Objetivo: ${goal || "engajamento"}

Retorne APENAS um objeto JSON válido com esta estrutura exata:
{
  "caption": "texto da legenda (máximo 150 caracteres)",
  "cta": "call to action (máximo 80 caracteres)",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
}

Regras importantes:
- Caption: criativa, envolvente, em português brasileiro
- CTA: clara e direta ao ponto
- Hashtags: exatamente 3 hashtags relevantes com #
- Sem explicações, apenas o JSON`

  const payload = {
    model: MODEL,
    reasoning: {
      effort: "minimal", // Fastest response for GPT-5 nano
    },
    text: {
      verbosity: "low", // Concise outputs
      format: {
        type: "json_schema",
        name: "CaptionResponse",
        schema: {
          type: "object",
          properties: {
            caption: { type: "string", maxLength: 150 },
            cta: { type: "string", maxLength: 80 },
            hashtags: {
              type: "array",
              items: { type: "string" },
              minItems: 3,
              maxItems: 3,
            },
          },
          required: ["caption", "cta", "hashtags"],
          additionalProperties: false,
        },
      },
    },
    instructions:
      "Você é um especialista em marketing digital e copywriting para redes sociais brasileiras. Retorne apenas JSON válido, sem markdown ou explicações. Seja criativo e engajante.",
    input: prompt,
    max_output_tokens: MAX_OUTPUT_TOKENS,
    store: false, // Don't store responses to save costs
  }

  console.log("[v0] Chamando OpenAI Responses API com modelo:", MODEL)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout

  try {
    const response = await fetch(RESPONSES_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openai.apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const data = await response.json()

    if (!response.ok) {
      console.error("[v0] Erro da API OpenAI:", data)
      throw new Error(data.error?.message || `Erro HTTP ${response.status}`)
    }

    console.log("[v0] Resposta recebida com sucesso")
    return data
  } catch (error) {
    clearTimeout(timeout)
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Timeout: A API demorou muito para responder. Tente novamente.")
    }
    throw error
  }
}

function extractCaptionFromResponse(response: any): CaptionResult {
  console.log("[v0] Extraindo legenda da resposta")

  // Try to get output_text first (SDK helper)
  if (response.output_text) {
    try {
      const parsed = JSON.parse(response.output_text)
      if (isValidCaption(parsed)) {
        return normalizeCaption(parsed)
      }
    } catch (e) {
      console.log("[v0] output_text não é JSON válido")
    }
  }

  // Try to extract from output array
  if (Array.isArray(response.output)) {
    for (const item of response.output) {
      // Skip reasoning items
      if (item.type === "reasoning") continue

      // Check message content
      if (item.type === "message" && Array.isArray(item.content)) {
        for (const content of item.content) {
          if (content.type === "output_text" && content.text) {
            try {
              const parsed = JSON.parse(content.text)
              if (isValidCaption(parsed)) {
                return normalizeCaption(parsed)
              }
            } catch (e) {
              console.log("[v0] Conteúdo não é JSON válido")
            }
          }
        }
      }
    }
  }

  throw new Error("Não foi possível extrair legenda válida da resposta da IA")
}

function isValidCaption(obj: any): obj is CaptionResult {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.caption === "string" &&
    obj.caption.trim().length > 0 &&
    typeof obj.cta === "string" &&
    obj.cta.trim().length > 0 &&
    Array.isArray(obj.hashtags) &&
    obj.hashtags.length >= 3 &&
    obj.hashtags.every((h: any) => typeof h === "string" && h.trim().length > 0)
  )
}

function normalizeCaption(caption: CaptionResult): CaptionResult {
  return {
    caption: caption.caption.trim(),
    cta: caption.cta.trim(),
    hashtags: caption.hashtags.map((h) => {
      const cleaned = h.trim().replace(/\s+/g, "")
      return cleaned.startsWith("#") ? cleaned : `#${cleaned}`
    }),
  }
}

async function generateOneVariation(
  businessDescription: string,
  tone: string,
  platform: string,
  goal: string,
  retryCount = 0,
): Promise<CaptionResult> {
  const maxRetries = 2

  try {
    const response = await callOpenAIResponses(businessDescription, tone, platform, goal)
    return extractCaptionFromResponse(response)
  } catch (error) {
    console.error(`[v0] Erro na tentativa ${retryCount + 1}:`, error)

    if (retryCount < maxRetries) {
      console.log(`[v0] Tentando novamente... (${retryCount + 1}/${maxRetries})`)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1s before retry
      return generateOneVariation(businessDescription, tone, platform, goal, retryCount + 1)
    }

    throw error
  }
}

export async function POST(request: Request) {
  try {
    console.log("[v0] Iniciando geração de legendas")

    if (!config.openai.apiKey) {
      throw new Error("Chave da API OpenAI não configurada. Entre em contato com o suporte.")
    }

    if (config.openai.apiKey.length < 20 || !config.openai.apiKey.startsWith("sk-")) {
      console.error("[v0] API key inválida detectada")
      throw new Error("Chave da API OpenAI inválida. Entre em contato com o suporte.")
    }

    const supabase = await createClient()

    // Authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new AuthenticationError()
    }

    // Rate limiting
    const rateLimit = checkRateLimit(`caption:${user.id}`, 10, 3_600_000)
    if (!rateLimit.allowed) {
      throw new RateLimitError(rateLimit.resetAt)
    }

    // Get user data
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (userError || !userData) {
      throw new NotFoundError("Usuário")
    }

    const isAdmin = userData.role === "admin" || user.email === config.admin.email

    // Parse and validate request body
    const body = (await request.json()) as CaptionRequest
    const validation = validateCaptionRequest(body)

    if (!validation.valid) {
      throw new ValidationError(validation.error ?? "Requisição inválida")
    }

    const tone = sanitizeInput(String(body.tone || "").trim())
    const platform = sanitizeInput(String(body.platform || "").trim())
    const businessDescription = sanitizeInput(String(body.businessDescription || "").trim())
    const goal = sanitizeInput(String(body.goal || "").trim())
    const numVariations = clamp(Number(body.numVariations || 1), MIN_VARIATIONS, MAX_VARIATIONS)

    // Check credits
    if (!isAdmin && (userData.credits ?? 0) < 1) {
      throw new InsufficientCreditsError(1, userData.credits ?? 0)
    }

    console.log(`[v0] Gerando ${numVariations} variações para usuário ${user.email}`)

    // Generate variations
    const results: CaptionResult[] = []
    const errors: string[] = []

    for (let i = 0; i < numVariations; i++) {
      try {
        console.log(`[v0] Gerando variação ${i + 1}/${numVariations}`)
        const caption = await generateOneVariation(businessDescription, tone, platform, goal)
        results.push(caption)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Erro desconhecido"
        console.error(`[v0] Erro ao gerar variação ${i + 1}:`, errorMsg)
        errors.push(errorMsg)

        // If we have at least one result, continue
        if (results.length === 0 && i === numVariations - 1) {
          throw new Error(`Falha ao gerar legendas: ${errorMsg}`)
        }
      }
    }

    if (results.length === 0) {
      throw new Error("Não foi possível gerar nenhuma legenda. Tente novamente.")
    }

    // Deduct credits (1 credit per request, not per variation)
    let creditsRemaining = userData.credits ?? 0
    if (!isAdmin) {
      const newCredits = Math.max(0, (userData.credits ?? 0) - 1)
      const { error: updateError } = await supabase.from("users").update({ credits: newCredits }).eq("id", user.id)

      if (updateError) {
        console.error("[v0] Erro ao atualizar créditos:", updateError)
        throw new Error("Erro ao processar créditos")
      }

      creditsRemaining = newCredits
    }

    // Save first caption to posts table
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
    } catch (error) {
      console.error("[v0] Erro ao salvar post:", error)
      // Don't throw, just log
    }

    // Log usage
    try {
      await supabase.from("usage_logs").insert({
        user_id: user.id,
        action: "generate_caption",
        credits_used: isAdmin ? 0 : 1,
        cost_usd: 0,
        metadata: {
          tone,
          platform,
          goal,
          model: MODEL,
          numVariations,
          successCount: results.length,
          errorCount: errors.length,
        },
      })
    } catch (error) {
      console.error("[v0] Erro ao registrar uso:", error)
      // Don't throw, just log
    }

    console.log(`[v0] Geração concluída com sucesso: ${results.length} legendas`)

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
    console.error("[v0] Erro no handler:", error)
    const errorResponse = handleError(error)
    return NextResponse.json(
      {
        error: errorResponse.message,
        code: errorResponse.code,
      },
      { status: errorResponse.statusCode },
    )
  }
}
