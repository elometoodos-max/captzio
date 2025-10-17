import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import {
  Sparkles,
  ImageIcon,
  Hash,
  Zap,
  Check,
  ArrowRight,
  Menu,
  TrendingUp,
  Clock,
  Shield,
  Users,
  Star,
  MessageSquare,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="transition-transform hover:scale-105">
              <Logo />
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
        <section className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="flex flex-col items-center gap-8 py-16 text-center md:py-24 lg:py-32">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-muted-foreground">IA treinada para o português brasileiro</span>
            </div>
            <h1 className="max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight text-balance md:text-5xl lg:text-6xl xl:text-7xl animate-fade-in-up">
              A primeira IA que{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                entende o Brasil
              </span>{" "}
              e suas redes sociais
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground text-balance md:text-lg lg:text-xl animate-fade-in-up delay-100">
              Feito por criadores, para criadores. Gere conteúdo que fala a língua do seu público, com gírias,
              expressões e contexto 100% brasileiro. Seu assistente criativo 24h por dia.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row animate-fade-in-up delay-200">
              <Button size="lg" asChild className="gap-2 shadow-lg hover:shadow-xl transition-all">
                <Link href="/auth/sign-up">
                  Começar Agora
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="hover:bg-muted transition-all bg-transparent">
                <Link href="#pricing">Ver Preços</Link>
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4 animate-fade-in-up delay-300">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Usuários Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500k+</div>
                <div className="text-sm text-muted-foreground">Legendas Geradas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100k+</div>
                <div className="text-sm text-muted-foreground">Imagens Criadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.9/5</div>
                <div className="text-sm text-muted-foreground">Avaliação Média</div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 md:mb-16 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />O diferencial do Captzio
              </div>
              <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Por que somos únicos?
              </h2>
              <p className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground">
                Não somos apenas mais uma ferramenta de IA. Somos a única plataforma treinada especificamente para o
                mercado brasileiro.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Português Brasileiro Nativo</CardTitle>
                  <CardDescription>
                    Entendemos gírias, expressões e o jeito único de falar do brasileiro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Enquanto outras IAs traduzem do inglês, nós pensamos em português desde o início. Resultado:
                    conteúdo natural, autêntico e que conecta de verdade.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Algoritmos Locais</CardTitle>
                  <CardDescription>Otimizado para Instagram, TikTok e Threads brasileiros</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Analisamos tendências e comportamentos específicos do público brasileiro. Sabemos o que funciona
                    aqui, não lá fora.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Memória de Marca</CardTitle>
                  <CardDescription>A IA aprende o estilo único da sua marca</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Cole 3 posts antigos e o Captzio replica seu tom de voz, vocabulário e personalidade. É como ter um
                    ghostwriter que conhece sua marca de dentro pra fora.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Economize Tempo</h3>
                  <p className="text-sm text-muted-foreground">Crie em segundos, não em horas</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Aumente o Engajamento</h3>
                  <p className="text-sm text-muted-foreground">Conteúdo otimizado por IA</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">100% Seguro</h3>
                  <p className="text-sm text-muted-foreground">Dados protegidos e criptografados</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-12 md:py-16">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Economize Tempo</h3>
                  <p className="text-sm text-muted-foreground">
                    Crie conteúdo em segundos ao invés de horas. Foque no que realmente importa.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Aumente o Engajamento</h3>
                  <p className="text-sm text-muted-foreground">
                    Conteúdo otimizado por IA para maximizar curtidas, comentários e compartilhamentos.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">100% Seguro</h3>
                  <p className="text-sm text-muted-foreground">
                    Seus dados são protegidos e nunca compartilhados. Pagamentos seguros via Mercado Pago.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border py-16 md:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 md:mb-16 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Veja a diferença na prática
              </h2>
              <p className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground">
                Compare legendas genéricas com o poder do Captzio otimizado para o Brasil
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-destructive/20">
                <CardHeader>
                  <Badge variant="destructive" className="w-fit mb-2">
                    Antes
                  </Badge>
                  <CardTitle className="text-lg">Legenda Genérica</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-muted p-4 text-sm">
                    <p className="text-muted-foreground italic">
                      "Confira nosso novo produto! 🎉 Disponível agora em nossa loja. Não perca essa oportunidade
                      incrível!"
                    </p>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <span className="text-destructive">✗</span> Sem personalidade
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-destructive">✗</span> Linguagem formal demais
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-destructive">✗</span> Não conecta emocionalmente
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardHeader>
                  <Badge className="w-fit mb-2">Depois - Com Captzio</Badge>
                  <CardTitle className="text-lg">Legenda Otimizada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-background p-4 text-sm border border-primary/20">
                    <p>
                      "Gente, chegou! 🔥 Aquele produto que vocês pediram MUITO nos stories tá finalmente disponível.
                      Corre que é por tempo limitado e eu sei que vai esgotar rapidinho! Link na bio 👆✨"
                    </p>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-primary">
                      <Check className="h-4 w-4" /> Tom conversacional brasileiro
                    </p>
                    <p className="flex items-center gap-2 text-primary">
                      <Check className="h-4 w-4" /> Cria urgência e FOMO
                    </p>
                    <p className="flex items-center gap-2 text-primary">
                      <Check className="h-4 w-4" /> Engajamento 3x maior
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Resultado: <strong className="text-primary">+300% de engajamento</strong> em média
              </p>
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">
                  Testar Gratuitamente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
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

        <section className="py-16 md:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 md:mb-16 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                O que nossos usuários dizem
              </h2>
              <p className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground">
                Milhares de criadores já estão usando Captzio para impulsionar suas redes sociais
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">Salvou meu negócio!</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    "Cara, eu tava travado sem ideia nenhuma pra postar. O Captzio me deu umas legendas tão boas que meu
                    alcance triplicou em 2 semanas. Sério, vale cada centavo!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Rafael Mendes</div>
                      <div className="text-xs text-muted-foreground">Fotógrafo Freelancer</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">Minha loja decolou!</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    "Eu vendia uns 5 produtos por semana. Comecei a usar o Captzio pra criar posts todo dia e agora
                    vendo 30+. As legendas são perfeitas pro meu público, parece que a IA me conhece!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Juliana Oliveira</div>
                      <div className="text-xs text-muted-foreground">Dona de Loja Online</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">Ganho de tempo absurdo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    "Eu gastava 2h por dia pensando em legenda. Agora levo 5 minutos. Sobra tempo pra treinar, gravar
                    vídeo e responder DM. Meu Instagram nunca cresceu tanto!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Bruno Cardoso</div>
                      <div className="text-xs text-muted-foreground">Personal Trainer</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative border-t border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl animate-pulse" />
          </div>

          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                Comece com 2 créditos grátis
              </div>
              <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Deixe o Captzio criar o seu próximo post — de graça
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-base md:text-lg text-muted-foreground">
                Teste agora e veja a diferença em 60 segundos. Junte-se a milhares de criadores que já estão usando IA
                para impulsionar suas redes sociais.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild className="gap-2 shadow-xl hover:shadow-2xl transition-all">
                  <Link href="/auth/sign-up">
                    Testar Gratuitamente Agora
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="hover:bg-muted transition-all bg-transparent">
                  <Link href="/pricing">Ver Todos os Planos</Link>
                </Button>
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>2 créditos grátis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 md:mb-16 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent-foreground">
                <Zap className="h-4 w-4" />
                Em breve
              </div>
              <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                O futuro do Captzio
              </h2>
              <p className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground">
                Estamos trabalhando em recursos revolucionários para tornar sua criação de conteúdo ainda mais poderosa
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    Q2 2025
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Publicação Direta</CardTitle>
                  <CardDescription>Poste direto no Instagram, TikTok e Threads</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Crie e publique sem sair da plataforma. Um hub completo de criação e distribuição de conteúdo.
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    Q2 2025
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Análise de Engajamento</CardTitle>
                  <CardDescription>IA que aprende com seus melhores posts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Conecte suas redes e deixe a IA analisar o que funciona melhor para sugerir conteúdo ainda mais
                    eficaz.
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    Q3 2025
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Gamificação</CardTitle>
                  <CardDescription>Conquistas, badges e recompensas</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Desbloqueie conquistas como "Top Creator" e "100 Posts Gerados" e ganhe créditos bônus.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-gradient-to-b from-muted/30 to-muted/50 py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Link href="/" className="mb-4 inline-block transition-transform hover:scale-105">
                <Logo />
              </Link>
              <p className="mb-6 text-sm text-muted-foreground max-w-sm">
                A primeira IA que entende o Brasil. Crie conteúdo profissional para redes sociais em segundos, com a
                linguagem e o contexto do público brasileiro.
              </p>

              {/* Social Media */}
              <div>
                <h4 className="mb-3 text-sm font-semibold">Siga-nos</h4>
                <div className="flex gap-3">
                  <Link
                    href="https://instagram.com/captzio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Instagram className="h-4 w-4" />
                  </Link>
                  <Link
                    href="https://twitter.com/captzio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                  </Link>
                  <Link
                    href="https://linkedin.com/company/captzio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                  </Link>
                  <Link
                    href="https://youtube.com/@captzio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Youtube className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">Produto</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground transition-colors">
                    Recursos
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-foreground transition-colors">
                    Preços
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">Empresa</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    Sobre Nós
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacidade
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">Suporte</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contato
                  </Link>
                </li>
                <li>
                  <a href="mailto:suporte@captzio.com" className="hover:text-foreground transition-colors">
                    suporte@captzio.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Pagamentos Seguros</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>LGPD Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>99.9% Uptime</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Aceitamos:</span>
                <div className="flex items-center gap-2">
                  <div className="rounded bg-muted px-2 py-1 text-xs font-semibold">PIX</div>
                  <div className="rounded bg-muted px-2 py-1 text-xs font-semibold">Cartão</div>
                  <div className="rounded bg-muted px-2 py-1 text-xs font-semibold">Boleto</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Captzio. Todos os direitos reservados.</p>
            <p className="mt-1 text-xs">
              Feito com <span className="text-red-500">❤</span> no Brasil para criadores brasileiros
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
