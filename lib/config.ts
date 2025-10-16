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
    email: process.env.ADMIN_EMAIL || "admin@captzio.com",
    freeTesting: true,
  },
  mercadopago: {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || "",
  },
} as const
