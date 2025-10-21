"use client"

import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex min-h-[400px] items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">{title}</h3>
          <p className="mb-6 text-sm text-muted-foreground">{description}</p>
          {actionLabel && (actionHref || onAction) && (
            <Button size="lg" onClick={onAction} asChild={!!actionHref}>
              {actionHref ? <a href={actionHref}>{actionLabel}</a> : actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
