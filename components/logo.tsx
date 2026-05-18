import { cn } from "@/lib/utils"

interface LogoMarkProps {
  className?: string
  size?: number
}

export function LogoMark({ className, size = 28 }: LogoMarkProps) {
  const id = `qx-${size}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
      </defs>
      {/* Background */}
      <rect width="32" height="32" rx="8" fill={`url(#${id})`} />
      {/* Magnifying glass circle */}
      <circle cx="13.5" cy="13.5" r="6.8" stroke="white" strokeWidth="2.3" fill="none" />
      {/* Handle */}
      <line x1="19" y1="19" x2="24" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Code scan lines inside glass */}
      <line x1="9.8" y1="13.5" x2="17.2" y2="13.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.9" />
      <line x1="9.8" y1="10.5" x2="15.5" y2="10.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.55" />
      <line x1="9.8" y1="16.5" x2="15" y2="16.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.55" />
    </svg>
  )
}

interface LogoProps {
  className?: string
  size?: number
  textClassName?: string
  showText?: boolean
}

export function Logo({ className, size = 28, textClassName, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark size={size} />
      {showText && (
        <span className={cn("font-semibold tracking-tight", textClassName ?? "text-[15px] text-[#0F1729]")}>
          Qualix
        </span>
      )}
    </div>
  )
}
