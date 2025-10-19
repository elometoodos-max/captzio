import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { config } from "@/lib/config"
import { validateImageGeneration } from "@/lib/validation"
import { handleApiError } from "@/lib/error-handler"

const IMAGE_GENERATION_ENDPOINT = "https://api.openai.com/v1/images/generations"
const IMAGE_MODEL = "gpt-image-1"

const CREDIT_COSTS = {
  low: { "1024x1024": 1, "1024x1536": 2, "1536x1024": 2 },
  medium: { "1024x1024": 4, "1024x1536": 6, "1536x1024": 6 },
  high: { "1024x1024": 17, "1024x1536": 25, "1536x1024": 25 },
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Image generation started")
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, style = "natural", quality: frontendQuality = "standard", size = "1024x1024" } = body

    // Map frontend quality to API quality
    const qualityMap: Record<string, "low" | "medium" | "high"> = {
      standard: "low",
      hd: "high",
      low: "low",
      medium: "medium",
      high: "high",
    }
    const quality = qualityMap[frontendQuality] || "low"

    const validation = validateImageGeneration({ prompt, style, quality, size })
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    if (!prompt || prompt.trim().length < 10) {
      return NextResponse.json({ error: "Descrição muito curta. Mínimo 10 caracteres." }, { status: 400 })
    }

    if (prompt.trim().length > 1000) {
      return NextResponse.json({ error: "Descrição muito longa. Máximo 1000 caracteres." }, { status: 400 })
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("credits, role, email")
      .eq("id", user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const isAdmin = userData.role === "admin" || userData.email === config.admin.email

    const requiredCredits = CREDIT_COSTS[quality][size as keyof (typeof CREDIT_COSTS)[typeof quality]] || 1

    if (!isAdmin && userData.credits < requiredCredits) {
      return NextResponse.json(
        {
          error: `Créditos insuficientes. Você precisa de ${requiredCredits} créditos para gerar uma imagem ${quality} ${size}.`,
        },
        { status: 402 },
      )
    }

    const { data: jobData, error: jobError } = await supabase
      .from("images")
      .insert({
        user_id: user.id,
        prompt: prompt.trim(),
        style,
        quality,
        status: "pending",
        credits_used: isAdmin ? 0 : requiredCredits,
      })
      .select()
      .single()

    if (jobError || !jobData) {
      console.error("[v0] Error creating image job:", jobError)
      return NextResponse.json({ error: "Erro ao criar job de imagem" }, { status: 500 })
    }

    if (!isAdmin) {
      const { error: creditError } = await supabase
        .from("users")
        .update({ credits: userData.credits - requiredCredits })
        .eq("id", user.id)

      if (creditError) {
        console.error("[v0] Error reserving credits:", creditError)
        await supabase.from("images").delete().eq("id", jobData.id)
        return NextResponse.json({ error: "Erro ao reservar créditos" }, { status: 500 })
      }
    }

    console.log("[v0] Starting async image generation with GPT Image 1")

    generateImageAsync(jobData.id, prompt.trim(), style, quality, size, user.id, isAdmin, requiredCredits).catch(
      (error) => {
        console.error("[v0] Unhandled error in generateImageAsync:", error)
      },
    )

    return NextResponse.json({
      success: true,
      jobId: jobData.id,
      message: "Geração de imagem iniciada",
      estimatedTime: "30-60 segundos",
      creditsUsed: isAdmin ? 0 : requiredCredits,
    })
  } catch (error) {
    console.error("[v0] Image generation error:", error)
    return handleApiError(error)
  }
}

async function generateImageAsync(
  jobId: string,
  prompt: string,
  style: string,
  quality: "low" | "medium" | "high",
  size: string,
  userId: string,
  isAdmin: boolean,
  creditsUsed: number,
) {
  try {
    console.log("[v0] Processing image generation for job:", jobId)

    const supabase = await createClient()

    await supabase.from("images").update({ status: "processing" }).eq("id", jobId)

    console.log("[v0] Calling GPT Image 1 API with quality:", quality, "size:", size)

    const enhancedPrompt = `${prompt}. High quality, professional, detailed.`

    const payload = {
      model: IMAGE_MODEL,
      prompt: enhancedPrompt,
      quality: quality, // low, medium, or high
      size: size, // 1024x1024, 1024x1536, or 1536x1024
      n: 1,
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 90000) // 90s timeout for images

    const response = await fetch(IMAGE_GENERATION_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openai.apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[v0] OpenAI API error:", errorData)

      let errorMessage = errorData.error?.message || `HTTP ${response.status}: Erro ao gerar imagem`

      if (response.status === 401) {
        errorMessage = "Erro de autenticação com a API OpenAI. Verifique a chave da API."
      } else if (response.status === 429) {
        errorMessage = "Limite de requisições atingido. Tente novamente em alguns minutos."
      } else if (response.status === 400) {
        errorMessage = "Prompt inválido ou parâmetros incorretos."
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log("[v0] Response received from OpenAI")

    const imageBase64 = data.data?.[0]?.b64_json

    if (!imageBase64) {
      throw new Error("Nenhuma imagem foi gerada pela API")
    }

    console.log("[v0] Image generated successfully, converting base64 to URL")

    const imageDataUrl = `data:image/png;base64,${imageBase64}`

    await supabase
      .from("images")
      .update({
        status: "completed",
        image_url: imageDataUrl, // Store as data URL
        revised_prompt: null, // gpt-image-1 doesn't return revised_prompt
      })
      .eq("id", jobId)

    await supabase.from("usage_logs").insert({
      user_id: userId,
      action: "generate_image",
      credits_used: isAdmin ? 0 : creditsUsed,
      cost_usd: 0,
      metadata: {
        prompt,
        style,
        quality,
        size,
        model: IMAGE_MODEL,
        usage: data.usage, // Include token usage from response
      },
    })

    console.log("[v0] Image generation completed successfully for job:", jobId)
  } catch (error) {
    console.error("[v0] Image generation failed:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao gerar imagem"

    const supabase = await createClient()

    await supabase
      .from("images")
      .update({
        status: "failed",
        error_message: errorMessage,
      })
      .eq("id", jobId)

    if (!isAdmin) {
      const { data: userData } = await supabase.from("users").select("credits").eq("id", userId).single()

      if (userData) {
        await supabase
          .from("users")
          .update({ credits: userData.credits + creditsUsed })
          .eq("id", userId)
        console.log("[v0] Credits refunded for failed generation")
      }
    }
  }
}
