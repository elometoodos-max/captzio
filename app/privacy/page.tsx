import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export default function PrivacyPage() {
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
              Política de Privacidade
            </h1>
            <p className="mb-6 sm:mb-8 text-sm text-muted-foreground">Última atualização: Janeiro de 2025</p>

            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="mb-4 text-2xl font-bold">1. Informações que Coletamos</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">Coletamos as seguintes informações:</p>
                <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                  <li>
                    <strong>Informações de Conta:</strong> Nome, email e senha (criptografada)
                  </li>
                  <li>
                    <strong>Informações de Pagamento:</strong> Processadas pelo Mercado Pago (não armazenamos dados de
                    cartão)
                  </li>
                  <li>
                    <strong>Conteúdo Gerado:</strong> Legendas, hashtags e imagens criadas na plataforma
                  </li>
                  <li>
                    <strong>Dados de Uso:</strong> Logs de acesso, IP, navegador e estatísticas de uso
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold">2. Como Usamos suas Informações</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">Utilizamos suas informações para:</p>
                <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                  <li>Fornecer e melhorar nossos serviços</li>
                  <li>Processar pagamentos e gerenciar créditos</li>
                  <li>Enviar notificações importantes sobre sua conta</li>
                  <li>Analisar padrões de uso para melhorar a plataforma</li>
                  <li>Prevenir fraudes e garantir a segurança</li>
                  <li>Cumprir obrigações legais</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold">3. Compartilhamento de Dados</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  Não vendemos suas informações pessoais. Compartilhamos dados apenas com:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                  <li>
                    <strong>Processadores de Pagamento:</strong> Mercado Pago para processar transações
                  </li>
                  <li>
                    <strong>Provedores de IA:</strong> OpenAI para geração de conteúdo (apenas prompts, não dados
                    pessoais)
                  </li>
                  <li>
                    <strong>Serviços de Hospedagem:</strong> Vercel e Supabase para infraestrutura
                  </li>
                  <li>
                    <strong>Autoridades Legais:</strong> Quando exigido por lei
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold">4. Segurança dos Dados</h2>
                <p className="leading-relaxed text-muted-foreground">
                  Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações,
                  incluindo criptografia SSL/TLS, senhas criptografadas com bcrypt, e controle de acesso baseado em
                  funções (RBAC).
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold">5. Seus Direitos (LGPD)</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir dados incompletos ou desatualizados</li>
                  <li>Solicitar a exclusão de seus dados</li>
                  <li>Revogar consentimento</li>
                  <li>Portabilidade de dados</li>
                  <li>Informações sobre compartilhamento de dados</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold">6. Cookies e Tecnologias Similares</h2>
                <p className="leading-relaxed text-muted-foreground">
                  Utilizamos cookies essenciais para autenticação e funcionamento da plataforma. Cookies analíticos são
                  usados para melhorar a experiência do usuário. Você pode gerenciar preferências de cookies nas
                  configurações do navegador.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold">7. Retenção de Dados</h2>
                <p className="leading-relaxed text-muted-foreground">
                  Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para fornecer serviços.
                  Após a exclusão da conta, dados pessoais são removidos em até 90 dias, exceto quando a retenção for
                  exigida por lei.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold">8. Alterações nesta Política</h2>
                <p className="leading-relaxed text-muted-foreground">
                  Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas por email
                  ou através da plataforma.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold">9. Contato</h2>
                <p className="leading-relaxed text-muted-foreground">
                  Para exercer seus direitos ou questões sobre privacidade, entre em contato:
                  <br />
                  Email: privacidade@captzio.com
                  <br />
                  DPO (Encarregado de Dados): dpo@captzio.com
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
