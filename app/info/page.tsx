"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ArrowRight, Star, Menu, X, GitPullRequest, Brain, TrendingUp,
  Sparkles, ChevronRight, Shield, BarChart3, Lock, Zap,
} from "lucide-react"
import { LogoMark } from "@/components/logo"
import { LiveDemo } from "@/components/live-demo"

const isDemoMode =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co"

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

function AnimateIn({ children, delay = 0, className, direction = "up" }: {
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

function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const rect = ref.current!.getBoundingClientRect()
        setOffset({ x: (e.clientX - rect.left - rect.width / 2) * 0.04, y: (e.clientY - rect.top - rect.height / 2) * 0.04 })
      }}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      className="relative inline-flex group"
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, transition: offset.x === 0 ? "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)" : "transform 0.1s ease" }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-lg overflow-hidden z-10">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transition-transform duration-500 ease-in-out" />
      </div>
      {children}
    </div>
  )
}

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

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", scrolled ? "bg-[#0F1729]/95 backdrop-blur-md border-b border-white/10" : "bg-transparent")}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 400 }}>
              <LogoMark size={28} />
            </motion.div>
            <span className="text-base font-semibold tracking-tight text-white">Meridian</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {[["Home", "/"], ["Features", "/#features"], ["Pricing", "/#pricing"]].map(([label, href]) => (
              <Link key={label} href={href} className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-white/60 hover:text-white hover:bg-white/10">
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
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
          {[["Home", "/"], ["Features", "/#features"], ["Pricing", "/#pricing"]].map(([label, href]) => (
            <Link key={label} href={href} className="block text-sm text-white/60 py-1 hover:text-white">{label}</Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <Link href="/dashboard"><Button variant="amber" className="w-full">Go to Dashboard</Button></Link>
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

const testimonials = [
  { quote: "Meridian caught a SQL injection vulnerability in a PR that passed our manual review. It pays for itself in one incident prevented.", author: "Sarah Chen", role: "CTO, Flowbase", avatar: "SC", stars: 5 },
  { quote: "We went from 8-hour review cycles to under 2 hours. The AI handles the boilerplate so humans can focus on architecture.", author: "Marcus Williams", role: "Engineering Lead, Pulsar", avatar: "MW", stars: 5 },
  { quote: "The tech debt visualization alone was worth it. We finally have a data-driven way to make the case for refactoring sprints.", author: "Priya Nair", role: "Staff Engineer, Cascade", avatar: "PN", stars: 5 },
]

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-[#0F1729] dot-grid-dark">
      <Navbar />

      {/* Page header */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/6 blur-[150px] rounded-full pointer-events-none" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <AnimateIn>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-sm text-white/60">Everything about Meridian</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              How it works &amp; what teams say
            </h1>
            <p className="text-white/50 text-lg leading-relaxed">
              A deeper look at the product — live demo, setup steps, and feedback from real engineering teams.
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* Live Demo */}
      <LiveDemo />

      {/* How it works */}
      <section className="py-24 border-y border-white/5">
        <div className="mx-auto max-w-5xl px-6">
          <AnimateIn className="text-center mb-16">
            <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">How it works</p>
            <h2 className="text-4xl font-bold text-white tracking-tight mb-4">Set up in minutes.<br />Works automatically forever.</h2>
          </AnimateIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-6 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            {[
              { step: "01", title: "Connect your repos", description: "Install the Meridian GitHub App in one click. Works with GitHub, GitLab, and Bitbucket.", icon: GitPullRequest },
              { step: "02", title: "AI reviews every PR", description: "When a PR is opened, Meridian automatically analyzes the diff and leaves inline comments with severity ratings.", icon: Brain },
              { step: "03", title: "Track & improve", description: "Use analytics to identify patterns, track quality trends, and measure your team's improvement over time.", icon: TrendingUp },
            ].map((step, i) => (
              <AnimateIn key={step.step} delay={i * 120}>
                <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }} className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 relative">
                      <step.icon className="h-5 w-5 text-amber-400" />
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-amber-400">{i + 1}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-500 mb-1">{step.step}</p>
                    <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Scanner features callout */}
      <section className="py-16 border-b border-white/5">
        <div className="mx-auto max-w-5xl px-6">
          <AnimateIn className="text-center mb-12">
            <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Scanner tools</p>
            <h2 className="text-3xl font-bold text-white tracking-tight">Four ways to scan your code.</h2>
          </AnimateIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Brain, title: "Code Scanner", desc: "Paste any code snippet and get an instant AI review with fixes.", href: "/scanner/code" },
              { icon: Shield, title: "Website Scanner", desc: "Enter a URL and audit the frontend code for issues and improvements.", href: "/scanner/website" },
              { icon: BarChart3, title: "File Upload", desc: "Drag & drop up to 10 files for batch scanning and download fixed versions.", href: "/scanner/upload" },
              { icon: Lock, title: "GitHub Repos", desc: "Browse your repositories, select files, and batch-scan them with AI.", href: "/scanner/repo" },
            ].map((item, i) => (
              <AnimateIn key={item.title} delay={i * 80}>
                <Link href={item.href} className="block group">
                  <div className="rounded-2xl border border-white/10 bg-white/5 hover:border-amber-500/20 hover:bg-white/[0.08] transition-all duration-300 p-6 h-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
                      <item.icon className="h-5 w-5 text-amber-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-white/45 leading-relaxed mb-4">{item.desc}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-400/60 group-hover:text-amber-400 transition-colors">
                      Try it <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6">
          <AnimateIn className="text-center mb-16">
            <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Testimonials</p>
            <h2 className="text-4xl font-bold text-white tracking-tight">Loved by engineering teams.</h2>
          </AnimateIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <AnimateIn key={t.author} delay={i * 100}>
                <motion.div
                  whileHover={{ y: -4, borderColor: "rgba(245,158,11,0.2)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 h-full transition-colors duration-300"
                >
                  <div className="flex items-center gap-0.5 mb-4">
                    {[...Array(t.stars)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 text-amber-400 fill-current" />)}
                  </div>
                  <p className="text-sm text-white/65 leading-relaxed mb-6">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold">{t.avatar}</div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.author}</p>
                      <p className="text-xs text-white/40">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/8 blur-[120px] rounded-full pointer-events-none" />
        <AnimateIn className="relative mx-auto max-w-2xl px-6 text-center">
          <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-6">Ready?</p>
          <h2 className="text-4xl font-bold text-white tracking-tight mb-4">Start scanning your code today.</h2>
          <p className="text-white/50 mb-8">Free forever plan. No credit card required.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <MagneticButton>
              <Link href="/signup">
                <Button size="xl" variant="amber" className="gap-2 shadow-xl shadow-amber-500/25">
                  Get started free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </MagneticButton>
            <Link href="/">
              <Button size="xl" className="bg-white/10 text-white hover:bg-white/20 border border-white/10">
                Back to home
              </Button>
            </Link>
          </div>
        </AnimateIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={24} />
            <span className="text-sm font-semibold text-white">Meridian</span>
          </Link>
          <p className="text-xs text-white/25">© {new Date().getFullYear()} Meridian, Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
