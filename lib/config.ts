export const config = {
  openai: {
    apiKey:
      process.env.OPENAI_API_KEY ||
      "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",
    models: {
      caption: "gpt-5-nano",
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
  console.error("[v0] WARNING: OpenAI API key is not properly configured!")
}
