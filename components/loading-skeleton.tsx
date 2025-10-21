"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function CaptionSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-5 w-32 bg-muted rounded" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-4 w-4/6 bg-muted rounded" />
        </div>
        <div className="h-10 w-full bg-muted rounded" />
        <div className="h-8 w-full bg-muted rounded" />
      </CardContent>
    </Card>
  )
}

export function ImageSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-0">
        <div className="aspect-square w-full bg-muted rounded-t-lg" />
        <div className="p-4 space-y-2">
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-4 w-1/2 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded mt-2" />
          </CardHeader>
          <CardContent>
            <div className="h-24 w-full bg-muted rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
