import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { config } from "@/lib/config"
import { validateCaptionRequest, sanitizeInput } from "@/lib/validation"
import { checkRateLimit } from "@/lib/rate-limit"
import {
  handleError,
  AuthenticationError,
  NotFoundError,
  InsufficientCreditsError,
  ValidationError,
  RateLimitError,
} from "@/lib/error-handler"

// ===== Tipos =====
interface CaptionRequest {
  businessDescription: string
  tone: string
  platform: string
  goal: string
  numVariations: number
}
interface CaptionResult {
  caption: string
  cta: string
  hashtags: string[]
}

// ===== Constantes =====
const RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses"
const MODEL = () => config.openai.models.caption // "gpt-5-nano" etc.
const MAX_VARIATIONS = 10
const MIN_VARIATIONS = 1

// Saída curtíssima por variação
const MAX_OUTPUT_TOKENS_SCHEMA = 200
const MAX_OUTPUT_TOKENS_TEXT   = 240
const MAX_OUTPUT_TOKENS_PLAIN  = 260

// ===== Utils =====
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
const slice = (s: string, n = 240) => (s && s.length > n ? s.slice(0, n) + "..." : s || "")
const toErr = (e: unknown) => (e instanceof Error ? e.message : (() => { try { return JSON.stringify(e) } catch { return String(e) } })())

function stripCodeFences(s: string): string {
  const m = s.match(/```json\s*([\s\S]*?)```/i) || s.match(/```\s*([\s\S]*?)```/i)
  return (m ? m[1] : s).trim()
}
function normalizeQuotes(s: string): string {
  return s.replace(/[\u201C\u201D\u2033]/g, '"').replace(/[\u2018\u2019\u2032]/g, "'")
}
function removeTrailingCommas(s: string): string {
  return s.replace(/,\s*([}\]])/g, "$1")
}
function coerceSingleToDoubleQuotes(s: string): string {
  s = s.replace(/'(\w+?)'\s*:/g, '"$1":')
  s = s.replace(/:\s*'([^']*)'/g, ': "$1"')
  return s
}

function isValidCaption(item: any): item is CaptionResult {
  return (
    item &&
    typeof item.caption === "string" && item.caption.trim() &&
    typeof item.cta === "string" && item.cta.trim() &&
    Array.isArray(item.hashtags) &&
    item.hashtags.length >= 3 && item.hashtags.length <= 5 &&
    item.hashtags.every((h: any) => typeof h === "string" && h.trim())
  )
}

function tryParseLoose(raw: string): any | undefined {
  let t = stripCodeFences(raw)
  t = normalizeQuotes(t)
  try { return JSON.parse(t) } catch {}
  try { return JSON.parse(removeTrailingCommas(t)) } catch {}
  try { return JSON.parse(coerceSingleToDoubleQuotes(removeTrailingCommas(t))) } catch {}
  return undefined
}

// Extrai texto/JSON do Responses API
function extractResponsePayload(resp: any): { text?: string; json?: any; onlyReasoning?: boolean } {
  let textConcat = ""
  let firstJson: any
  let sawTextOrJson = false
  let reasoningCount = 0

  const takeText = (s?: string) => {
    if (typeof s === "string" && s.trim()) { textConcat += s; sawTextOrJson = true }
  }
  const takeJson = (j: any) => {
    if (!firstJson && j && typeof j === "object") { firstJson = j; sawTextOrJson = true }
  }

  if (typeof resp?.output_text === "string") takeText(resp.output_text)

  const scanContent = (arr: any[]) => {
    for (const c of arr) {
      if (!c) continue
      if (c.type === "reasoning" || c.type === "reasoning_text") { reasoningCount++; continue }
      if (typeof c?.text === "string") takeText(c.text)
      if (typeof c?.output_text === "string") takeText(c.output_text)
      if (c?.json && typeof c.json === "object") takeJson(c.json)
      if (c?.object && typeof c.object === "object") takeJson(c.object)
      if (c?.value && typeof c.value === "string" && c.type === "text") takeText(c.value)
    }
  }

  const outs = Array.isArray(resp?.output) ? resp.output : []
  for (const o of outs) {
    if (!o) continue
    if (o.type === "reasoning") { reasoningCount++; continue }
    if (typeof o?.output_text === "string") takeText(o.output_text)
    const content = Array.isArray(o?.content) ? o.content : []
    scanContent(content)
  }

  const nested = Array.isArray(resp?.response?.output) ? resp.response.output : []
  for (const o of nested) {
    if (!o) continue
    if (o.type === "reasoning") { reasoningCount++; continue }
    if (typeof o?.output_text === "string") takeText(o.output_text)
    const content = Array.isArray(o?.content) ? o.content : []
    scanContent(content)
  }

  // fallback duro
  if (!sawTextOrJson && outs.length > 0) firstJson = outs[0]

  return {
    text: (textConcat || "").trim() || undefined,
    json: firstJson,
    onlyReasoning: !sawTextOrJson && reasoningCount > 0
  }
}

// ===== OpenAI =====
async function callOpenAI(payload: any, timeoutMs = 18000) {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), timeoutMs)
  try {
    const res = await fetch(RESPONSES_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.openai.apiKey}` },
      body: JSON.stringify(payload),
      signal: ac.signal,
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error((body as any)?.error?.message || `OpenAI HTTP ${res.status}`)
    return body
  } finally {
    clearTimeout(timer)
  }
}

// ===== Prompts & Payloads =====
function promptOne(desc: string, tone: string, platform: string, goal: string) {
  return `1 legenda PT-BR. Negócio: ${desc}. Tom: ${tone || "neutro"}. Plataforma: ${platform || "Instagram"}. Objetivo: ${goal || "engajamento"}. Sem explicações; retorne só JSON.`
}

const captionJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["caption", "cta", "hashtags"],
  properties: {
    caption: { type: "string", maxLength: 100 },
    cta: { type: "string", maxLength: 80 },
    hashtags: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string", maxLength: 20 }
    }
  }
} as const

// (1) Schema + desabilitar reasoning & tools
const payloadSchema = (prompt: string) => ({
  model: MODEL(),
  instructions: "Devolva somente JSON que satisfaça o schema. Não explique. Não use markdown.",
  input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
  max_output_tokens: MAX_OUTPUT_TOKENS_SCHEMA,
  tool_choice: "none",
  modalities: ["text"],
  reasoning: { effort: "none" as const },
  text: { format: { type: "json_schema", name: "Caption", schema: captionJsonSchema } },
})

// (2) Text (estruturado) sem reasoning/tools
const payloadText = (prompt: string) => ({
  model: MODEL(),
  instructions: `Retorne apenas: {"caption":"","cta":"","hashtags":["#a","#b","#c"]} (JSON válido).`,
  input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
  max_output_tokens: MAX_OUTPUT_TOKENS_TEXT,
  tool_choice: "none",
  modalities: ["text"],
  reasoning: { effort: "none" as const },
  text: { format: { type: "text" as const } },
})

// (3) Text (string simples) sem reasoning/tools — quebra reasoning-only
const payloadPlain = (prompt: string) => ({
  model: MODEL(),
  instructions: `Apenas JSON válido: {"caption":"","cta":"","hashtags":["#a","#b","#c"]}. Sem markdown ou explicações.`,
  input: prompt, // string simples
  max_output_tokens: MAX_OUTPUT_TOKENS_PLAIN,
  tool_choice: "none",
  modalities: ["text"],
  reasoning: { effort: "none" as const },
  text: { format: { type: "text" as const } },
})

// ===== Fallback final: gerar legenda via template (sem IA) =====
function templateCaption(desc: string, goal: string): CaptionResult {
  const core = desc.replace(/\s+/g, " ").trim().slice(0, 60)
  const caption = ` ${core} que conecta de verdade. ✨`
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 100)
  const cta = goal && goal.toLowerCase().includes("venda")
    ? "Quer saber mais? Chame no direct."
    : "Comente o que achou!"
  // hashtags bem curtas para caber
  const base = core
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
  const uniq = Array.from(new Set(base)).slice(0, 3)
  const hashtags = (uniq.length ? uniq : ["negocio", "brasil", "dicas"]).map(h => `#${h}`)
  return { caption, cta, hashtags }
}

// ===== Gera UMA variação =====
async function generateOneVariation(desc: string, tone: string, platform: string, goal: string): Promise<CaptionResult> {
  const prompt = promptOne(desc, tone, platform, goal)

  // 1) schema
  let ai = await callOpenAI(payloadSchema(prompt))
  let { text, json, onlyReasoning } = extractResponsePayload(ai)
  let status: string | undefined = ai?.status
  let reason: string | undefined = ai?.incomplete_details?.reason

  // 2) text (estruturado)
  if ((!text && !json) || status !== "completed") {
    ai = await callOpenAI(payloadText(prompt))
    ;({ text, json, onlyReasoning } = extractResponsePayload(ai))
    status = ai?.status
    reason = ai?.incomplete_details?.reason
  }

  // 3) plain string (vence reasoning-only)
  if (onlyReasoning || (!text && !json)) {
    ai = await callOpenAI(payloadPlain(prompt))
    ;({ text, json, onlyReasoning } = extractResponsePayload(ai))
    status = ai?.status
    reason = ai?.incomplete_details?.reason
  }

  // 4) decodifica
  let root: any = json
  if (!root && text) root = tryParseLoose(text)

  // 5) se ainda vazio (ou só reasoning), gera via template
  if (!root || onlyReasoning) {
    return templateCaption(desc, goal)
  }

  // 6) normaliza objeto final
  let item: any = root
  if (item && typeof item === "object") {
    if (Array.isArray(item.results) && item.results.length) item = item.results[0]
    else if (Array.isArray(item.items) && item.items.length) item = item.items[0]
  }
  if (!isValidCaption(item)) {
    if (root && typeof root === "object") {
      for (const v of Object.values(root)) {
        if (isValidCaption(v)) { item = v; break }
      }
    }
  }
  if (!isValidCaption(item)) {
    // último recurso, mas sem erro 500
    return templateCaption(desc, goal)
  }

  // força prefixo "#"
  const hashtags = item.hashtags.map((h: string) => (h.startsWith("#") ? h : `#${h.replace(/\s+/g, "")}`))
  return { caption: String(item.caption).trim(), cta: String(item.cta).trim(), hashtags }
}

// ===== Handler principal =====
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new AuthenticationError()

    // rate limit
    const rateLimit = checkRateLimit(`caption:${user.id}`, 10, 3_600_000)
    if (!rateLimit.allowed) throw new RateLimitError(rateLimit.resetAt)

    // usuário
    const { data: userData, error: userError } = await supabase
      .from("users").select("*").eq("id", user.id).single()
    if (userError || !userData) throw new NotFoundError("Usuário")
    const isAdmin = userData.role === "admin" || user.email === config.admin.email

    // body
    const body = (await request.json()) as CaptionRequest
    const validation = validateCaptionRequest(body)
    if (!validation.valid) throw new ValidationError(validation.error ?? "Requisição inválida")

    const tone = sanitizeInput(String(body.tone || "").trim())
    const platform = sanitizeInput(String(body.platform || "").trim())
    const businessDescription = sanitizeInput(String(body.businessDescription || "").trim())
    const goal = sanitizeInput(String(body.goal || "").trim())
    const numVariations = clamp(Number(body.numVariations || 1), MIN_VARIATIONS, MAX_VARIATIONS)

    if (!isAdmin && (userData.credits ?? 0) < 1) throw new InsufficientCreditsError(1, userData.credits ?? 0)

    // geração iterativa (1 variação por chamada)
    const results: CaptionResult[] = []
    for (let i = 0; i < numVariations; i++) {
      try {
        const one = await generateOneVariation(businessDescription, tone, platform, goal)
        results.push(one)
      } catch (err) {
        // mais 1 retry para essa posição
        try {
          const one = await generateOneVariation(businessDescription, tone, platform, goal)
          results.push(one)
        } catch (retryErr) {
          if (results.length === 0) throw retryErr
          break
        }
      }
    }
    if (results.length === 0) {
      // nunca retornar 500 — garante pelo menos 1 via template
      results.push(templateCaption(businessDescription, goal))
    }

    // 1 crédito por requisição
    let creditsRemaining = userData.credits ?? 0
    if (!isAdmin) {
      const newCredits = Math.max(0, (userData.credits ?? 0) - 1)
      const { error: updateError } = await supabase.from("users").update({ credits: newCredits }).eq("id", user.id)
      if (updateError) throw new Error("Erro ao processar créditos")
      creditsRemaining = newCredits
    }

    // salva primeiro
    try {
      const first = results[0]
      if (first) {
        await supabase.from("posts").insert({
          user_id: user.id,
          caption: first.caption,
          hashtags: first.hashtags,
          cta: first.cta,
          tone,
          platform,
          credits_used: isAdmin ? 0 : 1,
        })
      }
    } catch {}

    // log (opcional)
    try {
      await supabase.from("usage_logs").insert({
        user_id: user.id,
        action: "generate_caption",
        credits_used: isAdmin ? 0 : 1,
        cost_usd: 0,
        metadata: {
          tone, platform, goal,
          model: MODEL(),
          numVariations,
          strategy: "schema→text→plain + template-fallback",
        },
      })
    } catch {}

    return NextResponse.json({
      results,
      creditsRemaining: isAdmin ? "∞" : creditsRemaining,
      isAdmin,
      rateLimit: { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt },
    })
  } catch (error) {
    const errorResponse = handleError(error)
    return NextResponse.json(
      { error: errorResponse.message, code: errorResponse.code },
      { status: errorResponse.statusCode },
    )
  }
}
