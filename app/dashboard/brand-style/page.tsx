import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DashboardHeader } from "@/components/dashboard-header"
import { Sparkles, Save, Wand2 } from "lucide-react"
import { config } from "@/lib/config"

export default async function BrandStylePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  const credits = userData?.credits || 0
  const userName = userData?.name || user.email?.split("@")[0] || "Usuário"
  const isAdmin = userData?.role === "admin" || user.email === config.admin.email

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader credits={credits} isAdmin={isAdmin} userName={userName} />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Wand2 className="h-5 w-5 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold md:text-3xl">Estilo de Marca</h1>
            </div>
            <p className="text-sm text-muted-foreground md:text-base">
              Ensine o Captzio a escrever como você. Cole 3 posts antigos e a IA aprenderá seu tom de voz, vocabulário e
              personalidade.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Configure seu Estilo Único
              </CardTitle>
              <CardDescription>Quanto mais detalhes você fornecer, melhor a IA entenderá sua marca</CardDescription>
            </CardHeader>
            <CardContent>
              <form action="/api/save-brand-style" method="POST" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="post1">Post Exemplo 1</Label>
                  <Textarea
                    id="post1"
                    name="post1"
                    placeholder="Cole aqui uma legenda que representa bem o tom da sua marca..."
                    className="min-h-[120px] resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="post2">Post Exemplo 2</Label>
                  <Textarea
                    id="post2"
                    name="post2"
                    placeholder="Cole aqui outra legenda com seu estilo..."
                    className="min-h-[120px] resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="post3">Post Exemplo 3</Label>
                  <Textarea
                    id="post3"
                    name="post3"
                    placeholder="Cole aqui mais uma legenda..."
                    className="min-h-[120px] resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionais (Opcional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Ex: Sempre uso emojis, gosto de fazer perguntas, evito palavras muito formais..."
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Como funciona?
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• A IA analisa vocabulário, estrutura de frases e tom emocional</li>
                    <li>• Identifica padrões de uso de emojis e pontuação</li>
                    <li>• Aprende o nível de formalidade e proximidade com o público</li>
                    <li>• Replica seu estilo em todas as próximas gerações</li>
                  </ul>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Estilo de Marca
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Dica:</strong> Escolha posts que tiveram bom engajamento e que
              representam bem a voz da sua marca. Quanto mais consistentes os exemplos, melhor o resultado.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
