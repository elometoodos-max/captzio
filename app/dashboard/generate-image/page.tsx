"use client"

import { type FormEvent, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, ArrowLeft, Loader2, Download, RefreshCw } from "lucide-react"

interface ImageJob {
  id: string
  status: "pending" | "processing" | "completed" | "failed"
  image_url: string | null
  error_message: string | null
}

export default function GenerateImagePage() {
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("natural")
  const [quality, setQuality] = useState("standard")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [imageJob, setImageJob] = useState<ImageJob | null>(null)

  const pollRef = useRef<number | null>(null)

  // Poll for job status
  useEffect(() => {
    if (!jobId) return

    // clear any previous interval
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

  const handleGenerate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!prompt.trim()) {
      setError("Por favor escreva a descrição da imagem (prompt).")
      return
    }

    setIsLoading(true)
    setError(null)
    setJobId(null)
    setImageJob(null)

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          quality, // Send quality as-is (standard or hd)
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar imagem")
      }

      if (data.jobId) {
        setJobId(data.jobId)
      } else if (data.imageBase64) {
        setImageJob({
          id: "sync",
          status: "completed",
          image_url: `data:image/png;base64,${data.imageBase64}`,
          error_message: null,
        })
        setIsLoading(false)
      } else {
        throw new Error("Resposta inesperada do servidor")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar imagem")
      setIsLoading(false)
    }
  }

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) throw new Error("Falha ao baixar imagem")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `captzio-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("[v0] Failed to download image:", err)
      setError(err instanceof Error ? err.message : "Erro ao baixar imagem")
    }
  }

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
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h1 className="mb-2 font-display text-3xl font-bold">Gerar Imagem</h1>
              <p className="text-muted-foreground">Crie imagens profissionais com GPT Image 1</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                  <CardDescription>Descreva a imagem que você deseja criar</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="prompt">Descrição da Imagem</Label>
                      <Textarea
                        id="prompt"
                        placeholder="Ex: Uma foto profissional de produtos de beleza em um fundo minimalista branco com iluminação suave..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        required
                        rows={6}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Seja específico sobre cores, estilo, composição e elementos desejados
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="style">Estilo</Label>
                      <Select value={style} onValueChange={setStyle} disabled={isLoading}>
                        <SelectTrigger id="style">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="natural">Natural</SelectItem>
                          <SelectItem value="vivid">Vibrante</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quality">Qualidade</Label>
                      <Select value={quality} onValueChange={setQuality} disabled={isLoading}>
                        <SelectTrigger id="quality">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Padrão (mais barato)</SelectItem>
                          <SelectItem value="hd">Alta Definição (mais caro)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Gerar Imagem
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h2 className="font-semibold">Resultado</h2>
                <Card>
                  <CardContent className="flex min-h-[500px] items-center justify-center p-8">
                    {isLoading && !imageJob && (
                      <div className="text-center">
                        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Iniciando geração...</p>
                      </div>
                    )}

                    {imageJob?.status === "processing" && (
                      <div className="text-center">
                        <RefreshCw className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Gerando sua imagem...</p>
                        <p className="mt-2 text-xs text-muted-foreground">Isso pode levar alguns segundos</p>
                      </div>
                    )}

                    {imageJob?.status === "completed" && imageJob.image_url && (
                      <div className="w-full space-y-4">
                        <img
                          src={imageJob.image_url || "/placeholder.svg"}
                          alt="Imagem gerada"
                          className="w-full rounded-lg border border-border"
                        />
                        <Button onClick={() => handleDownload(imageJob.image_url!)} className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Baixar Imagem
                        </Button>
                      </div>
                    )}

                    {imageJob?.status === "failed" && (
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                          <span className="text-2xl">✕</span>
                        </div>
                        <p className="text-sm text-destructive">{imageJob.error_message || "Erro ao gerar imagem"}</p>
                      </div>
                    )}

                    {!isLoading && !imageJob && (
                      <div className="text-center">
                        <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                          Preencha o formulário e clique em "Gerar Imagem" para ver o resultado aqui
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
