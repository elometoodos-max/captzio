import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Sparkles } from "lucide-react"

export default function PaymentPendingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="font-display text-2xl font-bold">Captzio</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <Clock className="h-8 w-8 text-accent" />
          </div>
          <CardTitle className="text-2xl">Pagamento Pendente</CardTitle>
          <CardDescription>Aguardando confirmação do pagamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Seu pagamento está sendo processado. Você receberá um email assim que for confirmado e seus créditos serão
            adicionados automaticamente.
          </p>
          <Button asChild className="w-full">
            <Link href="/dashboard">Ir para Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
