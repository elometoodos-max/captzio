// app/api/generate-caption/route.ts
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
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

// Helper para extrair texto da Responses API, cobrindo todos os formatos conhecidos.
function extractResponseText(resp: any): string | undefined {
  // 1) Campo direto (mais comum)
  const t1 = resp?.output_text
  if (typeof t1 === "string" && t1.trim()) return t1.trim()

  // 2) Estrutura por "output[].content[].text"
  const t2 = resp?.output?.[0]?.content?.[0]?.text
  if (typeof t2 === "string" && t2.trim()) return t2.trim()

  // 3) Alguns retornam em "data[]" (streams agregadas)
  if (Array.isArray(resp?.data)) {
    const parts: string[] = []
    for (const item of resp.data) {
      const piece = item?.output_text || item?.output?.[0]?.content?.[0]?.text
      if (typeof piece === "string") parts.push(piece)
    }
    const joined = parts.join("").trim()
    if (joined) return joined
  }

  // 4) Último recurso: stringify para debug (não recomendado em prod)
  return undefined
}

export async function POST(request: Request) {
  try {
    console.log("[caption] generation started")
    const supabase = await createClient()

    // Autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) throw new AuthenticationError()
    console.log("[caption] user:", user.id)

    // Rate limit: 10/hora
    const rateLimit = checkRateLimit(`caption:${user.id}`, 10, 3600000)
    if (!rateLimit.allowed) throw new RateLimitError(rateLimit.resetAt)

    // Carrega usuário e créditos
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (userError || !userData) throw new NotFoundError("Usuário")
    const isAdmin = userData.role === "admin" || user.email === config.admin.email

    // Corpo + validação
    const body: CaptionRequest = await request.json()
    const validation = validateCaptionRequest(body)
    if (!validation.valid) throw new ValidationError(validation.error!)

    const { businessDescription, tone, platform, goal, numVariations } = body
    const sanitizedDescription = sanitizeInput(businessDescription)
    const sanitizedGoal = sanitizeInput(goal)

    if (!isAdmin && userData.credits < 1) {
      throw new InsufficientCreditsError(1, userData.credits)
    }

    // Prompt: simples e direto (sem cercar com ```), pois usamos JSON Schema na resposta
    const userPrompt =
      `Você é um copywriter brasileiro especializado em redes sociais.\n` +
      `Gere ${numVariations} variantes de legenda em português para o negócio: ${sanitizedDescription}.\n` +
      `Tom: ${tone}.\nPlataforma: ${platform}.\nObjetivo: ${sanitizedGoal}.\n` +
      `Cada legenda deve ter: 1–3 emojis, 1 linha de CTA e 5 hashtags relevantes.\n` +
      `Retorne APENAS no formato do schema fornecido.`

    console.log("[caption] calling Responses API with model:", config.openai.models.caption)

    // Chamada na Responses API (correta para GPT-5 Nano). Sem 'temperature'. Usa max_output_tokens.
    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: config.openai.models.caption, // ex.: "gpt-5-nano"
        // Instrução mínima para manter JSON válido
        instructions: "Responda exclusivamente com JSON válido, conforme o schema.",

        // Conteúdo do usuário
        input: [
          { role: "user", content: userPrompt }
        ],

        // Limite de saída (substitui max_tokens)
        max_output_tokens: 1000,

        // Força JSON conforme schema (evita texto solto e blocos markdown)
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "CaptionArray",
            // Schema de um array de objetos { caption, cta, hashtags[] }
            schema: {
              type: "array",
              minItems: 1,
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
                    items: { type: "string", pattern: "^#?\\w[\\w\\d_]*$" }
                  }
                }
              }
            },
            strict: true
          }
        }
      }),
    })

    if (!openaiResponse.ok) {
      let errMsg = "Erro desconhecido"
      try {
        const errorData = await openaiResponse.json()
        errMsg = errorData?.error?.message || JSON.stringify(errorData)
        console.error("[caption] openai error:", errorData)
      } catch {
        console.error("[caption] openai error (non-JSON)")
      }
      throw new Error(`Erro ao gerar legendas com IA: ${errMsg}`)
    }

    // Parse da Responses API
    const ai = await openaiResponse.json()
    const text = extractResponseText(ai)
    if (!text) {
      console.error("[caption] empty output from model:", ai)
      throw new Error("Resposta vazia da IA")
    }

    let results: CaptionResult[]
    try {
      const parsed = JSON.parse(text)
      results = Array.isArray(parsed) ? parsed : [parsed]
    } catch (e) {
      console.error("[caption] JSON parse error. Raw text:", text)
      throw new Error("Erro ao processar resposta da IA (JSON inválido)")
    }

    // Tokens e custo (estimativa simples; ajuste conforme pricing real do modelo)
    const usage = ai?.usage ?? {}
    const tokensUsed =
      usage?.total_tokens ??
      ((usage?.output_tokens ?? 0) + (usage?.input_tokens ?? 0))
    const costEstimate = (tokensUsed / 1_000_000) * 0.45

    // Débito de crédito (não-admin)
    if (!isAdmin) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ credits: userData.credits - 1 })
        .eq("id", user.id)
      if (updateError) {
        console.error("[caption] credit update error:", updateError)
        throw new Error("Erro ao processar créditos")
      }
    }

    // Persistência (primeiro item)
    try {
      const first = results[0] || { caption: "", hashtags: [], cta: "" }
      await supabase.from("posts").insert({
        user_id: user.id,
        caption: first.caption || "",
        hashtags: first.hashtags || [],
        cta: first.cta || "",
        tone,
        platform,
        credits_used: isAdmin ? 0 : 1,
      })
    } catch (saveError) {
      console.error("[caption] save error:", saveError)
      // não bloqueia a resposta
    }

    // Log de uso
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
        model: config.openai.models.caption,
        numVariations,
        rateLimit: {
          remaining: rateLimit.remaining,
          resetAt: rateLimit.resetAt,
        },
      },
    })

    return NextResponse.json({
      results,
      creditsRemaining: isAdmin ? "∞" : userData.credits - 1,
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
      { status: errorResponse.statusCode },
    )
  }
}
