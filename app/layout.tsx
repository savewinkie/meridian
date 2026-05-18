import type { Metadata } from "next"
import { Inter, JetBrains_Mono, DM_Serif_Display } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: {
    default: "Qualix — AI Code Review Platform",
    template: "%s · Qualix",
  },
  description:
    "AI-powered code review and quality platform for engineering teams. Catch bugs, security issues, and tech debt before they ship.",
  keywords: ["code review", "AI", "developer tools", "GitHub", "security scanning", "tech debt"],
  authors: [{ name: "Qualix" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Qualix — AI Code Review Platform",
    description: "Ship better code, faster. AI-powered reviews that actually understand your codebase.",
    siteName: "Qualix",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qualix — AI Code Review Platform",
    description: "Ship better code, faster.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${dmSerifDisplay.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
