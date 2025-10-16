import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@captzio.com" },
    update: {},
    create: {
      email: "admin@captzio.com",
      name: "Admin",
      password: hashedPassword,
      credits: 1000,
      planType: "BUSINESS",
    },
  })

  console.log("Created admin user:", admin.email)

  // Create system config defaults
  const configs = [
    { key: "overhead_pct", value: "0.20", description: "Overhead percentage (20%)" },
    { key: "payment_pct", value: "0.0499", description: "Payment gateway percentage (4.99%)" },
    { key: "payment_fixed_fee", value: "0.39", description: "Payment gateway fixed fee (BRL)" },
    { key: "markup", value: "1.50", description: "Markup multiplier (50% profit)" },
    { key: "credits_per_low_image", value: "1", description: "Credits for low quality image" },
    { key: "credits_per_medium_image", value: "2", description: "Credits for medium quality image" },
    { key: "credits_per_high_image", value: "3", description: "Credits for high quality image" },
  ]

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    })
  }

  console.log("Created system configs")

  // Create sample templates
  const templates = [
    {
      name: "Promoção de Produto",
      niche: "E-commerce",
      tone: "Entusiasmado",
      goal: "Vendas",
      example: "Desconto imperdível! 50% OFF em todos os produtos. Corre que é por tempo limitado!",
      approved: true,
    },
    {
      name: "Dica de Saúde",
      niche: "Saúde e Bem-estar",
      tone: "Informativo",
      goal: "Educação",
      example: "Você sabia? Beber água em jejum ajuda a acelerar o metabolismo e eliminar toxinas.",
      approved: true,
    },
    {
      name: "Motivação Diária",
      niche: "Desenvolvimento Pessoal",
      tone: "Inspirador",
      goal: "Engajamento",
      example: "Cada dia é uma nova oportunidade para ser a melhor versão de você mesmo. Acredite!",
      approved: true,
    },
  ]

  for (const template of templates) {
    await prisma.template.create({
      data: template,
    })
  }

  console.log("Created sample templates")

  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.disconnect()
  })
