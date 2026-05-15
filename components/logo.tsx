import { cn } from "@/lib/utils"

interface LogoMarkProps {
  className?: string
  size?: number
}

export function LogoMark({ className, size = 28 }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <rect width="32" height="32" rx="8" fill="#0F1729" />

      {/* Meridian mark — twin peaks (M shape) representing signal / quality */}
      <path
        d="M7.5 23 L11.5 9.5 L16 18 L20.5 9.5 L24.5 23"
        stroke="#F59E0B"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Subtle baseline */}
      <line
        x1="7.5" y1="23" x2="24.5" y2="23"
        stroke="#F59E0B"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.35"
      />
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
          Meridian
        </span>
      )}
    </div>
  )
}
