// app/api/generate-image/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { config } from "@/lib/config"
import { validateImageGeneration } from "@/lib/validation"
import { handleApiError } from "@/lib/error-handler"

// Garante ambiente Node.js (mantém o process rodando para o async)
export const runtime = "nodejs"
// (opcional) aumenta o tempo máximo do route no Vercel/Next
export const maxDuration = 120

const IMAGE_GENERATION_ENDPOINT = "https://api.openai.com/v1/images/generations"
const IMAGE_MODEL = "gpt-image-1" as const

// Qualidade interna (seu sistema de créditos) vs qualidade da API (OpenAI)
type InternalQuality = "low" | "medium" | "high"
type ApiQuality = "standard" | "hd"

// Mapeia o que vem do front para a qualidade interna
const frontendToInternal: Record<string, InternalQuality> = {
  standard: "low",
  hd: "high",
  low: "low",
  medium: "medium",
  high: "high",
}

// Mapeia a qualidade interna para o que a API aceita
const internalToApi: Record<InternalQuality, ApiQuality> = {
  low: "standard",
  medium: "standard", // medium usa standard na OpenAI
  high: "hd",
}

// Tabela de crédito permanece igual (em cima da qualidade interna)
const CREDIT_COSTS: Record<InternalQuality, Record<"1024x1024" | "1024x1536" | "1536x1024", number>> = {
  low: { "1024x1024": 1, "1024x1536": 2, "1536x1024": 2 },
  medium: { "1024x1024": 4, "1024x1536": 6, "1536x1024": 6 },
  high: { "1024x1024": 17, "1024x1536": 25, "1536x1024": 25 },
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Image generation started")
    const supabase = await createClient()

    // Autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Leitura do corpo
    const body = await request.json()
    const {
      prompt,
      style = "natural", // "natural" | "vivid"
      quality: frontendQuality = "standard", // "standard" | "hd" (ou legados)
      size = "1024x1024", // "1024x1024" | "1024x1536" | "1536x1024"
    } = body as {
      prompt?: string
      style?: "natural" | "vivid" | string
      quality?: "standard" | "hd" | "low" | "medium" | "high" | string
      size?: "1024x1024" | "1024x1536" | "1536x1024" | string
    }

    // Normaliza qualidade interna (para créditos/DB) e validação
    const internalQuality: InternalQuality = frontendToInternal[frontendQuality] || "low"

    const validation = validateImageGeneration({ prompt, style, quality: internalQuality, size })
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 10) {
      return NextResponse.json({ error: "Descrição muito curta. Mínimo 10 caracteres." }, { status: 400 })
    }

    if (prompt.trim().length > 1000) {
      return NextResponse.json({ error: "Descrição muito longa. Máximo 1000 caracteres." }, { status: 400 })
    }

    // Busca usuário e créditos
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("credits, role, email")
      .eq("id", user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const isAdmin = userData.role === "admin" || userData.email === config.admin.email

    const sizeKey = (["1024x1024", "1024x1536", "1536x1024"] as const).includes(size as any)
      ? (size as "1024x1024" | "1024x1536" | "1536x1024")
      : "1024x1024"

    const requiredCredits =
      CREDIT_COSTS[internalQuality][sizeKey as keyof (typeof CREDIT_COSTS)[typeof internalQuality]] || 1

    if (!isAdmin && (userData.credits ?? 0) < requiredCredits) {
      return NextResponse.json(
        {
          error: `Créditos insuficientes. Você precisa de ${requiredCredits} créditos para gerar uma imagem ${internalQuality} ${sizeKey}.`,
        },
        { status: 402 },
      )
    }

    // Cria job "pending"
    const { data: jobData, error: jobError } = await supabase
      .from("images")
      .insert({
        user_id: user.id,
        prompt: prompt.trim(),
        style,
        quality: internalQuality, // armazena a qualidade interna no DB
        status: "pending",
        credits_used: isAdmin ? 0 : requiredCredits,
      })
      .select()
      .single()

    if (jobError || !jobData) {
      console.error("[v0] Error creating image job:", jobError)
      return NextResponse.json({ error: "Erro ao criar job de imagem" }, { status: 500 })
    }

    // Reserva créditos (se não admin)
    if (!isAdmin) {
      const { error: creditError } = await supabase
        .from("users")
        .update({ credits: (userData.credits ?? 0) - requiredCredits })
        .eq("id", user.id)

      if (creditError) {
        console.error("[v0] Error reserving credits:", creditError)
        await supabase.from("images").delete().eq("id", jobData.id)
        return NextResponse.json({ error: "Erro ao reservar créditos" }, { status: 500 })
      }
    }

    console.log("[v0] Starting async image generation with GPT Image 1")

    // Dispara o processamento assíncrono
    generateImageAsync(
      jobData.id,
      prompt.trim(),
      style,
      internalQuality,
      sizeKey,
      user.id,
      isAdmin,
      requiredCredits,
    ).catch((error) => {
      console.error("[v0] Unhandled error in generateImageAsync:", error)
    })

    // Retorna imediatamente
    return NextResponse.json({
      success: true,
      jobId: jobData.id,
      message: "Geração de imagem iniciada",
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
  internalQuality: InternalQuality,
  size: "1024x1024" | "1024x1536" | "1536x1024",
  userId: string,
  isAdmin: boolean,
  creditsUsed: number,
) {
  try {
    console.log("[v0] Processing image generation for job:", jobId)

    const supabase = await createClient()

    await supabase.from("images").update({ status: "processing" }).eq("id", jobId)

    // Qualidade compatível com a API
    const apiQuality: ApiQuality = internalToApi[internalQuality]

    // Monta payload correto para a OpenAI
    const payload: {
      model: string
      prompt: string
      style?: "natural" | "vivid"
      quality: ApiQuality // "standard" | "hd"
      size: "1024x1024" | "1024x1536" | "1536x1024"
      n: number
    } = {
      model: IMAGE_MODEL,
      prompt,
      style: style === "vivid" ? "vivid" : "natural",
      quality: apiQuality,
      size,
      n: 1,
    }

    console.log("[v0] Sending request to OpenAI with payload:", JSON.stringify(payload, null, 2))

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 90_000) // 90s

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
      // Tenta ler o corpo de erro
      const errorData = await response.json().catch(() => ({} as any))
      console.error("[v0] OpenAI API error response:", JSON.stringify(errorData, null, 2))
      console.error("[v0] Status code:", response.status)

      let errorMessage = errorData?.error?.message || `HTTP ${response.status}: Erro ao gerar imagem`

      if (response.status === 401) {
        errorMessage = "Erro de autenticação com a API OpenAI. Verifique a chave da API."
      } else if (response.status === 429) {
        errorMessage = "Limite de requisições atingido. Tente novamente em alguns minutos."
      } else if (response.status === 400) {
        errorMessage = `Parâmetros inválidos: ${
          errorData?.error?.message || "Verifique prompt, size, quality ou style"
        }`
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log("[v0] Response received from OpenAI successfully")

    const imageBase64: string | undefined = data?.data?.[0]?.b64_json
    if (!imageBase64) {
      console.error("[v0] No image data in response:", JSON.stringify(data, null, 2))
      throw new Error("Nenhuma imagem foi gerada pela API")
    }

    const imageDataUrl = `data:image/png;base64,${imageBase64}`

    await supabase
      .from("images")
      .update({
        status: "completed",
        image_url: imageDataUrl,
        revised_prompt: null, // gpt-image-1 não retorna revised_prompt
      })
      .eq("id", jobId)

    const usage = data?.usage ?? null

    await supabase.from("usage_logs").insert({
      user_id: userId,
      action: "generate_image",
      credits_used: isAdmin ? 0 : creditsUsed,
      cost_usd: 0,
      metadata: {
        prompt,
        style,
        quality: internalQuality,
        size,
        model: IMAGE_MODEL,
        usage, // pode ser null
      },
    })

    console.log("[v0] Image generation completed successfully for job:", jobId)
  } catch (err) {
    console.error("[v0] Image generation failed:", err)
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao gerar imagem"

    const supabase = await createClient()

    // Marca job como failed
    await supabase
      .from("images")
      .update({
        status: "failed",
        error_message: errorMessage,
      })
      .eq("id", jobId)

    // Devolve créditos em caso de falha (se não for admin)
    if (!isAdmin) {
      const { data: userData } = await supabase.from("users").select("credits").eq("id", userId).single()
      if (userData) {
        await supabase
          .from("users")
          .update({ credits: (userData.credits ?? 0) + creditsUsed })
          .eq("id", userId)
        console.log("[v0] Credits refunded for failed generation")
      }
    }
  }
}
