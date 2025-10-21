"use client"

import { Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface SuccessMessageProps {
  title?: string
  message: string
  className?: string
}

export function SuccessMessage({ title = "Sucesso", message, className }: SuccessMessageProps) {
  return (
    <Alert className={`border-green-500/50 bg-green-500/10 ${className}`}>
      <Check className="h-4 w-4 text-green-500" />
      <AlertTitle className="text-green-700 dark:text-green-400">{title}</AlertTitle>
      <AlertDescription className="text-green-600 dark:text-green-300">{message}</AlertDescription>
    </Alert>
  )
}
