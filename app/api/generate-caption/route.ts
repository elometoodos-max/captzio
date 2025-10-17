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

export async function POST(request: Request) {
  try {
    console.log("[v0] Caption generation started")
    const supabase = await createClient()

    // Check authentication with custom error
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new AuthenticationError()
    }

    console.log("[v0] User authenticated:", user.id)

    const rateLimit = checkRateLimit(`caption:${user.id}`, 10, 3600000) // 10 per hour
    if (!rateLimit.allowed) {
      throw new RateLimitError(rateLimit.resetAt)
    }

    // Get user data and check credits
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (userError || !userData) {
      throw new NotFoundError("Usuário")
    }

    const isAdmin = userData.role === "admin" || user.email === config.admin.email

    const body = await request.json()
    const validation = validateCaptionRequest(body)

    if (!validation.valid) {
      throw new ValidationError(validation.error!)
    }

    const { businessDescription, tone, platform, goal, numVariations } = body

    const sanitizedDescription = sanitizeInput(businessDescription)
    const sanitizedGoal = sanitizeInput(goal)

    if (!isAdmin && userData.credits < 1) {
      throw new InsufficientCreditsError(1, userData.credits)
    }

    // Build the prompt for GPT-5 Nano
    const prompt = `Você é um copywriter especializado em redes sociais. Gere ${numVariations} variantes de legenda em português para o negócio: ${sanitizedDescription}. Tom: ${tone}. Plataforma: ${platform}. Objetivo: ${sanitizedGoal}. Cada legenda com 1-3 emojis, 1 linha de CTA e 5 hashtags relevantes. Retorne apenas JSON array com objetos: {"caption":"...","cta":"...","hashtags":["...","..."]}. Não explique nada.`

    console.log("[v0] Calling OpenAI API with model:", config.openai.models.caption)

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: config.openai.models.caption,
        messages: [
          {
            role: "system",
            content:
              "Você é um especialista em copywriting para redes sociais. Sempre retorne respostas em JSON válido.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error("[v0] OpenAI API error:", errorData)
      throw new Error(`Erro ao gerar legendas com IA: ${errorData.error?.message || "Erro desconhecido"}`)
    }

    console.log("[v0] OpenAI API response received")

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0]?.message?.content

    if (!content) {
      throw new Error("Resposta vazia da IA")
    }

    // Parse the JSON response
    let results
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/)
      const jsonString = jsonMatch ? jsonMatch[1] : content
      results = JSON.parse(jsonString)
    } catch (parseError) {
      console.error("[v0] Failed to parse OpenAI response:", content)
      throw new Error("Erro ao processar resposta da IA")
    }

    // Calculate tokens and cost
    const tokensUsed = openaiData.usage?.total_tokens || 0
    const costEstimate = (tokensUsed / 1000000) * 0.45

    if (!isAdmin) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ credits: userData.credits - 1 })
        .eq("id", user.id)

      if (updateError) {
        console.error("[v0] Failed to deduct credits:", updateError)
        throw new Error("Erro ao processar créditos")
      }
    }

    // Save to database
    const { error: saveError } = await supabase.from("posts").insert({
      user_id: user.id,
      caption: results[0]?.caption || "",
      hashtags: results[0]?.hashtags || [],
      cta: results[0]?.cta || "",
      tone,
      platform,
      credits_used: isAdmin ? 0 : 1,
    })

    if (saveError) {
      console.error("[v0] Failed to save caption:", saveError)
    }

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
    console.error("[v0] Caption generation error:", error)
    const errorResponse = handleError(error)
    return NextResponse.json(
      { error: errorResponse.message, code: errorResponse.code },
      { status: errorResponse.statusCode },
    )
  }
}
