// Centralized error handling utilities

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode = 500,
    public code?: string,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Não autenticado") {
    super(message, 401, "AUTH_ERROR")
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Sem permissão") {
    super(message, 403, "FORBIDDEN")
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR")
  }
}

export class InsufficientCreditsError extends AppError {
  constructor(required: number, available: number) {
    super(`Créditos insuficientes. Necessário: ${required}, Disponível: ${available}`, 402, "INSUFFICIENT_CREDITS")
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Recurso") {
    super(`${resource} não encontrado`, 404, "NOT_FOUND")
  }
}

export class RateLimitError extends AppError {
  constructor(resetAt: number) {
    super(
      `Limite de requisições excedido. Tente novamente em ${Math.ceil((resetAt - Date.now()) / 60000)} minutos`,
      429,
      "RATE_LIMIT_EXCEEDED",
    )
  }
}

export function handleError(error: unknown): { message: string; statusCode: number; code?: string } {
  console.error("[v0] Error occurred:", error)

  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
      code: "INTERNAL_ERROR",
    }
  }

  return {
    message: "Erro interno do servidor",
    statusCode: 500,
    code: "UNKNOWN_ERROR",
  }
}
