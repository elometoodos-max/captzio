"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Copy, Check, ArrowLeft, Loader2, Crown } from "lucide-react"

interface CaptionResult {
  caption: string
  cta: string
  hashtags: string[]
}

export default function GenerateCaptionPage() {
  const router = useRouter()
  const [businessDescription, setBusinessDescription] = useState("")
  const [tone, setTone] = useState("profissional")
  const [platform, setPlatform] = useState("instagram")
  const [goal, setGoal] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<CaptionResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [creditsRemaining, setCreditsRemaining] = useState<number | string>(0)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResults([])

    try {
      const response = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessDescription,
          tone,
          platform,
          goal: goal || "engajamento",
          numVariations: 3,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar legendas")
      }

      setResults(data.results)
      setIsAdmin(data.isAdmin || false)
      setCreditsRemaining(data.creditsRemaining)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar legendas")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
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
            <div className="flex items-center gap-2 sm:gap-4">
              {isAdmin && (
                <div className="hidden sm:flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium">
                  <Crown className="h-3 w-3" />
                  Admin - Teste Grátis
                </div>
              )}
              {!isAdmin && creditsRemaining !== 0 && (
                <div className="text-sm text-muted-foreground">
                  <span className="hidden sm:inline">Créditos: </span>
                  <span className="font-semibold text-foreground">{creditsRemaining}</span>
                </div>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Voltar</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 md:mb-8">
              <h1 className="mb-2 font-display text-2xl md:text-3xl font-bold">Gerar Legenda</h1>
              <p className="text-sm md:text-base text-muted-foreground">Crie legendas envolventes com IA em segundos</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                  <CardDescription>Descreva seu conteúdo e escolha o estilo</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição do Negócio/Conteúdo</Label>
                      <Textarea
                        id="description"
                        placeholder="Ex: Loja de roupas femininas com foco em moda sustentável..."
                        value={businessDescription}
                        onChange={(e) => setBusinessDescription(e.target.value)}
                        required
                        rows={4}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tone">Tom de Voz</Label>
                      <Select value={tone} onValueChange={setTone} disabled={isLoading}>
                        <SelectTrigger id="tone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="profissional">Profissional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="divertido">Divertido</SelectItem>
                          <SelectItem value="inspirador">Inspirador</SelectItem>
                          <SelectItem value="educativo">Educativo</SelectItem>
                          <SelectItem value="vendas">Vendas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="platform">Plataforma</Label>
                      <Select value={platform} onValueChange={setPlatform} disabled={isLoading}>
                        <SelectTrigger id="platform">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="twitter">Twitter/X</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goal">Objetivo (opcional)</Label>
                      <Input
                        id="goal"
                        placeholder="Ex: aumentar vendas, gerar engajamento..."
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        disabled={isLoading}
                      />
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
                          Gerar Legendas (1 crédito)
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {results.length > 0 ? (
                  <>
                    <h2 className="font-semibold">Resultados</h2>
                    {results.map((result, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Variação {index + 1}</CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  `${result.caption}\n\n${result.cta}\n\n${result.hashtags.join(" ")}`,
                                  index,
                                )
                              }
                            >
                              {copiedIndex === index ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="mb-1 text-xs font-medium text-muted-foreground">Legenda</p>
                            <p className="text-sm leading-relaxed">{result.caption}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-medium text-muted-foreground">CTA</p>
                            <p className="text-sm font-medium">{result.cta}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-medium text-muted-foreground">Hashtags</p>
                            <p className="text-sm text-primary">{result.hashtags.join(" ")}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="flex min-h-[400px] items-center justify-center p-8">
                      <div className="text-center">
                        <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                          Preencha o formulário e clique em "Gerar Legendas" para ver os resultados aqui
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
