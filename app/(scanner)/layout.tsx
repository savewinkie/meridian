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
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a0a0a]">
      <header className="relative flex items-center h-14 bg-[#0a0a0a]/95 backdrop-blur-md shrink-0 px-5 z-10 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#262626] after:to-transparent">
        <Link href="/" className="flex items-center gap-2.5 group">
          <LogoMark size={24} />
          <span className="text-[15px] font-semibold text-[#ededea] tracking-tight">Qualix</span>
        </Link>
        <div className="flex-1" />
        {user ? (
          <Link href="/dashboard">
            <Button size="sm" className="bg-[#d97757] hover:bg-[#c46843] text-white border-0 shadow-sm shadow-[#d97757]/20 rounded-full transition-all">
              Dashboard
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button
              size="sm"
              variant="ghost"
              className="text-[#9b9b9b] hover:text-[#ededea] hover:bg-[#141414] border border-[#262626] hover:border-[#333333] rounded-full transition-all"
            >
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
