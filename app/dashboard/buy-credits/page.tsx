"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowLeft, Check, Zap, Loader2 } from "lucide-react"

const pricingTiers = [
  {
    name: "Básico",
    credits: 50,
    price: 19.9,
    bonus: 0,
    description: "Perfeito para começar",
    features: [
      "50 legendas ou 10 imagens",
      "Geração com GPT-5 Nano",
      "Imagens com GPT Image 1",
      "Múltiplos tons de voz",
      "Hashtags estratégicas",
      "Suporte por email",
    ],
  },
  {
    name: "Profissional",
    credits: 150,
    price: 49.9,
    bonus: 10,
    description: "Para criadores de conteúdo",
    popular: true,
    features: [
      "160 legendas ou 32 imagens",
      "Geração com GPT-5 Nano",
      "Imagens com GPT Image 1",
      "Múltiplos tons de voz",
      "Hashtags estratégicas",
      "Suporte prioritário",
      "Histórico completo",
    ],
  },
  {
    name: "Empresarial",
    credits: 500,
    price: 149.9,
    bonus: 50,
    description: "Para equipes e agências",
    features: [
      "550 legendas ou 110 imagens",
      "Geração com GPT-5 Nano",
      "Imagens com GPT Image 1",
      "Múltiplos tons de voz",
      "Hashtags estratégicas",
      "Suporte VIP 24/7",
      "Histórico completo",
      "API de integração",
    ],
  },
]

export default function BuyCreditsPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async (tier: (typeof pricingTiers)[0]) => {
    setIsLoading(tier.name)
    setError(null)

    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits: tier.credits + tier.bonus,
          amount: tier.price,
          packageName: tier.name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar pagamento")
      }

      // Redirect to Mercado Pago checkout
      if (data.initPoint) {
        window.location.href = data.initPoint
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar pagamento")
      setIsLoading(null)
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
            <div className="mb-8 md:mb-12 text-center">
              <h1 className="mb-4 font-display text-2xl md:text-3xl lg:text-4xl font-bold">Comprar Créditos</h1>
              <p className="text-base md:text-lg text-muted-foreground">
                Escolha o plano ideal para suas necessidades. Sem mensalidades, pague apenas pelos créditos que usar.
              </p>
            </div>

            {error && (
              <div className="mb-8 rounded-lg bg-destructive/10 p-4 text-center text-sm text-destructive">{error}</div>
            )}

            <div className="grid gap-8 md:grid-cols-3">
              {pricingTiers.map((tier) => (
                <Card key={tier.name} className={tier.popular ? "border-primary shadow-lg" : ""}>
                  <CardHeader>
                    {tier.popular && (
                      <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                        <Zap className="h-3 w-3" />
                        Mais Popular
                      </div>
                    )}
                    <CardTitle>{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">R$ {tier.price.toFixed(2)}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">{tier.credits}</span>
                      <span className="text-muted-foreground">créditos</span>
                      {tier.bonus > 0 && (
                        <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                          +{tier.bonus} bônus
                        </span>
                      )}
                    </div>
                    <ul className="space-y-2 text-sm">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={tier.popular ? "w-full" : "w-full bg-transparent"}
                      variant={tier.popular ? "default" : "outline"}
                      onClick={() => handlePurchase(tier)}
                      disabled={isLoading !== null}
                    >
                      {isLoading === tier.name ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        "Comprar Agora"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground">
                Pagamento seguro via Mercado Pago • 1 crédito = 1 legenda | 5 créditos = 1 imagem
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
