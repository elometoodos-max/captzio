// lib/validation.ts
// Validation utilities for Captzio

export interface ValidationResult { valid: boolean; error?: string }

type InternalQuality = "low" | "medium" | "high"
type ApiStyle = "natural" | "vivid"
type ApiSize = "1024x1024" | "1024x1536" | "1536x1024"

interface ImageGenInput {
  prompt?: string
  style?: string
  quality?: string   // ESPERA "low" | "medium" | "high" (o route converte do front)
  size?: string
}

export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || email.trim().length === 0) return { valid: false, error: "Email é obrigatório" }
  if (!emailRegex.test(email)) return { valid: false, error: "Email inválido" }
  return { valid: true }
}

export function validatePassword(password: string): ValidationResult {
  if (!password || password.length < 8) return { valid: false, error: "Senha deve ter no mínimo 8 caracteres" }
  if (!/[A-Z]/.test(password)) return { valid: false, error: "Senha deve conter pelo menos uma letra maiúscula" }
  if (!/[a-z]/.test(password)) return { valid: false, error: "Senha deve conter pelo menos uma letra minúscula" }
  if (!/[0-9]/.test(password)) return { valid: false, error: "Senha deve conter pelo menos um número" }
  return { valid: true }
}

export function validateCaptionRequest(data: any): ValidationResult {
  if (!data.businessDescription || data.businessDescription.trim().length === 0)
    return { valid: false, error: "Descrição do negócio é obrigatória" }
  if (data.businessDescription.length > 500)
    return { valid: false, error: "Descrição muito longa (máximo 500 caracteres)" }

  const validTones = ["profissional", "casual", "divertido", "inspirador", "educativo", "vendas"]
  if (!data.tone || !validTones.includes(data.tone))
    return { valid: false, error: `Tom inválido. Opções válidas: ${validTones.join(", ")}` }

  const validPlatforms = ["instagram", "facebook", "linkedin", "twitter", "tiktok", "threads"]
  if (!data.platform || !validPlatforms.includes(data.platform))
    return { valid: false, error: `Plataforma inválida. Opções válidas: ${validPlatforms.join(", ")}` }

  if (!data.goal || data.goal.trim().length === 0) return { valid: false, error: "Objetivo é obrigatório" }
  if (!data.numVariations || data.numVariations < 1 || data.numVariations > 5)
    return { valid: false, error: "Número de variações deve ser entre 1 e 5" }

  return { valid: true }
}

// NOVO: validação para o route de imagens (contrato { success })
export function validateImageGeneration(input: ImageGenInput):
  | { success: true }
  | { success: false; error: string } {

  const prompt = (input.prompt ?? "").toString().trim()
  if (!prompt || prompt.length < 10) return { success: false, error: "Descrição muito curta. Mínimo 10 caracteres." }
  if (prompt.length > 1000) return { success: false, error: "Descrição muito longa. Máximo 1000 caracteres." }

  const style = (input.style ?? "natural").toString().toLowerCase()
  const allowedStyles: ApiStyle[] = ["natural", "vivid"]
  if (!allowedStyles.includes(style as ApiStyle))
    return { success: false, error: "Estilo inválido. Use 'natural' ou 'vivid'." }

  const size = (input.size ?? "1024x1024").toString().toLowerCase()
  const allowedSizes: ApiSize[] = ["1024x1024", "1024x1536", "1536x1024"]
  if (!allowedSizes.includes(size as ApiSize))
    return { success: false, error: "Tamanho inválido. Use 1024x1024, 1024x1536 ou 1536x1024." }

  const quality = (input.quality ?? "low").toString().toLowerCase()
  const allowedInternal: InternalQuality[] = ["low", "medium", "high"]
  if (!allowedInternal.includes(quality as InternalQuality))
    return { success: false, error: "Qualidade inválida. Use 'low', 'medium' ou 'high'." }

  return { success: true }
}

export function validateImageRequest(data: any): ValidationResult {
  const res = validateImageGeneration({
    prompt: data?.prompt,
    style: data?.style,
    quality: data?.quality,
    size: data?.size,
  })
  if ("success" in res && res.success) return { valid: true }
  return { valid: false, error: (res as any).error || "Parâmetros inválidos" }
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}
export function validateCredits(credits: number, required: number): ValidationResult {
  if (credits < required) return { valid: false, error: `Créditos insuficientes. Você tem ${credits}, mas precisa de ${required}` }
  return { valid: true }
}
