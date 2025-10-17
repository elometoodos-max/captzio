import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import OpenAI from "openai"
import { config } from "@/lib/config"
import { validateImageGeneration } from "@/lib/validation"
import { handleApiError } from "@/lib/error-handler"

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
})

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Image generation started")
    const supabase = await createServerClient()

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
        prompt,
        style,
        quality,
        status: "pending",
        credits_used: isAdmin ? 0 : requiredCredits,
      })
      .select()
      .single()

    if (jobError || !jobData) {
      return NextResponse.json({ error: "Erro ao criar job de imagem" }, { status: 500 })
    }

    // Reserve credits immediately (will be refunded if generation fails)
    if (!isAdmin) {
      const { error: creditError } = await supabase
        .from("users")
        .update({ credits: userData.credits - requiredCredits })
        .eq("id", user.id)

      if (creditError) {
        // Rollback job creation
        await supabase.from("images").delete().eq("id", jobData.id)
        return NextResponse.json({ error: "Erro ao reservar créditos" }, { status: 500 })
      }
    }

    console.log("[v0] Starting async image generation with model:", config.openai.models.image)

    // Start async image generation
    generateImageAsync(jobData.id, prompt, style, quality, user.id, isAdmin)

    return NextResponse.json({
      success: true,
      jobId: jobData.id,
      message: "Geração de imagem iniciada",
    })
  } catch (error) {
    console.error("[v0] Image generation error:", error)
    return handleApiError(error)
  }
}

// Async function to generate image (runs in background)
async function generateImageAsync(
  jobId: string,
  prompt: string,
  style: string,
  quality: string,
  userId: string,
  isAdmin: boolean,
) {
  const supabase = await createServerClient()

  try {
    console.log("[v0] Processing image generation for job:", jobId)

    // Update status to processing
    await supabase.from("images").update({ status: "processing" }).eq("id", jobId)

    console.log("[v0] Calling OpenAI DALL-E with model:", config.openai.models.image)

    // Generate image with OpenAI DALL-E
    const response = await openai.images.generate({
      model: config.openai.models.image,
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: quality === "hd" ? "hd" : "standard",
      style: style === "vivid" ? "vivid" : "natural",
    })

    const imageUrl = response.data[0]?.url

    if (!imageUrl) {
      throw new Error("Nenhuma imagem foi gerada")
    }

    console.log("[v0] Image generated successfully:", imageUrl)

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
        model: config.openai.models.image,
      },
    })
  } catch (error) {
    console.error("[v0] Image generation failed:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao gerar imagem"

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
      }
    }
  }
}
