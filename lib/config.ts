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
