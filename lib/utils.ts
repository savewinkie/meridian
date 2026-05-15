import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return formatDate(date)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "…"
}

export function getRiskLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Critical", color: "text-red-600" }
  if (score >= 60) return { label: "High", color: "text-orange-600" }
  if (score >= 40) return { label: "Medium", color: "text-amber-600" }
  return { label: "Low", color: "text-emerald-600" }
}

export function getSeverityVariant(
  severity: "low" | "medium" | "high" | "critical"
): "info" | "warning" | "destructive" | "critical" {
  const map = {
    low: "info" as const,
    medium: "warning" as const,
    high: "destructive" as const,
    critical: "critical" as const,
  }
  return map[severity]
}

export function pluralize(count: number, word: string): string {
  return count === 1 ? `${count} ${word}` : `${count} ${word}s`
}
