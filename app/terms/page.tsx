import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export default function TermsPage() {
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
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-4 sm:mb-6 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Termos de Uso
            </h1>
            <p className="mb-6 sm:mb-8 text-sm text-muted-foreground">Última atualização: Janeiro de 2025</p>

            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="mb-4 text-2xl font-bold">1. Aceitação dos Termos</h2>
                <p className="leading-relaxed text-muted-foreground">
                  Ao acessar e usar o Captzio, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você
                  não concordar com qualquer parte destes termos, não deverá usar nossos serviços.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold">2. Descrição do Serviço</h2>
                <p className="leading-relaxed text-muted-foreground">
                  O Captzio é uma plataforma de geração de conteúdo para redes sociais utilizando inteligência
                  artificial. Oferecemos serviços de criação de legendas, hashtags e imagens através de um sistema de
                  créditos.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold">3. Sistema de Créditos</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  Os créditos são a moeda virtual utilizada na plataforma:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                  <li>1 crédito = 1 geração de legenda/hashtags</li>
                  <li>5 créditos = 1 geração de imagem</li>
                  <li>Créditos não expiram</li>
                  <li>Créditos não são reembolsáveis após a compra</li>
                  <li>Créditos são pessoais e intransferíveis</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold">4. Pagamentos</h2>
                <p className="leading-relaxed text-muted-foreground">
                  Os pagamentos são processados através do Mercado Pago. Ao realizar uma compra, você concorda com os
                  termos de serviço do Mercado Pago. Todos os preços estão em Reais (BRL) e incluem impostos aplicáveis.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold">5. Uso Aceitável</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">Você concorda em não usar o Captzio para:</p>
                <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                  <li>Criar conteúdo ilegal, ofensivo ou prejudicial</li>
                  <li>Violar direitos de propriedade intelectual de terceiros</li>
                  <li>Realizar atividades fraudulentas ou enganosas</li>
                  <li>Tentar acessar sistemas ou dados não autorizados</li>
                  <li>Revender ou redistribuir nossos serviços sem autorização</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold">6. Propriedade Intelectual</h2>
                <p className="leading-relaxed text-muted-foreground">
                  O conteúdo gerado através da plataforma pertence a você. No entanto, você concede ao Captzio uma
                  licença não exclusiva para usar exemplos do conteúdo gerado para fins de marketing e melhoria do
                  serviço.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold">7. Limitação de Responsabilidade</h2>
                <p className="leading-relaxed text-muted-foreground">
                  O Captzio não se responsabiliza por danos diretos, indiretos, incidentais ou consequenciais
                  resultantes do uso ou incapacidade de usar nossos serviços. O conteúdo gerado pela IA deve ser
                  revisado antes da publicação.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold">8. Modificações dos Termos</h2>
                <p className="leading-relaxed text-muted-foreground">
                  Reservamos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre
                  mudanças significativas por email ou através da plataforma.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold">9. Contato</h2>
                <p className="leading-relaxed text-muted-foreground">
                  Para questões sobre estes termos, entre em contato através do email: suporte@captzio.com
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
