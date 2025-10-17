import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle2 } from "lucide-react"
import { Logo } from "@/components/logo"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-6">
      <Link href="/" className="mb-8">
        <Logo size="lg" />
      </Link>

      <Card className="w-full max-w-lg border-2">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20">
            <Mail className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl md:text-3xl">Verifique seu Email</CardTitle>
          <CardDescription className="text-base">Estamos quase lá! Só falta um passo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-primary/5 p-4">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Email de confirmação enviado</p>
                <p className="text-sm text-muted-foreground">
                  Enviamos um link de verificação para o seu email. Clique no link para ativar sua conta. Você será
                  redirecionado automaticamente para o Captzio após a verificação.
                </p>
              </div>
            </div>

            <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-4">
              <p className="text-sm font-medium mb-2">Não recebeu o email?</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Verifique sua caixa de spam ou lixo eletrônico
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Aguarde alguns minutos e recarregue sua caixa de entrada
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Certifique-se de que digitou o email corretamente
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">Voltar para Login</Link>
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            O link de verificação irá redirecioná-lo automaticamente para o Captzio
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
