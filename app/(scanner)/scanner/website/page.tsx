"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Globe, ArrowLeft, Search, AlertTriangle, Shield, Gauge,
  Code2, Eye, CheckCircle2, AlertCircle, Sparkles, Info,
  RefreshCw, ChevronRight, ExternalLink, Loader2, Zap, Palette,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryIssue {
  severity: "Critical" | "High" | "Medium" | "Low"
  title: string; description: string; fix: string
}
interface Category { name: string; icon: string; score: number; issues: CategoryIssue[] }
interface WebsiteResult {
  url: string; title: string; overallScore: number; categories: Category[]; summary: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SEV_CFG = {
  Critical: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", bar: "bg-red-500", icon: AlertCircle, dot: "bg-red-500" },
  High:     { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", bar: "bg-orange-500", icon: AlertTriangle, dot: "bg-orange-500" },
  Medium:   { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", bar: "bg-amber-400", icon: AlertTriangle, dot: "bg-amber-400" },
  Low:      { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", bar: "bg-blue-400", icon: Info, dot: "bg-blue-400" },
}

const ICON_MAP: Record<string, any> = {
  code: Code2, palette: Palette, zap: Zap,
  gauge: Gauge, search: Search, shield: Shield, eye: Eye,
}

const STEPS = [
  "Fetching page source…",
  "Parsing HTML structure…",
  "Auditing performance metrics…",
  "Scanning for SEO signals…",
  "Running security audit…",
  "Checking accessibility…",
  "Generating full report…",
]

function scoreColor(s: number) {
  if (s >= 80) return "#10b981"
  if (s >= 60) return "#f59e0b"
  if (s >= 40) return "#f97316"
  return "#ef4444"
}

// ─── Score Ring (big) ─────────────────────────────────────────────────────────

function BigScoreRing({ score }: { score: number }) {
  const r = 38; const c = 2 * Math.PI * r; const offset = c - (score / 100) * c
  const color = scoreColor(score)
  const grade = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Poor"
  return (
    <div className="relative h-[96px] w-[96px] shrink-0">
      <div className="absolute inset-4 rounded-full blur-xl opacity-20" style={{ backgroundColor: color }}/>
      <svg className="relative h-[96px] w-[96px] -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
        <motion.circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={c} strokeLinecap="round"
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] font-bold leading-none" style={{ color }}>{score}</span>
        <span className="text-[9px] text-white/30 mt-0.5">{grade}</span>
      </div>
    </div>
  )
}

// ─── Mini Score Ring ──────────────────────────────────────────────────────────

function MiniScoreRing({ score }: { score: number }) {
  const size = 36; const r = size / 2 - 3.5
  const circ = 2 * Math.PI * r; const offset = circ - (score / 100) * circ
  const color = scoreColor(score)
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}/>
      </svg>
      <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{score}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WebsiteScannerPage() {
  const [url, setUrl] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [result, setResult] = useState<WebsiteResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [freeUsed, setFreeUsed] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    setFreeUsed(localStorage.getItem("qualix_free_website") === "1")
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient().auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session))
    })
  }, [])

  const blocked = freeUsed && isLoggedIn === false

  async function scan() {
    if (!url.trim() || isScanning || blocked) return
    setIsScanning(true); setResult(null); setError(null); setStepIdx(0); setActiveCategory(null)
    const interval = setInterval(() => setStepIdx(i => Math.min(i + 1, STEPS.length - 1)), 3200)
    try {
      const res = await fetch("/api/scan-website", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      if (data.categories?.length) setActiveCategory(data.categories[0].name)
      if (isLoggedIn === false) {
        localStorage.setItem("qualix_free_website", "1")
        setFreeUsed(true)
      }
    } catch (err: any) {
      setError(err.message ?? "Scan failed. Please try again.")
    } finally {
      clearInterval(interval); setIsScanning(false)
    }
  }

  const activeData = result?.categories.find(c => c.name === activeCategory)
  const showEmpty = !isScanning && !result && !error
  const totalIssues = result?.categories.reduce((s, c) => s + c.issues.length, 0) ?? 0
  const criticalIssues = result?.categories.reduce((s, c) => s + c.issues.filter(i => i.severity === "Critical").length, 0) ?? 0

  return (
    <div className="flex flex-col h-full bg-[#060b16]">

      {/* Title bar */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center h-11 border-b border-white/[0.05] bg-[#070d1a]/80 backdrop-blur-md shrink-0 px-4">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/25">
          <Link href="/scanner" className="flex items-center gap-1 text-white/35 hover:text-white/60 transition-colors mr-1">
            <ArrowLeft className="h-3.5 w-3.5"/>
          </Link>
          <Globe className="h-3.5 w-3.5 text-blue-400 shrink-0"/>
          <span className="text-white/40">meridian</span>
          <ChevronRight className="h-3 w-3"/>
          <span className="text-white/40">scanner</span>
          <ChevronRight className="h-3 w-3"/>
          <span className="text-blue-400/70">website</span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15] px-3 py-1">
            <Sparkles className="h-3 w-3 text-blue-400"/>
            <span className="text-[10px] font-semibold text-blue-300 tracking-wide">claude-sonnet-4-6</span>
          </div>
        </div>
        <div className="w-28 flex justify-end">
          {result && (
            <button onClick={() => { setResult(null); setError(null) }}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/35 hover:text-white/60 transition-all">
              <RefreshCw className="h-3 w-3"/>New scan
            </button>
          )}
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Empty state */}
        <AnimatePresence>
          {showEmpty && (
            <motion.div key="empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center flex-1 px-6 gap-8">
              <div className="text-center">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/[0.08] border border-blue-500/[0.12] mx-auto mb-6">
                  <div className="absolute inset-0 rounded-3xl bg-blue-500/5 blur-xl"/>
                  <Globe className="h-8 w-8 text-blue-400/60 relative"/>
                </div>
                <h2 className="text-[20px] font-bold text-white/80 mb-2">Scan any website</h2>
                <p className="text-[12px] text-white/30 max-w-[340px] leading-relaxed">
                  Enter a URL and Qualix AI audits the HTML, CSS, JavaScript, performance, SEO, security, and accessibility in one go.
                </p>
              </div>

              {blocked ? (
                <div className="w-full max-w-xl rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-6 text-center">
                  <p className="text-sm font-semibold text-white mb-1">Free scan used</p>
                  <p className="text-xs text-white/40 mb-4">Sign up to scan unlimited websites.</p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/signup">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 rounded-2xl px-6 h-10 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/25">
                        Sign up free
                      </motion.button>
                    </Link>
                    <Link href="/login">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 rounded-2xl px-6 h-10 text-sm font-medium text-white/60 hover:text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
                        Sign in
                      </motion.button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 w-full max-w-xl">
                  <div className="flex-1 relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20"/>
                    <input type="text" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && scan()}
                      placeholder="https://example.com" autoFocus
                      className="w-full h-12 bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all"/>
                  </div>
                  <motion.button onClick={scan} disabled={!url.trim()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 rounded-2xl px-6 h-12 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-500/20">
                    <Search className="h-4 w-4"/>Scan
                  </motion.button>
                </div>
              )}

              {/* Free use indicator */}
              {!freeUsed && isLoggedIn === false && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/55">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  1 free scan available — no account needed
                </div>
              )}

              {/* Example domains */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="text-[10px] text-white/20">Try:</span>
                {["vercel.com", "anthropic.com", "github.com"].map(d => (
                  <button key={d} onClick={() => setUrl(`https://${d}`)}
                    className="text-[10px] text-blue-400/50 hover:text-blue-300 border border-blue-500/10 hover:border-blue-500/25 px-2.5 py-1 rounded-full transition-all">
                    {d}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanning */}
        <AnimatePresence>
          {isScanning && (
            <motion.div key="scanning" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center justify-center flex-1 gap-7">
              <div className="relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  className="h-20 w-20 rounded-full"
                  style={{ background: "conic-gradient(from 0deg, transparent 0deg, rgba(59,130,246,0.8) 100deg, transparent 220deg)" }}/>
                <div className="absolute inset-[3px] rounded-full bg-[#060b16] flex items-center justify-center">
                  <Globe className="h-7 w-7 text-blue-400"/>
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[15px] font-semibold text-white/70">Scanning website…</p>
                <motion.p key={stepIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-[12px] text-white/30">{STEPS[stepIdx]}</motion.p>
              </div>
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <motion.div key={i}
                    animate={{ backgroundColor: i <= stepIdx ? "rgb(59,130,246)" : "rgba(255,255,255,0.08)", scale: i === stepIdx ? 1.5 : 1 }}
                    transition={{ duration: 0.3 }} className="h-1.5 w-1.5 rounded-full"/>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && !isScanning && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }} className="flex flex-col items-center justify-center flex-1 gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/15">
                <AlertTriangle className="h-7 w-7 text-red-400"/>
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-white/60 mb-1">Scan failed</p>
                <p className="text-[12px] text-white/30 max-w-sm leading-relaxed">{error}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setError(null)}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] px-4 py-2 text-[12px] text-white/50 hover:text-white/80 transition-all">
                  <RefreshCw className="h-3.5 w-3.5"/>Try again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !isScanning && (
            <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} className="flex flex-col flex-1 overflow-hidden">

              {/* URL bar + Overview */}
              <div className="px-6 pt-5 pb-4 border-b border-white/[0.05] space-y-4 shrink-0">
                {/* URL input */}
                <div className="flex gap-2 w-full max-w-2xl">
                  <div className="flex-1 relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20"/>
                    <input type="text" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && scan()}
                      className="w-full h-9 bg-white/[0.04] border border-white/[0.07] rounded-xl pl-9 pr-4 text-xs text-white/60 focus:outline-none focus:border-blue-500/30 transition-all"/>
                  </div>
                  <button onClick={scan}
                    className="flex items-center gap-1.5 rounded-xl px-4 h-9 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors">
                    <RefreshCw className="h-3 w-3"/>Rescan
                  </button>
                </div>

                {/* Overview card */}
                <div className="flex items-center gap-5 rounded-2xl border border-white/[0.08] bg-[#0a0f1c] p-5">
                  <BigScoreRing score={result.overallScore}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-[15px] font-semibold text-white/80 truncate">{result.title}</h2>
                      <a href={result.url} target="_blank" rel="noopener noreferrer"
                        className="shrink-0 text-white/20 hover:text-white/50 transition-colors">
                        <ExternalLink className="h-3.5 w-3.5"/>
                      </a>
                    </div>
                    <p className="text-[10px] text-white/25 mb-2.5 font-mono truncate">{result.url}</p>
                    <p className="text-[12px] text-white/40 leading-relaxed line-clamp-2">{result.summary}</p>
                    <div className="flex items-center gap-2 mt-3">
                      {criticalIssues > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/15 text-red-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block"/>{criticalIssues} critical
                        </span>
                      )}
                      <span className="text-[10px] text-white/20">{totalIssues} total issues across {result.categories.length} categories</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two-panel: category list + detail */}
              <div className="flex flex-1 min-h-0">

                {/* Left: category list */}
                <div className="w-56 shrink-0 border-r border-white/[0.05] overflow-y-auto py-2 px-2">
                  {result.categories.map((cat, i) => {
                    const Icon = ICON_MAP[cat.icon] ?? Code2
                    const color = scoreColor(cat.score)
                    const isActive = activeCategory === cat.name
                    const catCritical = cat.issues.filter(i => i.severity === "Critical").length
                    return (
                      <motion.button key={cat.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }} onClick={() => setActiveCategory(cat.name)}
                        className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-all",
                          isActive ? "bg-white/[0.06] border border-white/[0.10]" : "hover:bg-white/[0.03] border border-transparent"
                        )}>
                        <MiniScoreRing score={cat.score}/>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-[11px] font-semibold truncate transition-colors", isActive ? "text-white/80" : "text-white/50")}>{cat.name}</p>
                          <p className="text-[9px] text-white/20 mt-0.5">
                            {cat.issues.length === 0 ? "No issues" : `${cat.issues.length} issue${cat.issues.length !== 1 ? "s" : ""}`}
                            {catCritical > 0 && <span className="text-red-400/60 ml-1">· {catCritical} critical</span>}
                          </p>
                        </div>
                        {isActive && <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: color }}/>}
                      </motion.button>
                    )
                  })}
                </div>

                {/* Right: issue detail */}
                <div className="flex-1 overflow-y-auto p-5">
                  <AnimatePresence mode="wait">
                    {activeData && (
                      <motion.div key={activeData.name} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2, ease: [0.22,1,0.36,1] }}>

                        {/* Category header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.07]">
                            {(() => { const Icon = ICON_MAP[activeData.icon] ?? Code2; return <Icon className="h-4 w-4 text-white/40"/> })()}
                          </div>
                          <div>
                            <h3 className="text-[14px] font-semibold text-white/75">{activeData.name}</h3>
                            <p className="text-[10px] text-white/25">
                              Score: <span style={{ color: scoreColor(activeData.score) }} className="font-bold">{activeData.score}/100</span>
                              {activeData.issues.length > 0 && <> · {activeData.issues.length} issue{activeData.issues.length !== 1 ? "s" : ""} found</>}
                            </p>
                          </div>
                        </div>

                        {/* No issues */}
                        {activeData.issues.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-white/[0.05] bg-[#0a0f1c]">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/15 mb-3">
                              <CheckCircle2 className="h-5 w-5 text-emerald-400"/>
                            </div>
                            <p className="text-[13px] font-semibold text-white/60">No issues found</p>
                            <p className="text-[11px] text-white/25 mt-1">This category looks great!</p>
                          </div>
                        )}

                        {/* Issues */}
                        <div className="space-y-3">
                          {activeData.issues.map((issue, i) => {
                            const sev = SEV_CFG[issue.severity] ?? SEV_CFG.Low
                            return (
                              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05, duration: 0.3, ease: [0.22,1,0.36,1] }}
                                className={cn("rounded-2xl border p-5", sev.bg, sev.border)}>
                                <div className="flex items-start gap-3">
                                  <sev.icon className={cn("h-4 w-4 mt-0.5 shrink-0", sev.text)}/>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                      <span className={cn("text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full", sev.bg, sev.border, sev.text, "border")}>
                                        {issue.severity}
                                      </span>
                                    </div>
                                    <p className="text-[13px] font-semibold text-white/80 mb-1.5">{issue.title}</p>
                                    <p className="text-[12px] text-white/40 leading-relaxed mb-3">{issue.description}</p>
                                    <div className="flex items-start gap-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.12] px-3.5 py-2.5">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/60 shrink-0 mt-0.5"/>
                                      <p className="text-[11px] text-emerald-400/70 leading-relaxed">
                                        <span className="font-semibold text-emerald-400/90">Fix: </span>{issue.fix}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
