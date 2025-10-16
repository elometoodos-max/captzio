import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Sparkles } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="font-display text-2xl font-bold">Captzio</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verifique seu Email</CardTitle>
          <CardDescription>Enviamos um link de confirmação para seu email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Clique no link que enviamos para ativar sua conta e começar a usar o Captzio.
          </p>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Não recebeu o email?</strong>
              <br />
              Verifique sua caixa de spam ou aguarde alguns minutos.
            </p>
          </div>
          <Button variant="outline" asChild className="w-full bg-transparent">
            <Link href="/auth/login">Voltar para Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
