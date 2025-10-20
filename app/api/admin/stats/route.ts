import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { config } from "@/lib/config"

export async function GET() {
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

    // Buscar estatísticas gerais
    const [usersResult, postsResult, imagesResult, transactionsResult, errorsResult] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("images").select("*", { count: "exact", head: true }),
      supabase.from("transactions").select("amount, status"),
      supabase.from("system_errors").select("severity, resolved, created_at"),
    ])

    // Calcular estatísticas
    const totalUsers = usersResult.count || 0
    const totalPosts = postsResult.count || 0
    const totalImages = imagesResult.count || 0

    const transactions = transactionsResult.data || []
    const totalRevenue = transactions
      .filter((t) => t.status === "approved")
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    const errors = errorsResult.data || []
    const unresolvedErrors = errors.filter((e) => !e.resolved).length
    const criticalErrors = errors.filter((e) => e.severity === "critical" && !e.resolved).length

    // Estatísticas de hoje
    const today = new Date().toISOString().split("T")[0]
    const errorsToday = errors.filter((e) => e.created_at?.startsWith(today)).length

    return NextResponse.json({
      users: {
        total: totalUsers,
      },
      content: {
        captions: totalPosts,
        images: totalImages,
      },
      revenue: {
        total: totalRevenue,
        currency: "BRL",
      },
      errors: {
        total: errors.length,
        unresolved: unresolvedErrors,
        critical: criticalErrors,
        today: errorsToday,
      },
      health: {
        status: criticalErrors > 0 ? "critical" : unresolvedErrors > 10 ? "warning" : "healthy",
        uptime: "99.9%", // Placeholder - implementar monitoramento real
      },
    })
  } catch (error) {
    console.error("[v0] Erro ao buscar estatísticas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
