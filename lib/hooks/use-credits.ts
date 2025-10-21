"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function useCredits() {
  const [credits, setCredits] = useState<number>(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCredits()
  }, [])

  const fetchCredits = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      const { data, error: fetchError } = await supabase
        .from("users")
        .select("credits, email")
        .eq("id", user.id)
        .single()

      if (fetchError) throw fetchError

      setCredits(data.credits || 0)
      setIsAdmin(data.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL)
      setError(null)
    } catch (err) {
      console.error("[v0] Error fetching credits:", err)
      setError(err instanceof Error ? err.message : "Erro ao buscar créditos")
    } finally {
      setLoading(false)
    }
  }

  const refreshCredits = () => {
    fetchCredits()
  }

  return {
    credits,
    isAdmin,
    loading,
    error,
    refreshCredits,
  }
}
