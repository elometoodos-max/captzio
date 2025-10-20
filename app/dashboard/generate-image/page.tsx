"use client"

import { type FormEvent, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Download, RefreshCw, Sparkles, Info } from "lucide-react"
import { Logo } from "@/components/logo"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { announceToScreenReader } from "@/lib/accessibility"
import { analytics } from "@/lib/analytics"
import { handleDownload } from "@/lib/download" // Declare the variable here

interface ImageJob {
  id: string
  status: "pending" | "processing" | "completed" | "failed"
  image_url: string | null
  error_message: string | null
  revised_prompt?: string | null
}

const getCreditCost = (quality: string, size: string): number => {
  const costs: Record<string, Record<string, number>> = {
    standard: { "1024x1024": 1, "1024x1536": 2, "1536x1024": 2 },
    medium: { "1024x1024": 4, "1024x1536": 6, "1536x1024": 6 },
    hd: { "1024x1024": 17, "1024x1536": 25, "1536x1024": 25 },
  }
  return costs[quality]?.[size] || 1
}

export default function GenerateImagePage() {
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("natural")
  const [quality, setQuality] = useState("standard")
  const [size, setSize] = useState("1024x1024")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [imageJob, setImageJob] = useState<ImageJob | null>(null)

  const pollRef = useRef<number | null>(null)

  const creditCost = getCreditCost(quality, size)

  useEffect(() => {
    if (!jobId) return

    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }

    const poll = async () => {
      try {
        const response = await fetch(`/api/image-job/${jobId}`)
        if (!response.ok) {
          const text = await response.text().catch(() => "Erro ao checar status do job")
          throw new Error(text || "Erro ao checar status do job")
        }

        const data = await response.json()

        if (data?.job) {
          setImageJob(data.job)

          if (data.job.status === "completed" || data.job.status === "failed") {
            if (pollRef.current) {
              clearInterval(pollRef.current)
              pollRef.current = null
            }
            setIsLoading(false)
          }
        }
      } catch (err) {
        console.error("[v0] Failed to poll job status:", err)
        if (pollRef.current) {
          clearInterval(pollRef.current)
          pollRef.current = null
        }
        setError(err instanceof Error ? err.message : "Erro ao checar status")
        setIsLoading(false)
      }
    }

    poll()
    pollRef.current = window.setInterval(poll, 2000)

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [jobId])

  useEffect(() => {
    analytics.trackPageView("/dashboard/generate-image")
  }, [])

  const handleGenerate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedPrompt = prompt.trim()

    if (!trimmedPrompt) {
      setError("Por favor, escreva a descrição da imagem (prompt).")
      return
    }

    if (trimmedPrompt.length < 10) {
      setError("Descrição muito curta. Mínimo 10 caracteres.")
      return
    }

    if (trimmedPrompt.length > 1000) {
      setError("Descrição muito longa. Máximo 1000 caracteres.")
      return
    }

    announceToScreenReader("Iniciando geração de imagem, por favor aguarde", "assertive")

    analytics.track("image_generation_started", {
      quality,
      size,
      style,
      creditCost,
    })

    setIsLoading(true)
    setError(null)
    setJobId(null)
    setImageJob(null)

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          style,
          quality,
          size,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar imagem")
      }

      if (data.jobId) {
        setJobId(data.jobId)
        announceToScreenReader("Imagem sendo processada", "polite")
      } else {
        throw new Error("Resposta inesperada do servidor")
      }
    } catch (err) {
      console.error("[v0] Error generating image:", err)
      const errorMessage = err instanceof Error ? err.message : "Erro ao gerar imagem"
      setError(errorMessage)
      setIsLoading(false)

      announceToScreenReader(`Erro: ${errorMessage}`, "assertive")

      analytics.trackError(err instanceof Error ? err : new Error(errorMessage), {
        context: "image_generation",
      })
    }
  }

  useEffect(() => {
    if (imageJob?.status === "completed") {
      announceToScreenReader("Imagem gerada com sucesso", "polite")
      analytics.track("image_generation_success", {
        quality,
        size,
        jobId,
      })
    } else if (imageJob?.status === "failed") {
      announceToScreenReader("Falha ao gerar imagem", "assertive")
      analytics.track("image_generation_failed", {
        error: imageJob.error_message,
        jobId,
      })
    }
  }, [imageJob?.status])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo size="sm" />
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

      <main className="flex-1 bg-gradient-to-b from-background to-muted/20">
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-3xl font-bold">Gerar Imagem</h1>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  GPT Image 1
                </span>
              </div>
              <p className="text-muted-foreground">
                Crie imagens profissionais com inteligência artificial de última geração
              </p>
            </div>

            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>GPT Image 1</strong> é o modelo mais avançado da OpenAI para geração de imagens. Ele entende
                contexto, cria composições complexas e produz resultados fotorrealistas de alta qualidade.
              </AlertDescription>
            </Alert>

            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                  <CardDescription>Descreva a imagem que você deseja criar</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="prompt">Descrição da Imagem *</Label>
                      <Textarea
                        id="prompt"
                        placeholder="Ex: Uma foto profissional de produtos de beleza em um fundo minimalista branco com iluminação suave e sombras delicadas. Composição elegante com foco nos detalhes dos produtos."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        required
                        rows={6}
                        disabled={isLoading}
                        maxLength={1000}
                        className="resize-none"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{prompt.length}/1000 caracteres</span>
                        <span className="text-muted-foreground">Seja específico sobre cores, estilo e composição</span>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="style">Estilo Visual</Label>
                        <Select value={style} onValueChange={setStyle} disabled={isLoading}>
                          <SelectTrigger id="style">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="natural">🎨 Natural (Realista)</SelectItem>
                            <SelectItem value="vivid">✨ Vibrante (Cores Intensas)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="size">Tamanho</Label>
                        <Select value={size} onValueChange={setSize} disabled={isLoading}>
                          <SelectTrigger id="size">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1024x1024">⬜ Quadrado (1:1)</SelectItem>
                            <SelectItem value="1024x1536">📱 Retrato (2:3)</SelectItem>
                            <SelectItem value="1536x1024">🖼️ Paisagem (3:2)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quality">Qualidade da Imagem</Label>
                      <Select value={quality} onValueChange={setQuality} disabled={isLoading}>
                        <SelectTrigger id="quality">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">
                            <div className="flex items-center justify-between w-full">
                              <span>Padrão</span>
                              <span className="ml-4 text-xs text-muted-foreground">
                                {getCreditCost("standard", size)} crédito
                                {getCreditCost("standard", size) > 1 ? "s" : ""}
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center justify-between w-full">
                              <span>Média</span>
                              <span className="ml-4 text-xs text-muted-foreground">
                                {getCreditCost("medium", size)} créditos
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="hd">
                            <div className="flex items-center justify-between w-full">
                              <span>Alta Definição (HD)</span>
                              <span className="ml-4 text-xs text-muted-foreground">
                                {getCreditCost("hd", size)} créditos
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {quality === "standard" && "Boa qualidade, rápida e econômica"}
                        {quality === "medium" && "Qualidade superior com mais detalhes"}
                        {quality === "hd" && "Máxima qualidade com detalhes ultra refinados"}
                      </p>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gerando imagem...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Gerar Imagem ({creditCost} crédito{creditCost > 1 ? "s" : ""})
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Resultado</h2>
                  {imageJob?.status === "completed" && (
                    <span className="text-xs text-muted-foreground">Gerado com GPT Image 1</span>
                  )}
                </div>
                <Card className="border-2">
                  <CardContent className="flex min-h-[500px] items-center justify-center p-8">
                    {isLoading && !imageJob && (
                      <div className="text-center">
                        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
                        <p className="font-medium">Iniciando geração...</p>
                        <p className="mt-2 text-sm text-muted-foreground">Preparando sua solicitação</p>
                      </div>
                    )}

                    {imageJob?.status === "processing" && (
                      <div className="text-center">
                        <RefreshCw className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
                        <p className="font-medium">Gerando sua imagem...</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          A IA está criando sua imagem com qualidade {quality}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">Isso pode levar 30-60 segundos</p>
                      </div>
                    )}

                    {imageJob?.status === "completed" && imageJob.image_url && (
                      <div className="w-full space-y-4">
                        <div className="relative overflow-hidden rounded-lg border-2 border-border">
                          <img src={imageJob.image_url || "/placeholder.svg"} alt="Imagem gerada" className="w-full" />
                        </div>
                        {imageJob.revised_prompt && (
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              <strong>Prompt otimizado pela IA:</strong> {imageJob.revised_prompt}
                            </AlertDescription>
                          </Alert>
                        )}
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Button onClick={() => handleDownload(imageJob.image_url!)} className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Baixar Imagem
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setJobId(null)
                              setImageJob(null)
                              setError(null)
                            }}
                            className="w-full"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Gerar Nova
                          </Button>
                        </div>
                      </div>
                    )}

                    {imageJob?.status === "failed" && (
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                          <span className="text-2xl">✕</span>
                        </div>
                        <p className="font-medium text-destructive">Erro ao gerar imagem</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {imageJob.error_message || "Erro desconhecido"}
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setJobId(null)
                            setImageJob(null)
                            setError(null)
                          }}
                          className="mt-4"
                        >
                          Tentar Novamente
                        </Button>
                      </div>
                    )}

                    {!isLoading && !imageJob && (
                      <div className="text-center">
                        <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                        <p className="font-medium">Pronto para criar</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Preencha o formulário e clique em "Gerar Imagem"
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
