"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  ArrowRight, Shield, GitPullRequest, BarChart3,
  Brain, CheckCircle2, Star, Menu, X,
  TrendingUp, Sparkles,
  AlertCircle, ChevronRight, Code2,
  Zap, Lock, Github,
} from "lucide-react"
import { LogoMark } from "@/components/logo"
import { LiveDemo } from "@/components/live-demo"

// ─── Scroll Progress Bar ──────────────────────────────────────────────────────

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D97757] via-[#E8956A] to-[#C46843] origin-left z-[100]"
      style={{ scaleX }}
    />
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
      <div className="text-4xl lg:text-5xl font-bold text-[#1A1504] mb-2 tabular-nums font-serif">{count}{suffix}</div>
      <div className="text-sm text-[#8C7B6E]">{label}</div>
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
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled
        ? "bg-[#FAF8F4]/95 backdrop-blur-md border-b border-[#E8DDD0]"
        : "bg-transparent"
    )}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center">
          <div className="flex-1">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 400 }}>
                <LogoMark size={28} />
              </motion.div>
              <span className="text-base font-semibold tracking-tight text-[#1A1504]">Qualix</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {[["Features", "#features"], ["Pricing", "#pricing"], ["Demo", "/demo"]].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-[#8C7B6E] hover:text-[#1A1504] hover:bg-[#E8DDD0]/60"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex-1 hidden md:flex items-center justify-end gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2.5">
                  {avatar ? (
                    <img src={avatar} alt={username} className="h-8 w-8 rounded-full border border-[#E8DDD0] object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#D97757]/15 border border-[#D97757]/30 flex items-center justify-center text-[#D97757] text-xs font-bold">
                      {username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-[#8C7B6E] font-medium">{username}</span>
                </div>
                <Link href="/dashboard">
                  <button className="px-4 py-2 rounded-full bg-[#D97757] hover:bg-[#C46843] text-white text-sm font-semibold transition-colors shadow-sm shadow-[#D97757]/20">
                    Dashboard
                  </button>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 text-sm text-[#8C7B6E] hover:text-[#1A1504] transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="px-3 py-2 text-sm font-medium text-[#8C7B6E] hover:text-[#1A1504] transition-colors">
                    Sign in
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="px-4 py-2 rounded-full bg-[#1A1504] hover:bg-[#2d2208] text-white text-sm font-semibold transition-colors">
                    Get started free
                  </button>
                </Link>
              </>
            )}
          </div>
          <button className="md:hidden text-[#1A1504]" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-[#FAF8F4] border-b border-[#E8DDD0] px-6 py-4 space-y-3">
          {[["Features", "#features"], ["Pricing", "#pricing"], ["Demo", "/demo"]].map(([label, href]) => (
            <Link key={label} href={href} className="block text-sm text-[#8C7B6E] py-1 hover:text-[#1A1504]">{label}</Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <>
                <Link href="/dashboard">
                  <button className="w-full py-2.5 rounded-full bg-[#D97757] text-white text-sm font-semibold">Dashboard</button>
                </Link>
                <button onClick={handleSignOut} className="w-full py-2.5 text-sm text-[#8C7B6E]">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="w-full py-2.5 text-sm text-[#8C7B6E]">Sign in</button>
                </Link>
                <Link href="/signup">
                  <button className="w-full py-2.5 rounded-full bg-[#1A1504] text-white text-sm font-semibold">Get started free</button>
                </Link>
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
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl border border-[#E8DDD0] bg-white overflow-hidden shadow-xl shadow-[#1A1504]/8"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E8DDD0] bg-[#FAF8F4]">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400/60" />
          <div className="h-3 w-3 rounded-full bg-amber-400/60" />
          <div className="h-3 w-3 rounded-full bg-emerald-400/60" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 rounded-md bg-[#E8DDD0]/60 px-3 py-1">
            <GitPullRequest className="h-3 w-3 text-[#8C7B6E]" />
            <span className="text-xs text-[#8C7B6E] font-mono">feat/add-oauth-provider · PR #247</span>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">3 issues</span>
      </div>
      {/* AI Review summary */}
      <div className="px-4 py-3 bg-[#D97757]/[0.05] border-b border-[#E8DDD0]">
        <div className="flex items-start gap-2">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D97757]/15 mt-0.5">
            <Sparkles className="h-2.5 w-2.5 text-[#D97757]" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#D97757] mb-0.5">AI Review Summary</p>
            <p className="text-[11px] text-[#8C7B6E] leading-relaxed">Found 2 critical security issues in <span className="text-[#1A1504] font-mono">src/auth/</span>. JWT token not validated against secret key.</p>
          </div>
        </div>
      </div>
      {/* Code diff */}
      <div className="font-mono text-[11px] leading-relaxed">
        <div className="px-4 py-2 border-b border-[#E8DDD0]/60 flex items-center justify-between">
          <span className="text-[#8C7B6E]">src/auth/middleware.ts</span>
          <div className="flex items-center gap-3 text-[10px]"><span className="text-emerald-600">+47</span><span className="text-red-500">-12</span></div>
        </div>
        {[
          { n: 38, type: "neutral", code: "  const authHeader = req.headers.get('authorization')" },
          { n: 39, type: "neutral", code: "  if (!authHeader) {" },
          { n: 40, type: "removed", code: "    return new Response('Unauthorized', { status: 401 })" },
          { n: 40, type: "added", code: "    return NextResponse.json({ error: 'No token' }, { status: 401 })" },
          { n: 42, type: "neutral", code: "  const token = authHeader.split(' ')[1]" },
          { n: 43, type: "removed", code: "  const decoded = jwt.decode(token)" },
          { n: 43, type: "added", code: "  const decoded = jwt.verify(token, process.env.JWT_SECRET)" },
        ].map((line, i) => (
          <div key={i} className={cn("flex items-start px-4 py-0.5",
            line.type === "added" ? "bg-emerald-50 border-l-2 border-emerald-400" :
            line.type === "removed" ? "bg-red-50 border-l-2 border-red-400" :
            "border-l-2 border-transparent"
          )}>
            <span className="w-8 shrink-0 text-[#C4B8AA] select-none">{line.n}</span>
            <span className={cn(
              line.type === "added" ? "text-emerald-700" :
              line.type === "removed" ? "text-red-500 line-through opacity-60" :
              "text-[#8C7B6E]"
            )}>
              {line.type === "added" ? "+ " : line.type === "removed" ? "- " : "  "}{line.code}
            </span>
          </div>
        ))}
        <div className="mx-4 my-2 rounded-lg border border-[#D97757]/20 bg-[#D97757]/[0.04] p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-[#D97757] shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold text-[#D97757]">Qualix AI</span>
                <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md">Critical</span>
                <span className="text-[9px] text-[#8C7B6E]">Security · Line 43</span>
              </div>
              <p className="text-[10px] text-[#8C7B6E] leading-relaxed">Using <span className="text-amber-700 font-mono">jwt.decode()</span> instead of <span className="text-emerald-700 font-mono">jwt.verify()</span> skips signature validation. An attacker can craft arbitrary tokens.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

function FeaturesSection() {
  return (
    <section id="features" className="py-24 border-t border-[#E8DDD0]">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateIn className="mb-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#D97757] mb-4">Features</p>
              <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-serif text-[#1A1504] tracking-tight leading-[1.15]">
                Built for teams that<br />care about quality.
              </h2>
            </div>
            <p className="text-[#8C7B6E] text-sm leading-relaxed max-w-xs">
              From AI-powered reviews to security scanning — one platform, zero friction.
            </p>
          </div>
        </AnimateIn>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          {/* AI Reviews — big */}
          <AnimateIn delay={0} className="md:col-span-2">
            <div className="rounded-2xl border border-[#E8DDD0] bg-white p-8 hover:shadow-md hover:border-[#D97757]/30 transition-all duration-300 h-full overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D97757]/30 to-transparent" />
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D97757]/10 border border-[#D97757]/20">
                  <Brain className="h-5 w-5 text-[#D97757]" />
                </div>
                <div>
                  <p className="text-[9px] text-[#C4B8AA] font-mono tracking-[0.25em] uppercase mb-0.5">01</p>
                  <h3 className="text-base font-semibold text-[#1A1504]">AI-Powered Reviews</h3>
                </div>
              </div>
              <p className="text-[#8C7B6E] text-sm leading-relaxed max-w-md mb-7">
                Claude analyzes every PR for bugs, anti-patterns, and logic errors — with context-aware suggestions, not just lint rules.
              </p>
              <div className="rounded-xl border border-[#E8DDD0] bg-[#FAF8F4] overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#E8DDD0]">
                  <div className="h-2 w-2 rounded-full bg-red-400/50" />
                  <div className="h-2 w-2 rounded-full bg-amber-400/50" />
                  <div className="h-2 w-2 rounded-full bg-emerald-400/50" />
                  <span className="text-[10px] text-[#8C7B6E] font-mono ml-2">auth/validator.ts</span>
                </div>
                <div className="font-mono text-[11px] px-4 py-3 space-y-0.5">
                  <div className="flex gap-4 text-[#C4B8AA] py-0.5"><span className="w-6 shrink-0 text-right">12</span><span>{"const token = authHeader.split(' ')[1]"}</span></div>
                  <div className="flex gap-4 bg-red-50 border-l-2 border-red-400 pl-2 -ml-px text-red-500/80 py-0.5"><span className="w-6 shrink-0 text-right">13</span><span>{"- const decoded = jwt.decode(token)"}</span></div>
                  <div className="flex gap-4 bg-emerald-50 border-l-2 border-emerald-400 pl-2 -ml-px text-emerald-700/80 py-0.5"><span className="w-6 shrink-0 text-right">13</span><span>{"+ const decoded = jwt.verify(token, SECRET)"}</span></div>
                  <div className="flex gap-4 text-[#C4B8AA] py-0.5"><span className="w-6 shrink-0 text-right">14</span><span>{"if (!decoded) { return unauthorized() }"}</span></div>
                </div>
                <div className="mx-4 mb-4 rounded-lg bg-[#D97757]/[0.05] border border-[#D97757]/15 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-semibold text-[#D97757]">Qualix AI</span>
                    <span className="text-[9px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-md font-semibold">Critical</span>
                    <span className="text-[9px] text-[#8C7B6E]">Security · Line 13</span>
                  </div>
                  <p className="text-[11px] text-[#8C7B6E] leading-relaxed"><span className="text-red-500/80 font-mono">jwt.decode()</span> skips signature validation — an attacker can forge arbitrary tokens without the secret key.</p>
                </div>
              </div>
            </div>
          </AnimateIn>

          {/* Security Scanning */}
          <AnimateIn delay={100}>
            <div className="rounded-2xl border border-[#E8DDD0] bg-white p-8 hover:shadow-md hover:border-[#D97757]/30 transition-all duration-300 h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-200">
                  <Shield className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[9px] text-[#C4B8AA] font-mono tracking-[0.25em] uppercase mb-0.5">02</p>
                  <h3 className="text-base font-semibold text-[#1A1504]">Security Scanning</h3>
                </div>
              </div>
              <p className="text-[#8C7B6E] text-sm leading-relaxed mb-6">Detect hardcoded secrets, CVEs, OWASP vulnerabilities, and misconfigurations before they reach production.</p>
              <div className="space-y-2">
                {[
                  { label: "Hardcoded API key", sev: "Critical", cls: "text-red-600 bg-red-50 border-red-200" },
                  { label: "SQL injection risk", sev: "High", cls: "text-orange-600 bg-orange-50 border-orange-200" },
                  { label: "Outdated dep (lodash)", sev: "Medium", cls: "text-amber-600 bg-amber-50 border-amber-200" },
                  { label: "Missing rate limit", sev: "Low", cls: "text-blue-600 bg-blue-50 border-blue-200" },
                ].map((v) => (
                  <div key={v.label} className="flex items-center justify-between rounded-lg bg-[#FAF8F4] border border-[#E8DDD0] px-3 py-2.5">
                    <span className="text-[11px] text-[#8C7B6E]">{v.label}</span>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md border", v.cls)}>{v.sev}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimateIn>

          {/* Risk Scoring */}
          <AnimateIn delay={0}>
            <div className="rounded-2xl border border-[#E8DDD0] bg-white p-6 hover:shadow-md hover:border-[#D97757]/30 transition-all duration-300 h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D97757]/20 to-transparent" />
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 border border-amber-200">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[9px] text-[#C4B8AA] font-mono tracking-[0.25em] uppercase mb-0.5">03</p>
                  <h3 className="text-sm font-semibold text-[#1A1504]">Risk Scoring</h3>
                </div>
              </div>
              <p className="text-[#8C7B6E] text-xs leading-relaxed mb-5">Every PR gets a risk score based on change complexity, blast radius, and historical patterns.</p>
              <div className="flex items-end gap-1 h-10">
                {[35, 60, 28, 75, 50, 88, 42, 70, 55, 92].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: `rgba(217,119,87,${0.15 + (h / 100) * 0.6})` }} />
                ))}
              </div>
            </div>
          </AnimateIn>

          {/* Team Analytics */}
          <AnimateIn delay={80}>
            <div className="rounded-2xl border border-[#E8DDD0] bg-white p-6 hover:shadow-md hover:border-[#D97757]/30 transition-all duration-300 h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/25 to-transparent" />
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[9px] text-[#C4B8AA] font-mono tracking-[0.25em] uppercase mb-0.5">04</p>
                  <h3 className="text-sm font-semibold text-[#1A1504]">Team Analytics</h3>
                </div>
              </div>
              <p className="text-[#8C7B6E] text-xs leading-relaxed mb-5">Track review response times, merge velocity, contributor health, and quality trends across your org.</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Avg review time", val: "1.8h", delta: "↓ 43%" },
                  { label: "Merge velocity", val: "12/day", delta: "↑ 28%" }
                ].map((m) => (
                  <div key={m.label} className="rounded-lg bg-[#FAF8F4] border border-[#E8DDD0] p-3">
                    <p className="text-[9px] text-[#C4B8AA] uppercase tracking-wide mb-1.5">{m.label}</p>
                    <p className="text-sm font-bold text-[#1A1504] leading-none mb-1">{m.val}</p>
                    <p className="text-[10px] text-emerald-600 font-medium">{m.delta}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimateIn>

          {/* Auto Fix */}
          <AnimateIn delay={160}>
            <div className="rounded-2xl border border-[#E8DDD0] bg-white p-6 hover:shadow-md hover:border-[#D97757]/30 transition-all duration-300 h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/25 to-transparent" />
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200">
                  <Zap className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[9px] text-[#C4B8AA] font-mono tracking-[0.25em] uppercase mb-0.5">05</p>
                  <h3 className="text-sm font-semibold text-[#1A1504]">Auto-Fix</h3>
                </div>
              </div>
              <p className="text-[#8C7B6E] text-xs leading-relaxed mb-5">One-click AI-generated fixes for detected issues. Review, apply, and ship — without leaving your PR.</p>
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[11px] text-emerald-700">3 fixes ready to apply</span>
                <ArrowRight className="h-3 w-3 text-emerald-500 ml-auto shrink-0" />
              </div>
            </div>
          </AnimateIn>
        </div>

        <AnimateIn delay={200} className="text-center mt-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-[#E8DDD0] bg-white hover:bg-[#FAF8F4] hover:border-[#D97757]/40 px-5 py-2.5 text-sm font-medium text-[#8C7B6E] hover:text-[#D97757] transition-all">
            See all features — auto-fix, review policies, smart alerts, and more
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </AnimateIn>
      </div>
    </section>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Starter", price: "$0", annualPrice: "$0", period: "/ month",
    description: "For individuals and small teams getting started.",
    features: ["Up to 3 repositories", "100 AI reviews / month", "Basic security scanning", "7-day review history", "GitHub integration"],
    cta: "Start free", href: "/signup", highlighted: false,
  },
  {
    name: "Pro", price: "$29", annualPrice: "$23", period: "/ month",
    description: "For growing teams that ship fast.",
    features: ["Unlimited repositories", "Unlimited AI reviews", "Advanced security scanning", "Full review history", "GitHub + GitLab + Bitbucket", "Team analytics dashboard", "Tech debt tracking", "Review policies", "Priority support"],
    cta: "Start 14-day trial", href: "/signup?plan=pro", highlighted: true,
  },
  {
    name: "Enterprise", price: "Custom", annualPrice: "Custom", period: "",
    description: "For large orgs with compliance needs.",
    features: ["Everything in Pro", "SSO / SAML", "Custom AI review policies", "Audit logs", "Dedicated Slack support", "SLA guarantees", "On-prem deployment option"],
    cta: "Contact sales", href: "mailto:sales@qualix.dev", highlighted: false,
  },
]

const companies = ["Acme Corp", "Streamline", "Vertex", "Cascade", "Pulsar", "Flowbase", "Luminary", "Nexus", "Orbit", "Prism", "Vanta", "Axiom"]

// ─── Pricing Section ──────────────────────────────────────────────────────────

function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)
  return (
    <section id="pricing" className="py-24 border-b border-[#E8DDD0]">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateIn className="text-center mb-14">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#D97757] mb-4">Pricing</p>
          <h2 className="font-serif text-[clamp(2rem,4vw,3.2rem)] text-[#1A1504] tracking-tight mb-4">Simple, transparent pricing.</h2>
          <p className="text-[#8C7B6E] text-lg mb-8">No seat fees. No usage surprises. Start free, scale as you grow.</p>
          <div className="inline-flex items-center gap-3 rounded-full border border-[#E8DDD0] bg-white px-4 py-2.5">
            <span className={cn("text-sm font-medium transition-colors duration-200", !isAnnual ? "text-[#1A1504]" : "text-[#C4B8AA]")}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={cn("relative h-6 w-11 rounded-full transition-colors duration-300", isAnnual ? "bg-[#D97757]" : "bg-[#E8DDD0]")}
            >
              <motion.div
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
                animate={{ x: isAnnual ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={cn("text-sm font-medium transition-colors duration-200 flex items-center gap-1.5", isAnnual ? "text-[#1A1504]" : "text-[#C4B8AA]")}>
              Annual
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">-20%</span>
            </span>
          </div>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {plans.map((plan, i) => {
            const displayPrice = isAnnual ? plan.annualPrice : plan.price
            const displayPeriod = plan.period && isAnnual && plan.price !== "Custom" && plan.price !== "$0"
              ? "/ month, billed annually" : plan.period
            return (
              <AnimateIn key={plan.name} delay={i * 100}>
                <div className={cn(
                  "relative rounded-2xl border p-8 flex flex-col h-full overflow-hidden transition-all duration-300",
                  plan.highlighted
                    ? "border-[#D97757]/40 bg-[#D97757]/[0.03] shadow-lg shadow-[#D97757]/10"
                    : "border-[#E8DDD0] bg-white hover:shadow-md"
                )}>
                  {plan.highlighted && (
                    <>
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D97757]/50 to-transparent" />
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#D97757]/30 bg-[#D97757]/10 px-3 py-1 text-[11px] font-semibold text-[#D97757]">
                          <Sparkles className="h-3 w-3" /> Most popular
                        </span>
                      </div>
                    </>
                  )}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-[#1A1504]">{plan.name}</h3>
                      <AnimatePresence>
                        {isAnnual && plan.price === "$29" && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"
                          >
                            Save 20%
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className="text-sm text-[#8C7B6E] mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={displayPrice}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18 }}
                          className="text-4xl font-bold text-[#1A1504] font-serif"
                        >
                          {displayPrice}
                        </motion.span>
                      </AnimatePresence>
                      {displayPeriod && <span className="text-sm text-[#8C7B6E]">{displayPeriod}</span>}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <CheckCircle2 className={cn("h-4 w-4 mt-0.5 shrink-0", plan.highlighted ? "text-[#D97757]" : "text-emerald-500")} />
                        <span className="text-sm text-[#8C7B6E]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href}>
                    <button className={cn(
                      "w-full py-3 rounded-full text-sm font-semibold transition-all",
                      plan.highlighted
                        ? "bg-[#D97757] hover:bg-[#C46843] text-white shadow-sm shadow-[#D97757]/20"
                        : "bg-[#1A1504] hover:bg-[#2d2208] text-white"
                    )}>
                      {plan.cta}
                    </button>
                  </Link>
                </div>
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
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroContentY = useTransform(heroProgress, [0, 1], [0, 100])
  const heroOpacity = useTransform(heroProgress, [0, 0.6], [1, 0])
  const mockupY = useTransform(heroProgress, [0, 1], [0, 60])

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--claude-cream)" }}>
      <ScrollProgressBar />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Warm dot grid background */}
        <div className="absolute inset-0 dot-grid-warm opacity-60 pointer-events-none" />
        {/* Subtle warm glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#D97757]/[0.06] blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-amber-300/[0.05] blur-[120px] rounded-full pointer-events-none" />

        <motion.div style={{ y: heroContentY, opacity: heroOpacity }} className="relative mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* LEFT: Text */}
            <div className="flex flex-col items-start">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-[#D97757]/25 bg-[#D97757]/[0.06] px-4 py-1.5 mb-8"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[#D97757] animate-pulse" />
                <span className="text-sm text-[#D97757]/90 font-medium">Powered by Claude · Now in public beta</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#D97757]/40" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-[clamp(2.8rem,7vw,5rem)] font-serif text-[#1A1504] tracking-tight leading-[1.08] mb-6"
              >
                Code review,<br />
                <span className="text-[#D97757] italic">reimagined.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-lg text-[#8C7B6E] max-w-lg leading-relaxed mb-10"
              >
                Stop shipping bugs. Let AI review every pull request, detect security vulnerabilities,
                and track tech debt — automatically, before anything reaches production.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col sm:flex-row items-start gap-3 mb-10"
              >
                <Link href="/signup">
                  <button className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#D97757] hover:bg-[#C46843] text-white text-sm font-semibold transition-all shadow-lg shadow-[#D97757]/25 hover:shadow-xl hover:shadow-[#D97757]/30 hover:-translate-y-0.5">
                    Start for free <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/demo">
                  <button className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#FAF8F4] border border-[#E8DDD0] hover:border-[#D97757]/30 text-sm font-semibold text-[#1A1504] transition-all hover:-translate-y-0.5">
                    <Code2 className="h-4 w-4 text-[#8C7B6E]" /> Try live demo
                  </button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-1.5"
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                ))}
                <span className="ml-2 text-sm text-[#8C7B6E]">Loved by <strong className="text-[#1A1504]">500+</strong> engineering teams</span>
              </motion.div>
            </div>

            {/* RIGHT: Dashboard Mockup */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-4 -right-4 z-20">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                  style={{ animation: "float 5s ease-in-out 1s infinite" }}
                  className="flex items-center gap-2 rounded-xl border border-[#E8DDD0] bg-white px-3.5 py-2.5 text-xs shadow-lg"
                >
                  <Star className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="text-[#8C7B6E]">Quality score <strong className="text-[#1A1504]">94/100</strong></span>
                </motion.div>
              </div>
              <div className="absolute -bottom-2 -left-4 z-20">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  style={{ animation: "float 5s ease-in-out 2.4s infinite" }}
                  className="flex items-center gap-2 rounded-xl border border-[#E8DDD0] bg-white px-3.5 py-2.5 text-xs shadow-lg"
                >
                  <Zap className="h-3.5 w-3.5 text-[#D97757] shrink-0" />
                  <span className="text-[#8C7B6E]">Reviewed in <strong className="text-[#1A1504]">1.8s</strong></span>
                </motion.div>
              </div>
              <motion.div style={{ y: mockupY }}>
                <DashboardMockup />
              </motion.div>
            </div>

            {/* Mobile mockup */}
            <div className="lg:hidden relative">
              <motion.div style={{ y: mockupY }}>
                <DashboardMockup />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-[#C4B8AA] uppercase tracking-widest">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-4 h-6 rounded-full border border-[#E8DDD0] flex items-start justify-center pt-1"
          >
            <div className="w-1 h-1.5 rounded-full bg-[#C4B8AA]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Marquee logos ───────────────────────────────────────────────────── */}
      <section className="border-y border-[#E8DDD0] py-10 overflow-hidden bg-white">
        <p className="text-center text-[10px] text-[#C4B8AA] tracking-widest uppercase mb-6">Trusted by engineering teams at</p>
        <div className="flex">
          <div className="flex animate-marquee gap-16 items-center whitespace-nowrap">
            {[...companies, ...companies].map((name, i) => (
              <span key={i} className="text-sm font-semibold text-[#C4B8AA] tracking-widest uppercase">{name}</span>
            ))}
          </div>
        </div>
      </section>

      <FeaturesSection />

      {/* ── Live Demo ───────────────────────────────────────────────────────── */}
      <LiveDemo />

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden bg-[#F5F0E8]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D97757]/20 to-transparent" />
        <div className="mx-auto max-w-5xl px-6 relative">
          <AnimateIn className="text-center mb-12">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#D97757] mb-2">By the numbers</p>
          </AnimateIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <CountStatCard num={2} suffix="M+" label="Reviews processed" delay={0} />
            <CountStatCard num={500} suffix="+" label="Engineering teams" delay={80} />
            <CountStatCard num={47} suffix="%" label="Faster review cycles" delay={160} />
            <CountStatCard num={99} suffix=".9%" label="Uptime SLA" delay={240} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D97757]/15 to-transparent" />
      </section>

      <PricingSection />

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden bg-[#1A1504]">
        <div className="absolute inset-0 dot-grid-warm opacity-[0.08] pointer-events-none" />
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#D97757]/20 blur-[140px] rounded-full pointer-events-none"
        />
        <AnimateIn className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D97757]/40 to-transparent" />
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#D97757] mb-6">Get started today</p>
            <h2 className="font-serif text-4xl sm:text-5xl text-white tracking-tight mb-6">
              Ready to ship{" "}
              <span className="text-[#D97757] italic">better code</span>?
            </h2>
            <p className="text-white/50 text-lg mb-10">Join 500+ engineering teams. No credit card required.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup">
                <button className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#D97757] hover:bg-[#E8956A] text-white text-sm font-semibold transition-all shadow-lg shadow-[#D97757]/30 hover:-translate-y-0.5">
                  Start for free <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="mailto:sales@qualix.dev">
                <button className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white text-sm font-semibold transition-all hover:-translate-y-0.5">
                  Talk to sales
                </button>
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
              {[
                { icon: Shield, label: "SOC 2 Type II" },
                { icon: Lock, label: "GDPR Compliant" },
                { icon: Zap, label: "99.9% Uptime" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-white/30">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimateIn>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E8DDD0] py-14 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-14">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-5">
                <LogoMark size={32} />
                <span className="text-lg font-bold text-[#1A1504] tracking-tight">Qualix</span>
              </Link>
              <p className="text-sm text-[#8C7B6E] max-w-xs leading-relaxed mb-4">AI-powered code review and quality platform for modern engineering teams.</p>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-[#C4B8AA]">All systems operational</span>
              </div>
            </div>
            {[
              { heading: "Product", links: [["Features", "#features"], ["Pricing", "#pricing"], ["Changelog", "#"], ["Roadmap", "#"]] },
              { heading: "Company", links: [["About", "#"], ["Blog", "#"], ["Careers", "#"], ["Press", "#"]] },
              { heading: "Legal", links: [["Privacy", "/privacy"], ["Terms", "/terms"], ["Security", "#"], ["DPA", "#"]] },
            ].map((col) => (
              <div key={col.heading}>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4B8AA] mb-5">{col.heading}</p>
                <ul className="space-y-3">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="text-sm text-[#8C7B6E] hover:text-[#1A1504] transition-colors">{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[#E8DDD0] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#C4B8AA]">© {new Date().getFullYear()} Qualix, Inc. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-[#C4B8AA]">
              <span>Made with ♥ for developers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
