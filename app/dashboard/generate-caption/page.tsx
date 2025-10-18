"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Copy, Check, ArrowLeft, Loader2, Crown, AlertCircle, Save } from "lucide-react"
import { Logo } from "@/components/logo"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const [savedToLibrary, setSavedToLibrary] = useState<boolean[]>([])

  useEffect(() => {
    const savedDraft = localStorage.getItem("caption-draft")
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        setBusinessDescription(draft.businessDescription || "")
        setTone(draft.tone || "profissional")
        setPlatform(draft.platform || "instagram")
        setGoal(draft.goal || "")
      } catch (e) {
        console.error("[v0] Failed to load draft:", e)
      }
    }
  }, [])

  useEffect(() => {
    const draft = { businessDescription, tone, platform, goal }
    localStorage.setItem("caption-draft", JSON.stringify(draft))
  }, [businessDescription, tone, platform, goal])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!businessDescription.trim()) {
      setError("Por favor, descreva seu negócio ou conteúdo")
      return
    }

    if (businessDescription.trim().length < 10) {
      setError("A descrição deve ter pelo menos 10 caracteres para gerar legendas de qualidade")
      return
    }

    setIsLoading(true)
    setError(null)
    setResults([])
    setSavedToLibrary([])

    try {
      const response = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessDescription: businessDescription.trim(),
          tone,
          platform,
          goal: goal.trim() || "engajamento",
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
      setSavedToLibrary(new Array(data.results.length).fill(false))

      localStorage.removeItem("caption-draft")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar legendas com IA")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error("[v0] Failed to copy:", err)
      setError("Erro ao copiar para área de transferência")
    }
  }

  const saveToLibrary = async (result: CaptionResult, index: number) => {
    try {
      const response = await fetch("/api/save-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: result.caption,
          cta: result.cta,
          hashtags: result.hashtags,
          platform,
          tone,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar na biblioteca")
      }

      const newSaved = [...savedToLibrary]
      newSaved[index] = true
      setSavedToLibrary(newSaved)
    } catch (err) {
      console.error("[v0] Failed to save:", err)
      setError("Erro ao salvar na biblioteca")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <Logo size="sm" />
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
              <Button variant="ghost" size="sm" asChild className="transition-all hover:scale-105">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Voltar</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-muted/30">
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 md:mb-8 animate-fade-in">
              <h1 className="mb-2 font-display text-2xl md:text-3xl font-bold">Gerar Legenda</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Crie legendas envolventes com IA treinada para português brasileiro
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              <Card className="animate-slide-in-left">
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                  <CardDescription>Descreva seu conteúdo e escolha o estilo</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Descrição do Negócio/Conteúdo <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Ex: Loja de roupas femininas com foco em moda sustentável e peças atemporais. Público: mulheres 25-40 anos que valorizam qualidade e consciência ambiental..."
                        value={businessDescription}
                        onChange={(e) => setBusinessDescription(e.target.value)}
                        required
                        rows={5}
                        disabled={isLoading}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Mínimo 10 caracteres. Seja específico para melhores resultados.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goal">Objetivo (opcional)</Label>
                      <Input
                        id="goal"
                        placeholder="Ex: aumentar vendas, gerar engajamento, educar audiência..."
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full transition-all hover:scale-105" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gerando legendas...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Gerar 3 Legendas {!isAdmin && "(1 crédito)"}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-4 animate-slide-in-right">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Resultados</h2>
                  {results.length > 0 && (
                    <span className="text-sm text-muted-foreground">{results.length} variações</span>
                  )}
                </div>

                {results.length > 0 ? (
                  <>
                    {results.map((result, index) => (
                      <Card key={index} className="card-hover" style={{ animationDelay: `${index * 0.1}s` }}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Variação {index + 1}</CardTitle>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => saveToLibrary(result, index)}
                                disabled={savedToLibrary[index]}
                                title="Salvar na biblioteca"
                              >
                                {savedToLibrary[index] ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(
                                    `${result.caption}\n\n${result.cta}\n\n${result.hashtags.join(" ")}`,
                                    index,
                                  )
                                }
                                title="Copiar tudo"
                              >
                                {copiedIndex === index ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="rounded-lg bg-muted/50 p-4">
                            <p className="mb-1 text-xs font-medium text-muted-foreground">Legenda</p>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.caption}</p>
                          </div>
                          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                            <p className="mb-1 text-xs font-medium text-muted-foreground">Call to Action</p>
                            <p className="text-sm font-medium text-primary">{result.cta}</p>
                          </div>
                          <div className="rounded-lg bg-accent/10 p-3">
                            <p className="mb-1 text-xs font-medium text-muted-foreground">Hashtags</p>
                            <p className="text-xs leading-relaxed text-accent-foreground">
                              {result.hashtags.join(" ")}
                            </p>
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
                        <p className="text-sm text-muted-foreground max-w-sm">
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
