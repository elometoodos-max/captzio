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

export async function POST(request: Request) {
  try {
    console.log("[caption] generation started")
    const supabase = await createClient()

    // auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) throw new AuthenticationError()
    console.log("[caption] user:", user.id)

    // rate limit: 10/h
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

    const { businessDescription, tone, platform, goal, numVariations } = body
    const sanitizedDescription = sanitizeInput(businessDescription)
    const sanitizedGoal = sanitizeInput(goal)

    if (!isAdmin && userData.credits < 1) {
      throw new InsufficientCreditsError(1, userData.credits)
    }

    // prompt
    const prompt = `Você é um copywriter especializado em redes sociais. Gere ${numVariations} variantes de legenda em português para o negócio: ${sanitizedDescription}. Tom: ${tone}. Plataforma: ${platform}. Objetivo: ${sanitizedGoal}. Cada legenda com 1-3 emojis, 1 linha de CTA e 5 hashtags relevantes. Retorne apenas JSON array com objetos: {"caption":"...","cta":"...","hashtags":["...","..."]}. Não explique nada.`

    console.log("[caption] calling OpenAI model:", config.openai.models.caption)

    // Open GPT-5 Nano: sem temperature; usar max_completion_tokens
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: config.openai.models.caption, // ex.: "gpt-5-nano"
        messages: [
          {
            role: "system",
            content:
              "Você é um especialista em copywriting para redes sociais. Sempre retorne respostas em JSON válido.",
          },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 1000, // substitui max_tokens
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

    const openaiData = await openaiResponse.json()
    const content: string | undefined = openaiData?.choices?.[0]?.message?.content
    if (!content) throw new Error("Resposta vazia da IA")

    // parsing robusto: aceita JSON puro ou cercado por ```json ... ```
    const extractJson = (txt: string): string => {
      const fenced =
        txt.match(/```json\s*([\s\S]*?)```/i) ||
        txt.match(/```\s*([\s\S]*?)```/i)
      return fenced ? fenced[1].trim() : txt.trim()
    }

    let results: CaptionResult[]
    try {
      const jsonString = extractJson(content)
      const parsed = JSON.parse(jsonString)
      results = Array.isArray(parsed) ? parsed : [parsed]
    } catch (parseError) {
      console.error("[caption] parse failure; content:", content)
      throw new Error("Erro ao processar resposta da IA")
    }

    // tokens e custo (estimativa simples)
    const tokensUsed =
      openaiData?.usage?.total_tokens ??
      (openaiData?.usage?.completion_tokens ?? 0) + (openaiData?.usage?.prompt_tokens ?? 0)
    const costEstimate = (tokensUsed / 1_000_000) * 0.45

    // debita crédito (se não for admin)
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

    // salva primeiro resultado (se houver)
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

    // log de uso
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
