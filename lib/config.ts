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
