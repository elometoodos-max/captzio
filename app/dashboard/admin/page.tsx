"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Users, ImageIcon, MessageSquare, DollarSign, Activity, RefreshCw } from "lucide-react"

interface SystemError {
  id: string
  error_type: string
  severity: "low" | "medium" | "high" | "critical"
  message: string
  stack_trace?: string
  user?: { email: string; name?: string }
  endpoint?: string
  method?: string
  status_code?: number
  metadata?: any
  resolved: boolean
  created_at: string
}

interface Stats {
  users: { total: number }
  content: { captions: number; images: number }
  revenue: { total: number; currency: string }
  errors: { total: number; unresolved: number; critical: number; today: number }
  health: { status: string; uptime: string }
}

const severityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
}

const severityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
}

const errorTypeLabels = {
  api: "API",
  sql: "SQL",
  caption: "Legenda",
  image: "Imagem",
  auth: "Autenticação",
  payment: "Pagamento",
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [errors, setErrors] = useState<SystemError[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null)
  const [showResolved, setShowResolved] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      // Buscar estatísticas
      const statsRes = await fetch("/api/admin/stats")
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      // Buscar erros
      const params = new URLSearchParams()
      if (filterType) params.append("type", filterType)
      if (filterSeverity) params.append("severity", filterSeverity)
      params.append("resolved", showResolved.toString())
      params.append("limit", "100")

      const errorsRes = await fetch(`/api/admin/errors?${params}`)
      if (errorsRes.ok) {
        const errorsData = await errorsRes.json()
        setErrors(errorsData.errors || [])
      }
    } catch (error) {
      console.error("[v0] Erro ao buscar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterType, filterSeverity, showResolved])

  const resolveError = async (errorId: string, resolved: boolean) => {
    try {
      const res = await fetch("/api/admin/errors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errorId, resolved }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("[v0] Erro ao resolver erro:", error)
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const healthStatus = stats?.health.status || "unknown"
  const healthColor =
    healthStatus === "healthy" ? "text-green-500" : healthStatus === "warning" ? "text-yellow-500" : "text-red-500"

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Monitoramento completo do sistema Captzio</p>
        </div>
        <Button onClick={fetchData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Status de Saúde */}
      {stats && (
        <Alert className={healthStatus === "critical" ? "border-red-500" : ""}>
          <Activity className={`h-4 w-4 ${healthColor}`} />
          <AlertTitle className="flex items-center gap-2">
            Status do Sistema: <span className={healthColor}>{healthStatus.toUpperCase()}</span>
          </AlertTitle>
          <AlertDescription>
            Uptime: {stats.health.uptime} | {stats.errors.unresolved} erros não resolvidos
            {stats.errors.critical > 0 && ` | ${stats.errors.critical} erros críticos`}
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Estatísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Legendas Geradas</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.content.captions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Imagens Geradas</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.content.images}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.revenue.currency} {stats.revenue.total.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs de Erros */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos os Erros ({errors.length})</TabsTrigger>
          <TabsTrigger value="critical">
            Críticos ({errors.filter((e) => e.severity === "critical").length})
          </TabsTrigger>
          <TabsTrigger value="unresolved">Não Resolvidos ({errors.filter((e) => !e.resolved).length})</TabsTrigger>
        </TabsList>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          <Button variant={filterType === null ? "default" : "outline"} size="sm" onClick={() => setFilterType(null)}>
            Todos os Tipos
          </Button>
          {Object.entries(errorTypeLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={filterType === key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(key)}
            >
              {label}
            </Button>
          ))}
          <Button
            variant={showResolved ? "default" : "outline"}
            size="sm"
            onClick={() => setShowResolved(!showResolved)}
          >
            {showResolved ? "Mostrar Não Resolvidos" : "Mostrar Resolvidos"}
          </Button>
        </div>

        <TabsContent value="all" className="space-y-4">
          {errors.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="mt-4 text-lg font-medium">Nenhum erro encontrado!</p>
                <p className="text-sm text-muted-foreground">O sistema está funcionando perfeitamente.</p>
              </CardContent>
            </Card>
          ) : (
            errors.map((error) => (
              <Card key={error.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={severityColors[error.severity]}>{severityLabels[error.severity]}</Badge>
                        <Badge variant="outline">
                          {errorTypeLabels[error.error_type as keyof typeof errorTypeLabels]}
                        </Badge>
                        {error.resolved && <Badge variant="secondary">Resolvido</Badge>}
                      </div>
                      <CardTitle className="text-lg">{error.message}</CardTitle>
                      <CardDescription>
                        {new Date(error.created_at).toLocaleString("pt-BR")}
                        {error.user && ` • ${error.user.email}`}
                        {error.endpoint && ` • ${error.method} ${error.endpoint}`}
                        {error.status_code && ` • Status ${error.status_code}`}
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant={error.resolved ? "outline" : "default"}
                      onClick={() => resolveError(error.id, !error.resolved)}
                    >
                      {error.resolved ? (
                        <XCircle className="mr-2 h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      {error.resolved ? "Marcar como Não Resolvido" : "Marcar como Resolvido"}
                    </Button>
                  </div>
                </CardHeader>
                {error.stack_trace && (
                  <CardContent>
                    <details className="cursor-pointer">
                      <summary className="text-sm font-medium">Stack Trace</summary>
                      <pre className="mt-2 overflow-x-auto rounded bg-muted p-4 text-xs">{error.stack_trace}</pre>
                    </details>
                  </CardContent>
                )}
                {error.metadata && Object.keys(error.metadata).length > 0 && (
                  <CardContent className="pt-0">
                    <details className="cursor-pointer">
                      <summary className="text-sm font-medium">Metadados</summary>
                      <pre className="mt-2 overflow-x-auto rounded bg-muted p-4 text-xs">
                        {JSON.stringify(error.metadata, null, 2)}
                      </pre>
                    </details>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          {errors.filter((e) => e.severity === "critical").length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="mt-4 text-lg font-medium">Nenhum erro crítico!</p>
              </CardContent>
            </Card>
          ) : (
            errors
              .filter((e) => e.severity === "critical")
              .map((error) => <Card key={error.id}>{/* Same error card structure */}</Card>)
          )}
        </TabsContent>

        <TabsContent value="unresolved" className="space-y-4">
          {errors.filter((e) => !e.resolved).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="mt-4 text-lg font-medium">Todos os erros foram resolvidos!</p>
              </CardContent>
            </Card>
          ) : (
            errors
              .filter((e) => !e.resolved)
              .map((error) => <Card key={error.id}>{/* Same error card structure */}</Card>)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
