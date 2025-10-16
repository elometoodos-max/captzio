import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, Sparkles } from "lucide-react"

export default function PaymentFailurePage() {
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Pagamento Não Aprovado</CardTitle>
          <CardDescription>Houve um problema ao processar seu pagamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Não se preocupe, nenhum valor foi cobrado. Você pode tentar novamente ou escolher outro método de pagamento.
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href="/dashboard">Voltar</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/dashboard/buy-credits">Tentar Novamente</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
