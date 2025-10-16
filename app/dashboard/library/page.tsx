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
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">Captzio</span>
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 md:mb-8">
              <h1 className="mb-2 font-display text-2xl md:text-3xl font-bold">Biblioteca</h1>
              <p className="text-sm md:text-base text-muted-foreground">Suas legendas geradas</p>
            </div>

            {posts && posts.length > 0 ? (
              <div className="grid gap-4">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-base">{post.title || "Legenda"}</CardTitle>
                            <CardDescription>
                              {new Date(post.created_at).toLocaleDateString("pt-BR")} • {post.platform || "Geral"} •{" "}
                              {post.tone || "Profissional"}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm leading-relaxed">{post.caption}</p>
                      </div>
                      {post.cta && (
                        <div>
                          <p className="text-sm font-medium text-primary">{post.cta}</p>
                        </div>
                      )}
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">{post.hashtags.join(" ")}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex min-h-[400px] items-center justify-center p-8">
                  <div className="text-center">
                    <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p className="mb-4 text-sm text-muted-foreground">Você ainda não gerou nenhuma legenda</p>
                    <Button asChild>
                      <Link href="/dashboard/generate-caption">Gerar Primeira Legenda</Link>
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
