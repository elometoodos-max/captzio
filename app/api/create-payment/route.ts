import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN

interface PaymentRequest {
  credits: number
  amount: number
  packageName: string
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body: PaymentRequest = await request.json()
    const { credits, amount, packageName } = body

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        amount,
        credits,
        status: "pending",
        payment_method: "mercado_pago",
      })
      .select()
      .single()

    if (transactionError || !transaction) {
      return NextResponse.json({ error: "Erro ao criar transação" }, { status: 500 })
    }

    // Create Mercado Pago preference
    const preference = {
      items: [
        {
          title: `Captzio - ${packageName}`,
          description: `${credits} créditos para geração de conteúdo`,
          quantity: 1,
          unit_price: amount,
          currency_id: "BRL",
        },
      ],
      payer: {
        email: user.email,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/payment-success`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/payment-failure`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/payment-pending`,
      },
      auto_return: "approved" as const,
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/webhook/mercadopago`,
      external_reference: transaction.id,
      statement_descriptor: "CAPTZIO",
    }

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    })

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json()
      console.error("[v0] Mercado Pago API error:", errorData)
      return NextResponse.json({ error: "Erro ao criar preferência de pagamento" }, { status: 500 })
    }

    const mpData = await mpResponse.json()

    // Update transaction with payment ID
    await supabase.from("transactions").update({ payment_id: mpData.id }).eq("id", transaction.id)

    return NextResponse.json({
      initPoint: mpData.init_point,
      preferenceId: mpData.id,
    })
  } catch (error) {
    console.error("[v0] Create payment error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
