import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, Sparkles } from "lucide-react"
import Link from "next/link"

export default function FAQPage() {
  const faqs = [
    {
      question: "Como funciona o Captzio?",
      answer:
        "O Captzio usa inteligência artificial avançada (GPT-5 Nano e GPT Image 1) para gerar legendas criativas e imagens profissionais para suas redes sociais. Basta descrever o que você precisa e nossa IA cria o conteúdo para você.",
    },
    {
      question: "O que são créditos?",
      answer:
        "Créditos são a moeda do Captzio. Cada legenda custa 1 crédito e cada imagem custa 10 créditos. Você recebe 2 créditos grátis ao criar sua conta e pode comprar mais a qualquer momento.",
    },
    {
      question: "Os créditos expiram?",
      answer: "Não! Seus créditos nunca expiram. Você pode usá-los quando quiser, sem pressa.",
    },
    {
      question: "Posso cancelar minha assinatura?",
      answer:
        "Sim! Não há contratos ou taxas de cancelamento. Você pode cancelar a qualquer momento e continuar usando seus créditos restantes.",
    },
    {
      question: "Qual é a política de reembolso?",
      answer:
        "Oferecemos reembolso total em até 7 dias após a compra, sem perguntas. Queremos que você esteja 100% satisfeito.",
    },
    {
      question: "Posso usar as imagens geradas comercialmente?",
      answer: "Sim! Todas as imagens e legendas geradas são suas para usar como quiser, incluindo uso comercial.",
    },
    {
      question: "Quais plataformas são suportadas?",
      answer:
        "O Captzio é otimizado para Instagram, Facebook, LinkedIn, Twitter e TikTok. Você pode escolher a plataforma ao gerar o conteúdo.",
    },
    {
      question: "Como funciona a geração de imagens?",
      answer:
        "Você descreve a imagem que deseja e nossa IA (GPT Image 1) cria uma imagem única em alta qualidade (1024x1024). O processo leva alguns segundos.",
    },
    {
      question: "Posso editar as legendas geradas?",
      answer:
        "Sim! Você pode copiar e editar as legendas como quiser. Elas são apenas um ponto de partida para sua criatividade.",
    },
    {
      question: "Há suporte técnico disponível?",
      answer:
        "Sim! Oferecemos suporte por email para todos os usuários. Planos Pro e Business têm suporte prioritário e VIP.",
    },
    {
      question: "Posso usar o Captzio em equipe?",
      answer: "Atualmente, cada conta é individual. Estamos trabalhando em recursos de equipe para o futuro.",
    },
    {
      question: "Os dados são seguros?",
      answer:
        "Absolutamente! Usamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança. Seus dados nunca são compartilhados com terceiros.",
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
      <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-balance font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Perguntas Frequentes
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Encontre respostas para as dúvidas mais comuns sobre o Captzio.
          </p>
        </div>

        {/* FAQ List */}
        <div className="mt-16 space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-8 text-center">
          <h2 className="text-2xl font-bold">Ainda tem dúvidas?</h2>
          <p className="mt-4 text-muted-foreground">Nossa equipe está pronta para ajudar. Entre em contato conosco.</p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/contact">Falar com Suporte</Link>
          </Button>
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
