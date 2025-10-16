import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { config } from "@/lib/config"
import { TrendingUp, MessageSquare, ImageIcon, CreditCard, BarChart3 } from "lucide-react"

export default async function StatsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  const credits = userData?.credits || 0
  const userName = userData?.name || user.email?.split("@")[0] || "Usuário"
  const isAdmin = userData?.role === "admin" || user.email === config.admin.email

  // Get detailed statistics
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: images } = await supabase
    .from("images")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "approved")

  const totalCreditsUsed = (posts?.length || 0) + (images?.length || 0) * 5
  const totalCreditsPurchased = transactions?.reduce((sum, t) => sum + (t.credits_amount || 0), 0) || 0
  const totalSpent = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

  // Get this month's activity
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const postsThisMonth = posts?.filter((p) => new Date(p.created_at) >= firstDayOfMonth).length || 0
  const imagesThisMonth = images?.filter((i) => new Date(i.created_at) >= firstDayOfMonth).length || 0

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader credits={credits} isAdmin={isAdmin} userName={userName} />

      <main className="flex-1 bg-muted/30">
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6 md:mb-8">
            <h1 className="font-display text-2xl font-bold md:text-3xl flex items-center gap-2">
              <BarChart3 className="h-7 w-7" />
              Estatísticas
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">Acompanhe seu uso e desempenho na plataforma</p>
          </div>

          {/* Overview Cards */}
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-xs">
                  <MessageSquare className="h-4 w-4" />
                  Legendas Geradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{posts?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">{postsThisMonth} este mês</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-xs">
                  <ImageIcon className="h-4 w-4" />
                  Imagens Criadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{images?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">{imagesThisMonth} este mês</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-xs">
                  <TrendingUp className="h-4 w-4" />
                  Créditos Usados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCreditsUsed}</div>
                <p className="text-xs text-muted-foreground mt-1">{credits} disponíveis</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-xs">
                  <CreditCard className="h-4 w-4" />
                  Total Investido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {(totalSpent / 100).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">{totalCreditsPurchased} créditos comprados</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Suas últimas gerações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts && posts.length > 0 ? (
                    posts.slice(0, 5).map((post) => (
                      <div key={post.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{post.caption?.substring(0, 50)}...</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">Nenhuma legenda gerada ainda</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uso de Créditos</CardTitle>
                <CardDescription>Distribuição do seu consumo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Legendas</span>
                      <span className="text-sm text-muted-foreground">{posts?.length || 0} créditos</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${totalCreditsUsed > 0 ? ((posts?.length || 0) / totalCreditsUsed) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Imagens</span>
                      <span className="text-sm text-muted-foreground">{(images?.length || 0) * 5} créditos</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all"
                        style={{
                          width: `${
                            totalCreditsUsed > 0 ? (((images?.length || 0) * 5) / totalCreditsUsed) * 100 : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Usado</span>
                      <span className="text-lg font-bold">{totalCreditsUsed}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">Disponível</span>
                      <span className="text-sm font-semibold text-primary">{credits}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
