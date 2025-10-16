import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart3,
  Clock,
  Globe,
  ImageIcon,
  Languages,
  Lightbulb,
  Lock,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react"
import Link from "next/link"

export default function FeaturesPage() {
  const features = [
    {
      icon: MessageSquare,
      title: "Legendas Inteligentes",
      description: "Gere legendas criativas e envolventes para qualquer tipo de conteúdo com IA avançada.",
    },
    {
      icon: ImageIcon,
      title: "Geração de Imagens",
      description: "Crie imagens únicas e profissionais para suas postagens usando GPT Image 1.",
    },
    {
      icon: Languages,
      title: "Múltiplos Tons",
      description: "Escolha entre diversos tons de voz: profissional, casual, engraçado, inspirador e mais.",
    },
    {
      icon: Globe,
      title: "Todas as Plataformas",
      description: "Otimizado para Instagram, Facebook, LinkedIn, Twitter e TikTok.",
    },
    {
      icon: Zap,
      title: "Geração Rápida",
      description: "Crie conteúdo em segundos, não em horas. Economize tempo e aumente sua produtividade.",
    },
    {
      icon: Lightbulb,
      title: "Hashtags Inteligentes",
      description: "Receba sugestões de hashtags relevantes para aumentar o alcance das suas postagens.",
    },
    {
      icon: BarChart3,
      title: "Histórico Completo",
      description: "Acesse todo o histórico de legendas e imagens geradas a qualquer momento.",
    },
    {
      icon: Lock,
      title: "Segurança Total",
      description: "Seus dados estão protegidos com criptografia de ponta a ponta.",
    },
    {
      icon: Clock,
      title: "Disponível 24/7",
      description: "Acesse a plataforma a qualquer hora, de qualquer lugar do mundo.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Captzio</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Começar Grátis</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-balance font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Recursos Poderosos
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Tudo que você precisa para criar conteúdo incrível para redes sociais, em um só lugar.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-24 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-12 text-center">
          <h2 className="text-3xl font-bold">Pronto para começar?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Crie sua conta agora e ganhe 2 créditos grátis para testar todos os recursos.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="min-w-[200px]">
              <Link href="/auth/sign-up">Começar Grátis</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-w-[200px] bg-transparent">
              <Link href="/pricing">Ver Preços</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t bg-muted/50">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-display text-xl font-bold">Captzio</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Crie conteúdo incrível para redes sociais com inteligência artificial.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Produto</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link href="/features" className="text-muted-foreground hover:text-foreground">
                    Recursos
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
                    Preços
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Suporte</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link href="/help" className="text-muted-foreground hover:text-foreground">
                    Ajuda
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                    Termos
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                    Privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © 2025 Captzio. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
