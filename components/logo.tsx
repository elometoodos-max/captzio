interface LogoProps {
  className?: string
  iconClassName?: string
  textClassName?: string
  showText?: boolean
}

export function Logo({ className = "", iconClassName = "", textClassName = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Modern geometric icon representing connection and creativity */}
      <div
        className={`relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] shadow-md ${iconClassName}`}
      >
        {/* Geometric pattern - connected dots representing network/creativity */}
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
          {/* Main dots */}
          <circle cx="6" cy="6" r="2" fill="white" />
          <circle cx="18" cy="6" r="2" fill="white" />
          <circle cx="12" cy="12" r="2.5" fill="#EAB308" />
          <circle cx="6" cy="18" r="2" fill="white" />
          <circle cx="18" cy="18" r="2" fill="white" />
          {/* Connection lines */}
          <path
            d="M7.5 7L10.5 10.5M13.5 10.5L16.5 7M10.5 13.5L7.5 17M13.5 13.5L16.5 17"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {/* Subtle glow effect */}
        <div className="absolute -inset-0.5 -z-10 rounded-lg bg-[#2563EB]/30 blur-sm" />
      </div>

      {/* Logo text with modern typography */}
      {showText && (
        <span className={`font-display text-2xl font-semibold tracking-tight text-foreground ${textClassName}`}>
          Captzio
        </span>
      )}
    </div>
  )
}
