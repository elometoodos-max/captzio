// FILE: app/(dashboard)/generate-image/page.tsx
// Next.js App Router client component (TSX)

"use client"

import React, { FormEvent, useEffect, useRef, useState } from "react"
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
          // if the job endpoint returns a 4xx/5xx we stop polling and show error
          const text = await response.text().catch(() => "Erro ao checar status do job")
          throw new Error(text || "Erro ao checar status do job")
        }

        const data = await response.json()

        if (data?.job) {
          setImageJob(data.job)

          if (data.job.status === "completed" || data.job.status === "failed") {
            // stop polling
            if (pollRef.current) {
              clearInterval(pollRef.current)
              pollRef.current = null
            }
            setIsLoading(false)
          }
        }
      } catch (err) {
        console.error("[v0] Failed to poll job status:", err)
        // Stop polling on error to avoid infinite loop
        if (pollRef.current) {
          clearInterval(pollRef.current)
          pollRef.current = null
        }
        setError(err instanceof Error ? err.message : "Erro ao checar status")
        setIsLoading(false)
      }
    }

    // start immediately then every 2s
    poll()
    // store interval id
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
      // map local quality to backend-expected value (backend will map to API quality)
      const qualityPayload = quality === "hd" ? "high" : quality === "standard" ? "medium" : quality

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), style, quality: qualityPayload }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar imagem")
      }

      // Backend returns jobId for async flow (or imageBase64 in sync flow)
      if (data.jobId) {
        setJobId(data.jobId)
      } else if (data.imageBase64) {
        // sync flow: receive base64 image directly
        setImageJob({ id: "sync", status: "completed", image_url: `data:image/png;base64,${data.imageBase64}`, error_message: null })
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
                      <p className="text-xs text-muted-foreground">Seja específico sobre cores, estilo, composição e elementos desejados</p>
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
                        <img src={imageJob.image_url || "/placeholder.svg"} alt="Imagem gerada" className="w-full rounded-lg border border-border" />
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
                        <p className="text-sm text-muted-foreground">Preencha o formulário e clique em "Gerar Imagem" para ver o resultado aqui</p>
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


// --------------------------------------------------------
// FILE: pages/api/generate-image.ts
// Next.js API route (Pages Router). TypeScript.

import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// NOTE: Instalar dependência: npm install openai

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory store for example. Use Redis/DB in produção.
const jobs: Record<string, any> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt, style, quality } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Prompt é obrigatório" });

  try {
    // Decide whether to run sync or async. For demonstration we'll create an async job.
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    jobs[id] = { id, status: "pending", image_url: null, error_message: null };

    // Worker-like async execution (simple example)
    (async () => {
      try {
        jobs[id].status = "processing";

        // Map quality to API expected values
        const qualityMap: Record<string, string> = {
          low: "low",
          medium: "medium",
          high: "high",
        };

        const apiQuality = qualityMap[quality] ?? "medium";

        const promptWithStyle = style ? `${prompt} // estilo: ${style}` : prompt;

        const result = await client.images.generate({
          model: "gpt-image-1",
          prompt: promptWithStyle,
          size: "1024x1024",
          quality: apiQuality,
          output_format: "png",
        });

        const b64 = result?.data?.[0]?.b64_json;
        if (!b64) throw new Error("Nenhuma imagem retornada pela API")

        // Store as data URL (for demo). In production, upload to object storage and return a signed URL.
        jobs[id].image_url = `data:image/png;base64,${b64}`;
        jobs[id].status = "completed";
      } catch (e: any) {
        console.error("Image generation error:", e);
        jobs[id].status = "failed";
        jobs[id].error_message = e?.message || "Erro ao gerar imagem";
      }
    })();

    return res.status(200).json({ jobId: id });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err?.message ?? "Erro interno" });
  }
}


// --------------------------------------------------------
// FILE: pages/api/image-job/[id].ts
// Polling endpoint to check job status

import type { NextApiRequest, NextApiResponse } from "next";

// reuse the same in-memory store declared above in a real app you'd import a shared module
// For this single-file demo, we create a minimal re-declaration. In your app, move `jobs` to a separate module.
let _jobsRef: Record<string, any> | null = null;
try {
  // @ts-ignore
  _jobsRef = (global as any)._CAPTZIO_JOBS || {};
} catch {}

if (!_jobsRef) {
  // Try to share between handlers by attaching to global
  // @ts-ignore
  (global as any)._CAPTZIO_JOBS = (global as any)._CAPTZIO_JOBS || {};
  // @ts-ignore
  _jobsRef = (global as any)._CAPTZIO_JOBS;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const job = _jobsRef?.[id as string];
  if (!job) return res.status(404).json({ error: "Job não encontrado" });
  return res.status(200).json({ job });
}

// --------------------------------------------------------
// IMPORTANT NOTES
// 1) Para rodar localmente, instale "openai": npm install openai
// 2) Configure a variável de ambiente OPENAI_API_KEY no seu ambiente de execução.
// 3) Este exemplo usa armazenamento em memória para jobs (apenas para desenvolvimento). Em produção use Redis, banco de dados ou uma fila dedicada com workers.
// 4) Em produção, não retorne data URLs longos diretamente — faça upload para S3/Cloud Storage e retorne URLs assinadas expirando.
// 5) Ajuste permissões e checagens de conteúdo (moderação) antes de permitir prompts de usuários.
// 6) Se você usa o App Router e quer as rotas em /app/api, adapte os handlers conforme o novo formato (route handlers).

// --------------------------------------------------------
// COMO INTEGRAR
// - O componente client (page.tsx) chama POST /api/generate-image -> retorna jobId
// - O client faz polling em GET /api/image-job/{jobId} até status completed/failed
// --------------------------------------------------------
