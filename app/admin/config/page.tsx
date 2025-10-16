import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowLeft } from "lucide-react"

export default async function AdminConfigPage() {
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

  // Get system config
  const { data: configs } = await supabase.from("system_config").select("*").order("key")

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
            <h1 className="mb-2 font-display text-3xl font-bold">Configurações do Sistema</h1>
            <p className="text-muted-foreground">Ajustar parâmetros e custos</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {configs && configs.length > 0 ? (
              configs.map((config) => (
                <Card key={config.key}>
                  <CardHeader>
                    <CardTitle className="text-base">{config.key}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <pre className="text-sm">{JSON.stringify(config.value, null, 2)}</pre>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Atualizado: {new Date(config.updated_at).toLocaleDateString("pt-BR")}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="lg:col-span-2">
                <CardContent className="flex min-h-[200px] items-center justify-center">
                  <p className="text-sm text-muted-foreground">Nenhuma configuração encontrada</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
