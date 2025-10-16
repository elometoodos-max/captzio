import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DashboardHeader } from "@/components/dashboard-header"
import { config } from "@/lib/config"
import { User, Mail, CreditCard, Crown, Shield } from "lucide-react"

export default async function ProfilePage() {
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

  // Get usage statistics
  const { data: captionCount } = await supabase.from("posts").select("id", { count: "exact" }).eq("user_id", user.id)

  const { data: imageCount } = await supabase.from("images").select("id", { count: "exact" }).eq("user_id", user.id)

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const totalSpent = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader credits={credits} isAdmin={isAdmin} userName={userName} />

      <main className="flex-1 bg-muted/30">
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6 md:mb-8">
            <h1 className="font-display text-2xl font-bold md:text-3xl">Meu Perfil</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Gerencie suas informações e veja suas estatísticas
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>Seus dados de cadastro</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" value={userName} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Input id="email" value={user.email || ""} disabled />
                      {user.email_confirmed_at && (
                        <Badge variant="secondary" className="gap-1 whitespace-nowrap">
                          <Shield className="h-3 w-3" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="created">Membro desde</Label>
                    <Input
                      id="created"
                      value={new Date(userData?.created_at || user.created_at).toLocaleDateString("pt-BR")}
                      disabled
                    />
                  </div>
                  {isAdmin && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Crown className="h-4 w-4 text-primary" />
                        <span>Conta Administrativa</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Você tem acesso total ao sistema e pode usar todas as funcionalidades gratuitamente
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Histórico de Transações
                  </CardTitle>
                  <CardDescription>Suas últimas compras de créditos</CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions && transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between rounded-lg border border-border p-3"
                        >
                          <div>
                            <p className="text-sm font-medium">{transaction.credits_amount} créditos</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">R$ {(transaction.amount / 100).toFixed(2)}</p>
                            <Badge
                              variant={
                                transaction.status === "approved"
                                  ? "default"
                                  : transaction.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {transaction.status === "approved"
                                ? "Aprovado"
                                : transaction.status === "pending"
                                  ? "Pendente"
                                  : "Cancelado"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">Nenhuma transação encontrada</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Statistics Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas</CardTitle>
                  <CardDescription>Seu uso da plataforma</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Créditos disponíveis</span>
                      <span className="font-bold text-lg">{credits}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${Math.min((credits / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Legendas geradas</span>
                      <span className="font-semibold">{captionCount?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Imagens criadas</span>
                      <span className="font-semibold">{imageCount?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total gasto</span>
                      <span className="font-semibold">R$ {(totalSpent / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  {!isAdmin && credits < 10 && (
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-3">Seus créditos estão acabando</p>
                      <Button asChild size="sm" className="w-full">
                        <a href="/dashboard/buy-credits">Comprar Mais</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start bg-transparent" size="sm">
                    <a href="/dashboard/library">
                      <Mail className="mr-2 h-4 w-4" />
                      Ver Biblioteca
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start bg-transparent" size="sm">
                    <a href="/dashboard/transactions">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Transações
                    </a>
                  </Button>
                  {isAdmin && (
                    <Button asChild variant="outline" className="w-full justify-start bg-transparent" size="sm">
                      <a href="/admin">
                        <Crown className="mr-2 h-4 w-4" />
                        Painel Admin
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
