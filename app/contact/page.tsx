import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare } from "lucide-react"
import { Logo } from "@/components/logo"

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Início
            </Link>
            <Button asChild size="sm">
              <Link href="/auth/sign-up">Começar</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-24">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 font-display text-4xl font-bold tracking-tight md:text-5xl">Entre em Contato</h1>
            <p className="mb-12 text-lg text-muted-foreground">
              Tem alguma dúvida ou sugestão? Estamos aqui para ajudar!
            </p>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Envie uma Mensagem</CardTitle>
                    <CardDescription>Responderemos em até 24 horas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome</Label>
                          <Input id="name" placeholder="Seu nome" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="seu@email.com" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Assunto</Label>
                        <Input id="subject" placeholder="Como podemos ajudar?" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Mensagem</Label>
                        <Textarea id="message" placeholder="Descreva sua dúvida ou sugestão..." rows={6} required />
                      </div>
                      <Button type="submit" className="w-full">
                        Enviar Mensagem
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Email</CardTitle>
                    <CardDescription>Envie um email direto</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <a href="mailto:suporte@captzio.com" className="text-sm font-medium text-primary hover:underline">
                      suporte@captzio.com
                    </a>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Central de Ajuda</CardTitle>
                    <CardDescription>Respostas rápidas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild className="w-full bg-transparent">
                      <Link href="/help">Ver FAQ</Link>
                    </Button>
                  </CardContent>
                </Card>

                <div className="rounded-lg border border-border bg-muted/50 p-6">
                  <h3 className="mb-2 font-semibold">Horário de Atendimento</h3>
                  <p className="text-sm text-muted-foreground">
                    Segunda a Sexta
                    <br />
                    9h às 18h (Horário de Brasília)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
