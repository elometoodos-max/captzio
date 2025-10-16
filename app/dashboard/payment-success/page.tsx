import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Sparkles } from "lucide-react"

export default function PaymentSuccessPage() {
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Pagamento Aprovado</CardTitle>
          <CardDescription>Seus créditos foram adicionados à sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Obrigado pela sua compra! Você já pode começar a gerar conteúdo incrível para suas redes sociais.
          </p>
          <Button asChild className="w-full">
            <Link href="/dashboard">Ir para Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
