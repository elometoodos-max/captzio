import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, CreditCard, ImageIcon, MessageSquare, LogOut, Library, Images, Crown } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch user data from public.users table
  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  const credits = userData?.credits || 0
  const userName = userData?.name || user.email?.split("@")[0] || "Usuário"
  const isAdmin = userData?.role === "admin" || user.email === process.env.ADMIN_EMAIL

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Captzio</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/library">
                <Library className="mr-2 h-4 w-4" />
                Legendas
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/images">
                <Images className="mr-2 h-4 w-4" />
                Imagens
              </Link>
            </Button>
            {isAdmin ? (
              <div className="flex items-center gap-2 rounded-lg border border-accent bg-accent/10 px-3 py-1.5">
                <Crown className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Admin • ∞ créditos</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{credits} créditos</span>
              </div>
            )}
            <form action="/auth/logout" method="post">
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-12">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold">Olá, {userName}</h1>
              {isAdmin && (
                <Badge variant="secondary" className="gap-1">
                  <Crown className="h-3 w-3" />
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {isAdmin ? "Modo de teste administrativo ativo" : "Bem-vindo ao seu dashboard"}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Gerar Legenda</CardTitle>
                <CardDescription>Crie legendas e hashtags com GPT-5 Nano</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  {isAdmin ? "Grátis para admins" : "1 crédito por geração"}
                </p>
                <Button asChild className="w-full">
                  <Link href="/dashboard/generate-caption">Começar</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Gerar Imagem</CardTitle>
                <CardDescription>Crie imagens profissionais com GPT Image 1</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  {isAdmin ? "Grátis para admins" : "5 créditos por geração"}
                </p>
                <Button asChild className="w-full">
                  <Link href="/dashboard/generate-image">Começar</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Comprar Créditos</CardTitle>
                <CardDescription>Adicione mais créditos à sua conta</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">A partir de R$ 19,90</p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/dashboard/buy-credits">Ver Planos</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {!isAdmin && credits === 0 && (
            <div className="mt-8 rounded-lg border border-accent/20 bg-accent/5 p-6">
              <h3 className="mb-2 font-semibold">Você não tem créditos</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Compre créditos para começar a gerar conteúdo incrível para suas redes sociais
              </p>
              <Button asChild>
                <Link href="/dashboard/buy-credits">Comprar Créditos</Link>
              </Button>
            </div>
          )}

          {isAdmin && (
            <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-6">
              <div className="flex items-start gap-3">
                <Crown className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h3 className="mb-2 font-semibold">Modo de Teste Administrativo</h3>
                  <p className="text-sm text-muted-foreground">
                    Como administrador, você tem acesso ilimitado a todas as funcionalidades sem consumir créditos.
                    Perfeito para testar o sistema antes do lançamento oficial.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
