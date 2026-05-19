"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  ArrowRight, Shield, GitPullRequest, BarChart3,
  Brain, CheckCircle2, Star, Menu, X,
  TrendingUp, Sparkles, AlertCircle, ChevronRight,
  Code2, Zap, Lock,
} from "lucide-react"
import { LogoMark } from "@/components/logo"
import { LiveDemo } from "@/components/live-demo"

// ─── Scroll Progress ──────────────────────────────────────────────────────────

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#d97757] via-[#e8956a] to-[#c46843] origin-left z-[100]"
      style={{ scaleX }}
    />
  )
}

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
        background: `radial-gradient(800px at ${pos.x}px ${pos.y}px, rgba(217,119,87,0.035), transparent 65%)`,
      }}
    />
  )
}

// ─── Animation helpers ────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el); return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function AnimateIn({ children, delay = 0, className, direction = "up" }: {
  children: React.ReactNode; delay?: number; className?: string; direction?: "up" | "left" | "right" | "none"
}) {
  const { ref, inView } = useInView()
  const hidden = direction === "up" ? "opacity-0 translate-y-8" : direction === "left" ? "opacity-0 -translate-x-8" : direction === "right" ? "opacity-0 translate-x-8" : "opacity-0"
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={cn("transition-all duration-700 ease-out", inView ? "opacity-100 translate-y-0 translate-x-0" : hidden, className)}>
      {children}
    </div>
  )
}

function useCountUp(target: number, duration = 1800, active = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setCount(Math.floor(p * target))
      if (p < 1) raf = requestAnimationFrame(tick); else setCount(target)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, active])
  return count
}

function CountStatCard({ num, suffix, label, delay = 0 }: { num: number; suffix: string; label: string; delay?: number }) {
  const { ref, inView } = useInView(0.3)
  const count = useCountUp(num, 1800, inView)
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={cn("text-center transition-all duration-700 ease-out", inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>
      <div className="text-4xl lg:text-5xl font-bold text-[#ededea] mb-2 tabular-nums">{count}{suffix}</div>
      <div className="text-sm text-[#9b9b9b]">{label}</div>
    </div>
  )
}

// ─── Spotlight card ───────────────────────────────────────────────────────────

function SpotlightCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}
      onMouseMove={(e) => { const r = ref.current!.getBoundingClientRect(); setPos({ x: e.clientX - r.left, y: e.clientY - r.top }) }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="pointer-events-none absolute inset-0 transition-opacity duration-500 z-0" style={{
        opacity: hovered ? 1 : 0,
        background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, rgba(217,119,87,0.06), transparent 60%)`,
      }} />
      {children}
    </div>
  )
}

// ─── 3D Tilt ──────────────────────────────────────────────────────────────────

function Tilt3DCard({ children, className, intensity = 8 }: { children: React.ReactNode; className?: string; intensity?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect()
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * intensity, y: -((e.clientX - r.left) / r.width - 0.5) * intensity })
  }, [intensity])
  return (
    <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: (tilt.x === 0 && tilt.y === 0) ? "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)" : "transform 0.1s ease-out", willChange: "transform" }}
      className={cn("relative", className)}>
      {children}
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") || process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co"

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
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null))
        cleanup = () => subscription.unsubscribe()
      })
    }
    return () => { window.removeEventListener("scroll", onScroll); cleanup?.() }
  }, [])

  const avatar = user?.user_metadata?.avatar_url
  const username = user?.user_metadata?.user_name || user?.user_metadata?.name || user?.email?.split("@")[0]
  const handleSignOut = async () => { const { createClient } = await import("@/lib/supabase/client"); await createClient().auth.signOut(); setUser(null) }

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1e1e1e]" : "bg-transparent")}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center">
          <div className="flex-1">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 400 }}>
                <LogoMark size={28} />
              </motion.div>
              <span className="text-base font-semibold tracking-tight text-[#ededea]">Qualix</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {[["Features", "#features"], ["Pricing", "#pricing"], ["Demo", "/demo"]].map(([label, href]) => (
              <Link key={label} href={href} className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-[#9b9b9b] hover:text-[#ededea] hover:bg-white/[0.05]">{label}</Link>
            ))}
          </nav>
          <div className="flex-1 hidden md:flex items-center justify-end gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2.5">
                  {avatar ? <img src={avatar} alt={username} className="h-7 w-7 rounded-full border border-[#2a2a2a] object-cover" /> :
                    <div className="h-7 w-7 rounded-full bg-[#d97757]/15 border border-[#d97757]/30 flex items-center justify-center text-[#d97757] text-xs font-bold">{username?.[0]?.toUpperCase()}</div>}
                  <span className="text-sm text-[#9b9b9b]">{username}</span>
                </div>
                <Link href="/dashboard"><button className="btn-orange text-xs px-4 py-2">Dashboard</button></Link>
                <button onClick={handleSignOut} className="text-sm text-[#555] hover:text-[#9b9b9b] transition-colors">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/login"><button className="text-sm text-[#9b9b9b] hover:text-[#ededea] transition-colors px-3 py-1.5">Sign in</button></Link>
                <Link href="/signup"><button className="btn-orange text-sm px-5 py-2">Get started free</button></Link>
              </>
            )}
          </div>
          <button className="md:hidden text-[#ededea]" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-[#0d0d0d] border-b border-[#1e1e1e] px-6 py-4 space-y-3">
          {[["Features", "#features"], ["Pricing", "#pricing"], ["Demo", "/demo"]].map(([label, href]) => (
            <Link key={label} href={href} className="block text-sm text-[#9b9b9b] py-1 hover:text-[#ededea]">{label}</Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <><Link href="/dashboard"><button className="w-full btn-orange">Dashboard</button></Link>
                <button onClick={handleSignOut} className="w-full py-2.5 text-sm text-[#555]">Sign out</button></>
            ) : (
              <><Link href="/login"><button className="w-full py-2.5 text-sm text-[#9b9b9b]">Sign in</button></Link>
                <Link href="/signup"><button className="w-full btn-orange">Get started free</button></Link></>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────

function DashboardMockup() {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!ref.current) return
      const r = ref.current.getBoundingClientRect()
      setTilt({ x: ((e.clientY - r.top - r.height / 2) / window.innerHeight) * 5, y: -((e.clientX - r.left - r.width / 2) / window.innerWidth) * 5 })
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  return (
    <div ref={ref} className="relative w-full"
      style={{ transform: `perspective(1400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: "transform 0.15s ease-out", willChange: "transform" }}>
      <div className="absolute inset-0 bg-[#d97757]/10 blur-3xl rounded-3xl scale-105" />
      <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-2xl border border-[#262626] bg-[#0f0f0f] overflow-hidden shadow-2xl shadow-black/60">
        {/* Chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e1e1e] bg-[#0a0a0a]">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/50" /><div className="h-3 w-3 rounded-full bg-amber-500/50" /><div className="h-3 w-3 rounded-full bg-emerald-500/50" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 rounded-md bg-[#1a1a1a] px-3 py-1">
              <GitPullRequest className="h-3 w-3 text-[#555]" />
              <span className="text-xs text-[#555] font-mono">feat/add-oauth-provider · PR #247</span>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">3 issues</span>
        </div>
        {/* AI Summary */}
        <div className="px-4 py-3 bg-[#d97757]/[0.05] border-b border-[#1e1e1e]">
          <div className="flex items-start gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d97757]/15 mt-0.5">
              <Sparkles className="h-2.5 w-2.5 text-[#d97757]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#d97757] mb-0.5">AI Review Summary</p>
              <p className="text-[11px] text-[#9b9b9b] leading-relaxed">Found 2 critical security issues in <span className="text-[#ededea] font-mono">src/auth/</span>. JWT token not validated against secret key.</p>
            </div>
          </div>
        </div>
        {/* Code diff */}
        <div className="font-mono text-[11px] leading-relaxed">
          <div className="px-4 py-2 border-b border-[#1a1a1a] flex items-center justify-between">
            <span className="text-[#555]">src/auth/middleware.ts</span>
            <div className="flex gap-3 text-[10px]"><span className="text-emerald-400">+47</span><span className="text-red-400">-12</span></div>
          </div>
          {[
            { n: 38, t: "n", code: "  const authHeader = req.headers.get('authorization')" },
            { n: 39, t: "n", code: "  if (!authHeader) {" },
            { n: 40, t: "r", code: "    return new Response('Unauthorized', { status: 401 })" },
            { n: 40, t: "a", code: "    return NextResponse.json({ error: 'No token' }, { status: 401 })" },
            { n: 42, t: "n", code: "  const token = authHeader.split(' ')[1]" },
            { n: 43, t: "r", code: "  const decoded = jwt.decode(token)" },
            { n: 43, t: "a", code: "  const decoded = jwt.verify(token, process.env.JWT_SECRET)" },
          ].map((line, i) => (
            <div key={i} className={cn("flex items-start px-4 py-0.5", line.t === "a" ? "bg-emerald-500/8 border-l-2 border-emerald-500/50" : line.t === "r" ? "bg-red-500/8 border-l-2 border-red-500/50" : "border-l-2 border-transparent")}>
              <span className="w-8 shrink-0 text-[#333] select-none">{line.n}</span>
              <span className={cn(line.t === "a" ? "text-emerald-400" : line.t === "r" ? "text-red-400 line-through opacity-50" : "text-[#555]")}>
                {line.t === "a" ? "+ " : line.t === "r" ? "- " : "  "}{line.code}
              </span>
            </div>
          ))}
          <div className="mx-4 my-2 rounded-lg border border-[#d97757]/20 bg-[#d97757]/[0.04] p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-[#d97757] shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold text-[#d97757]">Qualix AI</span>
                  <span className="text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md">Critical</span>
                  <span className="text-[9px] text-[#444]">Security · Line 43</span>
                </div>
                <p className="text-[10px] text-[#9b9b9b] leading-relaxed">Using <span className="text-amber-400 font-mono">jwt.decode()</span> skips signature validation — attacker can forge arbitrary tokens.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    num: "01", icon: Brain, title: "AI-Powered Reviews", span: "md:col-span-2",
    iconBg: "bg-[#d97757]/10 border-[#d97757]/20", iconColor: "text-[#d97757]",
    accent: "via-[#d97757]/25",
    desc: "Claude analyzes every PR for bugs, anti-patterns, and logic errors — with context-aware suggestions, not just lint rules.",
    preview: "code",
  },
  {
    num: "02", icon: Shield, title: "Security Scanning", span: "",
    iconBg: "bg-blue-500/10 border-blue-500/20", iconColor: "text-blue-400",
    accent: "via-blue-500/20",
    desc: "Detect hardcoded secrets, CVEs, OWASP vulnerabilities, and misconfigurations before they reach production.",
    preview: "security",
  },
  {
    num: "03", icon: TrendingUp, title: "Risk Scoring", span: "",
    iconBg: "bg-amber-500/10 border-amber-500/20", iconColor: "text-amber-400",
    accent: "via-amber-500/15",
    desc: "Every PR gets a risk score based on change complexity, blast radius, and historical patterns.",
    preview: "chart",
  },
  {
    num: "04", icon: BarChart3, title: "Team Analytics", span: "",
    iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-400",
    accent: "via-emerald-500/15",
    desc: "Track review response times, merge velocity, contributor health, and quality trends.",
    preview: "metrics",
  },
  {
    num: "05", icon: Zap, title: "Auto-Fix", span: "",
    iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-400",
    accent: "via-emerald-500/15",
    desc: "One-click AI-generated fixes for detected issues. Review, apply, and ship without leaving your PR.",
    preview: "fix",
  },
]

function FeatureCard({ f }: { f: typeof FEATURES[0] }) {
  return (
    <Tilt3DCard className="h-full" intensity={6}>
      <SpotlightCard className={cn("rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] p-7 hover:border-[#2a2a2a] transition-all duration-300 h-full relative overflow-hidden")}>
        <div className={cn("absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent", f.accent)} />
        <div className="flex items-center gap-3 mb-5 relative z-10">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", f.iconBg)}>
            <f.icon className={cn("h-4.5 w-4.5", f.iconColor)} style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <p className="text-[9px] text-[#333] font-mono tracking-[0.25em] uppercase mb-0.5">{f.num}</p>
            <h3 className="text-sm font-semibold text-[#ededea]">{f.title}</h3>
          </div>
        </div>
        <p className="text-[#9b9b9b] text-xs leading-relaxed relative z-10">{f.desc}</p>
        {f.preview === "code" && (
          <div className="mt-5 rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] overflow-hidden relative z-10">
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#1a1a1a]">
              <div className="h-2 w-2 rounded-full bg-red-500/40" /><div className="h-2 w-2 rounded-full bg-amber-500/40" /><div className="h-2 w-2 rounded-full bg-emerald-500/40" />
              <span className="text-[10px] text-[#333] font-mono ml-2">auth/validator.ts</span>
            </div>
            <div className="font-mono text-[10px] px-4 py-2.5 space-y-0.5">
              <div className="flex gap-3 text-[#333] py-px"><span className="w-5 shrink-0 text-right">12</span><span>{"const token = authHeader.split(' ')[1]"}</span></div>
              <div className="flex gap-3 bg-red-500/8 border-l-2 border-red-500/40 pl-2 -ml-px text-red-400/70 py-px"><span className="w-5 shrink-0 text-right">13</span><span>{"- const decoded = jwt.decode(token)"}</span></div>
              <div className="flex gap-3 bg-emerald-500/8 border-l-2 border-emerald-500/40 pl-2 -ml-px text-emerald-400/70 py-px"><span className="w-5 shrink-0 text-right">13</span><span>{"+ const decoded = jwt.verify(token, SECRET)"}</span></div>
            </div>
            <div className="mx-3 mb-3 rounded-lg bg-[#d97757]/[0.05] border border-[#d97757]/12 p-2.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-semibold text-[#d97757]">Qualix AI</span>
                <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-semibold border border-red-500/20">Critical</span>
              </div>
              <p className="text-[10px] text-[#555] leading-relaxed"><span className="text-red-400/70 font-mono">jwt.decode()</span> skips signature — attacker can forge tokens.</p>
            </div>
          </div>
        )}
        {f.preview === "security" && (
          <div className="mt-5 space-y-2 relative z-10">
            {[
              { label: "Hardcoded API key", sev: "Critical", cls: "text-red-400 bg-red-500/10 border-red-500/20" },
              { label: "SQL injection risk", sev: "High", cls: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
              { label: "Outdated dep (lodash)", sev: "Medium", cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
              { label: "Missing rate limit", sev: "Low", cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
            ].map(v => (
              <div key={v.label} className="flex items-center justify-between rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2">
                <span className="text-[11px] text-[#9b9b9b]">{v.label}</span>
                <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded border", v.cls)}>{v.sev}</span>
              </div>
            ))}
          </div>
        )}
        {f.preview === "chart" && (
          <div className="mt-5 flex items-end gap-1 h-12 relative z-10">
            {[35, 60, 28, 75, 50, 88, 42, 70, 55, 92].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: `rgba(217,119,87,${0.12 + (h / 100) * 0.55})` }} />
            ))}
          </div>
        )}
        {f.preview === "metrics" && (
          <div className="mt-5 grid grid-cols-2 gap-2 relative z-10">
            {[{ label: "Avg review time", val: "1.8h", delta: "↓ 43%" }, { label: "Merge velocity", val: "12/day", delta: "↑ 28%" }].map(m => (
              <div key={m.label} className="rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] p-3">
                <p className="text-[9px] text-[#333] uppercase tracking-wide mb-1">{m.label}</p>
                <p className="text-sm font-bold text-[#ededea] leading-none mb-1">{m.val}</p>
                <p className="text-[10px] text-emerald-400 font-medium">{m.delta}</p>
              </div>
            ))}
          </div>
        )}
        {f.preview === "fix" && (
          <div className="mt-5 relative z-10 rounded-lg bg-emerald-500/[0.05] border border-emerald-500/15 p-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[11px] text-emerald-400/80">3 fixes ready to apply</span>
            <ArrowRight className="h-3 w-3 text-emerald-400/50 ml-auto shrink-0" />
          </div>
        )}
      </SpotlightCard>
    </Tilt3DCard>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24 border-t border-[#1a1a1a]">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateIn className="mb-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#d97757] mb-4">Features</p>
              <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-bold text-[#ededea] tracking-tight leading-[1.1]">
                Built for teams that<br />care about quality.
              </h2>
            </div>
            <p className="text-[#9b9b9b] text-sm leading-relaxed max-w-xs">From AI-powered reviews to security scanning — one platform, zero friction.</p>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FEATURES.map((f, i) => (
            <AnimateIn key={f.num} delay={i * 80} className={f.span}>
              <FeatureCard f={f} />
            </AnimateIn>
          ))}
        </div>
        <AnimateIn delay={200} className="text-center mt-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-[#1e1e1e] bg-[#0f0f0f] hover:bg-[#141414] hover:border-[#2a2a2a] px-5 py-2.5 text-sm font-medium text-[#9b9b9b] hover:text-[#ededea] transition-all">
            See all features <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </AnimateIn>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Starter", price: "$0", annualPrice: "$0", period: "/ month",
    description: "For individuals and small teams.",
    features: ["Up to 3 repositories", "100 AI reviews / month", "Basic security scanning", "7-day history", "GitHub integration"],
    cta: "Start free", href: "/signup", highlighted: false,
  },
  {
    name: "Pro", price: "$29", annualPrice: "$23", period: "/ month",
    description: "For growing teams that ship fast.",
    features: ["Unlimited repositories", "Unlimited AI reviews", "Advanced security scanning", "Full history", "GitHub + GitLab + Bitbucket", "Team analytics", "Tech debt tracking", "Review policies", "Priority support"],
    cta: "Start 14-day trial", href: "/signup?plan=pro", highlighted: true,
  },
  {
    name: "Enterprise", price: "Custom", annualPrice: "Custom", period: "",
    description: "For large orgs with compliance needs.",
    features: ["Everything in Pro", "SSO / SAML", "Custom AI review policies", "Audit logs", "Dedicated Slack support", "SLA guarantees", "On-prem option"],
    cta: "Contact sales", href: "mailto:sales@qualix.dev", highlighted: false,
  },
]

const companies = ["Acme Corp", "Streamline", "Vertex", "Cascade", "Pulsar", "Flowbase", "Luminary", "Nexus", "Orbit", "Prism", "Vanta", "Axiom"]

function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)
  return (
    <section id="pricing" className="py-24 border-b border-[#1a1a1a]">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateIn className="text-center mb-14">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#d97757] mb-4">Pricing</p>
          <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-bold text-[#ededea] tracking-tight mb-4">Simple, transparent pricing.</h2>
          <p className="text-[#9b9b9b] text-lg mb-8">No seat fees. No surprises. Start free, scale as you grow.</p>
          <div className="inline-flex items-center gap-3 rounded-full border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-2.5">
            <span className={cn("text-sm font-medium transition-colors", !isAnnual ? "text-[#ededea]" : "text-[#444]")}>Monthly</span>
            <button onClick={() => setIsAnnual(!isAnnual)} className={cn("relative h-6 w-11 rounded-full transition-colors duration-300", isAnnual ? "bg-[#d97757]" : "bg-[#1e1e1e]")}>
              <motion.div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm" animate={{ x: isAnnual ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
            </button>
            <span className={cn("text-sm font-medium transition-colors flex items-center gap-1.5", isAnnual ? "text-[#ededea]" : "text-[#444]")}>
              Annual <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">-20%</span>
            </span>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {plans.map((plan, i) => {
            const displayPrice = isAnnual ? plan.annualPrice : plan.price
            const displayPeriod = plan.period && isAnnual && plan.price !== "Custom" && plan.price !== "$0" ? "/ month, billed annually" : plan.period
            return (
              <AnimateIn key={plan.name} delay={i * 100}>
                <div className={cn("relative rounded-2xl border p-8 flex flex-col h-full overflow-hidden transition-all duration-300",
                  plan.highlighted ? "border-[#d97757]/30 bg-[#d97757]/[0.04] shadow-xl shadow-[#d97757]/8" : "border-[#1e1e1e] bg-[#0f0f0f] hover:border-[#2a2a2a]")}>
                  {plan.highlighted && (
                    <>
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d97757]/50 to-transparent" />
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#d97757]/30 bg-[#d97757]/10 px-3 py-1 text-[11px] font-semibold text-[#d97757]">
                          <Sparkles className="h-3 w-3" /> Most popular
                        </span>
                      </div>
                    </>
                  )}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-[#ededea]">{plan.name}</h3>
                      <AnimatePresence>
                        {isAnnual && plan.price === "$29" && (
                          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                            className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Save 20%</motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className="text-sm text-[#9b9b9b] mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <AnimatePresence mode="wait">
                        <motion.span key={displayPrice} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18 }}
                          className="text-4xl font-bold text-[#ededea]">{displayPrice}</motion.span>
                      </AnimatePresence>
                      {displayPeriod && <span className="text-sm text-[#9b9b9b]">{displayPeriod}</span>}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <CheckCircle2 className={cn("h-4 w-4 mt-0.5 shrink-0", plan.highlighted ? "text-[#d97757]" : "text-emerald-500")} />
                        <span className="text-sm text-[#9b9b9b]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href}>
                    <button className={cn("w-full py-3 rounded-full text-sm font-semibold transition-all",
                      plan.highlighted ? "bg-[#d97757] hover:bg-[#c46843] text-white shadow-md shadow-[#d97757]/20" : "bg-[#1a1a1a] hover:bg-[#222] text-[#ededea] border border-[#2a2a2a]")}>
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
    <div className="min-h-screen" style={{ background: "var(--claude-bg)" }}>
      <ScrollProgressBar />
      <CursorGlow />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="absolute inset-0 dot-grid-dark opacity-100 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#d97757]/[0.07] blur-[160px] rounded-full pointer-events-none" />

        <motion.div style={{ y: heroContentY, opacity: heroOpacity }} className="relative mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text */}
            <div className="flex flex-col items-start">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-[#d97757]/20 bg-[#d97757]/[0.07] px-4 py-1.5 mb-8">
                <div className="h-1.5 w-1.5 rounded-full bg-[#d97757] animate-pulse" />
                <span className="text-sm text-[#d97757]/90">Powered by Claude · Now in public beta</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#d97757]/40" />
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-[clamp(2.8rem,7vw,5rem)] font-bold text-[#ededea] tracking-tight leading-[1.05] mb-6">
                Code review,<br />
                <span className="bg-gradient-to-r from-[#d97757] to-[#e8956a] bg-clip-text text-transparent">reimagined.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
                className="text-lg text-[#9b9b9b] max-w-lg leading-relaxed mb-10">
                Stop shipping bugs. Let AI review every pull request, detect security vulnerabilities,
                and track tech debt — automatically, before anything reaches production.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col sm:flex-row items-start gap-3 mb-10">
                <Link href="/signup">
                  <button className="btn-orange flex items-center gap-2 text-sm px-6 py-3.5">
                    Start for free <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/demo">
                  <button className="btn-ghost-claude flex items-center gap-2 text-sm px-6 py-3.5">
                    <Code2 className="h-4 w-4" /> Try live demo
                  </button>
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-1.5">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />)}
                <span className="ml-2 text-sm text-[#9b9b9b]">Loved by <strong className="text-[#ededea]">500+</strong> engineering teams</span>
              </motion.div>
            </div>

            {/* Mockup */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-4 -right-4 z-20">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0 }}
                  style={{ animation: "float 5s ease-in-out 1s infinite" }}
                  className="flex items-center gap-2 rounded-xl border border-[#1e1e1e] bg-[#111] px-3.5 py-2.5 text-xs shadow-xl">
                  <Star className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="text-[#9b9b9b]">Quality score <strong className="text-[#ededea]">94/100</strong></span>
                </motion.div>
              </div>
              <div className="absolute -bottom-2 -left-4 z-20">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 }}
                  style={{ animation: "float 5s ease-in-out 2.4s infinite" }}
                  className="flex items-center gap-2 rounded-xl border border-[#1e1e1e] bg-[#111] px-3.5 py-2.5 text-xs shadow-xl">
                  <Zap className="h-3.5 w-3.5 text-[#d97757] shrink-0" />
                  <span className="text-[#9b9b9b]">Reviewed in <strong className="text-[#ededea]">1.8s</strong></span>
                </motion.div>
              </div>
              <motion.div style={{ y: mockupY }}><DashboardMockup /></motion.div>
            </div>
            <div className="lg:hidden"><motion.div style={{ y: mockupY }}><DashboardMockup /></motion.div></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] text-[#333] uppercase tracking-widest">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-4 h-6 rounded-full border border-[#1e1e1e] flex items-start justify-center pt-1">
            <div className="w-1 h-1.5 rounded-full bg-[#333]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Marquee ──────────────────────────────────────────────────────────── */}
      <section className="border-y border-[#1a1a1a] py-10 overflow-hidden bg-[#0d0d0d]">
        <p className="text-center text-[10px] text-[#333] tracking-widest uppercase mb-6">Trusted by engineering teams at</p>
        <div className="flex">
          <div className="flex animate-marquee gap-16 items-center whitespace-nowrap">
            {[...companies, ...companies].map((name, i) => (
              <span key={i} className="text-sm font-semibold text-[#2a2a2a] tracking-widest uppercase">{name}</span>
            ))}
          </div>
        </div>
      </section>

      <FeaturesSection />
      <LiveDemo />

      {/* ── Stats ──────────────────────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden bg-[#0d0d0d]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d97757]/15 to-transparent" />
        <div className="mx-auto max-w-5xl px-6 relative">
          <AnimateIn className="text-center mb-12">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#d97757] mb-2">By the numbers</p>
          </AnimateIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <CountStatCard num={2} suffix="M+" label="Reviews processed" delay={0} />
            <CountStatCard num={500} suffix="+" label="Engineering teams" delay={80} />
            <CountStatCard num={47} suffix="%" label="Faster review cycles" delay={160} />
            <CountStatCard num={99} suffix=".9%" label="Uptime SLA" delay={240} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d97757]/10 to-transparent" />
      </section>

      <PricingSection />

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden" style={{ background: "#0d0d0d" }}>
        <div className="absolute inset-0 dot-grid-dark opacity-60 pointer-events-none" />
        <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.25, 0.4, 0.25] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#d97757]/15 blur-[140px] rounded-full pointer-events-none" />
        <AnimateIn className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-[#1e1e1e] bg-[#0f0f0f]/80 backdrop-blur-md p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d97757]/35 to-transparent" />
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#d97757] mb-6">Get started today</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#ededea] tracking-tight mb-6">
              Ready to ship{" "}
              <span className="bg-gradient-to-r from-[#d97757] to-[#e8956a] bg-clip-text text-transparent">better code</span>?
            </h2>
            <p className="text-[#9b9b9b] text-lg mb-10">Join 500+ engineering teams. No credit card required.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup">
                <button className="btn-orange flex items-center gap-2 px-7 py-3.5">Start for free <ArrowRight className="h-4 w-4" /></button>
              </Link>
              <Link href="mailto:sales@qualix.dev">
                <button className="btn-ghost-claude px-7 py-3.5">Talk to sales</button>
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
              {[{ icon: Shield, label: "SOC 2 Type II" }, { icon: Lock, label: "GDPR Compliant" }, { icon: Zap, label: "99.9% Uptime" }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-[#333]">
                  <Icon className="h-3.5 w-3.5" />{label}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimateIn>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1a1a1a] py-14 bg-[#0a0a0a]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-14">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-5">
                <LogoMark size={32} />
                <span className="text-lg font-bold text-[#ededea] tracking-tight">Qualix</span>
              </Link>
              <p className="text-sm text-[#9b9b9b] max-w-xs leading-relaxed mb-4">AI-powered code review and quality platform for modern engineering teams.</p>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-[#444]">All systems operational</span>
              </div>
            </div>
            {[
              { heading: "Product", links: [["Features", "#features"], ["Pricing", "#pricing"], ["Changelog", "#"], ["Roadmap", "#"]] },
              { heading: "Company", links: [["About", "#"], ["Blog", "#"], ["Careers", "#"], ["Press", "#"]] },
              { heading: "Legal", links: [["Privacy", "/privacy"], ["Terms", "/terms"], ["Security", "#"], ["DPA", "#"]] },
            ].map(col => (
              <div key={col.heading}>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#333] mb-5">{col.heading}</p>
                <ul className="space-y-3">
                  {col.links.map(([label, href]) => (
                    <li key={label}><a href={href} className="text-sm text-[#9b9b9b] hover:text-[#ededea] transition-colors">{label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[#1a1a1a] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#333]">© {new Date().getFullYear()} Qualix, Inc. All rights reserved.</p>
            <span className="text-xs text-[#333]">Made with ♥ for developers</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
