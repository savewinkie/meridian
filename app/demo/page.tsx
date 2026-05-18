"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import { LogoMark } from "@/components/logo"
import { LiveDemo } from "@/components/live-demo"

const isDemoMode =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co"

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)

    let cleanup: (() => void) | undefined
    if (!isDemoMode) {
      import("@/lib/supabase/client").then(({ createClient }) => {
        const supabase = createClient()
        supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
          setUser(session?.user ?? null)
        })
        cleanup = () => subscription.unsubscribe()
      })
    }

    return () => { window.removeEventListener("scroll", onScroll); cleanup?.() }
  }, [])

  const avatar = user?.user_metadata?.avatar_url
  const username = user?.user_metadata?.user_name || user?.user_metadata?.name || user?.email?.split("@")[0]

  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client")
    await createClient().auth.signOut()
    setUser(null)
  }

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-[#0F1729]/95 backdrop-blur-md border-b border-white/10" : "bg-transparent")}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center">
          <div className="flex-1">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 400 }}>
                <LogoMark size={28} />
              </motion.div>
              <span className="text-base font-semibold tracking-tight text-white">Refract</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {[["Home", "/"], ["Features", "/#features"], ["Pricing", "/#pricing"], ["Info", "/info"]].map(([label, href]) => (
              <Link key={label} href={href}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-white/60 hover:text-white hover:bg-white/10">
                {label}
              </Link>
            ))}
            <span className="px-3 py-1.5 rounded-md text-sm font-medium text-amber-400/80 bg-amber-500/10 border border-amber-500/15">
              Demo
            </span>
          </nav>
          <div className="flex-1 hidden md:flex items-center justify-end gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2.5">
                  {avatar ? (
                    <img src={avatar} alt={username} className="h-8 w-8 rounded-full border border-white/20 object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold">
                      {username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-white/60 font-medium">{username}</span>
                </div>
                <Link href="/dashboard"><Button size="sm" variant="amber">Dashboard</Button></Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-white/40 hover:text-white/80 hover:bg-white/10">
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">Sign in</Button></Link>
                <Link href="/signup"><Button size="sm" variant="amber">Get started free</Button></Link>
              </>
            )}
          </div>
          <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-[#0F1729] border-b border-white/10 px-6 py-4 space-y-3">
          {[["Home", "/"], ["Features", "/#features"], ["Pricing", "/#pricing"], ["Info", "/info"]].map(([label, href]) => (
            <Link key={label} href={href} className="block text-sm text-white/60 py-1 hover:text-white">{label}</Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <>
                <Link href="/dashboard"><Button variant="amber" className="w-full">Go to Dashboard</Button></Link>
                <Button variant="ghost" onClick={handleSignOut} className="w-full text-white/50 hover:text-white hover:bg-white/10">Sign out</Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" className="w-full text-white/70">Sign in</Button></Link>
                <Link href="/signup"><Button variant="amber" className="w-full">Get started free</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#0F1729] dot-grid-dark">
      <Navbar />
      <div className="pt-16">
        <LiveDemo />
      </div>
      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={24} />
            <span className="text-sm font-semibold text-white">Refract</span>
          </Link>
          <p className="text-xs text-white/25">© {new Date().getFullYear()} Refract, Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
