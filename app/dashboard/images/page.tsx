import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowLeft, ImageIcon } from "lucide-react"

export default async function ImagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch user's images
  const { data: images } = await supabase
    .from("images")
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
          <div className="mb-6 md:mb-8 animate-fade-in">
            <h1 className="mb-2 font-display text-2xl md:text-3xl font-bold">Galeria de Imagens</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {images && images.length > 0
                ? `${images.length} imagens geradas`
                : "Suas imagens geradas aparecerão aqui"}
            </p>
          </div>

          {images && images.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
              {images.map((image, index) => (
                <Card
                  key={image.id}
                  className="card-hover overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {image.status === "completed"
                          ? "Concluída"
                          : image.status === "failed"
                            ? "Falhou"
                            : "Processando..."}
                      </CardTitle>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          image.status === "completed"
                            ? "bg-primary/10 text-primary"
                            : image.status === "failed"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {image.status === "completed" ? "✓" : image.status === "failed" ? "✗" : "⏳"}
                      </span>
                    </div>
                    <CardDescription className="text-xs">
                      {new Date(image.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {image.status === "completed" && image.image_url ? (
                      <div className="relative aspect-square overflow-hidden rounded-lg border border-border group">
                        <img
                          src={image.image_url || "/placeholder.svg"}
                          alt={image.prompt}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    ) : image.status === "failed" ? (
                      <div className="flex aspect-square items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5">
                        <div className="text-center p-4">
                          <p className="text-sm font-medium text-destructive mb-1">Erro ao gerar</p>
                          <p className="text-xs text-destructive/70">{image.error_message || "Tente novamente"}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex aspect-square items-center justify-center rounded-lg border border-border bg-muted/50">
                        <div className="text-center">
                          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          <p className="text-xs text-muted-foreground">Gerando imagem...</p>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{image.prompt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed animate-fade-in">
              <CardContent className="flex min-h-[400px] items-center justify-center p-8">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">Nenhuma imagem ainda</h3>
                  <p className="mb-6 text-sm text-muted-foreground max-w-sm mx-auto">
                    Crie imagens profissionais com IA para suas redes sociais
                  </p>
                  <Button asChild size="lg" className="transition-all hover:scale-105">
                    <Link href="/dashboard/generate-image">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar Primeira Imagem
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  )
}
