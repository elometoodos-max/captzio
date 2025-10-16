import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

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
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Get user data and check credits
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (userError || !userData) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const isAdmin = userData.role === "admin" || user.email === process.env.ADMIN_EMAIL

    if (!isAdmin && userData.credits < 1) {
      return NextResponse.json({ error: "Créditos insuficientes" }, { status: 402 })
    }

    const body: CaptionRequest = await request.json()
    const { businessDescription, tone, platform, goal, numVariations } = body

    // Build the prompt for GPT-5 Nano
    const prompt = `Você é um copywriter especializado em redes sociais. Gere ${numVariations} variantes de legenda em português para o negócio: ${businessDescription}. Tom: ${tone}. Plataforma: ${platform}. Objetivo: ${goal}. Cada legenda com 1-3 emojis, 1 linha de CTA e 5 hashtags relevantes. Retorne apenas JSON array com objetos: {"caption":"...","cta":"...","hashtags":["...","..."]}. Não explique nada.`

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
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
      return NextResponse.json({ error: "Erro ao gerar legendas com IA" }, { status: 500 })
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: "Resposta vazia da IA" }, { status: 500 })
    }

    // Parse the JSON response
    let results: CaptionResult[]
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/)
      const jsonString = jsonMatch ? jsonMatch[1] : content
      results = JSON.parse(jsonString)
    } catch (parseError) {
      console.error("[v0] Failed to parse OpenAI response:", content)
      return NextResponse.json({ error: "Erro ao processar resposta da IA" }, { status: 500 })
    }

    // Calculate tokens and cost
    const tokensUsed = openaiData.usage?.total_tokens || 0
    const costEstimate = (tokensUsed / 1000000) * 0.45 // Cost for GPT-5 Nano

    if (!isAdmin) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ credits: userData.credits - 1 })
        .eq("id", user.id)

      if (updateError) {
        console.error("[v0] Failed to deduct credits:", updateError)
        return NextResponse.json({ error: "Erro ao processar créditos" }, { status: 500 })
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

    // Log usage
    await supabase.from("usage_logs").insert({
      user_id: user.id,
      action: "generate_caption",
      credits_used: isAdmin ? 0 : 1,
      cost_usd: costEstimate,
      metadata: { tone, platform, goal, tokensUsed, model: "gpt-5-nano" },
    })

    return NextResponse.json({
      results,
      creditsRemaining: isAdmin ? "∞" : userData.credits - 1,
      isAdmin,
    })
  } catch (error) {
    console.error("[v0] Generate caption error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
