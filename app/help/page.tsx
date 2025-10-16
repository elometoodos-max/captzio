import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, HelpCircle, CreditCard, ImageIcon, MessageSquare } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Captzio</span>
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
            <h1 className="mb-6 font-display text-4xl font-bold tracking-tight md:text-5xl">Central de Ajuda</h1>
            <p className="mb-12 text-lg text-muted-foreground">
              Encontre respostas para as perguntas mais frequentes sobre o Captzio
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <HelpCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Como funciona o Captzio?</CardTitle>
                  <CardDescription>Entenda o básico da plataforma</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  O Captzio usa inteligência artificial para gerar legendas, hashtags e imagens para suas redes sociais.
                  Você compra créditos e usa conforme necessário, sem mensalidades.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Como funcionam os créditos?</CardTitle>
                  <CardDescription>Sistema de créditos explicado</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  1 crédito = 1 legenda com hashtags. 5 créditos = 1 imagem. Os créditos não expiram e podem ser usados
                  a qualquer momento. Você pode comprar mais créditos quando precisar.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Como gerar legendas?</CardTitle>
                  <CardDescription>Criando conteúdo de texto</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  No dashboard, clique em "Gerar Legenda", descreva seu conteúdo, escolha o tom e a plataforma. A IA
                  criará uma legenda completa com hashtags e CTA em segundos.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Como gerar imagens?</CardTitle>
                  <CardDescription>Criando imagens com IA</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Clique em "Gerar Imagem", descreva o que você quer ver, e a IA criará uma imagem profissional usando
                  DALL-E 3. O processo leva alguns segundos.
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 space-y-8">
              <div>
                <h2 className="mb-4 text-2xl font-bold">Perguntas Frequentes</h2>
                <div className="space-y-4">
                  <div className="rounded-lg border border-border p-6">
                    <h3 className="mb-2 font-semibold">Os créditos expiram?</h3>
                    <p className="text-sm text-muted-foreground">
                      Não! Seus créditos nunca expiram e podem ser usados a qualquer momento.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border p-6">
                    <h3 className="mb-2 font-semibold">Posso cancelar minha compra?</h3>
                    <p className="text-sm text-muted-foreground">
                      Créditos não são reembolsáveis após a compra. Certifique-se de escolher o plano adequado antes de
                      comprar.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border p-6">
                    <h3 className="mb-2 font-semibold">Posso editar o conteúdo gerado?</h3>
                    <p className="text-sm text-muted-foreground">
                      Sim! Todo conteúdo gerado pode ser copiado e editado antes de publicar em suas redes sociais.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border p-6">
                    <h3 className="mb-2 font-semibold">Qual a qualidade das imagens?</h3>
                    <p className="text-sm text-muted-foreground">
                      Usamos DALL-E 3, o modelo mais avançado da OpenAI, que gera imagens em alta resolução e qualidade
                      profissional.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border p-6">
                    <h3 className="mb-2 font-semibold">Como funciona o suporte?</h3>
                    <p className="text-sm text-muted-foreground">
                      Oferecemos suporte por email para todos os planos. Planos Profissional e Empresarial têm
                      prioridade no atendimento.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-8 text-center">
                <h2 className="mb-2 text-2xl font-bold">Ainda tem dúvidas?</h2>
                <p className="mb-6 text-muted-foreground">Nossa equipe está pronta para ajudar você</p>
                <Button asChild>
                  <Link href="/contact">Entre em Contato</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
