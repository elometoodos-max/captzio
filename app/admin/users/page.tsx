import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowLeft, CreditCard, Mail } from "lucide-react"

export default async function AdminUsersPage() {
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

  // Get all users
  const { data: users } = await supabase.from("users").select("*").order("created_at", { ascending: false })

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
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-12">
          <div className="mb-8">
            <h1 className="mb-2 font-display text-3xl font-bold">Usuários</h1>
            <p className="text-muted-foreground">Gerenciar usuários do sistema</p>
          </div>

          <div className="space-y-4">
            {users && users.length > 0 ? (
              users.map((u) => (
                <Card key={u.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{u.name || "Sem nome"}</CardTitle>
                          <CardDescription>{u.email}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{u.credits} créditos</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {u.role === "admin" ? "Administrador" : "Usuário"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Criado em: {new Date(u.created_at).toLocaleDateString("pt-BR")}</span>
                      <span>Atualizado: {new Date(u.updated_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex min-h-[200px] items-center justify-center">
                  <p className="text-sm text-muted-foreground">Nenhum usuário encontrado</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
