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
        <div className="container flex h-16 items-center justify-between">
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
      </header>

      <main className="flex-1">
        <section className="container py-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h1 className="mb-2 font-display text-3xl font-bold">Minhas Imagens</h1>
              <p className="text-muted-foreground">Imagens geradas com IA</p>
            </div>

            {images && images.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {images.map((image) => (
                  <Card key={image.id}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {image.status === "completed"
                          ? "Concluída"
                          : image.status === "failed"
                            ? "Falhou"
                            : "Processando"}
                      </CardTitle>
                      <CardDescription>{new Date(image.created_at).toLocaleDateString("pt-BR")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {image.status === "completed" && image.image_url ? (
                        <img
                          src={image.image_url || "/placeholder.svg"}
                          alt={image.prompt}
                          className="w-full rounded-lg border border-border"
                        />
                      ) : image.status === "failed" ? (
                        <div className="flex h-48 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5">
                          <p className="text-sm text-destructive">{image.error_message || "Erro ao gerar"}</p>
                        </div>
                      ) : (
                        <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-muted/50">
                          <p className="text-sm text-muted-foreground">Processando...</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2">{image.prompt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex min-h-[400px] items-center justify-center p-8">
                  <div className="text-center">
                    <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p className="mb-4 text-sm text-muted-foreground">Você ainda não gerou nenhuma imagem</p>
                    <Button asChild>
                      <Link href="/dashboard/generate-image">Gerar Primeira Imagem</Link>
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
