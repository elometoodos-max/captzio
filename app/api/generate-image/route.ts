import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { config } from "@/lib/config"
import { validateImageRequest, sanitizeInput } from "@/lib/validation"
import { checkRateLimit } from "@/lib/rate-limit"
import {
  handleError,
  AuthenticationError,
  NotFoundError,
  InsufficientCreditsError,
  ValidationError,
  RateLimitError,
} from "@/lib/error-handler"

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
      throw new AuthenticationError()
    }

    const rateLimit = checkRateLimit(`image:${user.id}`, 5, 3600000) // 5 per hour
    if (!rateLimit.allowed) {
      throw new RateLimitError(rateLimit.resetAt)
    }

    // Get user data and check credits
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (userError || !userData) {
      throw new NotFoundError("Usuário")
    }

    const creditsRequired = 5
    const isAdmin = userData.role === "admin" || user.email === config.admin.email

    const body = await request.json()
    const validation = validateImageRequest(body)

    if (!validation.valid) {
      throw new ValidationError(validation.error!)
    }

    const { prompt, style, quality } = body

    const sanitizedPrompt = sanitizeInput(prompt)

    if (!isAdmin && userData.credits < creditsRequired) {
      throw new InsufficientCreditsError(creditsRequired, userData.credits)
    }

    // Create image job with pending status
    const { data: imageJob, error: jobError } = await supabase
      .from("images")
      .insert({
        user_id: user.id,
        prompt: sanitizedPrompt,
        status: "pending",
        credits_used: isAdmin ? 0 : creditsRequired,
      })
      .select()
      .single()

    if (jobError || !imageJob) {
      throw new Error("Erro ao criar job de imagem")
    }

    if (!isAdmin) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ credits: userData.credits - creditsRequired })
        .eq("id", user.id)

      if (updateError) {
        // Rollback: delete the image job
        await supabase.from("images").delete().eq("id", imageJob.id)
        console.error("[v0] Failed to reserve credits:", updateError)
        throw new Error("Erro ao reservar créditos")
      }
    }

    // Start async image generation
    generateImageAsync(imageJob.id, sanitizedPrompt, style, quality, isAdmin, user.id, rateLimit)

    return NextResponse.json({
      jobId: imageJob.id,
      status: "pending",
      isAdmin,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt,
      },
    })
  } catch (error) {
    const errorResponse = handleError(error)
    return NextResponse.json(
      { error: errorResponse.message, code: errorResponse.code },
      { status: errorResponse.statusCode },
    )
  }
}

async function generateImageAsync(
  jobId: string,
  prompt: string,
  style: string,
  quality: string,
  isAdmin: boolean,
  userId: string,
  rateLimit: any,
) {
  const supabase = await createClient()

  try {
    // Update status to processing
    await supabase.from("images").update({ status: "processing" }).eq("id", jobId)

    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: config.openai.models.image,
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

    await supabase.from("usage_logs").insert({
      user_id: userId,
      action: "generate_image",
      credits_used: isAdmin ? 0 : 5,
      cost_usd: quality === "hd" ? 0.08 : 0.04,
      metadata: {
        style,
        quality,
        model: config.openai.models.image,
        jobId,
        rateLimit: {
          remaining: rateLimit.remaining,
          resetAt: rateLimit.resetAt,
        },
      },
    })
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

          console.log(`[v0] Refunded ${imageData.credits_used} credits to user ${imageData.user_id}`)
        }
      }
    }
  }
}
