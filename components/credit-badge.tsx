"use client"

import { Crown, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CreditBadgeProps {
  credits: number | string
  isAdmin?: boolean
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
}

export function CreditBadge({ credits, isAdmin = false, size = "md", showIcon = true }: CreditBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  }

  if (isAdmin) {
    return (
      <Badge variant="secondary" className={`${sizeClasses[size]} gap-1.5`}>
        {showIcon && <Crown className="h-3 w-3" />}
        <span>Admin - Ilimitado</span>
      </Badge>
    )
  }

  const creditNum = typeof credits === "string" ? Number.parseInt(credits) : credits
  const variant = creditNum <= 5 ? "destructive" : creditNum <= 20 ? "default" : "secondary"

  return (
    <Badge variant={variant} className={`${sizeClasses[size]} gap-1.5`}>
      {showIcon && <Zap className="h-3 w-3" />}
      <span>
        {credits} crédito{creditNum !== 1 ? "s" : ""}
      </span>
    </Badge>
  )
}
