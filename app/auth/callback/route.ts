import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = createClient()

    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("[v0] Error exchanging code for session:", error)
        return NextResponse.redirect(new URL("/auth/login?error=verification_failed", requestUrl.origin))
      }

      // Successful verification - redirect to dashboard
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } catch (error) {
      console.error("[v0] Unexpected error in auth callback:", error)
      return NextResponse.redirect(new URL("/auth/login?error=unexpected_error", requestUrl.origin))
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(new URL("/auth/login?error=no_code", requestUrl.origin))
}
