import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowLeft, MessageSquare } from "lucide-react"

export default async function LibraryPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch user's posts
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">Captzio</span>
            </Link>
            <Button variant="ghost" size="sm" asChild className="transition-all hover:scale-105">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-muted/30">
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 md:mb-8 animate-fade-in">
              <h1 className="mb-2 font-display text-2xl md:text-3xl font-bold">Biblioteca de Legendas</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {posts && posts.length > 0
                  ? `${posts.length} legendas geradas`
                  : "Suas legendas geradas aparecerão aqui"}
              </p>
            </div>

            {posts && posts.length > 0 ? (
              <div className="grid gap-4 animate-fade-in">
                {posts.map((post, index) => (
                  <Card key={post.id} className="card-hover" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                            <MessageSquare className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base md:text-lg">{post.title || "Legenda"}</CardTitle>
                            <CardDescription className="text-xs md:text-sm">
                              {new Date(post.created_at).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })}{" "}
                              • {post.platform || "Geral"} • {post.tone || "Profissional"}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.caption}</p>
                      </div>
                      {post.cta && (
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                          <p className="text-sm font-medium text-primary">{post.cta}</p>
                        </div>
                      )}
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="rounded-lg bg-accent/10 p-3">
                          <p className="text-xs text-muted-foreground leading-relaxed">{post.hashtags.join(" ")}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed animate-fade-in">
                <CardContent className="flex min-h-[400px] items-center justify-center p-8">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">Nenhuma legenda ainda</h3>
                    <p className="mb-6 text-sm text-muted-foreground max-w-sm mx-auto">
                      Comece a criar legendas incríveis com IA para suas redes sociais
                    </p>
                    <Button asChild size="lg" className="transition-all hover:scale-105">
                      <Link href="/dashboard/generate-caption">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gerar Primeira Legenda
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
