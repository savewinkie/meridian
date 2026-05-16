"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Globe, ArrowLeft, Search, AlertTriangle, Shield, Gauge,
  Code2, Eye, CheckCircle2, AlertCircle, Sparkles,
  Download, RefreshCw, ChevronRight, ExternalLink, Loader2,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryIssue {
  severity: "Critical" | "High" | "Medium" | "Low"
  title: string
  description: string
  fix: string
}

interface Category {
  name: string
  icon: string
  score: number
  issues: CategoryIssue[]
}

interface WebsiteResult {
  url: string
  title: string
  overallScore: number
  categories: Category[]
  summary: string
  fixedHtml: string
}

// ─── Config ────────────────────────────────────────────────────────────────────

const SEV = {
  Critical: { badge: "bg-red-500/15 text-red-400", bar: "bg-red-500" },
  High:     { badge: "bg-orange-500/15 text-orange-400", bar: "bg-orange-500" },
  Medium:   { badge: "bg-amber-500/15 text-amber-400", bar: "bg-amber-500" },
  Low:      { badge: "bg-blue-500/15 text-blue-400", bar: "bg-blue-500" },
}

const ICON_MAP: Record<string, any> = {
  code: Code2, palette: Code2, zap: AlertCircle,
  gauge: Gauge, search: Search, shield: Shield, eye: Eye,
}

const LOADING_MESSAGES = [
  "Fetching page source…", "Parsing HTML structure…", "Analyzing CSS patterns…",
  "Auditing JavaScript…", "Checking performance signals…",
  "Scanning for SEO issues…", "Running security audit…",
  "Checking accessibility…", "Generating fixes…", "Finalizing report…",
]

function ScoreBar({ score, delay = 0 }: { score: number; delay?: number }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444"
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
        />
      </div>
      <span className="text-[11px] font-semibold shrink-0 w-7 text-right" style={{ color }}>{score}</span>
    </div>
  )
}

function BigScoreRing({ score }: { score: number }) {
  const r = 38
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444"
  const grade = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Poor"

  return (
    <div className="relative h-[100px] w-[100px]">
      <div className="absolute inset-4 rounded-full blur-xl opacity-25" style={{ backgroundColor: color }} />
      <svg className="relative h-[100px] w-[100px] -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={c} strokeLinecap="round"
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] font-bold leading-none" style={{ color }}>{score}</span>
        <span className="text-[9px] text-white/30">{grade}</span>
      </div>
    </div>
  )
}

export default function WebsiteScannerPage() {
  const [url, setUrl] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [result, setResult] = useState<WebsiteResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const intervalRef = { current: null as ReturnType<typeof setInterval> | null }

  async function scan() {
    if (!url.trim()) return
    setIsScanning(true); setResult(null); setError(null); setStepIdx(0); setActiveCategory(null)
    intervalRef.current = setInterval(() => setStepIdx(i => (i + 1) % LOADING_MESSAGES.length), 1000)
    try {
      const res = await fetch("/api/scan-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      if (data.categories?.length) setActiveCategory(data.categories[0].name)
    } catch (err: any) {
      setError(err.message ?? "Scan failed. Please try again.")
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setIsScanning(false)
    }
  }

  function downloadFixed() {
    if (!result?.fixedHtml) return
    const blob = new Blob([result.fixedHtml], { type: "text/html" })
    const url2 = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url2; a.download = "fixed-index.html"; a.click()
    URL.revokeObjectURL(url2)
  }

  const activeData = result?.categories.find(c => c.name === activeCategory)

  return (
    <div className="flex flex-col h-full bg-[#060b16] overflow-y-auto">

      {/* Title bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center h-11 border-b border-white/[0.05] bg-[#070d1a]/80 backdrop-blur-md shrink-0 px-4"
      >
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/25">
          <Link href="/scanner" className="flex items-center gap-1 text-white/35 hover:text-white/60 transition-colors mr-1">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <Globe className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <span className="text-white/40">meridian</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white/40">scanner</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-blue-400/70">website</span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5 rounded-full bg-purple-500/[0.08] border border-purple-500/[0.15] px-3 py-1">
            <Sparkles className="h-3 w-3 text-purple-400" />
            <span className="text-[10px] font-semibold text-purple-300 tracking-wide">claude-opus-4-7</span>
          </div>
        </div>
        <div className="w-24 flex justify-end">
          {result && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => { setResult(null); setError(null); setUrl("") }}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/35 hover:text-white/60 transition-all"
            >
              <RefreshCw className="h-3 w-3" />New scan
            </motion.button>
          )}
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col p-6 gap-6">

        {/* URL input */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex gap-3 w-full max-w-2xl mx-auto"
        >
          <div className="flex-1 relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && scan()}
              placeholder="https://example.com"
              disabled={isScanning}
              className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all disabled:opacity-50"
            />
          </div>
          <motion.button
            onClick={scan}
            disabled={isScanning || !url.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="group relative overflow-hidden flex items-center gap-2 rounded-xl px-5 h-11 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-500/20"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isScanning
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Search className="h-4 w-4" />
              }
              {isScanning ? "Scanning…" : "Scan Website"}
            </span>
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:translate-x-full transition-transform duration-700" />
          </motion.button>
        </motion.div>

        {/* Scanning state */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="relative mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  className="h-16 w-16 rounded-full"
                  style={{ background: "conic-gradient(from 0deg, transparent 0deg, rgba(59,130,246,0.7) 90deg, transparent 180deg)" }}
                />
                <div className="absolute inset-2 rounded-full bg-[#060b16] flex items-center justify-center">
                  <Globe className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <p className="text-[13px] font-semibold text-white/60 mb-1">Scanning website…</p>
              <p className="text-[11px] text-white/30 mb-4">{LOADING_MESSAGES[stepIdx]}</p>
              <div className="flex gap-1">
                {LOADING_MESSAGES.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ backgroundColor: i <= stepIdx ? "rgb(59,130,246)" : "rgba(255,255,255,0.1)", scaleY: i === stepIdx ? 1.6 : 1 }}
                    transition={{ duration: 0.2 }}
                    className="h-1 w-2 rounded-full origin-center"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && !isScanning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
                <AlertTriangle className="h-7 w-7 text-red-400" />
              </div>
              <p className="text-[13px] font-semibold text-white/60 mb-2">Scan failed</p>
              <p className="text-[11px] text-white/30 max-w-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!result && !isScanning && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/10 border border-blue-500/15 mb-5">
              <Globe className="h-7 w-7 text-blue-400/60" />
            </div>
            <h3 className="text-[13px] font-semibold text-white/50 mb-2">Scan any website</h3>
            <p className="text-[11px] text-white/25 max-w-[280px] leading-relaxed">
              Enter a URL above and Claude Opus 4.7 will audit the HTML, CSS, JavaScript, performance, SEO, security, and accessibility — then generate a fixed version.
            </p>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && !isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-5"
            >
              {/* Overview card */}
              <div className="flex items-center gap-6 rounded-2xl border border-white/[0.08] bg-[#0a0f1c] p-6">
                <BigScoreRing score={result.overallScore} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-[15px] font-semibold text-white truncate">{result.title}</h2>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-white/20 hover:text-white/50 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <p className="text-[11px] text-white/25 mb-3 truncate">{result.url}</p>
                  <p className="text-[12px] text-white/40 leading-relaxed">{result.summary}</p>
                </div>
                <button
                  onClick={downloadFixed}
                  className="shrink-0 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] px-4 py-2.5 text-[12px] font-medium text-white/50 hover:text-white/80 transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download fixed HTML
                </button>
              </div>

              {/* Category scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {result.categories.map((cat, i) => {
                  const Icon = ICON_MAP[cat.icon] ?? Code2
                  const color = cat.score >= 80 ? "#10b981" : cat.score >= 60 ? "#f59e0b" : cat.score >= 40 ? "#f97316" : "#ef4444"
                  return (
                    <motion.button
                      key={cat.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                      className={cn(
                        "flex flex-col gap-2 rounded-xl border p-4 text-left transition-all",
                        activeCategory === cat.name
                          ? "border-white/20 bg-white/[0.06]"
                          : "border-white/[0.07] bg-[#0a0f1c] hover:border-white/[0.12] hover:bg-white/[0.04]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="h-4 w-4 text-white/40" />
                        <span className="text-[13px] font-bold" style={{ color }}>{cat.score}</span>
                      </div>
                      <p className="text-[11px] font-medium text-white/60">{cat.name}</p>
                      <ScoreBar score={cat.score} delay={i * 0.05 + 0.3} />
                      {cat.issues.length > 0 && (
                        <p className="text-[10px] text-white/25">{cat.issues.length} issue{cat.issues.length !== 1 ? "s" : ""}</p>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Category detail */}
              <AnimatePresence mode="wait">
                {activeData && (
                  <motion.div
                    key={activeData.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-2xl border border-white/[0.08] bg-[#0a0f1c] overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.05]">
                      <h3 className="text-[13px] font-semibold text-white/70">{activeData.name}</h3>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/30">
                        {activeData.issues.length} issues
                      </span>
                    </div>
                    {activeData.issues.length === 0 ? (
                      <div className="flex items-center gap-2 px-5 py-6">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-[12px] text-white/40">No issues found in this category.</span>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/[0.04]">
                        {activeData.issues.map((issue, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="relative p-4"
                          >
                            <div className={cn("absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full", SEV[issue.severity].bar)} />
                            <div className="pl-4">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-md", SEV[issue.severity].badge)}>
                                  {issue.severity}
                                </span>
                                <span className="text-[11.5px] font-semibold text-white/75">{issue.title}</span>
                              </div>
                              <p className="text-[10.5px] text-white/35 leading-relaxed mb-2">{issue.description}</p>
                              <div className="flex items-start gap-2 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/[0.13] px-3 py-2">
                                <CheckCircle2 className="h-3 w-3 text-emerald-500/60 shrink-0 mt-px" />
                                <p className="text-[10px] text-emerald-400/65 leading-relaxed">
                                  <span className="font-semibold text-emerald-400/85">Fix: </span>{issue.fix}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
