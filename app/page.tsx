"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ArrowRight, Shield, GitPullRequest, BarChart3,
  AlertTriangle, Brain, CheckCircle2, Star, Menu, X,
  TrendingUp, Users, Clock, Sparkles, GitMerge,
  AlertCircle, ChevronRight, Code2,
} from "lucide-react"
import { LogoMark } from "@/components/logo"

// ─── Nav ────────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/90 backdrop-blur-md border-b border-border shadow-sm" : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className={cn("text-base font-semibold tracking-tight transition-colors", scrolled ? "text-[#0F1729]" : "text-white")}>
              Meridian
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {["Features", "Pricing", "Docs", "Blog"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  scrolled ? "text-gray-600 hover:text-[#0F1729] hover:bg-gray-50" : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className={cn(scrolled ? "" : "text-white/80 hover:text-white hover:bg-white/10")}>
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" variant="amber">
                Get started free
              </Button>
            </Link>
          </div>

          <button
            className={cn("md:hidden", scrolled ? "text-[#0F1729]" : "text-white")}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-border px-6 py-4 space-y-3">
          {["Features", "Pricing", "Docs", "Blog"].map((item) => (
            <Link key={item} href={`#${item.toLowerCase()}`} className="block text-sm text-gray-600 py-1">
              {item}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/login"><Button variant="outline" className="w-full">Sign in</Button></Link>
            <Link href="/signup"><Button variant="amber" className="w-full">Get started free</Button></Link>
          </div>
        </div>
      )}
    </header>
  )
}

// ─── Hero Dashboard Mockup ────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div className="relative mx-auto max-w-2xl">
      {/* Glow */}
      <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-3xl scale-110" />

      <div className="relative rounded-2xl border border-white/10 bg-[#0d1526] overflow-hidden shadow-2xl">
        {/* Titlebar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0a1020]">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/70" />
            <div className="h-3 w-3 rounded-full bg-amber-500/70" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-1">
              <GitPullRequest className="h-3 w-3 text-white/40" />
              <span className="text-xs text-white/40 font-mono">feat/add-oauth-provider · PR #247</span>
            </div>
          </div>
          <Badge variant="warning" className="text-[10px] py-0">
            3 issues
          </Badge>
        </div>

        {/* AI Summary */}
        <div className="px-4 py-3 bg-amber-500/5 border-b border-white/5">
          <div className="flex items-start gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 mt-0.5">
              <Sparkles className="h-2.5 w-2.5 text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-amber-400 mb-0.5">AI Review Summary</p>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Found 2 critical security issues in <span className="text-white/80 font-mono">src/auth/</span>.
                JWT token is not validated against secret key, allowing token forgery.
              </p>
            </div>
          </div>
        </div>

        {/* Code diff */}
        <div className="font-mono text-[11px] leading-relaxed">
          <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
            <span className="text-white/40">src/auth/middleware.ts</span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-emerald-400">+47</span>
              <span className="text-red-400">-12</span>
            </div>
          </div>

          <div className="overflow-hidden">
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
              <div
                key={i}
                className={cn(
                  "flex items-start px-4 py-0.5",
                  line.type === "added" ? "bg-emerald-500/10 border-l-2 border-emerald-500" :
                  line.type === "removed" ? "bg-red-500/10 border-l-2 border-red-500" :
                  "border-l-2 border-transparent"
                )}
              >
                <span className="w-8 shrink-0 text-white/20 select-none">{line.n}</span>
                <span className={cn(
                  line.type === "added" ? "text-emerald-300" :
                  line.type === "removed" ? "text-red-300 line-through opacity-60" :
                  "text-white/70"
                )}>
                  {line.type === "added" ? "+ " : line.type === "removed" ? "- " : "  "}
                  {line.code}
                </span>
              </div>
            ))}
          </div>

          {/* AI annotation */}
          <div className="mx-4 my-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold text-amber-400">Meridian AI</span>
                  <Badge variant="critical" className="text-[9px] py-0 px-1.5">Critical</Badge>
                  <span className="text-[9px] text-white/30">Security · Line 43</span>
                </div>
                <p className="text-[10px] text-white/60 leading-relaxed">
                  Using <span className="text-amber-300 font-mono">jwt.decode()</span> instead of{" "}
                  <span className="text-emerald-300 font-mono">jwt.verify()</span> skips signature validation.
                  An attacker can craft arbitrary tokens.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-[#0F1729] border-t border-white/5">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Features</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.1]">
              Built for teams that
              <br />
              care about quality.
            </h2>
          </div>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            From AI-powered reviews to security scanning and tech debt tracking — one platform, zero friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Big card — AI Reviews */}
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-amber-500/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Brain className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/25 font-mono tracking-[0.2em] uppercase mb-0.5">01</p>
                <h3 className="text-base font-semibold text-white">AI-Powered Reviews</h3>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-md mb-7">
              Claude analyzes every PR for bugs, anti-patterns, and logic errors — with context-aware suggestions, not just lint rules.
            </p>
            <div className="rounded-xl border border-white/10 bg-[#070d1a] overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5">
                <div className="h-2 w-2 rounded-full bg-red-500/50" />
                <div className="h-2 w-2 rounded-full bg-amber-500/50" />
                <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
                <span className="text-[10px] text-white/20 font-mono ml-2">auth/validator.ts</span>
              </div>
              <div className="font-mono text-[11px] px-4 py-3 space-y-0.5">
                <div className="flex gap-4 text-white/35 py-0.5">
                  <span className="w-6 shrink-0 text-right">12</span>
                  <span>{"const token = authHeader.split(' ')[1]"}</span>
                </div>
                <div className="flex gap-4 bg-red-500/10 border-l-2 border-red-500/50 pl-2 -ml-px text-red-400/70 py-0.5">
                  <span className="w-6 shrink-0 text-right">13</span>
                  <span>{"- const decoded = jwt.decode(token)"}</span>
                </div>
                <div className="flex gap-4 bg-emerald-500/10 border-l-2 border-emerald-500/50 pl-2 -ml-px text-emerald-400/70 py-0.5">
                  <span className="w-6 shrink-0 text-right">13</span>
                  <span>{"+ const decoded = jwt.verify(token, SECRET)"}</span>
                </div>
                <div className="flex gap-4 text-white/35 py-0.5">
                  <span className="w-6 shrink-0 text-right">14</span>
                  <span>{"if (!decoded) { return unauthorized() }"}</span>
                </div>
              </div>
              <div className="mx-4 mb-4 rounded-lg bg-amber-500/5 border border-amber-500/15 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-semibold text-amber-400">Meridian AI</span>
                  <span className="text-[9px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-md font-semibold">Critical</span>
                  <span className="text-[9px] text-white/20">Security · Line 13</span>
                </div>
                <p className="text-[11px] text-white/45 leading-relaxed">
                  <span className="text-red-300/70 font-mono">jwt.decode()</span> skips signature validation — an attacker can forge arbitrary tokens without the secret key.
                </p>
              </div>
            </div>
          </div>

          {/* Security Scanning */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-amber-500/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Shield className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/25 font-mono tracking-[0.2em] uppercase mb-0.5">02</p>
                <h3 className="text-base font-semibold text-white">Security Scanning</h3>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-7">
              Detect hardcoded secrets, CVEs, OWASP vulnerabilities, and misconfigurations before they reach production.
            </p>
            <div className="space-y-2">
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
          </div>

          {/* Risk Scoring */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-amber-500/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                <TrendingUp className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/25 font-mono tracking-[0.2em] uppercase mb-0.5">03</p>
                <h3 className="text-sm font-semibold text-white">Risk Scoring</h3>
              </div>
            </div>
            <p className="text-white/40 text-xs leading-relaxed mb-5">
              Every PR gets a risk score based on change complexity, blast radius, and historical patterns.
            </p>
            <div className="flex items-end gap-1 h-10">
              {[35, 60, 28, 75, 50, 88, 42, 70, 55, 92].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{ height: `${h}%`, background: `rgba(245,158,11,${0.15 + (h / 100) * 0.55})` }}
                />
              ))}
            </div>
          </div>

          {/* Team Analytics */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-amber-500/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                <BarChart3 className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/25 font-mono tracking-[0.2em] uppercase mb-0.5">04</p>
                <h3 className="text-sm font-semibold text-white">Team Analytics</h3>
              </div>
            </div>
            <p className="text-white/40 text-xs leading-relaxed mb-5">
              Track review response times, merge velocity, contributor health, and quality trends across your org.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Avg review time", val: "1.8h", delta: "↓ 43%" },
                { label: "Merge velocity", val: "12/day", delta: "↑ 28%" },
              ].map((m) => (
                <div key={m.label} className="rounded-lg bg-white/5 border border-white/5 p-3">
                  <p className="text-[9px] text-white/30 uppercase tracking-wide mb-1.5">{m.label}</p>
                  <p className="text-sm font-bold text-white leading-none mb-1">{m.val}</p>
                  <p className="text-[10px] text-emerald-400 font-medium">{m.delta}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Review Policies */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-amber-500/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                <GitMerge className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/25 font-mono tracking-[0.2em] uppercase mb-0.5">05</p>
                <h3 className="text-sm font-semibold text-white">Review Policies</h3>
              </div>
            </div>
            <p className="text-white/40 text-xs leading-relaxed mb-5">
              Define rules: require N approvals, block merges on critical severity, enforce review time SLAs.
            </p>
            <div className="space-y-2">
              {[
                { rule: "Block merge on Critical", on: true },
                { rule: "Require 2 approvals", on: true },
                { rule: "Max review time 24h", on: false },
              ].map((r) => (
                <div key={r.rule} className="flex items-center justify-between rounded-lg bg-white/5 border border-white/5 px-3 py-2">
                  <span className="text-[11px] text-white/50">{r.rule}</span>
                  <div className={cn("h-4 w-7 rounded-full flex items-center px-0.5", r.on ? "bg-amber-500/30 justify-end" : "bg-white/10 justify-start")}>
                    <div className={cn("h-3 w-3 rounded-full", r.on ? "bg-amber-400" : "bg-white/25")} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ──────────────────────────────────────────────────────────────

const testimonials = [
  {
    quote: "Meridian caught a SQL injection vulnerability in a PR that passed our manual review. It pays for itself in one incident prevented.",
    author: "Sarah Chen",
    role: "CTO, Flowbase",
    avatar: "SC",
    stars: 5,
  },
  {
    quote: "We went from 8-hour review cycles to under 2 hours. The AI handles the boilerplate so humans can focus on architecture.",
    author: "Marcus Williams",
    role: "Engineering Lead, Pulsar",
    avatar: "MW",
    stars: 5,
  },
  {
    quote: "The tech debt visualization alone was worth it. We finally have a data-driven way to make the case for refactoring sprints.",
    author: "Priya Nair",
    role: "Staff Engineer, Cascade",
    avatar: "PN",
    stars: 5,
  },
]

// ─── Pricing ──────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For individuals and small teams getting started.",
    features: [
      "Up to 3 repositories",
      "100 AI reviews / month",
      "Basic security scanning",
      "7-day review history",
      "GitHub integration",
    ],
    cta: "Start free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/ month",
    description: "For growing teams that ship fast.",
    features: [
      "Unlimited repositories",
      "Unlimited AI reviews",
      "Advanced security scanning",
      "Full review history",
      "GitHub + GitLab + Bitbucket",
      "Team analytics dashboard",
      "Tech debt tracking",
      "Review policies",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    href: "/signup?plan=pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large orgs with compliance needs.",
    features: [
      "Everything in Pro",
      "SSO / SAML",
      "Custom AI review policies",
      "Audit logs",
      "Dedicated Slack support",
      "SLA guarantees",
      "On-prem deployment option",
    ],
    cta: "Contact sales",
    href: "mailto:sales@meridian.dev",
    highlighted: false,
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0F1729] pt-32 pb-24">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-8">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-sm text-white/70">Powered by Claude · Now in public beta</span>
              <ChevronRight className="h-3.5 w-3.5 text-white/40" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-6">
              Code review,
              <br />
              <span className="gradient-amber">reimagined.</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
              Stop shipping bugs. Let AI review every pull request, detect security vulnerabilities,
              and track tech debt — automatically, before anything reaches production.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup">
                <Button size="xl" variant="amber" className="gap-2 shadow-xl shadow-amber-500/25">
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="xl"
                  className="bg-white/10 text-white hover:bg-white/20 border border-white/10 gap-2"
                >
                  <Code2 className="h-4 w-4" />
                  See it in action
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
              ))}
              <span className="ml-2 text-sm text-white/50">
                Loved by <strong className="text-white/80">500+</strong> engineering teams
              </span>
            </div>
          </div>

          <DashboardMockup />
        </div>
      </section>

      {/* Logos */}
      <section className="border-b border-white/5 bg-[#0a1020] py-12">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-sm text-white/25 mb-8 tracking-wide">
            Trusted by engineering teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {["Acme Corp", "Streamline", "Vertex", "Cascade", "Pulsar", "Flowbase"].map((name) => (
              <span key={name} className="text-sm font-semibold text-white/15 tracking-widest uppercase">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <FeaturesSection />

      {/* How it works */}
      <section className="py-24 bg-white border-y border-border">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <Badge variant="navy" className="mb-4">How it works</Badge>
            <h2 className="text-4xl font-bold text-[#0F1729] tracking-tight mb-4">
              Set up in minutes.
              <br />
              Works automatically forever.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect your repos",
                description: "Install the Meridian GitHub App in one click. Works with GitHub, GitLab, and Bitbucket.",
                icon: GitPullRequest,
              },
              {
                step: "02",
                title: "AI reviews every PR",
                description: "When a PR is opened, Meridian automatically analyzes the diff and leaves inline comments with severity ratings.",
                icon: Brain,
              },
              {
                step: "03",
                title: "Track & improve",
                description: "Use analytics to identify patterns, track quality trends, and measure your team's improvement over time.",
                icon: TrendingUp,
              },
            ].map((step) => (
              <div key={step.step} className="relative">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F1729]">
                      <step.icon className="h-5 w-5 text-amber-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-500 mb-1">{step.step}</p>
                    <h3 className="text-base font-semibold text-[#0F1729] mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#0F1729] py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "2M+", label: "Reviews processed" },
              { value: "500+", label: "Engineering teams" },
              { value: "47%", label: "Faster review cycles" },
              { value: "99.9%", label: "Uptime SLA" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#FAFAF8]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <Badge variant="navy" className="mb-4">Testimonials</Badge>
            <h2 className="text-4xl font-bold text-[#0F1729] tracking-tight">
              Loved by engineering teams.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.author} className="rounded-2xl border border-border bg-white p-6">
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0F1729]">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white border-y border-border">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <Badge variant="navy" className="mb-4">Pricing</Badge>
            <h2 className="text-4xl font-bold text-[#0F1729] tracking-tight mb-4">
              Simple, transparent pricing.
            </h2>
            <p className="text-muted-foreground text-lg">
              No seat fees. No usage surprises. Start free, scale as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-2xl border p-8 flex flex-col",
                  plan.highlighted
                    ? "bg-[#0F1729] border-[#0F1729] shadow-2xl shadow-[#0F1729]/20"
                    : "bg-white border-border"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge variant="warning" className="shadow-sm">Most popular</Badge>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={cn("text-lg font-semibold mb-1", plan.highlighted ? "text-white" : "text-[#0F1729]")}>
                    {plan.name}
                  </h3>
                  <p className={cn("text-sm mb-4", plan.highlighted ? "text-white/50" : "text-muted-foreground")}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className={cn("text-4xl font-bold", plan.highlighted ? "text-white" : "text-[#0F1729]")}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={cn("text-sm", plan.highlighted ? "text-white/40" : "text-muted-foreground")}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckCircle2 className={cn("h-4 w-4 mt-0.5 shrink-0", plan.highlighted ? "text-amber-400" : "text-emerald-500")} />
                      <span className={cn("text-sm", plan.highlighted ? "text-white/70" : "text-gray-600")}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href}>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "amber" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0F1729] relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-6">
            Ready to ship{" "}
            <span className="gradient-amber">better code</span>?
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Join 500+ engineering teams. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="xl" variant="amber" className="gap-2 shadow-xl shadow-amber-500/30">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="mailto:sales@meridian.dev">
              <Button size="xl" className="bg-white/10 text-white hover:bg-white/20 border border-white/10">
                Talk to sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <LogoMark size={28} />
                <span className="text-base font-semibold text-[#0F1729]">Meridian</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                AI-powered code review and quality platform for modern engineering teams.
              </p>
            </div>

            {[
              {
                heading: "Product",
                links: ["Features", "Pricing", "Changelog", "Roadmap"],
              },
              {
                heading: "Company",
                links: ["About", "Blog", "Careers", "Press"],
              },
              {
                heading: "Legal",
                links: ["Privacy", "Terms", "Security", "DPA"],
              },
            ].map((col) => (
              <div key={col.heading}>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
                  {col.heading}
                </p>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-[#0F1729] transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Meridian, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Made with ♥ for developers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
