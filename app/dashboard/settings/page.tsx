import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DashboardHeader } from "@/components/dashboard-header"
import { config } from "@/lib/config"
import { Bell, Lock, Palette, Globe } from "lucide-react"

export default async function SettingsPage() {
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

      <main className="flex-1 bg-muted/30">
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6 md:mb-8">
            <h1 className="font-display text-2xl font-bold md:text-3xl">Configurações</h1>
            <p className="text-sm text-muted-foreground md:text-base">Personalize sua experiência no Captzio</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações
                </CardTitle>
                <CardDescription>Gerencie como você recebe notificações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Notificações por Email</Label>
                    <p className="text-xs text-muted-foreground">Receba atualizações sobre suas gerações e créditos</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing">Novidades e Promoções</Label>
                    <p className="text-xs text-muted-foreground">Fique por dentro de novos recursos e ofertas</p>
                  </div>
                  <Switch id="marketing" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="low-credits">Alerta de Créditos Baixos</Label>
                    <p className="text-xs text-muted-foreground">
                      Seja notificado quando seus créditos estiverem acabando
                    </p>
                  </div>
                  <Switch id="low-credits" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Aparência
                </CardTitle>
                <CardDescription>Personalize a interface do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Modo Escuro</Label>
                    <p className="text-xs text-muted-foreground">Ative o tema escuro para reduzir o cansaço visual</p>
                  </div>
                  <Switch id="dark-mode" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compact-mode">Modo Compacto</Label>
                    <p className="text-xs text-muted-foreground">Reduza o espaçamento para ver mais conteúdo</p>
                  </div>
                  <Switch id="compact-mode" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="animations">Animações</Label>
                    <p className="text-xs text-muted-foreground">Ative animações suaves na interface</p>
                  </div>
                  <Switch id="animations" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Segurança
                </CardTitle>
                <CardDescription>Proteja sua conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <p className="text-xs text-muted-foreground mb-2">Última alteração: Nunca</p>
                  <Button variant="outline" size="sm">
                    Alterar Senha
                  </Button>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="space-y-0.5">
                    <Label htmlFor="2fa">Autenticação de Dois Fatores</Label>
                    <p className="text-xs text-muted-foreground">Adicione uma camada extra de segurança</p>
                  </div>
                  <Switch id="2fa" />
                </div>
                <div className="pt-2 border-t">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Ver Sessões Ativas
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Preferências
                </CardTitle>
                <CardDescription>Ajustes gerais do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <p className="text-xs text-muted-foreground">Português (Brasil)</p>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <Label>Fuso Horário</Label>
                  <p className="text-xs text-muted-foreground">(GMT-3) Brasília</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-save">Salvar Automaticamente</Label>
                    <p className="text-xs text-muted-foreground">Salve suas gerações automaticamente</p>
                  </div>
                  <Switch id="auto-save" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
              <CardDescription>Ações irreversíveis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Excluir Conta</p>
                  <p className="text-xs text-muted-foreground">
                    Remova permanentemente sua conta e todos os dados associados
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Excluir Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
