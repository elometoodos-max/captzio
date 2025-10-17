import { Sparkles } from "lucide-react"

interface LogoProps {
  className?: string
  iconClassName?: string
  textClassName?: string
  showText?: boolean
}

export function Logo({ className = "", iconClassName = "", textClassName = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon with gradient background */}
      <div
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-accent shadow-lg ${iconClassName}`}
      >
        {/* Sparkle effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
        <Sparkles className="relative h-6 w-6 text-white drop-shadow-lg" />
        {/* Glow effect */}
        <div className="absolute -inset-1 -z-10 rounded-xl bg-gradient-to-br from-primary/50 to-accent/50 blur-md" />
      </div>

      {/* Logo Text */}
      {showText && (
        <span
          className={`font-display text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent ${textClassName}`}
        >
          Captzio
        </span>
      )}
    </div>
  )
}
