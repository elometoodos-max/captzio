import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Get image job
    const { data: imageJob, error: jobError } = await supabase
      .from("images")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (jobError || !imageJob) {
      return NextResponse.json({ error: "Job não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      job: {
        id: imageJob.id,
        status: imageJob.status,
        image_url: imageJob.image_url,
        error_message: imageJob.error_message,
      },
    })
  } catch (error) {
    console.error("[v0] Get image job error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
