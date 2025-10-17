// Validation utilities for Captzio

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email || email.trim().length === 0) {
    return { valid: false, error: "Email é obrigatório" }
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: "Email inválido" }
  }

  return { valid: true }
}

export function validatePassword(password: string): ValidationResult {
  if (!password || password.length < 8) {
    return { valid: false, error: "Senha deve ter no mínimo 8 caracteres" }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Senha deve conter pelo menos uma letra maiúscula" }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Senha deve conter pelo menos uma letra minúscula" }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Senha deve conter pelo menos um número" }
  }

  return { valid: true }
}

export function validateCaptionRequest(data: any): ValidationResult {
  if (!data.businessDescription || data.businessDescription.trim().length === 0) {
    return { valid: false, error: "Descrição do negócio é obrigatória" }
  }

  if (data.businessDescription.length > 500) {
    return { valid: false, error: "Descrição muito longa (máximo 500 caracteres)" }
  }

  const validTones = ["profissional", "casual", "divertido", "inspirador", "educativo", "vendas"]
  if (!data.tone || !validTones.includes(data.tone)) {
    return { valid: false, error: `Tom inválido. Opções válidas: ${validTones.join(", ")}` }
  }

  const validPlatforms = ["instagram", "facebook", "linkedin", "twitter", "tiktok", "threads"]
  if (!data.platform || !validPlatforms.includes(data.platform)) {
    return { valid: false, error: `Plataforma inválida. Opções válidas: ${validPlatforms.join(", ")}` }
  }

  if (!data.goal || data.goal.trim().length === 0) {
    return { valid: false, error: "Objetivo é obrigatório" }
  }

  if (!data.numVariations || data.numVariations < 1 || data.numVariations > 5) {
    return { valid: false, error: "Número de variações deve ser entre 1 e 5" }
  }

  return { valid: true }
}

export function validateImageRequest(data: any): ValidationResult {
  if (!data.prompt || data.prompt.trim().length === 0) {
    return { valid: false, error: "Prompt é obrigatório" }
  }

  if (data.prompt.length > 1000) {
    return { valid: false, error: "Prompt muito longo (máximo 1000 caracteres)" }
  }

  if (!data.style || !["natural", "vivid"].includes(data.style)) {
    return { valid: false, error: "Estilo inválido" }
  }

  // Accept both frontend values (standard, hd) and API values (low, medium, high)
  if (!data.quality || !["standard", "hd", "low", "medium", "high"].includes(data.quality)) {
    return { valid: false, error: "Qualidade inválida" }
  }

  return { valid: true }
}

export { validateImageRequest as validateImageGeneration }

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}

export function validateCredits(credits: number, required: number): ValidationResult {
  if (credits < required) {
    return {
      valid: false,
      error: `Créditos insuficientes. Você tem ${credits}, mas precisa de ${required}`,
    }
  }

  return { valid: true }
}
