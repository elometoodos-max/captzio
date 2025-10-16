import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Sparkles, Zap } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "R$ 19,90",
      credits: 50,
      description: "Perfeito para começar",
      features: [
        "50 créditos",
        "Geração de legendas ilimitadas",
        "5 imagens com IA",
        "Suporte por email",
        "Acesso a todos os recursos",
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: "R$ 49,90",
      credits: 150,
      description: "Ideal para profissionais",
      features: [
        "150 créditos",
        "Geração de legendas ilimitadas",
        "15 imagens com IA",
        "Suporte prioritário",
        "Acesso a todos os recursos",
        "Histórico completo",
      ],
      popular: true,
    },
    {
      name: "Business",
      price: "R$ 99,90",
      credits: 350,
      description: "Para equipes e agências",
      features: [
        "350 créditos",
        "Geração de legendas ilimitadas",
        "35 imagens com IA",
        "Suporte VIP 24/7",
        "Acesso a todos os recursos",
        "Histórico completo",
        "API de integração",
      ],
      popular: false,
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
            Planos e Preços
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Escolha o plano ideal para suas necessidades. Todos os planos incluem 2 créditos grátis para testar.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${plan.popular ? "border-primary shadow-lg" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                    <Zap className="h-4 w-4" />
                    Mais Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                  <Link href="/auth/sign-up">Começar Agora</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-center text-3xl font-bold">Perguntas Frequentes</h2>
          <div className="mx-auto mt-12 max-w-3xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como funcionam os créditos?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cada legenda custa 1 crédito e cada imagem custa 10 créditos. Os créditos não expiram e você pode
                  comprar mais a qualquer momento.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posso cancelar a qualquer momento?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sim! Não há contratos ou taxas de cancelamento. Você pode cancelar sua assinatura a qualquer momento.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Qual é a política de reembolso?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Oferecemos reembolso total em até 7 dias após a compra, sem perguntas.
                </p>
              </CardContent>
            </Card>
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
                  <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
                    Preços
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground">
                    Sobre
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
