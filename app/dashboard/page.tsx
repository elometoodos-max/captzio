import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, ImageIcon, MessageSquare, Crown, Wand2, Trophy, TrendingUp } from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { config } from "@/lib/config"

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
  const isAdmin = userData?.role === "admin" || user.email === config.admin.email

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader credits={credits} isAdmin={isAdmin} userName={userName} />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <h1 className="font-display text-2xl font-bold md:text-3xl">Olá, {userName}</h1>
              {isAdmin && (
                <Badge variant="secondary" className="w-fit gap-1">
                  <Crown className="h-3 w-3" />
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground md:text-base">
              {isAdmin ? "Modo de teste administrativo ativo" : "Bem-vindo ao seu dashboard"}
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg md:text-xl">Gerar Legenda</CardTitle>
                <CardDescription className="text-sm">Crie legendas e hashtags com GPT-5 Nano</CardDescription>
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

            <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg md:text-xl">Gerar Imagem</CardTitle>
                <CardDescription className="text-sm">Crie imagens profissionais com GPT Image 1</CardDescription>
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

            <Card className="transition-all hover:shadow-lg hover:-translate-y-1 border-accent/20 bg-gradient-to-br from-accent/5 to-background">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Wand2 className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-lg md:text-xl">Estilo de Marca</CardTitle>
                <CardDescription className="text-sm">Ensine a IA a escrever como você</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">Configure uma vez, use sempre</p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/dashboard/brand-style">Configurar</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg hover:-translate-y-1 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg md:text-xl">Conquistas</CardTitle>
                <CardDescription className="text-sm">Desbloqueie badges e ganhe créditos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">Recompensas por criar conteúdo</p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/dashboard/achievements">Ver Progresso</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg md:text-xl">Estatísticas</CardTitle>
                <CardDescription className="text-sm">Acompanhe seu progresso e uso</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">Insights sobre seu conteúdo</p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/dashboard/stats">Ver Estatísticas</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg md:text-xl">Comprar Créditos</CardTitle>
                <CardDescription className="text-sm">Adicione mais créditos à sua conta</CardDescription>
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
            <div className="mt-6 rounded-lg border border-accent/20 bg-accent/5 p-4 md:mt-8 md:p-6">
              <h3 className="mb-2 text-base font-semibold md:text-lg">Você não tem créditos</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Compre créditos para começar a gerar conteúdo incrível para suas redes sociais
              </p>
              <Button asChild>
                <Link href="/dashboard/buy-credits">Comprar Créditos</Link>
              </Button>
            </div>
          )}

          {isAdmin && (
            <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4 md:mt-8 md:p-6">
              <div className="flex items-start gap-3">
                <Crown className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="mb-2 text-base font-semibold md:text-lg">Modo de Teste Administrativo</h3>
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
