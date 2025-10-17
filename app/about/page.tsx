import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Users, Zap, Sparkles, MessageSquare, TrendingUp, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="transition-transform hover:scale-105">
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
        {/* Hero Section */}
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Sobre o Captzio
            </div>
            <h1 className="mb-6 font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              A primeira IA que{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                entende o Brasil
              </span>
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              Nascemos da frustração de ver criadores brasileiros usando ferramentas que não entendem nossa cultura,
              gírias e jeito único de se comunicar. Decidimos mudar isso.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 text-3xl font-bold">Nossa História</h2>
              <div className="space-y-6 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  Em 2024, percebemos que todas as ferramentas de IA para criação de conteúdo eram feitas pensando no
                  mercado americano. O resultado? Legendas que soavam traduzidas, hashtags que não funcionavam aqui, e
                  conteúdo que simplesmente não conectava com o público brasileiro.
                </p>
                <p className="text-lg leading-relaxed">
                  Foi aí que nasceu o Captzio. Não queríamos apenas mais uma ferramenta de IA — queríamos a{" "}
                  <strong className="text-foreground">
                    primeira IA treinada especificamente para o português brasileiro
                  </strong>
                  , que entendesse nossas gírias, expressões e o contexto cultural único do Brasil.
                </p>
                <p className="text-lg leading-relaxed">
                  Hoje, milhares de criadores, empreendedores e agências usam o Captzio para criar conteúdo que
                  realmente fala a língua do público brasileiro. E estamos apenas começando.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl">Nossos Pilares</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">O que nos move e para onde estamos indo</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                    <Target className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">Nossa Missão</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Democratizar a criação de conteúdo profissional para todos os brasileiros, independente do tamanho
                    do negócio ou orçamento.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">Nossa Visão</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ser a plataforma número 1 de criação de conteúdo com IA na América Latina, expandindo para outros
                    países de língua portuguesa.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">Nossos Valores</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Inovação constante, qualidade sem compromissos, e foco obsessivo na experiência do criador
                    brasileiro.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Differentials */}
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-5xl">
              <div className="mb-12 text-center">
                <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
                  O que nos torna únicos
                </h2>
                <p className="mx-auto max-w-2xl text-muted-foreground">Não somos apenas mais uma ferramenta de IA</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex gap-4 rounded-lg border border-border bg-background p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Português Brasileiro Nativo</h3>
                    <p className="text-sm text-muted-foreground">
                      Treinada com milhões de posts brasileiros. Entendemos gírias, expressões e o contexto cultural
                      único do Brasil.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-lg border border-border bg-background p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Algoritmos Locais</h3>
                    <p className="text-sm text-muted-foreground">
                      Otimizado especificamente para Instagram, TikTok e Threads brasileiros. Sabemos o que funciona
                      aqui.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-lg border border-border bg-background p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Memória de Marca</h3>
                    <p className="text-sm text-muted-foreground">
                      A IA aprende o estilo único da sua marca analisando seus posts anteriores. Conteúdo consistente,
                      sempre.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-lg border border-border bg-background p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Feito por Criadores</h3>
                    <p className="text-sm text-muted-foreground">
                      Nossa equipe é formada por criadores de conteúdo que entendem os desafios do dia a dia. Não é
                      teoria, é prática.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl">Captzio em Números</h2>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Usuários Ativos</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">500k+</div>
                <div className="text-sm text-muted-foreground">Legendas Geradas</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">100k+</div>
                <div className="text-sm text-muted-foreground">Imagens Criadas</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">4.9/5</div>
                <div className="text-sm text-muted-foreground">Avaliação Média</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
          <div className="container text-center">
            <div className="mx-auto max-w-2xl">
              <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Junte-se a milhares de criadores
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Comece a criar conteúdo que realmente conecta com o público brasileiro
              </p>
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">
                  Começar Gratuitamente
                  <Sparkles className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
