export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
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

if (!config.openai.apiKey) {
  console.error("❌ [ERRO CRÍTICO] Chave da API OpenAI não está configurada!")
  console.error("Configure a variável de ambiente OPENAI_API_KEY no Vercel")
} else if (config.openai.apiKey.length < 20 || !config.openai.apiKey.startsWith("sk-")) {
  console.error("❌ [ERRO CRÍTICO] Chave da API OpenAI é inválida!")
  console.error("A chave deve começar com 'sk-' e ter pelo menos 20 caracteres")
} else {
  console.log("✅ OpenAI API key configurada com sucesso")
}
