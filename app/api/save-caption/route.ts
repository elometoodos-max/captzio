import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Save caption started")
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { title, caption, tone, platform, hashtags, cta, credits_used = 1 } = body

    if (!caption || caption.trim().length === 0) {
      return NextResponse.json({ error: "Legenda é obrigatória" }, { status: 400 })
    }

    if (caption.length > 5000) {
      return NextResponse.json({ error: "Legenda muito longa (máximo 5000 caracteres)" }, { status: 400 })
    }

    const validPlatforms = ["instagram", "facebook", "linkedin", "twitter", "tiktok", "threads"]
    if (platform && !validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: `Plataforma inválida. Opções válidas: ${validPlatforms.join(", ")}` },
        { status: 400 },
      )
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("credits, role, email")
      .eq("id", user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const isAdmin = userData.role === "admin" || userData.email === "saviobof@gmail.com"

    if (!isAdmin && userData.credits < credits_used) {
      return NextResponse.json(
        { error: `Créditos insuficientes. Você precisa de ${credits_used} créditos.` },
        { status: 402 },
      )
    }

    const { data: postData, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        title: title?.trim() || null,
        caption: caption.trim(),
        tone: tone || null,
        platform: platform || null,
        hashtags: hashtags || [],
        cta: cta?.trim() || null,
        credits_used: isAdmin ? 0 : credits_used,
      })
      .select()
      .single()

    if (postError || !postData) {
      console.error("[v0] Error saving caption:", postError)
      return NextResponse.json({ error: "Erro ao salvar legenda na biblioteca" }, { status: 500 })
    }

    if (!isAdmin) {
      const { error: creditError } = await supabase
        .from("users")
        .update({ credits: userData.credits - credits_used })
        .eq("id", user.id)

      if (creditError) {
        console.error("[v0] Error deducting credits:", creditError)
        // Reverter inserção do post
        await supabase.from("posts").delete().eq("id", postData.id)
        return NextResponse.json({ error: "Erro ao deduzir créditos" }, { status: 500 })
      }
    }

    await supabase.from("usage_logs").insert({
      user_id: user.id,
      action: "save_caption",
      credits_used: isAdmin ? 0 : credits_used,
      cost_usd: 0,
      metadata: {
        caption_length: caption.length,
        platform,
        tone,
        has_hashtags: (hashtags || []).length > 0,
        has_cta: !!cta,
      },
    })

    console.log("[v0] Caption saved successfully:", postData.id)

    return NextResponse.json({
      success: true,
      id: postData.id,
      message: "Legenda salva com sucesso na biblioteca",
    })
  } catch (error) {
    console.error("[v0] Save caption error:", error)
    return NextResponse.json(
      {
        error: "Erro interno ao salvar legenda",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
