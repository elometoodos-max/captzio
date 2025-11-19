import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, ImageIcon, MessageSquare, Crown, Wand2, Trophy, TrendingUp, CheckCircle2, AlertCircle, Sparkles, Zap, ArrowRight } from 'lucide-react'
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { config } from "@/lib/config"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch user data from public.users table
  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  const credits = userData?.credits || 0
  const userName = userData?.name || user.email?.split("@")[0] || "Usuário"
  const isAdmin = userData?.role === "admin" || user.email === config.admin.email

  // Fetch recent activity (last 3 items)
  const { data: recentImages } = await supabase
    .from("images")
    .select("id, created_at, status, prompt, image_url, quality")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  const { data: recentCaptions } = await supabase
    .from("posts")
    .select("id, created_at, platform, caption")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  const safeRecentImages = recentImages || []
  const safeRecentCaptions = recentCaptions || []

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50">
      <DashboardHeader credits={credits} isAdmin={isAdmin} userName={userName} />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Olá, {userName}
                </h1>
                {isAdmin && (
                  <Badge variant="secondary" className="w-fit gap-1 bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
                    <Crown className="h-3.5 w-3.5" />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-slate-500 md:text-lg mt-2 max-w-2xl">
                {isAdmin 
                  ? "Painel de controle administrativo e monitoramento do sistema." 
                  : "Seu estúdio criativo com Inteligência Artificial. O que vamos criar hoje?"}
              </p>
            </div>
            
            <div className="flex items-center gap-3 rounded-full bg-white p-1.5 pr-5 shadow-sm border border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Seus Créditos</span>
                <span className="text-sm font-bold text-slate-900">{isAdmin ? "Ilimitado" : credits}</span>
              </div>
              {!isAdmin && (
                <Button size="sm" variant="ghost" className="ml-2 h-8 w-8 rounded-full p-0" asChild>
                  <Link href="/dashboard/buy-credits">
                    <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* System Status Alert for Admins */}
          {isAdmin && (
             <Alert className="mb-8 border-blue-200 bg-blue-50/50 shadow-sm">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800 font-semibold">Status do Sistema</AlertTitle>
              <AlertDescription className="text-blue-700 flex items-center gap-2 mt-1">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                O sistema está operando normalmente. 
                <Link href="/api/verify-system" target="_blank" className="underline font-medium hover:text-blue-900 ml-1">
                  Verificar integridade completa
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
            {/* Main Actions - Enhanced Cards */}
            <Card className="group relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-slate-200 bg-white">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <MessageSquare className="h-32 w-32" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardHeader className="relative">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Gerar Legenda</CardTitle>
                <CardDescription className="text-slate-500">
                  Crie legendas virais para Instagram, LinkedIn e TikTok com GPT-5 Nano.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative mt-auto">
                <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Otimizado para engajamento</span>
                </div>
                <Button asChild className="w-full h-11 text-base shadow-md shadow-blue-600/10 group-hover:shadow-blue-600/20">
                  <Link href="/dashboard/generate-caption">
                    Criar Legenda <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-slate-200 bg-white">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <ImageIcon className="h-32 w-32" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardHeader className="relative">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-600/20 group-hover:scale-110 transition-transform duration-300">
                  <ImageIcon className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Gerar Imagem</CardTitle>
                <CardDescription className="text-slate-500">
                  Crie visuais impressionantes e realistas com o novo modelo GPT Image 1.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative mt-auto">
                <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Qualidade HD disponível</span>
                </div>
                <Button asChild className="w-full h-11 text-base bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/10 group-hover:shadow-purple-600/20">
                  <Link href="/dashboard/generate-image">
                    Criar Imagem <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats / Recent Activity - Enhanced */}
            <Card className="md:row-span-2 transition-all hover:shadow-lg border-slate-200 bg-white flex flex-col">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pt-6">
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-purple-500" />
                        Últimas Imagens
                      </h4>
                      <Link href="/dashboard/library" className="text-xs text-primary hover:underline">Ver todas</Link>
                    </div>
                    
                    {safeRecentImages.length > 0 ? (
                      <div className="space-y-3">
                        {safeRecentImages.map((img) => (
                          <div key={img.id} className="group flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-2 transition-colors hover:bg-white hover:border-slate-200 hover:shadow-sm">
                            <div className="h-12 w-12 shrink-0 rounded-md bg-slate-200 overflow-hidden">
                              {img.image_url ? (
                                <img src={img.image_url || "/placeholder.svg"} alt="Thumbnail" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                  <ImageIcon className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">{img.prompt}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={img.status === 'completed' ? 'outline' : 'secondary'} className="text-[10px] h-5 px-1.5 font-normal">
                                  {img.status === 'completed' ? 'Pronto' : img.status}
                                </Badge>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(img.created_at).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center">
                        <p className="text-sm text-slate-500">Nenhuma imagem gerada ainda.</p>
                        <Button variant="link" size="sm" asChild className="mt-1 h-auto p-0 text-purple-600">
                          <Link href="/dashboard/generate-image">Criar primeira imagem</Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        Últimas Legendas
                      </h4>
                      <Link href="/dashboard/library" className="text-xs text-primary hover:underline">Ver todas</Link>
                    </div>

                    {safeRecentCaptions.length > 0 ? (
                      <div className="space-y-3">
                        {safeRecentCaptions.map((cap) => (
                          <div key={cap.id} className="group flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:bg-white hover:border-slate-200 hover:shadow-sm">
                            <div className="flex-1 min-w-0">
                              <p className="line-clamp-2 text-sm text-slate-600 italic">"{cap.caption}"</p>
                              <div className="flex items-center justify-between mt-2">
                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal capitalize bg-blue-50 text-blue-700 hover:bg-blue-100">
                                  {cap.platform}
                                </Badge>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(cap.created_at).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center">
                        <p className="text-sm text-slate-500">Nenhuma legenda gerada ainda.</p>
                        <Button variant="link" size="sm" asChild className="mt-1 h-auto p-0 text-blue-600">
                          <Link href="/dashboard/generate-caption">Criar primeira legenda</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Secondary Actions - Compact Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2">
              <Card className="transition-all hover:shadow-md hover:border-primary/30 cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Wand2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Estilo de Marca</h3>
                    <p className="text-xs text-slate-500">Personalize o tom de voz</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-md hover:border-yellow-400/50 cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Missões</h3>
                    <p className="text-xs text-slate-500">Ganhe créditos grátis</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-md hover:border-green-400/50 cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Planos</h3>
                    <p className="text-xs text-slate-500">A partir de R$ 19,90</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {!isAdmin && credits < 5 && (
            <div className="mt-8 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-900 mb-1">Seus créditos estão acabando</h3>
                    <p className="text-amber-700 max-w-xl">
                      Você tem apenas <strong>{credits} créditos</strong> restantes. Recarregue agora para continuar criando conteúdo sem interrupções e desbloquear recursos premium.
                    </p>
                  </div>
                </div>
                <Button asChild size="lg" className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white border-none shadow-lg shadow-amber-600/20">
                  <Link href="/dashboard/buy-credits">Recarregar Agora</Link>
                </Button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
