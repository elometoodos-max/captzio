import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ImageIcon, Hash, Zap, Check, ArrowRight, Menu } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">Captzio</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Recursos
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Preços
              </Link>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Entrar
              </Link>
              <Button asChild>
                <Link href="/auth/sign-up">Começar Grátis</Link>
              </Button>
            </nav>

            {/* Mobile Navigation */}
            <div className="flex items-center gap-2 md:hidden">
              <Button asChild size="sm">
                <Link href="/auth/sign-up">Começar</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="#features" className="cursor-pointer">
                      Recursos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#pricing" className="cursor-pointer">
                      Preços
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/login" className="cursor-pointer">
                      Entrar
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 py-16 text-center md:py-24 lg:py-32">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Powered by GPT-5 Nano & GPT Image 1</span>
            </div>
            <h1 className="max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight text-balance md:text-5xl lg:text-6xl xl:text-7xl">
              Crie conteúdo incrível para redes sociais com <span className="text-primary">IA</span>
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground text-balance md:text-lg lg:text-xl">
              Gere legendas envolventes, hashtags estratégicas e imagens profissionais em segundos. Economize tempo e
              aumente seu engajamento.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link href="/auth/sign-up">
                  Começar Agora
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#pricing">Ver Preços</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t border-border bg-muted/50 py-16 md:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 md:mb-16 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Tudo que você precisa em um só lugar
              </h2>
              <p className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground">
                Ferramentas poderosas de IA para criar conteúdo profissional em minutos
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Legendas Inteligentes</CardTitle>
                  <CardDescription>Gere legendas criativas e envolventes adaptadas ao tom da sua marca</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Múltiplos tons de voz
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Otimizado por plataforma
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      CTAs personalizados
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Hash className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Hashtags Estratégicas</CardTitle>
                  <CardDescription>Hashtags relevantes para aumentar seu alcance e engajamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Até 30 hashtags
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Análise de tendências
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Mix de popularidade
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Imagens com IA</CardTitle>
                  <CardDescription>Crie imagens profissionais com DALL-E 3 em alta qualidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Alta resolução
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Estilos variados
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Download direto
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="relative py-16 md:py-24 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/30 via-background to-background" />

          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 md:mb-16 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                Sem mensalidades • Pague apenas o que usar
              </div>
              <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-balance md:text-4xl lg:text-5xl">
                Planos para todos os tamanhos
              </h2>
              <p className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground text-balance">
                Escolha o plano ideal para suas necessidades. Créditos nunca expiram e você pode combinar legendas e
                imagens como quiser.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 md:gap-8 lg:gap-10">
              {/* Básico Plan */}
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl">Básico</CardTitle>
                  <CardDescription className="text-base">Perfeito para começar e testar</CardDescription>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight">R$ 19</span>
                    <span className="text-2xl font-semibold text-muted-foreground">,90</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">R$ 0,40 por crédito</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">50</span>
                      <span className="text-lg font-medium text-muted-foreground">créditos</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Equivale a:</p>
                  </div>

                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>
                        <strong className="font-semibold">50 legendas</strong> completas com hashtags e CTAs
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>
                        <strong className="font-semibold">10 imagens</strong> em alta qualidade (1024x1024)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>
                        Ou qualquer <strong className="font-semibold">combinação</strong> entre legendas e imagens
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>
                        Créditos <strong className="font-semibold">nunca expiram</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>Suporte por email em até 24h</span>
                    </li>
                  </ul>

                  <Button className="w-full bg-transparent" variant="outline" size="lg" asChild>
                    <Link href="/auth/sign-up">
                      Começar Agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Profissional Plan - Most Popular */}
              <Card className="relative overflow-hidden border-2 border-primary shadow-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 scale-105">
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute left-0 bottom-0 -ml-8 -mb-8 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />

                <div className="absolute right-4 top-4 z-10">
                  <div className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
                    <Zap className="h-3.5 w-3.5" />
                    Mais Popular
                  </div>
                </div>

                <CardHeader className="relative pb-8">
                  <CardTitle className="text-2xl">Profissional</CardTitle>
                  <CardDescription className="text-base">Para criadores de conteúdo sérios</CardDescription>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight">R$ 49</span>
                    <span className="text-2xl font-semibold text-muted-foreground">,90</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    R$ 0,31 por crédito • <span className="font-semibold text-primary">Economize 22%</span>
                  </p>
                </CardHeader>
                <CardContent className="relative space-y-6">
                  <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 p-4 ring-1 ring-primary/20">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">160</span>
                      <span className="text-lg font-medium">créditos</span>
                      <span className="ml-auto rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                        +10 BÔNUS
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">150 créditos + 10 de bônus</p>
                  </div>

                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span>
                        <strong className="font-semibold">160 legendas</strong> completas com hashtags e CTAs
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span>
                        <strong className="font-semibold">32 imagens</strong> em alta qualidade (1024x1024)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span>
                        Ou qualquer <strong className="font-semibold">combinação</strong> entre legendas e imagens
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span>
                        Créditos <strong className="font-semibold">nunca expiram</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span>
                        <strong className="font-semibold">Suporte prioritário</strong> em até 12h
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span>Acesso antecipado a novos recursos</span>
                    </li>
                  </ul>

                  <Button className="w-full shadow-lg" size="lg" asChild>
                    <Link href="/auth/sign-up">
                      Começar Agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Empresarial Plan */}
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl">Empresarial</CardTitle>
                  <CardDescription className="text-base">Para equipes e agências</CardDescription>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight">R$ 149</span>
                    <span className="text-2xl font-semibold text-muted-foreground">,90</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    R$ 0,27 por crédito • <span className="font-semibold text-primary">Economize 32%</span>
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg bg-gradient-to-br from-accent/10 to-primary/10 p-4 ring-1 ring-accent/20">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">550</span>
                      <span className="text-lg font-medium">créditos</span>
                      <span className="ml-auto rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
                        +50 BÔNUS
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">500 créditos + 50 de bônus</p>
                  </div>

                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>
                        <strong className="font-semibold">550 legendas</strong> completas com hashtags e CTAs
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>
                        <strong className="font-semibold">110 imagens</strong> em alta qualidade (1024x1024)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>
                        Ou qualquer <strong className="font-semibold">combinação</strong> entre legendas e imagens
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>
                        Créditos <strong className="font-semibold">nunca expiram</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>
                        <strong className="font-semibold">Suporte VIP 24/7</strong> com resposta imediata
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>Gerente de conta dedicado</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>Treinamento personalizado da equipe</span>
                    </li>
                  </ul>

                  <Button className="w-full bg-transparent" variant="outline" size="lg" asChild>
                    <Link href="/auth/sign-up">
                      Começar Agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Trust signals and additional info */}
            <div className="mt-12 space-y-6">
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Créditos nunca expiram</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Pagamento seguro via Mercado Pago</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Sem taxas ocultas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  <strong className="text-foreground">Como funcionam os créditos:</strong> 1 crédito = 1 legenda
                  completa | 5 créditos = 1 imagem em alta qualidade
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Você pode combinar legendas e imagens da forma que preferir. Seus créditos nunca expiram e podem ser
                  usados a qualquer momento.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-muted/50 py-16 md:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Pronto para criar conteúdo incrível?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-base md:text-lg text-muted-foreground">
              Junte-se a milhares de criadores que já estão usando IA para impulsionar suas redes sociais
            </p>
            <Button size="lg" asChild className="gap-2">
              <Link href="/auth/sign-up">
                Começar Gratuitamente
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-display text-xl font-bold">Captzio</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Crie conteúdo profissional para redes sociais com inteligência artificial
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Produto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground">
                    Recursos
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-foreground">
                    Preços
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Empresa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacidade
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Suporte</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground">
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Captzio. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
