"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ArrowRight, Shield, GitPullRequest, BarChart3,
  Brain, CheckCircle2, Star, Menu, X,
  TrendingUp, Sparkles, GitMerge,
  AlertCircle, ChevronRight, Code2,
  Bell, Zap, Check, Lock,
} from "lucide-react"
import { LogoMark } from "@/components/logo"
import { LiveDemo } from "@/components/live-demo"

// ─── Cursor Glow ──────────────────────────────────────────────────────────────

function CursorGlow() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 })
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onMove = (e: MouseEvent) => { setPos({ x: e.clientX, y: e.clientY }); setVisible(true) }
    const onLeave = () => setVisible(false)
    window.addEventListener("mousemove", onMove)
    document.addEventListener("mouseleave", onLeave)
    return () => { window.removeEventListener("mousemove", onMove); document.removeEventListener("mouseleave", onLeave) }
  }, [])
  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-700"
      style={{
        opacity: visible ? 1 : 0,
        background: `radial-gradient(700px at ${pos.x}px ${pos.y}px, rgba(245,158,11,0.038), transparent 70%)`,
      }}
    />
  )
}

// ─── Spotlight Card ───────────────────────────────────────────────────────────

function SpotlightCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={(e) => {
        const rect = ref.current!.getBoundingClientRect()
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(500px circle at ${pos.x}px ${pos.y}px, rgba(245,158,11,0.065), transparent 60%)`,
        }}
      />
      {children}
    </div>
  )
}

// ─── Magnetic Button ──────────────────────────────────────────────────────────

function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const onMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    setOffset({ x: (e.clientX - rect.left - rect.width / 2) * 0.04, y: (e.clientY - rect.top - rect.height / 2) * 0.04 })
  }
  const onMouseLeave = () => setOffset({ x: 0, y: 0 })
  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative inline-flex group"
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: offset.x === 0 ? "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)" : "transform 0.1s ease",
      }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-lg overflow-hidden z-10">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transition-transform duration-500 ease-in-out" />
      </div>
      {children}
    </div>
  )
}

// ─── Cycling Hero Word ────────────────────────────────────────────────────────

const HERO_WORDS = ["reimagined.", "upgraded.", "secured.", "perfected."]

function CyclingWord() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % HERO_WORDS.length), 2800)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="relative inline-block pb-[0.18em]">
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -24, filter: "blur(10px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="gradient-amber inline-block pb-[0.18em]"
        >
          {HERO_WORDS[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

// ─── Animation Hooks ──────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, inView }
}

function AnimateIn({
  children, delay = 0, className, direction = "up",
}: {
  children: React.ReactNode; delay?: number; className?: string; direction?: "up" | "left" | "right" | "none"
}) {
  const { ref, inView } = useInView()
  const hidden =
    direction === "up" ? "opacity-0 translate-y-8" :
    direction === "left" ? "opacity-0 -translate-x-8" :
    direction === "right" ? "opacity-0 translate-x-8" : "opacity-0"
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn("transition-all duration-700 ease-out", inView ? "opacity-100 translate-y-0 translate-x-0" : hidden, className)}
    >
      {children}
    </div>
  )
}

function useCountUp(target: number, duration = 1800, active = false): number {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf: number
    const start = performance.now()
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1)
      setCount(Math.floor(p * target))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setCount(target)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, active])
  return count
}

// ─── Count Stat Card ──────────────────────────────────────────────────────────

function CountStatCard({ num, suffix, label, delay = 0 }: { num: number; suffix: string; label: string; delay?: number }) {
  const { ref, inView } = useInView(0.3)
  const count = useCountUp(num, 1800, inView)
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn("text-center transition-all duration-700 ease-out", inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}
    >
      <div className="text-4xl lg:text-5xl font-bold text-white mb-2 tabular-nums">{count}{suffix}</div>
      <div className="text-sm text-white/50">{label}</div>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

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
        supabase.auth.getSession().then(({ data: { session } }) => {
          setUser(session?.user ?? null)
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
          setUser(session?.user ?? null)
        })
        cleanup = () => subscription.unsubscribe()
      })
    }

    return () => {
      window.removeEventListener("scroll", onScroll)
      cleanup?.()
    }
  }, [])

  const avatar = user?.user_metadata?.avatar_url
  const username = user?.user_metadata?.user_name || user?.user_metadata?.name || user?.email?.split("@")[0]

  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", scrolled ? "bg-[#0F1729]/95 backdrop-blur-md border-b border-white/10" : "bg-transparent")}>
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
            {[["Features", "#features"], ["Pricing", "#pricing"], ["Info", "/info"], ["Demo", "/demo"]].map(([label, href]) => (
              <Link key={label} href={href} className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-white/60 hover:text-white hover:bg-white/10">
                {label}
              </Link>
            ))}
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
                <MagneticButton>
                  <Link href="/dashboard"><Button size="sm" variant="amber">Dashboard</Button></Link>
                </MagneticButton>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-white/40 hover:text-white/80 hover:bg-white/10">
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">Sign in</Button></Link>
                <MagneticButton>
                  <Link href="/signup"><Button size="sm" variant="amber">Get started free</Button></Link>
                </MagneticButton>
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
          {[["Features", "#features"], ["Pricing", "#pricing"], ["Info", "/info"]].map(([label, href]) => (
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
                <Link href="/login"><Button variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10">Sign in</Button></Link>
                <Link href="/signup"><Button variant="amber" className="w-full">Get started free</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div className="relative mx-auto max-w-2xl">
      <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-3xl scale-110 animate-pulse-glow" />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-2xl border border-white/10 bg-[#0d1526] overflow-hidden shadow-2xl"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0a1020]">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/70" /><div className="h-3 w-3 rounded-full bg-amber-500/70" /><div className="h-3 w-3 rounded-full bg-emerald-500/70" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-1">
              <GitPullRequest className="h-3 w-3 text-white/40" />
              <span className="text-xs text-white/40 font-mono">feat/add-oauth-provider · PR #247</span>
            </div>
          </div>
          <Badge variant="warning" className="text-[10px] py-0">3 issues</Badge>
        </div>
        <div className="px-4 py-3 bg-amber-500/5 border-b border-white/5">
          <div className="flex items-start gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 mt-0.5">
              <Sparkles className="h-2.5 w-2.5 text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-amber-400 mb-0.5">AI Review Summary</p>
              <p className="text-[11px] text-white/60 leading-relaxed">Found 2 critical security issues in <span className="text-white/80 font-mono">src/auth/</span>. JWT token not validated against secret key — allows token forgery.</p>
            </div>
          </div>
        </div>
        <div className="font-mono text-[11px] leading-relaxed">
          <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
            <span className="text-white/40">src/auth/middleware.ts</span>
            <div className="flex items-center gap-3 text-[10px]"><span className="text-emerald-400">+47</span><span className="text-red-400">-12</span></div>
          </div>
          {[
            { n: 38, type: "neutral", code: "  const authHeader = req.headers.get('authorization')" },
            { n: 39, type: "neutral", code: "  if (!authHeader) {" },
            { n: 40, type: "removed", code: "    return new Response('Unauthorized', { status: 401 })" },
            { n: 40, type: "added", code: "    return NextResponse.json({ error: 'No token' }, { status: 401 })" },
            { n: 41, type: "neutral", code: "  }" },
            { n: 42, type: "neutral", code: "  const token = authHeader.split(' ')[1]" },
            { n: 43, type: "removed", code: "  const decoded = jwt.decode(token)" },
            { n: 43, type: "added", code: "  const decoded = jwt.verify(token, process.env.JWT_SECRET)" },
          ].map((line, i) => (
            <div key={i} className={cn("flex items-start px-4 py-0.5", line.type === "added" ? "bg-emerald-500/10 border-l-2 border-emerald-500" : line.type === "removed" ? "bg-red-500/10 border-l-2 border-red-500" : "border-l-2 border-transparent")}>
              <span className="w-8 shrink-0 text-white/20 select-none">{line.n}</span>
              <span className={cn(line.type === "added" ? "text-emerald-300" : line.type === "removed" ? "text-red-300 line-through opacity-60" : "text-white/70")}>
                {line.type === "added" ? "+ " : line.type === "removed" ? "- " : "  "}{line.code}
              </span>
            </div>
          ))}
          <div className="mx-4 my-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold text-amber-400">Refract AI</span>
                  <Badge variant="critical" className="text-[9px] py-0 px-1.5">Critical</Badge>
                  <span className="text-[9px] text-white/30">Security · Line 43</span>
                </div>
                <p className="text-[10px] text-white/60 leading-relaxed">Using <span className="text-amber-300 font-mono">jwt.decode()</span> instead of <span className="text-emerald-300 font-mono">jwt.verify()</span> skips signature validation. An attacker can craft arbitrary tokens.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

function FeaturesSection() {
  return (
    <section id="features" className="py-24 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateIn className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Features</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.1]">Built for teams that<br />care about quality.</h2>
          </div>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">From AI-powered reviews to security scanning and tech debt tracking — one platform, zero friction.</p>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* AI Reviews — big */}
          <AnimateIn delay={0} className="md:col-span-2">
            <SpotlightCard className="rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-amber-500/20 transition-all duration-300 h-full">
              <div className="flex items-center gap-3 mb-5 relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Brain className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/25 font-mono tracking-[0.2em] uppercase mb-0.5">01</p>
                  <h3 className="text-base font-semibold text-white">AI-Powered Reviews</h3>
                </div>
              </div>
              <p className="text-white/50 text-sm leading-relaxed max-w-md mb-7 relative z-10">
                Claude analyzes every PR for bugs, anti-patterns, and logic errors — with context-aware suggestions, not just lint rules.
              </p>
              <div className="rounded-xl border border-white/10 bg-[#070d1a] overflow-hidden relative z-10">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5">
                  <div className="h-2 w-2 rounded-full bg-red-500/50" /><div className="h-2 w-2 rounded-full bg-amber-500/50" /><div className="h-2 w-2 rounded-full bg-emerald-500/50" />
                  <span className="text-[10px] text-white/20 font-mono ml-2">auth/validator.ts</span>
                </div>
                <div className="font-mono text-[11px] px-4 py-3 space-y-0.5">
                  <div className="flex gap-4 text-white/35 py-0.5"><span className="w-6 shrink-0 text-right">12</span><span>{"const token = authHeader.split(' ')[1]"}</span></div>
                  <div className="flex gap-4 bg-red-500/10 border-l-2 border-red-500/50 pl-2 -ml-px text-red-400/70 py-0.5"><span className="w-6 shrink-0 text-right">13</span><span>{"- const decoded = jwt.decode(token)"}</span></div>
                  <div className="flex gap-4 bg-emerald-500/10 border-l-2 border-emerald-500/50 pl-2 -ml-px text-emerald-400/70 py-0.5"><span className="w-6 shrink-0 text-right">13</span><span>{"+ const decoded = jwt.verify(token, SECRET)"}</span></div>
                  <div className="flex gap-4 text-white/35 py-0.5"><span className="w-6 shrink-0 text-right">14</span><span>{"if (!decoded) { return unauthorized() }"}</span></div>
                </div>
                <div className="mx-4 mb-4 rounded-lg bg-amber-500/5 border border-amber-500/15 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-semibold text-amber-400">Refract AI</span>
                    <span className="text-[9px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-md font-semibold">Critical</span>
                    <span className="text-[9px] text-white/20">Security · Line 13</span>
                  </div>
                  <p className="text-[11px] text-white/45 leading-relaxed"><span className="text-red-300/70 font-mono">jwt.decode()</span> skips signature validation — an attacker can forge arbitrary tokens without the secret key.</p>
                </div>
              </div>
            </SpotlightCard>
          </AnimateIn>

          {/* Security Scanning */}
          <AnimateIn delay={100}>
            <SpotlightCard className="rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-amber-500/20 transition-all duration-300 h-full">
              <div className="flex items-center gap-3 mb-5 relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20"><Shield className="h-5 w-5 text-amber-400" /></div>
                <div>
                  <p className="text-[10px] text-white/25 font-mono tracking-[0.2em] uppercase mb-0.5">02</p>
                  <h3 className="text-base font-semibold text-white">Security Scanning</h3>
                </div>
              </div>
              <p className="text-white/50 text-sm leading-relaxed mb-7 relative z-10">Detect hardcoded secrets, CVEs, OWASP vulnerabilities, and misconfigurations before they reach production.</p>
              <div className="space-y-2 relative z-10">
                {[
                  { label: "Hardcoded API key", sev: "Critical", cls: "text-red-400 bg-red-500/10" },
                  { label: "SQL injection risk", sev: "High", cls: "text-orange-400 bg-orange-500/10" },
                  { label: "Outdated dep (lodash)", sev: "Medium", cls: "text-amber-400 bg-amber-500/10" },
                  { label: "Missing rate limit", sev: "Low", cls: "text-blue-400 bg-blue-500/10" },
                ].map((v) => (
                  <div key={v.label} className="flex items-center justify-between rounded-lg bg-white/5 border border-white/5 px-3 py-2.5">
                    <span className="text-[11px] text-white/55">{v.label}</span>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md", v.cls)}>{v.sev}</span>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </AnimateIn>

          {/* Risk Scoring */}
          <AnimateIn delay={0}>
            <SpotlightCard className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-amber-500/20 transition-all duration-300 h-full">
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20"><TrendingUp className="h-4 w-4 text-amber-400" /></div>
                <div><p className="text-[10px] text-white/25 font-mono tracking-[0.2em] uppercase mb-0.5">03</p><h3 className="text-sm font-semibold text-white">Risk Scoring</h3></div>
              </div>
              <p className="text-white/40 text-xs leading-relaxed mb-5 relative z-10">Every PR gets a risk score based on change complexity, blast radius, and historical patterns.</p>
              <div className="flex items-end gap-1 h-10 relative z-10">
                {[35, 60, 28, 75, 50, 88, 42, 70, 55, 92].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: `rgba(245,158,11,${0.15 + (h / 100) * 0.55})` }} />
                ))}
              </div>
            </SpotlightCard>
          </AnimateIn>

          {/* Team Analytics */}
          <AnimateIn delay={80}>
            <SpotlightCard className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-amber-500/20 transition-all duration-300 h-full">
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20"><BarChart3 className="h-4 w-4 text-amber-400" /></div>
                <div><p className="text-[10px] text-white/25 font-mono tracking-[0.2em] uppercase mb-0.5">04</p><h3 className="text-sm font-semibold text-white">Team Analytics</h3></div>
              </div>
              <p className="text-white/40 text-xs leading-relaxed mb-5 relative z-10">Track review response times, merge velocity, contributor health, and quality trends across your org.</p>
              <div className="grid grid-cols-2 gap-2 relative z-10">
                {[{ label: "Avg review time", val: "1.8h", delta: "↓ 43%" }, { label: "Merge velocity", val: "12/day", delta: "↑ 28%" }].map((m) => (
                  <div key={m.label} className="rounded-lg bg-white/5 border border-white/5 p-3">
                    <p className="text-[9px] text-white/30 uppercase tracking-wide mb-1.5">{m.label}</p>
                    <p className="text-sm font-bold text-white leading-none mb-1">{m.val}</p>
                    <p className="text-[10px] text-emerald-400 font-medium">{m.delta}</p>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </AnimateIn>

        </div>

        <AnimateIn delay={200} className="text-center">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/20 px-5 py-2.5 text-sm font-medium text-white/50 hover:text-white/80 transition-all">
            See all features — auto-fix, review policies, smart alerts, and more
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </AnimateIn>
      </div>
    </section>
  )
}

// ─── Product Tour removed ─────────────────────────────────────────────────────

function ProductTour() { return null }
function _PT() {
  const [active, setActive] = useState<any>("review")
  const tabs: Array<{ id: any; label: string; icon: any }> = [
    { id: "review", label: "AI Review", icon: Brain },
    { id: "security", label: "Security", icon: Shield },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "policies", label: "Policies", icon: Lock },
  ]
  return (
    <section className="py-24 border-y border-white/5">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateIn className="text-center mb-12">
          <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Product tour</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">See it in action.</h2>
        </AnimateIn>
        <AnimateIn delay={100} className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200", active === tab.id ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10" : "text-white/40 hover:text-white/70 border border-white/5 hover:border-white/15")}
            >
              <tab.icon className="h-3.5 w-3.5" />{tab.label}
            </button>
          ))}
        </AnimateIn>
        <AnimateIn delay={150}>
          <div className="rounded-2xl border border-white/10 bg-[#070d1a] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#050a14]">
              <div className="flex gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-red-500/50" /><div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" /><div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" /></div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-1 text-[11px] text-white/30 font-mono">app.meridian.dev/{active}</div>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-6 min-h-[320px]"
              >
                {active === "review" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-white/60">feat/payment-flow · PR #412</p>
                        <div className="flex gap-1.5">
                          <span className="text-[10px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded-md font-semibold">2 Critical</span>
                          <span className="text-[10px] bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-md font-semibold">4 Warnings</span>
                        </div>
                      </div>
                      <div className="font-mono text-[11px] rounded-xl bg-black/30 border border-white/5 overflow-hidden">
                        {[
                          { n: 24, t: "n", c: "async function processPayment(amount, cardData) {" },
                          { n: 25, t: "n", c: "  const token = stripe.createToken(cardData)" },
                          { n: 26, t: "r", c: "  console.log('Processing:', cardData)" },
                          { n: 27, t: "a", c: "  // Removed: never log raw card data (PCI-DSS)" },
                          { n: 28, t: "n", c: "  const charge = await stripe.charges.create({" },
                          { n: 29, t: "n", c: "    amount, currency: 'usd', source: token" },
                        ].map((l, i) => (
                          <div key={i} className={cn("flex gap-3 px-3 py-0.5", l.t === "r" ? "bg-red-500/10 text-red-400/60" : l.t === "a" ? "bg-emerald-500/10 text-emerald-400/60" : "text-white/35")}>
                            <span className="w-5 shrink-0 text-right opacity-50">{l.n}</span>
                            <span>{l.t === "r" ? "- " : l.t === "a" ? "+ " : "  "}{l.c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">AI Comments</p>
                      {[
                        { sev: "Critical", color: "red", line: 26, msg: "PCI-DSS violation: never log raw card data. This exposes PAN numbers to your log aggregator." },
                        { sev: "Warning", color: "amber", line: 25, msg: "stripe.createToken() is async — missing await. This will silently pass undefined as the token." },
                      ].map((c) => (
                        <div key={c.line} className={cn("rounded-xl border p-4", c.color === "red" ? "border-red-500/20 bg-red-500/5" : "border-amber-500/20 bg-amber-500/5")}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", c.color === "red" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400")}>{c.sev}</span>
                            <span className="text-[9px] text-white/25">Line {c.line}</span>
                          </div>
                          <p className="text-[11px] text-white/55 leading-relaxed">{c.msg}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {active === "security" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-sm font-semibold text-white">Security Scan · PR #412</p>
                      <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-1.5">
                        <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                        <span className="text-xs font-semibold text-red-400">3 vulnerabilities found</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { id: "CVE-2024-1337", pkg: "lodash@4.17.15", sev: "Critical", cvss: "9.8", desc: "Prototype pollution via merge() allows arbitrary code execution" },
                        { id: "CWE-312", pkg: "src/payments/processor.ts", sev: "High", cvss: "8.1", desc: "Sensitive card data logged in plaintext — PCI-DSS violation" },
                        { id: "CWE-89", pkg: "src/api/users.ts:47", sev: "High", cvss: "7.6", desc: "SQL query constructed via string interpolation — injection risk" },
                      ].map((v) => (
                        <div key={v.id} className="flex items-start gap-4 rounded-xl bg-white/5 border border-white/5 p-4">
                          <div className="shrink-0 text-center">
                            <span className={cn("text-[10px] font-bold px-2 py-1 rounded-lg block", v.sev === "Critical" ? "bg-red-500/15 text-red-400" : "bg-orange-500/15 text-orange-400")}>{v.sev}</span>
                            <p className="text-[10px] text-white/25 mt-1.5 font-mono">CVSS {v.cvss}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-[11px] font-mono text-amber-400/70">{v.id}</p>
                              <p className="text-[11px] text-white/30 truncate">{v.pkg}</p>
                            </div>
                            <p className="text-[11px] text-white/55 leading-relaxed">{v.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {active === "analytics" && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Avg review time", value: "1.8h", delta: "↓ 43%" },
                      { label: "Merge velocity", value: "12/day", delta: "↑ 28%" },
                      { label: "Quality score", value: "87/100", delta: "+12 pts" },
                      { label: "Open critical issues", value: "3", delta: "↓ 8 this wk" },
                    ].map((m) => (
                      <div key={m.label} className="rounded-xl bg-white/5 border border-white/5 p-4">
                        <p className="text-[10px] text-white/35 uppercase tracking-wide mb-3">{m.label}</p>
                        <p className="text-2xl font-bold text-white mb-1">{m.value}</p>
                        <p className="text-[11px] text-emerald-400 font-medium">{m.delta}</p>
                      </div>
                    ))}
                    <div className="col-span-2 lg:col-span-4 rounded-xl bg-white/5 border border-white/5 p-4">
                      <p className="text-xs text-white/40 mb-4">Review time trend — last 8 weeks</p>
                      <div className="flex items-end gap-2 h-16">
                        {[82, 71, 68, 60, 55, 48, 38, 28].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full rounded-t-sm" style={{ height: `${h}%`, background: i === 7 ? "rgba(245,158,11,0.7)" : `rgba(245,158,11,${0.15 + ((8 - i) / 8) * 0.25})` }} />
                            <span className="text-[8px] text-white/20">W{i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {active === "policies" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-4">Active policies</p>
                      <div className="space-y-2">
                        {[
                          { rule: "Block merge on Critical severity", on: true, type: "security" },
                          { rule: "Require 2 approvals on main", on: true, type: "review" },
                          { rule: "Max review time SLA: 24h", on: true, type: "review" },
                          { rule: "Auto-assign security team on CVE", on: true, type: "security" },
                          { rule: "Require passing CI on merge", on: false, type: "ci" },
                        ].map((r) => (
                          <div key={r.rule} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 px-4 py-3 gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", r.type === "security" ? "bg-red-400" : r.type === "review" ? "bg-amber-400" : "bg-blue-400")} />
                              <span className="text-[11px] text-white/60 truncate">{r.rule}</span>
                            </div>
                            <div className={cn("h-4 w-7 rounded-full flex items-center px-0.5 shrink-0", r.on ? "bg-amber-500/30 justify-end" : "bg-white/10 justify-start")}>
                              <div className={cn("h-3 w-3 rounded-full", r.on ? "bg-amber-400" : "bg-white/25")} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-4">Merge gate · PR #412</p>
                      <div className="rounded-xl bg-white/5 border border-white/5 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-semibold text-white">PR #412</span>
                          <span className="text-[10px] bg-red-500/15 text-red-400 px-2 py-1 rounded-lg font-semibold">BLOCKED</span>
                        </div>
                        {[
                          { check: "No critical severity issues", pass: false },
                          { check: "2 approvals received", pass: true },
                          { check: "Review within SLA", pass: true },
                          { check: "All CI checks passing", pass: false },
                        ].map((c) => (
                          <div key={c.check} className="flex items-center gap-2.5 py-1.5 border-b border-white/5 last:border-0">
                            {c.pass ? <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> : <X className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                            <span className="text-[11px] text-white/55">{c.check}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}

// ─── Comparison Table removed ─────────────────────────────────────────────────

function ComparisonTable() { return null }
const _comparisons: Array<{ feature: string; manual: boolean | "partial"; copilot: boolean | "partial"; meridian: boolean }> = [
  { feature: "AI-powered code review", manual: false, copilot: "partial", meridian: true },
  { feature: "Security vulnerability scanning", manual: false, copilot: false, meridian: true },
  { feature: "Risk scoring per PR", manual: false, copilot: false, meridian: true },
  { feature: "Team analytics & reporting", manual: false, copilot: false, meridian: true },
  { feature: "Tech debt visualization", manual: false, copilot: false, meridian: true },
  { feature: "Merge policy enforcement", manual: false, copilot: false, meridian: true },
  { feature: "Multi-platform (GH / GL / BB)", manual: "partial", copilot: false, meridian: true },
  { feature: "Auto-fix suggestions", manual: false, copilot: "partial", meridian: true },
  { feature: "Inline PR comments", manual: true, copilot: true, meridian: true },
  { feature: "CVE / OWASP detection", manual: false, copilot: false, meridian: true },
]

function _ComparisonTableOld() {
  const Cell = ({ val }: { val: boolean | "partial" }) => {
    if (val === true) return <Check className="h-4 w-4 text-emerald-400 mx-auto" />
    if (val === "partial") return <span className="text-[11px] font-semibold text-amber-400">Partial</span>
    return <X className="h-4 w-4 text-white/15 mx-auto" />
  }
  return (
    <section className="py-24 border-y border-white/5">
      <div className="mx-auto max-w-5xl px-6">
        <AnimateIn className="text-center mb-12">
          <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Why Refract</p>
          <h2 className="text-4xl font-bold text-white tracking-tight mb-4">How we compare.</h2>
          <p className="text-white/40 text-base max-w-xl mx-auto">Manual review and Copilot help with the basics. Refract goes the full distance.</p>
        </AnimateIn>
        <AnimateIn delay={100}>
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-4 bg-white/5">
              <div className="p-5 border-b border-white/5" />
              <div className="p-5 text-center border-l border-b border-white/5"><p className="text-xs font-semibold text-white/35">Manual Review</p></div>
              <div className="p-5 text-center border-l border-b border-white/5"><p className="text-xs font-semibold text-white/35">GitHub Copilot</p></div>
              <div className="p-5 text-center border-l border-b border-amber-500/15 bg-amber-500/5">
                <div className="flex items-center justify-center gap-1.5">
                  <LogoMark size={14} />
                  <p className="text-xs font-bold text-amber-400">Refract</p>
                </div>
              </div>
            </div>
            {_comparisons.map((row, i) => (
              <div key={row.feature} className={cn("grid grid-cols-4", i < _comparisons.length - 1 ? "border-b border-white/5" : "")}>
                <div className="p-4 flex items-center"><p className="text-sm text-white/60">{row.feature}</p></div>
                <div className="p-4 flex items-center justify-center border-l border-white/5"><Cell val={row.manual} /></div>
                <div className="p-4 flex items-center justify-center border-l border-white/5"><Cell val={row.copilot} /></div>
                <div className="p-4 flex items-center justify-center border-l border-amber-500/15 bg-amber-500/[0.03]"><Cell val={row.meridian} /></div>
              </div>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const testimonials = [
  { quote: "Refract caught a SQL injection vulnerability in a PR that passed our manual review. It pays for itself in one incident prevented.", author: "Sarah Chen", role: "CTO, Flowbase", avatar: "SC", stars: 5 },
  { quote: "We went from 8-hour review cycles to under 2 hours. The AI handles the boilerplate so humans can focus on architecture.", author: "Marcus Williams", role: "Engineering Lead, Pulsar", avatar: "MW", stars: 5 },
  { quote: "The tech debt visualization alone was worth it. We finally have a data-driven way to make the case for refactoring sprints.", author: "Priya Nair", role: "Staff Engineer, Cascade", avatar: "PN", stars: 5 },
]

const plans = [
  {
    name: "Starter", price: "$0", annualPrice: "$0", period: "/ month", description: "For individuals and small teams getting started.",
    features: ["Up to 3 repositories", "100 AI reviews / month", "Basic security scanning", "7-day review history", "GitHub integration"],
    cta: "Start free", href: "/signup", highlighted: false,
  },
  {
    name: "Pro", price: "$29", annualPrice: "$23", period: "/ month", description: "For growing teams that ship fast.",
    features: ["Unlimited repositories", "Unlimited AI reviews", "Advanced security scanning", "Full review history", "GitHub + GitLab + Bitbucket", "Team analytics dashboard", "Tech debt tracking", "Review policies", "Priority support"],
    cta: "Start 14-day trial", href: "/signup?plan=pro", highlighted: true,
  },
  {
    name: "Enterprise", price: "Custom", annualPrice: "Custom", period: "", description: "For large orgs with compliance needs.",
    features: ["Everything in Pro", "SSO / SAML", "Custom AI review policies", "Audit logs", "Dedicated Slack support", "SLA guarantees", "On-prem deployment option"],
    cta: "Contact sales", href: "mailto:sales@meridian.dev", highlighted: false,
  },
]

const companies = ["Acme Corp", "Streamline", "Vertex", "Cascade", "Pulsar", "Flowbase", "Luminary", "Nexus", "Orbit", "Prism", "Vanta", "Axiom"]

// ─── Integrations ─────────────────────────────────────────────────────────────

const INTEGRATIONS = [
  { name: "GitHub", color: "#e6edf3" },
  { name: "GitLab", color: "#fc6d26" },
  { name: "Bitbucket", color: "#2684ff" },
  { name: "GitHub Actions", color: "#2088ff" },
  { name: "CircleCI", color: "#93c5fd" },
  { name: "Slack", color: "#4ade80" },
  { name: "Microsoft Teams", color: "#5558af" },
  { name: "Jira", color: "#0052cc" },
  { name: "Linear", color: "#5e6ad2" },
  { name: "VS Code", color: "#007acc" },
  { name: "JetBrains", color: "#fe315d" },
  { name: "PagerDuty", color: "#06ac38" },
  { name: "Datadog", color: "#632ca6" },
  { name: "Asana", color: "#f06a6a" },
]

function IntegrationsSection() { return null }

// ─── Enterprise + Integrations compact callout ────────────────────────────────

function EnterpriseSection() {
  return (
    <section className="py-16 border-y border-white/5">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Integrations */}
          <AnimateIn direction="left">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 flex flex-col justify-between h-full">
              <div>
                <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Integrations</p>
                <h3 className="text-2xl font-bold text-white mb-3">Works with your stack.</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-6">GitHub, GitLab, Bitbucket, Slack, Jira, Linear, VS Code, and 50+ more tools — connected in minutes.</p>
                <div className="flex flex-wrap gap-2">
                  {["GitHub", "GitLab", "Slack", "Jira", "Linear", "VS Code"].map((name) => (
                    <span key={name} className="text-[11px] font-medium text-white/40 bg-white/[0.06] border border-white/[0.08] rounded-full px-3 py-1">{name}</span>
                  ))}
                  <span className="text-[11px] font-medium text-white/25 bg-white/[0.03] border border-white/[0.05] rounded-full px-3 py-1">+50 more</span>
                </div>
              </div>
            </div>
          </AnimateIn>
          {/* Enterprise */}
          <AnimateIn direction="right" delay={80}>
            <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.05] p-8 flex flex-col justify-between h-full">
              <div>
                <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Enterprise</p>
                <h3 className="text-2xl font-bold text-white mb-3">Built for regulated teams.</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-6">SOC 2 Type II, GDPR, SAML/SSO, audit logs, RBAC, and on-premises deployment — included in every Enterprise plan.</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {["SOC 2 Type II", "GDPR", "SAML/SSO", "Audit Logs", "RBAC", "On-Prem"].map((item) => (
                    <span key={item} className="flex items-center gap-1.5 text-[11px] font-medium text-amber-400/70 bg-amber-500/[0.08] border border-amber-500/15 rounded-full px-3 py-1">
                      <CheckCircle2 className="h-3 w-3" />{item}
                    </span>
                  ))}
                </div>
              </div>
              <MagneticButton>
                <Link href="mailto:sales@meridian.dev">
                  <Button variant="amber" size="sm" className="gap-2">Talk to sales <ArrowRight className="h-3.5 w-3.5" /></Button>
                </Link>
              </MagneticButton>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  )
}

// ─── Pricing Section ──────────────────────────────────────────────────────────

function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)
  return (
    <section id="pricing" className="py-24 border-y border-white/5">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateIn className="text-center mb-12">
          <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Pricing</p>
          <h2 className="text-4xl font-bold text-white tracking-tight mb-4">Simple, transparent pricing.</h2>
          <p className="text-white/50 text-lg mb-8">No seat fees. No usage surprises. Start free, scale as you grow.</p>
          {/* Toggle */}
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2.5">
            <span className={cn("text-sm font-medium transition-colors duration-200", !isAnnual ? "text-white" : "text-white/40")}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={cn("relative h-6 w-11 rounded-full transition-colors duration-300", isAnnual ? "bg-amber-500" : "bg-white/20")}
            >
              <motion.div
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
                animate={{ x: isAnnual ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={cn("text-sm font-medium transition-colors duration-200 flex items-center gap-1.5", isAnnual ? "text-white" : "text-white/40")}>
              Annual
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">-20%</span>
            </span>
          </div>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => {
            const displayPrice = isAnnual ? plan.annualPrice : plan.price
            const displayPeriod = plan.period && isAnnual && plan.price !== "Custom" && plan.price !== "$0"
              ? "/ month, billed annually" : plan.period
            return (
              <AnimateIn key={plan.name} delay={i * 100}>
                <SpotlightCard className={cn("relative rounded-2xl border p-8 flex flex-col h-full", plan.highlighted ? "bg-amber-500/10 border-amber-500/30 shadow-2xl shadow-amber-500/10" : "bg-white/5 border-white/10")}>
                  {plan.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <Badge variant="warning" className="shadow-sm">Most popular</Badge>
                    </div>
                  )}
                  <div className="mb-6 relative z-10">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                      <AnimatePresence>
                        {isAnnual && plan.price === "$29" && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"
                          >
                            Save 20%
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className="text-sm text-white/40 mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={displayPrice}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18 }}
                          className="text-4xl font-bold text-white"
                        >
                          {displayPrice}
                        </motion.span>
                      </AnimatePresence>
                      {displayPeriod && <span className="text-sm text-white/40">{displayPeriod}</span>}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1 relative z-10">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <CheckCircle2 className={cn("h-4 w-4 mt-0.5 shrink-0", plan.highlighted ? "text-amber-400" : "text-emerald-400")} />
                        <span className="text-sm text-white/60">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="relative z-10">
                    <Link href={plan.href}>
                      <Button className="w-full" variant={plan.highlighted ? "amber" : "outline"} size="lg">{plan.cta}</Button>
                    </Link>
                  </div>
                </SpotlightCard>
              </AnimateIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F1729] dot-grid-dark">
      <CursorGlow />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24">
        {/* Multi-layer aurora */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-amber-500/8 blur-[180px] rounded-full pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-amber-400/4 blur-[130px] rounded-full pointer-events-none" style={{ animation: "float 9s ease-in-out infinite" }} />
        <div className="absolute top-2/3 right-1/4 w-[350px] h-[350px] bg-blue-500/4 blur-[100px] rounded-full pointer-events-none" style={{ animation: "float 12s ease-in-out 3s infinite" }} />
        <div className="absolute bottom-0 left-1/2 w-[600px] h-[300px] bg-amber-500/3 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <AnimateIn>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-8 cursor-default"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-sm text-white/70">Powered by Claude · Now in public beta</span>
                <ChevronRight className="h-3.5 w-3.5 text-white/40" />
              </motion.div>
            </AnimateIn>

            <AnimateIn delay={80}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-6">
                Code review,<br /><CyclingWord />
              </h1>
            </AnimateIn>

            <AnimateIn delay={160}>
              <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
                Stop shipping bugs. Let AI review every pull request, detect security vulnerabilities,
                and track tech debt — automatically, before anything reaches production.
              </p>
            </AnimateIn>

            <AnimateIn delay={240}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <MagneticButton>
                  <Link href="/signup">
                    <Button size="xl" variant="amber" className="gap-2 shadow-xl shadow-amber-500/25">
                      Start for free <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </MagneticButton>
                <Link href="/demo">
                  <Button size="xl" className="bg-white/10 text-white hover:bg-white/20 border border-white/10 gap-2">
                    <Code2 className="h-4 w-4" />Try the live demo
                  </Button>
                </Link>
              </div>
            </AnimateIn>

            <AnimateIn delay={300}>
              <div className="mt-8 flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.05, type: "spring" }}>
                    <Star className="h-4 w-4 text-amber-400 fill-current" />
                  </motion.div>
                ))}
                <span className="ml-2 text-sm text-white/50">Loved by <strong className="text-white/80">500+</strong> engineering teams</span>
              </div>
            </AnimateIn>
          </div>

          <AnimateIn delay={200}>
            <DashboardMockup />
          </AnimateIn>
        </div>
      </section>

      {/* Marquee logos */}
      <section className="border-y border-white/5 py-10 overflow-hidden">
        <p className="text-center text-xs text-white/25 tracking-widest uppercase mb-6">Trusted by engineering teams at</p>
        <div className="flex">
          <div className="flex animate-marquee gap-16 items-center whitespace-nowrap">
            {[...companies, ...companies].map((name, i) => (
              <span key={i} className="text-sm font-semibold text-white/15 tracking-widest uppercase">{name}</span>
            ))}
          </div>
        </div>
      </section>

      <FeaturesSection />

      {/* Stats */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/2 to-transparent pointer-events-none" />
        <div className="mx-auto max-w-5xl px-6 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <CountStatCard num={2} suffix="M+" label="Reviews processed" delay={0} />
            <CountStatCard num={500} suffix="+" label="Engineering teams" delay={80} />
            <CountStatCard num={47} suffix="%" label="Faster review cycles" delay={160} />
            <CountStatCard num={99} suffix=".9%" label="Uptime SLA" delay={240} />
          </div>
        </div>
      </section>

      <EnterpriseSection />

      <PricingSection />

      {/* CTA */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse-glow" />
        <AnimateIn className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-6">Get started today</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-6">
              Ready to ship <span className="gradient-amber">better code</span>?
            </h2>
            <p className="text-white/60 text-lg mb-10">Join 500+ engineering teams. No credit card required.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <MagneticButton>
                <Link href="/signup">
                  <Button size="xl" variant="amber" className="gap-2 shadow-xl shadow-amber-500/30">
                    Start for free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </MagneticButton>
              <Link href="mailto:sales@meridian.dev">
                <Button size="xl" className="bg-white/10 text-white hover:bg-white/20 border border-white/10">Talk to sales</Button>
              </Link>
            </div>
          </motion.div>
        </AnimateIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <LogoMark size={28} />
                <span className="text-base font-semibold text-white">Refract</span>
              </Link>
              <p className="text-sm text-white/40 max-w-xs leading-relaxed">AI-powered code review and quality platform for modern engineering teams.</p>
            </div>
            {[
              { heading: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { heading: "Legal", links: ["Privacy", "Terms", "Security", "DPA"] },
            ].map((col) => (
              <div key={col.heading}>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/25 mb-4">{col.heading}</p>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="text-sm text-white/40 hover:text-white transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/25">© {new Date().getFullYear()} Refract, Inc. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-white/25">
              <span>Made with ♥ for developers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
