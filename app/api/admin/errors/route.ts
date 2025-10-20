import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { config } from "@/lib/config"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Verificar se é admin
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    const isAdmin = userData?.role === "admin" || user.email === config.admin.email

    if (!isAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Obter parâmetros de query
    const { searchParams } = new URL(request.url)
    const errorType = searchParams.get("type")
    const severity = searchParams.get("severity")
    const resolved = searchParams.get("resolved")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Construir query
    let query = supabase
      .from("system_errors")
      .select("*, user:users(email, name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (errorType) {
      query = query.eq("error_type", errorType)
    }

    if (severity) {
      query = query.eq("severity", severity)
    }

    if (resolved !== null) {
      query = query.eq("resolved", resolved === "true")
    }

    const { data: errors, error, count } = await query

    if (error) {
      console.error("[v0] Erro ao buscar erros do sistema:", error)
      return NextResponse.json({ error: "Erro ao buscar erros" }, { status: 500 })
    }

    // Obter estatísticas
    const { data: stats } = await supabase.rpc("get_error_stats")

    return NextResponse.json({
      errors: errors || [],
      total: count || 0,
      stats: stats || {},
      pagination: {
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error("[v0] Erro no handler de erros:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Verificar se é admin
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    const isAdmin = userData?.role === "admin" || user.email === config.admin.email

    if (!isAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const body = await request.json()
    const { errorId, resolved } = body

    if (!errorId) {
      return NextResponse.json({ error: "ID do erro é obrigatório" }, { status: 400 })
    }

    // Atualizar erro
    const { error } = await supabase
      .from("system_errors")
      .update({
        resolved,
        resolved_at: resolved ? new Date().toISOString() : null,
        resolved_by: resolved ? user.id : null,
      })
      .eq("id", errorId)

    if (error) {
      console.error("[v0] Erro ao atualizar erro:", error)
      return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Erro no handler de atualização:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
