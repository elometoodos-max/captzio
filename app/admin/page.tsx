import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Users, CreditCard, ImageIcon, MessageSquare } from "lucide-react"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!userData || userData.role !== "admin") {
    redirect("/dashboard")
  }

  // Get statistics
  const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

  const { count: totalPosts } = await supabase.from("posts").select("*", { count: "exact", head: true })

  const { count: totalImages } = await supabase.from("images").select("*", { count: "exact", head: true })

  const { data: transactions } = await supabase.from("transactions").select("amount, status")

  const totalRevenue =
    transactions?.filter((t) => t.status === "approved").reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const pendingTransactions = transactions?.filter((t) => t.status === "pending").length || 0

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Captzio Admin</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin/users"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Usuários
            </Link>
            <Link
              href="/admin/transactions"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Transações
            </Link>
            <Link
              href="/admin/config"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Configurações
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-12">
          <div className="mb-8">
            <h1 className="mb-2 font-display text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Visão geral do sistema</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Usuários registrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{pendingTransactions} pendentes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Legendas Geradas</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPosts || 0}</div>
                <p className="text-xs text-muted-foreground">Total de gerações</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Imagens Geradas</CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalImages || 0}</div>
                <p className="text-xs text-muted-foreground">Total de gerações</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Gerenciar o sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Gerenciar Usuários</p>
                    <p className="text-xs text-muted-foreground">Ver e editar usuários</p>
                  </div>
                </Link>
                <Link
                  href="/admin/transactions"
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Ver Transações</p>
                    <p className="text-xs text-muted-foreground">Histórico de pagamentos</p>
                  </div>
                </Link>
                <Link
                  href="/admin/config"
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Configurações</p>
                    <p className="text-xs text-muted-foreground">Ajustar custos e preços</p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Últimas ações no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
