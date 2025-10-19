export const config = {
  openai: {
    apiKey:
      process.env.OPENAI_API_KEY ||
      "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",
    models: {
      caption: "gpt-5-nano", // Fastest and cheapest GPT-5 model
      image: "gpt-image-1",
    },
    get imageModel() {
      return this.models.image
    },
  },
  credits: {
    caption: 1,
    image: 5,
  },
  admin: {
    email: process.env.ADMIN_EMAIL || "saviobof@gmail.com",
    freeTesting: true,
  },
  mercadopago: {
    accessToken: process.env.MP_ACCESS_TOKEN || "",
    webhookSecret: process.env.MP_WEBHOOK_SECRET || "",
  },
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://captzio.vercel.app",
  },
} as const

if (!config.openai.apiKey || config.openai.apiKey.length < 20) {
  console.error("[v0] ERRO CRÍTICO: Chave da API OpenAI não está configurada corretamente!")
  console.error("[v0] Configure a variável de ambiente OPENAI_API_KEY")
} else {
  console.log("[v0] OpenAI API key configurada com sucesso")
}
