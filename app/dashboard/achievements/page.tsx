import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardHeader } from "@/components/dashboard-header"
import { Trophy, Star, Zap, Target, Award, Crown } from "lucide-react"
import { config } from "@/lib/config"

export default async function AchievementsPage() {
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

  // Fetch user stats
  const { data: posts } = await supabase.from("posts").select("*").eq("user_id", user.id)
  const { data: images } = await supabase.from("images").select("*").eq("user_id", user.id)

  const totalPosts = posts?.length || 0
  const totalImages = images?.length || 0
  const totalContent = totalPosts + totalImages

  // Define achievements
  const achievements = [
    {
      id: "first-post",
      title: "Primeiro Passo",
      description: "Gere sua primeira legenda",
      icon: Star,
      unlocked: totalPosts >= 1,
      progress: Math.min(totalPosts, 1),
      target: 1,
      reward: "+5 créditos",
    },
    {
      id: "10-posts",
      title: "Criador Iniciante",
      description: "Gere 10 legendas",
      icon: Zap,
      unlocked: totalPosts >= 10,
      progress: Math.min(totalPosts, 10),
      target: 10,
      reward: "+10 créditos",
    },
    {
      id: "50-posts",
      title: "Criador Experiente",
      description: "Gere 50 legendas",
      icon: Target,
      unlocked: totalPosts >= 50,
      progress: Math.min(totalPosts, 50),
      target: 50,
      reward: "+25 créditos",
    },
    {
      id: "100-content",
      title: "Top Creator",
      description: "Gere 100 conteúdos (legendas + imagens)",
      icon: Trophy,
      unlocked: totalContent >= 100,
      progress: Math.min(totalContent, 100),
      target: 100,
      reward: "+50 créditos",
    },
    {
      id: "first-image",
      title: "Artista Visual",
      description: "Gere sua primeira imagem",
      icon: Award,
      unlocked: totalImages >= 1,
      progress: Math.min(totalImages, 1),
      target: 1,
      reward: "+10 créditos",
    },
    {
      id: "power-user",
      title: "Usuário Power",
      description: "Use o Captzio por 30 dias consecutivos",
      icon: Crown,
      unlocked: false,
      progress: 0,
      target: 30,
      reward: "+100 créditos",
    },
  ]

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader credits={credits} isAdmin={isAdmin} userName={userName} />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold md:text-3xl">Conquistas</h1>
            </div>
            <p className="text-sm text-muted-foreground md:text-base">
              Desbloqueie conquistas e ganhe créditos bônus enquanto cria conteúdo incrível
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Seu Progresso</CardTitle>
              <CardDescription>
                {unlockedCount} de {achievements.length} conquistas desbloqueadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso geral</span>
                  <span className="font-semibold">{Math.round((unlockedCount / achievements.length) * 100)}%</span>
                </div>
                <Progress value={(unlockedCount / achievements.length) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => {
              const Icon = achievement.icon
              const progressPercent = (achievement.progress / achievement.target) * 100

              return (
                <Card
                  key={achievement.id}
                  className={achievement.unlocked ? "border-primary/50 bg-primary/5" : "opacity-75"}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                          achievement.unlocked ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      {achievement.unlocked && (
                        <Badge className="bg-primary">
                          <Trophy className="mr-1 h-3 w-3" />
                          Desbloqueado
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{achievement.title}</CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-semibold">
                            {achievement.progress}/{achievement.target}
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                      <div className="rounded-lg bg-accent/10 px-3 py-2 text-center">
                        <p className="text-sm font-semibold text-accent-foreground">Recompensa: {achievement.reward}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
