import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowLeft, CreditCard } from "lucide-react"

export default async function TransactionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch user's transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-500"
      case "pending":
        return "text-yellow-500"
      case "failed":
        return "text-destructive"
      case "refunded":
        return "text-muted-foreground"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprovado"
      case "pending":
        return "Pendente"
      case "failed":
        return "Falhou"
      case "refunded":
        return "Reembolsado"
      default:
        return status
    }
  }

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
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-12">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <h1 className="mb-2 font-display text-3xl font-bold">Transações</h1>
              <p className="text-muted-foreground">Histórico de compras de créditos</p>
            </div>

            {transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <CreditCard className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{transaction.credits} créditos</CardTitle>
                            <CardDescription>
                              {new Date(transaction.created_at).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">R$ {transaction.amount.toFixed(2)}</p>
                          <p className={`text-sm font-medium ${getStatusColor(transaction.status)}`}>
                            {getStatusLabel(transaction.status)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex min-h-[400px] items-center justify-center p-8">
                  <div className="text-center">
                    <CreditCard className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p className="mb-4 text-sm text-muted-foreground">Você ainda não fez nenhuma compra</p>
                    <Button asChild>
                      <Link href="/dashboard/buy-credits">Comprar Créditos</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
