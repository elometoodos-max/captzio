export interface User {
  id: string
  email: string
  name: string | null
  credits: number
  role: "user" | "admin"
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  title: string | null
  caption: string
  hashtags: string[]
  cta: string | null
  tone: string | null
  platform: string | null
  credits_used: number
  created_at: string
}

export interface Image {
  id: string
  user_id: string
  prompt: string
  image_url: string
  status: "pending" | "processing" | "completed" | "failed"
  credits_used: number
  error_message: string | null
  created_at: string
  completed_at: string | null
}

export interface Transaction {
  id: string
  user_id: string
  amount: number
  credits: number
  status: "pending" | "approved" | "failed" | "refunded"
  payment_id: string | null
  payment_method: string
  created_at: string
  updated_at: string
}

export interface SystemConfig {
  key: string
  value: any
  description: string | null
  updated_at: string
}

export interface UsageLog {
  id: string
  user_id: string | null
  action: string
  credits_used: number
  cost_usd: number | null
  metadata: any
  created_at: string
}

export interface PricingTier {
  name: string
  credits: number
  price: number
  bonus: number
}
