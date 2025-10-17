import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { Sparkles, HelpCircle, CreditCard, ImageIcon, MessageSquare, Hash, Award } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/" className="transition-transform hover:scale-105">
            <Logo />
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
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
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 sm:mb-12 text-center">
              <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-primary">
                <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                Central de Ajuda
              </div>
              <h1 className="mb-3 sm:mb-4 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                Como podemos ajudar?
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground px-4">
                Encontre respostas rápidas para as perguntas mais frequentes sobre o Captzio
              </p>
            </div>

            {/* Quick Links */}
            <div className="mb-12 sm:mb-16 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Primeiros Passos</CardTitle>
                  <CardDescription>Como começar a usar o Captzio</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Crie sua conta, ganhe 2 créditos grátis e comece a gerar conteúdo profissional em segundos.
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Sistema de Créditos</CardTitle>
                  <CardDescription>Entenda como funcionam os créditos</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  1 crédito = 1 legenda | 5 créditos = 1 imagem. Créditos nunca expiram e podem ser usados quando
                  quiser.
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Gerar Legendas</CardTitle>
                  <CardDescription>Crie legendas envolventes</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Descreva seu conteúdo, escolha o tom e a plataforma. A IA cria legendas otimizadas em português
                  brasileiro.
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Hash className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Hashtags Estratégicas</CardTitle>
                  <CardDescription>Aumente seu alcance</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Gere até 30 hashtags relevantes otimizadas para o algoritmo brasileiro de cada plataforma.
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Imagens com IA</CardTitle>
                  <CardDescription>Crie visuais profissionais</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Descreva a imagem que você quer e a IA cria usando DALL-E 3 em alta qualidade (1024x1024).
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Estilo de Marca</CardTitle>
                  <CardDescription>IA que aprende sua voz</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Cole 3 posts antigos e a IA replica seu tom, vocabulário e personalidade em todo conteúdo gerado.
                </CardContent>
              </Card>
            </div>

            {/* FAQ Accordion */}
            <div className="mb-16">
              <h2 className="mb-8 text-center text-3xl font-bold">Perguntas Frequentes</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">Como funciona o sistema de créditos?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p className="mb-3">
                      O Captzio usa um sistema de créditos flexível onde você paga apenas pelo que usa:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>
                        <strong>1 crédito</strong> = 1 legenda completa com hashtags e CTA
                      </li>
                      <li>
                        <strong>5 créditos</strong> = 1 imagem em alta qualidade (1024x1024)
                      </li>
                      <li>Créditos nunca expiram</li>
                      <li>Você pode combinar legendas e imagens como quiser</li>
                      <li>Compre mais créditos quando precisar, sem mensalidades</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    O que torna o Captzio diferente de outras IAs?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p className="mb-3">Somos a primeira IA treinada especificamente para o mercado brasileiro:</p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>
                        <strong>Português Brasileiro Nativo:</strong> Entendemos gírias, expressões e contexto cultural
                      </li>
                      <li>
                        <strong>Algoritmos Locais:</strong> Otimizado para Instagram, TikTok e Threads brasileiros
                      </li>
                      <li>
                        <strong>Memória de Marca:</strong> A IA aprende e replica o estilo único da sua marca
                      </li>
                      <li>
                        <strong>Feito por Criadores:</strong> Desenvolvido por quem entende os desafios reais
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">Como funciona o recurso de Estilo de Marca?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p className="mb-3">
                      O Estilo de Marca é um recurso exclusivo que permite a IA aprender sua voz única:
                    </p>
                    <ol className="list-decimal space-y-2 pl-6">
                      <li>Acesse "Estilo de Marca" no dashboard</li>
                      <li>Cole 3 posts antigos que representam bem sua marca</li>
                      <li>A IA analisa tom de voz, vocabulário, estrutura e personalidade</li>
                      <li>Todo conteúdo gerado seguirá automaticamente esse estilo</li>
                      <li>Você pode atualizar o estilo a qualquer momento</li>
                    </ol>
                    <p className="mt-3">É como ter um ghostwriter que conhece sua marca de dentro pra fora!</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">Os créditos expiram?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <strong>Não!</strong> Seus créditos nunca expiram. Você pode comprar hoje e usar daqui a 6 meses, 1
                    ano ou quando quiser. Não há pressa nem pressão. Compre no seu ritmo e use quando precisar.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">Posso editar o conteúdo gerado pela IA?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Sim! Todo conteúdo gerado pode ser copiado e editado livremente. A IA serve como ponto de partida,
                    mas você tem controle total para ajustar, personalizar ou reescrever como preferir antes de
                    publicar.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">Qual a qualidade das imagens geradas?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p className="mb-3">Usamos o DALL-E 3, o modelo mais avançado da OpenAI para geração de imagens:</p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>Resolução: 1024x1024 pixels (alta qualidade)</li>
                      <li>Estilos variados: fotorrealista, ilustração, minimalista, etc.</li>
                      <li>Qualidade profissional pronta para publicação</li>
                      <li>Download direto em PNG</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger className="text-left">Como funciona o sistema de conquistas?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p className="mb-3">O sistema de conquistas gamifica sua experiência e recompensa seu uso:</p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>Desbloqueie badges ao atingir marcos (10 posts, 100 posts, etc.)</li>
                      <li>Ganhe créditos bônus ao completar conquistas</li>
                      <li>Acompanhe seu progresso e estatísticas</li>
                      <li>Conquistas exclusivas para usuários fiéis</li>
                    </ul>
                    <p className="mt-3">Acesse "Conquistas" no dashboard para ver todas disponíveis!</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger className="text-left">Posso cancelar ou pedir reembolso?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Como trabalhamos com créditos pré-pagos (não assinaturas), não há o que cancelar. Os créditos são
                    seus para sempre. Quanto a reembolsos, não oferecemos após a compra, pois os créditos são
                    disponibilizados imediatamente. Por isso, recomendamos começar com o plano Básico para testar.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-9">
                  <AccordionTrigger className="text-left">Quais formas de pagamento vocês aceitam?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p className="mb-3">Aceitamos todas as principais formas de pagamento via Mercado Pago:</p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>
                        <strong>PIX:</strong> Aprovação instantânea
                      </li>
                      <li>
                        <strong>Cartão de Crédito:</strong> Todas as bandeiras (Visa, Mastercard, Elo, etc.)
                      </li>
                      <li>
                        <strong>Boleto Bancário:</strong> Aprovação em até 2 dias úteis
                      </li>
                    </ul>
                    <p className="mt-3">Todos os pagamentos são 100% seguros e criptografados.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-10">
                  <AccordionTrigger className="text-left">Como funciona o suporte?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p className="mb-3">Oferecemos diferentes níveis de suporte baseados no seu plano:</p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>
                        <strong>Plano Básico:</strong> Suporte por email em até 24h
                      </li>
                      <li>
                        <strong>Plano Profissional:</strong> Suporte prioritário em até 12h
                      </li>
                      <li>
                        <strong>Plano Empresarial:</strong> Suporte VIP 24/7 + gerente de conta dedicado
                      </li>
                    </ul>
                    <p className="mt-3">
                      Entre em contato:{" "}
                      <a href="mailto:suporte@captzio.com" className="text-primary hover:underline">
                        suporte@captzio.com
                      </a>
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Contact CTA */}
            <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-8 text-center">
              <HelpCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h2 className="mb-2 text-2xl font-bold">Ainda tem dúvidas?</h2>
              <p className="mb-6 text-muted-foreground">
                Nossa equipe está pronta para ajudar você a aproveitar ao máximo o Captzio
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/contact">
                    Entre em Contato
                    <MessageSquare className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/faq">Ver Mais Perguntas</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
