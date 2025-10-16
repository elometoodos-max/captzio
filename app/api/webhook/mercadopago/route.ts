import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[v0] Mercado Pago webhook received:", body)

    // Mercado Pago sends notifications with type and data.id
    if (body.type === "payment") {
      const paymentId = body.data?.id

      if (!paymentId) {
        return NextResponse.json({ error: "Payment ID not found" }, { status: 400 })
      }

      // Fetch payment details from Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        },
      })

      if (!mpResponse.ok) {
        console.error("[v0] Failed to fetch payment from Mercado Pago")
        return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 })
      }

      const payment = await mpResponse.json()
      console.log("[v0] Payment details:", payment)

      const externalReference = payment.external_reference
      const status = payment.status

      if (!externalReference) {
        console.error("[v0] No external reference in payment")
        return NextResponse.json({ error: "No external reference" }, { status: 400 })
      }

      const supabase = await createClient()

      // Get transaction
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", externalReference)
        .single()

      if (transactionError || !transaction) {
        console.error("[v0] Transaction not found:", externalReference)
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
      }

      // Update transaction status
      let newStatus: "pending" | "approved" | "failed" | "refunded" = "pending"

      if (status === "approved") {
        newStatus = "approved"

        // Credit the user
        const { data: userData } = await supabase.from("users").select("credits").eq("id", transaction.user_id).single()

        if (userData) {
          await supabase
            .from("users")
            .update({ credits: userData.credits + transaction.credits })
            .eq("id", transaction.user_id)

          console.log("[v0] Credited", transaction.credits, "credits to user", transaction.user_id)
        }
      } else if (status === "rejected" || status === "cancelled") {
        newStatus = "failed"
      } else if (status === "refunded") {
        newStatus = "refunded"

        // Deduct credits if refunded
        const { data: userData } = await supabase.from("users").select("credits").eq("id", transaction.user_id).single()

        if (userData && userData.credits >= transaction.credits) {
          await supabase
            .from("users")
            .update({ credits: userData.credits - transaction.credits })
            .eq("id", transaction.user_id)
        }
      }

      await supabase.from("transactions").update({ status: newStatus }).eq("id", transaction.id)

      console.log("[v0] Transaction", transaction.id, "updated to", newStatus)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
