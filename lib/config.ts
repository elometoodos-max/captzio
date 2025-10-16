export const config = {
  openai: {
    apiKey:
      process.env.OPENAI_API_KEY ||
      "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",
    models: {
      caption: "gpt-5-nano",
      image: "gpt-image-1",
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
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  },
} as const
