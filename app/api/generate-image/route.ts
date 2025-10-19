import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { config } from "@/lib/config"
import { validateImageGeneration } from "@/lib/validation"
import { handleApiError } from "@/lib/error-handler"

const RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses"
const IMAGE_MODEL = "gpt-image-1" // GPT Image 1 for high-quality images

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Image generation started")
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    console.log("[v0] User authenticated:", user.id)

    // Get request body
    const body = await request.json()
    const { prompt, style = "natural", quality = "standard" } = body

    // Validate input
    const validation = validateImageGeneration({ prompt, style, quality })
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    if (!prompt || prompt.trim().length < 10) {
      return NextResponse.json({ error: "Descrição muito curta. Mínimo 10 caracteres." }, { status: 400 })
    }

    if (prompt.trim().length > 1000) {
      return NextResponse.json({ error: "Descrição muito longa. Máximo 1000 caracteres." }, { status: 400 })
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("credits, role, email")
      .eq("id", user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Check if user is admin (free testing)
    const isAdmin = userData.role === "admin" || userData.email === config.admin.email

    // Check credits (5 credits for image generation)
    const requiredCredits = 5
    if (!isAdmin && userData.credits < requiredCredits) {
      return NextResponse.json(
        { error: "Créditos insuficientes. Você precisa de 5 créditos para gerar uma imagem." },
        { status: 402 },
      )
    }

    // Reserve credits by creating a pending job
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

    // Reserve credits immediately (will be refunded if generation fails)
    if (!isAdmin) {
      const { error: creditError } = await supabase
        .from("users")
        .update({ credits: userData.credits - requiredCredits })
        .eq("id", user.id)

      if (creditError) {
        console.error("[v0] Error reserving credits:", creditError)
        // Rollback job creation
        await supabase.from("images").delete().eq("id", jobData.id)
        return NextResponse.json({ error: "Erro ao reservar créditos" }, { status: 500 })
      }
    }

    console.log("[v0] Starting async image generation with GPT Image 1")

    // Start async image generation
    generateImageAsync(jobData.id, prompt.trim(), style, quality, user.id, isAdmin).catch((error) => {
      console.error("[v0] Unhandled error in generateImageAsync:", error)
    })

    return NextResponse.json({
      success: true,
      jobId: jobData.id,
      message: "Geração de imagem iniciada",
      estimatedTime: "30-60 segundos",
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
  quality: string,
  userId: string,
  isAdmin: boolean,
) {
  try {
    console.log("[v0] Processing image generation for job:", jobId)

    // Create a new Supabase client for this async operation
    const supabase = await createClient()

    // Update status to processing
    await supabase.from("images").update({ status: "processing" }).eq("id", jobId)

    console.log("[v0] Calling OpenAI Responses API with GPT Image 1")

    const payload = {
      model: IMAGE_MODEL,
      reasoning: {
        effort: "low", // Low reasoning for image generation
      },
      instructions: `Generate a high-quality, professional image based on the user's description. 
Style: ${style === "vivid" ? "vibrant, bold colors and dramatic composition" : "natural, realistic, and subtle"}
Quality: ${quality === "hd" ? "ultra high definition with fine details" : "standard quality"}`,
      input: prompt,
      image: {
        size: "1024x1024",
        format: "png",
      },
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000) // 60s timeout for images

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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[v0] OpenAI API error:", errorData)
      throw new Error(errorData.error?.message || `HTTP ${response.status}: Erro ao gerar imagem`)
    }

    const data = await response.json()
    console.log("[v0] Response received from OpenAI")

    // Extract image URL from response
    let imageUrl: string | null = null

    // Try to find image in output array
    if (Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.type === "message" && Array.isArray(item.content)) {
          for (const content of item.content) {
            if (content.type === "output_image" && content.url) {
              imageUrl = content.url
              break
            }
          }
        }
        if (imageUrl) break
      }
    }

    if (!imageUrl) {
      throw new Error("Nenhuma imagem foi gerada pela API")
    }

    console.log("[v0] Image generated successfully")

    // Update job with completed status
    await supabase
      .from("images")
      .update({
        status: "completed",
        image_url: imageUrl,
      })
      .eq("id", jobId)

    // Log usage
    await supabase.from("usage_logs").insert({
      user_id: userId,
      action: "generate_image",
      credits_used: isAdmin ? 0 : 5,
      metadata: {
        prompt,
        style,
        quality,
        model: IMAGE_MODEL,
      },
    })

    console.log("[v0] Image generation completed successfully for job:", jobId)
  } catch (error) {
    console.error("[v0] Image generation failed:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao gerar imagem"

    // Create a new Supabase client for error handling
    const supabase = await createClient()

    // Update job with failed status
    await supabase
      .from("images")
      .update({
        status: "failed",
        error_message: errorMessage,
      })
      .eq("id", jobId)

    // Refund credits if not admin
    if (!isAdmin) {
      const { data: userData } = await supabase.from("users").select("credits").eq("id", userId).single()

      if (userData) {
        await supabase
          .from("users")
          .update({ credits: userData.credits + 5 })
          .eq("id", userId)
        console.log("[v0] Credits refunded for failed generation")
      }
    }
  }
}
