import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Sparkles, Zap, X } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const plans = [
    {
      name: "Básico",
      price: "R$ 19,90",
      credits: 50,
      bonus: 0,
      description: "Perfeito para começar",
      features: [
        { name: "50 créditos", included: true },
        { name: "50 legendas ou 10 imagens", included: true },
        { name: "Geração de legendas com IA", included: true },
        { name: "Geração de imagens com IA", included: true },
        { name: "Múltiplos tons de voz", included: true },
        { name: "Hashtags estratégicas", included: true },
        { name: "CTAs personalizados", included: true },
        { name: "Biblioteca de conteúdo", included: true },
        { name: "Suporte por email", included: true },
        { name: "Créditos nunca expiram", included: true },
        { name: "Suporte prioritário", included: false },
        { name: "Histórico completo", included: false },
        { name: "API de integração", included: false },
      ],
      popular: false,
    },
    {
      name: "Profissional",
      price: "R$ 49,90",
      credits: 150,
      bonus: 10,
      description: "Ideal para criadores de conteúdo",
      features: [
        { name: "150 créditos + 10 bônus", included: true },
        { name: "160 legendas ou 32 imagens", included: true },
        { name: "Geração de legendas com IA", included: true },
        { name: "Geração de imagens com IA", included: true },
        { name: "Múltiplos tons de voz", included: true },
        { name: "Hashtags estratégicas", included: true },
        { name: "CTAs personalizados", included: true },
        { name: "Biblioteca de conteúdo", included: true },
        { name: "Suporte prioritário", included: true },
        { name: "Créditos nunca expiram", included: true },
        { name: "Histórico completo", included: true },
        { name: "Estatísticas detalhadas", included: true },
        { name: "API de integração", included: false },
      ],
      popular: true,
    },
    {
      name: "Empresarial",
      price: "R$ 149,90",
      credits: 500,
      bonus: 50,
      description: "Para equipes e agências",
      features: [
        { name: "500 créditos + 50 bônus", included: true },
        { name: "550 legendas ou 110 imagens", included: true },
        { name: "Geração de legendas com IA", included: true },
        { name: "Geração de imagens com IA", included: true },
        { name: "Múltiplos tons de voz", included: true },
        { name: "Hashtags estratégicas", included: true },
        { name: "CTAs personalizados", included: true },
        { name: "Biblioteca de conteúdo", included: true },
        { name: "Suporte VIP 24/7", included: true },
        { name: "Créditos nunca expiram", included: true },
        { name: "Histórico completo", included: true },
        { name: "Estatísticas detalhadas", included: true },
        { name: "API de integração", included: true },
        { name: "Gerenciamento de equipe", included: true },
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
            Escolha o plano ideal para suas necessidades. Todos os novos usuários ganham 2 créditos grátis para testar.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Sem mensalidades • Pague apenas pelos créditos que usar
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${plan.popular ? "border-primary shadow-lg ring-2 ring-primary/20" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground shadow-lg">
                    <Zap className="h-4 w-4" />
                    Mais Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold">{plan.price}</span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {plan.credits} créditos{plan.bonus > 0 && ` + ${plan.bonus} bônus`}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      ) : (
                        <X className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/40" />
                      )}
                      <span className={`text-sm ${!feature.included ? "text-muted-foreground/60" : ""}`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full" size="lg" variant={plan.popular ? "default" : "outline"}>
                  <Link href="/auth/sign-up">Começar Agora</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-24">
          <h2 className="mb-8 text-center text-3xl font-bold">Comparação Detalhada</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-semibold">Recurso</th>
                  <th className="p-4 text-center font-semibold">Básico</th>
                  <th className="p-4 text-center font-semibold">Profissional</th>
                  <th className="p-4 text-center font-semibold">Empresarial</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4">Créditos totais</td>
                  <td className="p-4 text-center">50</td>
                  <td className="p-4 text-center font-semibold text-primary">160</td>
                  <td className="p-4 text-center font-semibold text-primary">550</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Legendas possíveis</td>
                  <td className="p-4 text-center">50</td>
                  <td className="p-4 text-center">160</td>
                  <td className="p-4 text-center">550</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Imagens possíveis</td>
                  <td className="p-4 text-center">10</td>
                  <td className="p-4 text-center">32</td>
                  <td className="p-4 text-center">110</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Suporte</td>
                  <td className="p-4 text-center">Email</td>
                  <td className="p-4 text-center">Prioritário</td>
                  <td className="p-4 text-center">VIP 24/7</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Histórico completo</td>
                  <td className="p-4 text-center">
                    <X className="mx-auto h-5 w-5 text-muted-foreground/40" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-primary" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-primary" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">API de integração</td>
                  <td className="p-4 text-center">
                    <X className="mx-auto h-5 w-5 text-muted-foreground/40" />
                  </td>
                  <td className="p-4 text-center">
                    <X className="mx-auto h-5 w-5 text-muted-foreground/40" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-primary" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
                  Cada legenda custa 1 crédito e cada imagem custa 5 créditos. Os créditos não expiram e você pode
                  comprar mais a qualquer momento. Todos os novos usuários ganham 2 créditos grátis para testar.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posso combinar legendas e imagens?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sim! Você pode usar seus créditos da forma que preferir. Por exemplo, com 50 créditos você pode gerar
                  25 legendas e 5 imagens, ou qualquer outra combinação.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Os créditos expiram?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Não! Seus créditos nunca expiram. Você pode usá-los quando quiser, sem pressa.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Qual é a política de reembolso?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Oferecemos reembolso total em até 7 dias após a compra, sem perguntas. Sua satisfação é nossa
                  prioridade.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posso fazer upgrade do meu plano?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sim! Você pode comprar créditos adicionais a qualquer momento. Não há planos de assinatura, apenas
                  compra de créditos conforme necessário.
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
                  <Link href="/features" className="text-muted-foreground hover:text-foreground">
                    Recursos
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
                  <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                    FAQ
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
