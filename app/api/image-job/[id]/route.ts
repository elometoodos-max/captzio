// app/api/image-job/[id]/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { data: imageJob, error: jobError } = await supabase
      .from("images")
      .select("id, user_id, status, image_url, error_message, revised_prompt, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()
    if (jobError || !imageJob) return NextResponse.json({ error: "Job não encontrado" }, { status: 404 })
    if (imageJob.user_id !== user.id) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

    return NextResponse.json({
      job: {
        id: imageJob.id,
        status: imageJob.status,
        image_url: imageJob.image_url,
        error_message: imageJob.error_message,
        revised_prompt: imageJob.revised_prompt ?? null,
        created_at: imageJob.created_at,
      },
    })
  } catch (error) {
    console.error("[v0] Get image job error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
