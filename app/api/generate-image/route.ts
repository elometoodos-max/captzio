import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface ImageRequest {
  prompt: string
  style: string
  quality: string
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

    const creditsRequired = 5

    const isAdmin = userData.role === "admin" || user.email === process.env.ADMIN_EMAIL

    if (!isAdmin && userData.credits < creditsRequired) {
      return NextResponse.json({ error: "Créditos insuficientes" }, { status: 402 })
    }

    const body: ImageRequest = await request.json()
    const { prompt, style, quality } = body

    // Create image job with pending status
    const { data: imageJob, error: jobError } = await supabase
      .from("images")
      .insert({
        user_id: user.id,
        prompt,
        status: "pending",
        credits_used: isAdmin ? 0 : creditsRequired,
      })
      .select()
      .single()

    if (jobError || !imageJob) {
      return NextResponse.json({ error: "Erro ao criar job de imagem" }, { status: 500 })
    }

    if (!isAdmin) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ credits: userData.credits - creditsRequired })
        .eq("id", user.id)

      if (updateError) {
        console.error("[v0] Failed to reserve credits:", updateError)
        return NextResponse.json({ error: "Erro ao reservar créditos" }, { status: 500 })
      }
    }

    // Start async image generation (in production, this would be a queue job)
    generateImageAsync(imageJob.id, prompt, style, quality, isAdmin)

    return NextResponse.json({
      jobId: imageJob.id,
      status: "pending",
      isAdmin,
    })
  } catch (error) {
    console.error("[v0] Generate image error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

async function generateImageAsync(jobId: string, prompt: string, style: string, quality: string, isAdmin: boolean) {
  const supabase = await createClient()

  try {
    // Update status to processing
    await supabase.from("images").update({ status: "processing" }).eq("id", jobId)

    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: quality === "hd" ? "hd" : "standard",
        style: style === "vivid" ? "vivid" : "natural",
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error("[v0] OpenAI API error:", errorData)
      throw new Error(errorData.error?.message || "Erro ao gerar imagem")
    }

    const openaiData = await openaiResponse.json()
    const imageUrl = openaiData.data[0]?.url

    if (!imageUrl) {
      throw new Error("URL da imagem não retornada")
    }

    // Update job with completed status and image URL
    await supabase
      .from("images")
      .update({
        status: "completed",
        image_url: imageUrl,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId)

    // Log usage
    const { data: imageData } = await supabase.from("images").select("user_id").eq("id", jobId).single()

    if (imageData) {
      await supabase.from("usage_logs").insert({
        user_id: imageData.user_id,
        action: "generate_image",
        credits_used: isAdmin ? 0 : 5,
        cost_usd: quality === "hd" ? 0.08 : 0.04,
        metadata: { style, quality, model: "gpt-image-1" },
      })
    }
  } catch (error) {
    console.error("[v0] Image generation failed:", error)

    // Update job with failed status
    await supabase
      .from("images")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Erro desconhecido",
      })
      .eq("id", jobId)

    if (!isAdmin) {
      const { data: imageData } = await supabase.from("images").select("user_id, credits_used").eq("id", jobId).single()

      if (imageData) {
        const { data: userData } = await supabase.from("users").select("credits").eq("id", imageData.user_id).single()

        if (userData) {
          await supabase
            .from("users")
            .update({ credits: userData.credits + imageData.credits_used })
            .eq("id", imageData.user_id)
        }
      }
    }
  }
}
