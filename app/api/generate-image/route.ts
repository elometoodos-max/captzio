// app/api/generate-image/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { config } from "@/lib/config"
import { validateImageGeneration } from "@/lib/validation"
import { handleApiError } from "@/lib/error-handler"

export const runtime = "nodejs"

const IMAGE_GENERATION_ENDPOINT = "https://api.openai.com/v1/images/generations"
const IMAGE_MODEL = "gpt-image-1" as const

type InternalQuality = "low" | "medium" | "high"
type ApiQuality = "standard" | "hd"
type ApiSize = "1024x1024" | "1024x1536" | "1536x1024"
type ApiStyle = "natural" | "vivid"

// --- ler corpo em JSON OU FormData (para casos em que o front não manda JSON puro)
async function readBody(req: NextRequest): Promise<Record<string, any>> {
  const ct = req.headers.get("content-type")?.toLowerCase() ?? ""
  if (ct.includes("application/json")) {
    try { return await req.json() } catch {}
  }
  try {
    const fd = await req.formData()
    const obj: Record<string, any> = {}
    for (const [k, v] of fd.entries()) obj[k] = typeof v === "string" ? v : (v as File).name
    if (Object.keys(obj).length) return obj
  } catch {}
  try {
    const txt = await req.text()
    if (txt && txt.trim().length) return JSON.parse(txt)
  } catch {}
  return {}
}

// --- normalizadores (aceitam labels do UI)
function normalizeStyle(input?: string): ApiStyle {
  if (!input) return "natural"
  const s = input.toLowerCase()
  if (s.includes("vivid") || s.includes("vívido") || s.includes("vibrant") || s.includes("vibrante") || s.includes("vivo"))
    return "vivid"
  return "natural"
}
function normalizeSize(input?: string): ApiSize {
  if (!input) return "1024x1024"
  const s = input.toLowerCase().trim()
  if (s.includes("1:1") || s.includes("quadrado") || s.includes("square")) return "1024x1024"
  if (s.includes("vertical") || s.includes("retrato") || s.includes("portrait")) return "1024x1536"
  if (s.includes("horizontal") || s.includes("paisagem") || s.includes("landscape")) return "1536x1024"
  if (s === "1024x1024" || s === "1024x1536" || s === "1536x1024") return s as ApiSize
  return "1024x1024"
}

// front → qualidade interna (créditos)
const frontendToInternal: Record<string, InternalQuality> = {
  standard: "low",
  hd: "high",
  low: "low",
  medium: "medium",
  high: "high",
}
// interna → qualidade aceita pela API
const internalToApi: Record<InternalQuality, ApiQuality> = {
  low: "standard",
  medium: "standard",
  high: "hd",
}

// custos por qualidade interna
const CREDIT_COSTS: Record<InternalQuality, Record<ApiSize, number>> = {
  low: { "1024x1024": 1, "1024x1536": 2, "1536x1024": 2 },
  medium: { "1024x1024": 4, "1024x1536": 6, "1536x1024": 6 },
  high: { "1024x1024": 17, "1024x1536": 25, "1536x1024": 25 },
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Image generation started")

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const raw = await readBody(request)
    const rawPrompt = (raw?.prompt ?? "") as string
    const rawStyle = (raw?.style ?? "natural") as string
    const rawQuality = (raw?.quality ?? "standard") as string
    const rawSize = (raw?.size ?? "1024x1024") as string

    const prompt = typeof rawPrompt === "string" ? rawPrompt.trim() : ""
    const style = normalizeStyle(rawStyle)
    const size = normalizeSize(rawSize)
    const internalQuality: InternalQuality = frontendToInternal[String(rawQuality).toLowerCase()] || "low"

    console.log("[v0] Raw inputs:", { rawPrompt, rawStyle, rawQuality, rawSize })
    console.log("[v0] Normalized inputs:", { prompt, style, size, internalQuality })

    // validação com valores normalizados (espera internalQuality)
    const validation = validateImageGeneration({ prompt, style, quality: internalQuality, size })
    if (!validation.success) return NextResponse.json({ error: validation.error }, { status: 400 })

    if (!prompt || prompt.length < 10) return NextResponse.json({ error: "Descrição muito curta. Mínimo 10 caracteres." }, { status: 400 })
    if (prompt.length > 1000) return NextResponse.json({ error: "Descrição muito longa. Máximo 1000 caracteres." }, { status: 400 })

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("credits, role, email")
      .eq("id", user.id)
      .single()
    if (userError || !userData) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    const isAdmin = userData.role === "admin" || userData.email === config.admin.email
    const requiredCredits = CREDIT_COSTS[internalQuality][size] ?? 1

    if (!isAdmin && (userData.credits ?? 0) < requiredCredits) {
      return NextResponse.json(
        { error: `Créditos insuficientes. Você precisa de ${requiredCredits} créditos para gerar uma imagem ${internalQuality} ${size}.` },
        { status: 402 },
      )
    }

    // cria job
    const { data: jobData, error: jobError } = await supabase
      .from("images")
      .insert({
        user_id: user.id,
        prompt,
        style,                 // "natural" | "vivid"
        quality: internalQuality, // interno
        status: "pending",
        credits_used: isAdmin ? 0 : requiredCredits,
      })
      .select()
      .single()
    if (jobError || !jobData) {
      console.error("[v0] Error creating image job:", jobError)
      return NextResponse.json({ error: "Erro ao criar job de imagem" }, { status: 500 })
    }

    // reserva créditos
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

    generateImageAsync(jobData.id, prompt, style, internalQuality, size, user.id, isAdmin, requiredCredits).catch((e) =>
      console.error("[v0] Unhandled error in generateImageAsync:", e),
    )

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
  style: ApiStyle,
  internalQuality: InternalQuality,
  size: ApiSize,
  userId: string,
  isAdmin: boolean,
  creditsUsed: number,
) {
  try {
    console.log("[v0] Processing image generation for job:", jobId)
    const supabase = await createClient()
    await supabase.from("images").update({ status: "processing" }).eq("id", jobId)

    const apiQuality: ApiQuality = internalToApi[internalQuality]
    const payload = { model: IMAGE_MODEL, prompt, style, quality: apiQuality, size, n: 1 as const }

    console.log("[v0] Sending request to OpenAI with payload:", JSON.stringify(payload, null, 2))

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 90_000)

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
      console.error("[v0] OpenAI API error response:", JSON.stringify(errorData, null, 2))
      console.error("[v0] Status code:", response.status)
      let msg = errorData?.error?.message || `HTTP ${response.status}: Erro ao gerar imagem`
      if (response.status === 401) msg = "Erro de autenticação com a API OpenAI. Verifique a chave da API."
      else if (response.status === 429) msg = "Limite de requisições atingido. Tente novamente em alguns minutos."
      else if (response.status === 400) msg = `Parâmetros inválidos: ${errorData?.error?.message || "Verifique prompt, size, quality ou style"}`
      throw new Error(msg)
    }

    const data = await response.json()
    console.log("[v0] Response received from OpenAI successfully")

    const imageBase64: string | undefined = data?.data?.[0]?.b64_json
    if (!imageBase64) throw new Error("Nenhuma imagem foi gerada pela API")

    const imageDataUrl = `data:image/png;base64,${imageBase64}`

    await supabase
      .from("images")
      .update({
        status: "completed",
        image_url: imageDataUrl,
        revised_prompt: null,
      })
      .eq("id", jobId)

    const usage = data?.usage ?? null

    await supabase.from("usage_logs").insert({
      user_id: userId,
      action: "generate_image",
      credits_used: isAdmin ? 0 : creditsUsed,
      cost_usd: 0,
      metadata: { prompt, style, quality: internalQuality, size, model: IMAGE_MODEL, usage },
    })

    console.log("[v0] Image generation completed successfully for job:", jobId)
  } catch (error) {
    console.error("[v0] Image generation failed:", error)
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao gerar imagem"

    const supabase = await createClient()
    await supabase
      .from("images")
      .update({ status: "failed", error_message: errorMessage })
      .eq("id", jobId)

    if (!isAdmin) {
      const { data: userData } = await supabase.from("users").select("credits").eq("id", userId).single()
      if (userData) {
        await supabase.from("users").update({ credits: (userData.credits ?? 0) + creditsUsed }).eq("id", userId)
        console.log("[v0] Credits refunded for failed generation")
      }
    }
  }
}
