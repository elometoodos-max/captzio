import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Target, Users, Zap } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Captzio</span>
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
        <section className="container py-24">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 font-display text-4xl font-bold tracking-tight md:text-5xl">Sobre o Captzio</h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              O Captzio nasceu da necessidade de simplificar a criação de conteúdo para redes sociais. Sabemos que criar
              legendas envolventes, encontrar as hashtags certas e produzir imagens profissionais pode ser demorado e
              desafiador.
            </p>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              Nossa plataforma utiliza as mais avançadas tecnologias de inteligência artificial, incluindo GPT-5 nano
              para geração de texto e DALL-E 3 para criação de imagens, permitindo que você produza conteúdo de alta
              qualidade em segundos.
            </p>

            <div className="my-16 grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Nossa Missão</h3>
                <p className="text-sm text-muted-foreground">
                  Democratizar a criação de conteúdo profissional para todos
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Nossa Visão</h3>
                <p className="text-sm text-muted-foreground">Ser a plataforma líder em criação de conteúdo com IA</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Nossos Valores</h3>
                <p className="text-sm text-muted-foreground">Inovação, qualidade e foco no cliente</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-8">
              <h2 className="mb-4 text-2xl font-bold">Por que escolher o Captzio?</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-primary">•</span>
                  <span>Tecnologia de ponta com GPT-5 e DALL-E 3</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-primary">•</span>
                  <span>Sistema de créditos flexível sem mensalidades</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-primary">•</span>
                  <span>Interface intuitiva e fácil de usar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-primary">•</span>
                  <span>Suporte dedicado para ajudar você a crescer</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
