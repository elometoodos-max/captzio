import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { config } from "@/lib/config"

export async function GET() {
  const results = {
    database: { status: "unknown", message: "" },
    openai: { status: "unknown", message: "" },
    env: { status: "unknown", message: "" },
  }

  // 1. Check Environment Variables
  try {
    const missingVars = []
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push("NEXT_PUBLIC_SUPABASE_URL")
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if (!config.openai.apiKey) missingVars.push("OPENAI_API_KEY")

    if (missingVars.length > 0) {
      results.env = { status: "error", message: `Missing: ${missingVars.join(", ")}` }
    } else {
      results.env = { status: "ok", message: "All required variables present" }
    }
  } catch (e) {
    results.env = { status: "error", message: "Error checking env vars" }
  }

  // 2. Check Database Connection
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("users").select("count").limit(1).single()
    
    if (error && error.code !== "PGRST116") { // PGRST116 is "The result contains 0 rows" which is fine for connection check
       throw error
    }
    
    results.database = { status: "ok", message: "Connected successfully" }
  } catch (error: any) {
    console.error("[v0] DB Check Error:", error)
    results.database = { status: "error", message: error.message || "Connection failed" }
  }

  // 3. Check OpenAI API
  try {
    if (!config.openai.apiKey) {
      throw new Error("API Key missing")
    }

    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${config.openai.apiKey}`,
      },
    })

    if (response.ok) {
      results.openai = { status: "ok", message: "API Key valid" }
    } else {
      const data = await response.json()
      results.openai = { status: "error", message: data.error?.message || "Invalid API Key" }
    }
  } catch (error: any) {
    console.error("[v0] OpenAI Check Error:", error)
    results.openai = { status: "error", message: error.message || "Connection failed" }
  }

  const overallStatus = Object.values(results).every((r) => r.status === "ok") ? "ok" : "error"

  return NextResponse.json({
    status: overallStatus,
    checks: results,
    timestamp: new Date().toISOString(),
  })
}
