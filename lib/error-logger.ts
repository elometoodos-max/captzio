import { createClient } from "@/lib/supabase/server"

interface LogErrorParams {
  errorType: "api" | "sql" | "caption" | "image" | "auth" | "payment"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  stackTrace?: string
  userId?: string
  endpoint?: string
  method?: string
  statusCode?: number
  metadata?: Record<string, any>
}

export async function logError(params: LogErrorParams) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("system_errors").insert({
      error_type: params.errorType,
      severity: params.severity,
      message: params.message,
      stack_trace: params.stackTrace,
      user_id: params.userId,
      endpoint: params.endpoint,
      method: params.method,
      status_code: params.statusCode,
      metadata: params.metadata || {},
    })

    if (error) {
      console.error("[v0] Erro ao registrar erro no banco:", error)
    }
  } catch (error) {
    console.error("[v0] Erro crítico ao registrar erro:", error)
  }
}

export function captureError(error: Error, context?: Partial<LogErrorParams>) {
  const severity = context?.severity || "medium"
  const errorType = context?.errorType || "api"

  logError({
    errorType,
    severity,
    message: error.message,
    stackTrace: error.stack,
    ...context,
  })
}
