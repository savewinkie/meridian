"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { LogoMark } from "@/components/logo"
import { Button } from "@/components/ui/button"

const isDemoMode =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co"

export default function ScannerLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (isDemoMode) return
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
      supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null))
    })
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#070d1a]">
      <header className="flex items-center h-12 border-b border-white/[0.05] bg-[#070d1a]/95 backdrop-blur-md shrink-0 px-4 z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <LogoMark size={22} />
          <span className="text-sm font-semibold text-white">Qualix</span>
        </Link>
        <div className="flex-1" />
        {user ? (
          <Link href="/dashboard">
            <Button size="sm" variant="amber">Dashboard</Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              Sign in
            </Button>
          </Link>
        )}
      </header>
      <main className="flex-1 min-h-0">
        {children}
      </main>
    </div>
  )
}
