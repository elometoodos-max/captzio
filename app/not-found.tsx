import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Home, Sparkles } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
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
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-3xl font-bold">404</CardTitle>
          <CardTitle className="text-2xl">Página Não Encontrada</CardTitle>
          <CardDescription className="text-base">
            Desculpe, a página que você está procurando não existe ou foi movida.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Voltar para Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/dashboard">Ir para Dashboard</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/help">Central de Ajuda</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
