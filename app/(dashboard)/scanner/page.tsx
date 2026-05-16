"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Zap, Loader2, Copy, Check, ChevronDown, AlertTriangle,
  Shield, Bug, Gauge, Code2, Brain, CheckCircle2, AlertCircle,
  Sparkles, Download, RefreshCw, FileCode2, ChevronRight,
  Terminal, Play,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Issue {
  line: number | null
  severity: "Critical" | "High" | "Medium" | "Low"
  type: "Security" | "Bug" | "Performance" | "Logic" | "Style"
  title: string
  description: string
  fix: string
}

interface ScanResult {
  language: string
  score: { before: number; after: number }
  summary: string
  issues: Issue[]
  fixedCode: string
}

// ─── Config ────────────────────────────────────────────────────────────────────

const SEV = {
  Critical: {
    color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20",
    badge: "bg-red-500/15 text-red-400", bar: "bg-red-500", glow: "shadow-red-500/20", ring: "#ef4444",
  },
  High: {
    color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20",
    badge: "bg-orange-500/15 text-orange-400", bar: "bg-orange-500", glow: "shadow-orange-500/20", ring: "#f97316",
  },
  Medium: {
    color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20",
    badge: "bg-amber-500/15 text-amber-400", bar: "bg-amber-500", glow: "shadow-amber-500/20", ring: "#f59e0b",
  },
  Low: {
    color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20",
    badge: "bg-blue-500/15 text-blue-400", bar: "bg-blue-500", glow: "shadow-blue-500/20", ring: "#3b82f6",
  },
}

const TYPE_ICON: Record<string, any> = {
  Security: Shield, Bug, Performance: Gauge, Logic: Brain, Style: Code2,
}

const LANGUAGES = [
  "Auto-detect", "JavaScript", "TypeScript", "Python", "Java", "C++", "C#",
  "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "SQL", "Bash", "YAML", "JSON", "HTML", "CSS",
]

const LOADING_STEPS = [
  "Loading claude-opus-4-7…", "Parsing code structure…", "Analyzing logic flow…",
  "Scanning for vulnerabilities…", "Cross-referencing OWASP Top 10…",
  "Detecting performance issues…", "Identifying anti-patterns…",
  "Generating optimal fixes…", "Validating corrections…", "Finalizing report…",
]

const PLACEHOLDER = `async function getUser(userId) {
  const query = \`SELECT * FROM users WHERE id = \${userId}\`
  const result = await db.query(query)
  console.log("User password:", result[0].password)
  return result[0]
}

function verifyToken(token) {
  const decoded = jwt.decode(token)
  if (decoded.exp < Date.now()) return null
  return decoded
}

const API_KEY = "sk_live_abc123secret"`

// ─── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, label, delay = 0 }: { score: number; label: string; delay?: number }) {
  const r = 26
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444"
  const grade = score >= 80 ? "Excellent" : score >= 60 ? "Fair" : score >= 40 ? "Poor" : "Critical"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 200 }}
      className="flex flex-col items-center gap-1.5"
    >
      <div className="relative h-[68px] w-[68px]">
        {/* Glow behind ring */}
        <div
          className="absolute inset-2 rounded-full blur-lg opacity-30"
          style={{ backgroundColor: color }}
        />
        <svg className="relative h-[68px] w-[68px] -rotate-90" viewBox="0 0 68 68">
          <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
          <motion.circle
            cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={c} strokeLinecap="round"
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, delay: delay + 0.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[17px] font-bold leading-none" style={{ color }}>{score}</span>
          <span className="text-[8px] text-white/25">/100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-semibold text-white/60">{label}</p>
        <p className="text-[10px]" style={{ color }}>{grade}</p>
      </div>
    </motion.div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ScannerPage() {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("Auto-detect")
  const [langOpen, setLangOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"issues" | "fixed">("issues")
  const [copied, setCopied] = useState(false)
  const [visibleIssues, setVisibleIssues] = useState(0)
  const [sevFilter, setSevFilter] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lines = code.split("\n")

  useEffect(() => {
    if (result) {
      setVisibleIssues(0)
      result.issues.forEach((_, i) => setTimeout(() => setVisibleIssues(i + 1), i * 110 + 180))
    }
  }, [result])

  async function scan() {
    if (!code.trim()) return
    setIsScanning(true); setResult(null); setError(null); setStepIdx(0); setSevFilter(null)
    intervalRef.current = setInterval(() => setStepIdx((i) => (i + 1) % LOADING_STEPS.length), 900)
    try {
      const res = await fetch("/api/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: language === "Auto-detect" ? "auto" : language }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data); setActiveTab("issues")
    } catch (err: any) {
      setError(err.message ?? "Scan failed. Please try again.")
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setIsScanning(false)
    }
  }

  async function copyFixed() {
    if (!result?.fixedCode) return
    await navigator.clipboard.writeText(result.fixedCode)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  function downloadFixed() {
    if (!result?.fixedCode) return
    const ext: Record<string, string> = {
      javascript: "js", typescript: "ts", python: "py", java: "java", go: "go",
      rust: "rs", ruby: "rb", php: "php", sql: "sql", bash: "sh", yaml: "yaml",
      html: "html", css: "css",
    }
    const lang = result.language.toLowerCase()
    const blob = new Blob([result.fixedCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `fixed.${ext[lang] ?? "txt"}`; a.click()
    URL.revokeObjectURL(url)
  }

  const filteredIssues = result?.issues.filter(i => !sevFilter || i.severity === sevFilter) ?? []
  const sevCounts = result
    ? (["Critical", "High", "Medium", "Low"] as const)
        .map((s) => ({ sev: s, count: result.issues.filter((i) => i.severity === s).length }))
        .filter((x) => x.count > 0)
    : []
  const progress = (stepIdx / (LOADING_STEPS.length - 1)) * 100

  return (
    <div className="flex flex-col h-full bg-[#060b16]">

      {/* ── Title bar ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center h-11 border-b border-white/[0.05] bg-[#070d1a]/80 backdrop-blur-md shrink-0 px-4"
      >
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/25">
          <Brain className="h-3.5 w-3.5 text-purple-400 shrink-0" />
          <span className="text-white/40">meridian</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white/40">scanner</span>
          {language !== "Auto-detect" && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white/60">{language.toLowerCase()}</span>
            </>
          )}
        </div>

        <div className="flex-1 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-1.5 rounded-full bg-purple-500/[0.08] border border-purple-500/[0.15] px-3 py-1"
          >
            <Sparkles className="h-3 w-3 text-purple-400" />
            <span className="text-[10px] font-semibold text-purple-300 tracking-wide">claude-opus-4-7</span>
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          {result && (
            <motion.button
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => { setResult(null); setError(null); setCode("") }}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/35 hover:text-white/60 transition-all"
            >
              <RefreshCw className="h-3 w-3" />New scan
            </motion.button>
          )}
          {/* Language picker */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/50 hover:text-white/70 transition-all"
            >
              <Code2 className="h-3 w-3 text-white/25" />
              {language}
              <ChevronDown className="h-3 w-3 text-white/25" />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl border border-white/[0.08] bg-[#0d1525]/95 backdrop-blur-xl shadow-2xl shadow-black/60 z-50 overflow-hidden"
                >
                  <div className="max-h-56 overflow-y-auto py-1.5 px-1.5">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { setLanguage(lang); setLangOpen(false) }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-[11px] rounded-lg transition-colors",
                          lang === language
                            ? "bg-amber-500/10 text-amber-400 font-semibold"
                            : "text-white/45 hover:bg-white/[0.05] hover:text-white/70"
                        )}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ── Split workspace ────────────────────────────────────────────────── */}
      <div className="flex flex-1 gap-3 p-3 min-h-0">

        {/* ── Editor panel ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col w-[55%] rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
          style={{
            boxShadow: isScanning
              ? "0 0 0 1px rgba(245,158,11,0.25), 0 25px 50px rgba(0,0,0,0.5)"
              : "0 0 0 1px rgba(255,255,255,0.07), 0 25px 50px rgba(0,0,0,0.5)",
            transition: "box-shadow 0.5s ease",
          }}
        >
          {/* Animated scanning border beam */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none z-20 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                  style={{ width: "60%" }}
                  animate={{ left: ["-60%", "100%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute bottom-0 right-0 h-[2px] bg-gradient-to-l from-transparent via-amber-400/60 to-transparent"
                  style={{ width: "60%" }}
                  animate={{ right: ["-60%", "100%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Panel tab strip */}
          <div className="flex items-center h-9 border-b border-white/[0.06] bg-[#0a0d14] shrink-0 px-3">
            <div className="flex gap-1.5 mr-3">
              <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#27c840]" />
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.05] border border-white/[0.06] px-2.5 py-1">
              <FileCode2 className="h-3 w-3 text-amber-400/60" />
              <span className="text-[10px] font-medium text-white/50">
                untitled{language !== "Auto-detect" ? `.${language.toLowerCase().slice(0, 2)}` : ""}
              </span>
            </div>
          </div>

          {/* Code editor */}
          <div className="flex-1 flex font-mono text-[12.5px] leading-[1.65] overflow-y-auto bg-[#0d1117] min-h-[160px]">
            <div
              className="select-none text-right border-r border-white/[0.04] py-4 shrink-0 text-[11px]"
              style={{ minWidth: "3.25rem", paddingLeft: "0.5rem", paddingRight: "0.75rem", color: "rgba(255,255,255,0.12)" }}
            >
              {lines.map((_, i) => <div key={i} className="leading-[1.65]">{i + 1}</div>)}
            </div>
            <textarea
              value={code}
              onChange={(e) => { setCode(e.target.value); if (result) { setResult(null); setError(null) } }}
              spellCheck={false}
              className="flex-1 bg-transparent text-white/80 resize-none outline-none px-4 py-4 placeholder:text-white/[0.12] caret-amber-400"
              rows={Math.max(lines.length, 18)}
              placeholder={PLACEHOLDER}
            />
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] bg-[#080c14] shrink-0">
            <div className="flex items-center gap-3 text-[10px] font-mono text-white/20">
              <span className="flex items-center gap-1">
                <Terminal className="h-3 w-3" />
                {lines.length} ln
              </span>
              <span>·</span>
              <span>{code.length.toLocaleString()} chars</span>
              {language !== "Auto-detect" && <><span>·</span><span className="text-white/35">{language}</span></>}
            </div>

            {/* Scan button with shimmer */}
            <motion.button
              onClick={scan}
              disabled={isScanning || !code.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "group relative overflow-hidden flex items-center gap-2 rounded-xl px-5 py-2 text-[12.5px] font-semibold text-white transition-all",
                "disabled:opacity-30 disabled:cursor-not-allowed",
                code.trim() && !isScanning
                  ? "bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/25"
                  : "bg-amber-500/50"
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isScanning
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                  : <Play className="h-3.5 w-3.5 shrink-0 fill-white" />
                }
                <span className="whitespace-nowrap max-w-[200px] truncate">
                  {isScanning ? LOADING_STEPS[stepIdx] : "Scan & Fix with Opus 4.7"}
                </span>
              </span>
              {/* Shimmer */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
              {/* Glow pulse when ready */}
              {code.trim() && !isScanning && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-amber-400/20"
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </motion.button>
          </div>

          {/* Progress bar */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-[49px] left-0 right-0 h-[2px] bg-white/[0.04]"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Results panel ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col flex-1 rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 25px 50px rgba(0,0,0,0.5)" }}
        >
          {/* Panel tabs */}
          <div className="flex items-center h-9 border-b border-white/[0.06] bg-[#0a0d14] shrink-0 px-1.5">
            {result ? (
              <>
                {(["issues", "fixed"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 h-full text-[11px] font-medium rounded-md transition-all",
                      activeTab === tab ? "text-white" : "text-white/35 hover:text-white/60"
                    )}
                  >
                    {tab === "issues" ? <AlertCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                    {tab === "issues" ? "Issues" : "Fixed Code"}
                    {tab === "issues" && (
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                        activeTab === "issues" ? "bg-amber-500/20 text-amber-400" : "bg-white/[0.07] text-white/30"
                      )}>
                        {result.issues.length}
                      </span>
                    )}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-md bg-white/[0.06]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </>
            ) : (
              <span className="px-3 text-[11px] text-white/20 font-medium">Results</span>
            )}
          </div>

          {/* Content area */}
          <div className="flex flex-col flex-1 overflow-hidden bg-[#0a0f1c]">

            {/* Empty state */}
            {!result && !isScanning && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center flex-1 p-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="relative mb-6"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/15 to-purple-900/10 border border-purple-500/15 shadow-xl shadow-purple-500/5">
                    <Brain className="h-9 w-9 text-purple-400/60" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -inset-3 rounded-3xl border border-purple-500/10"
                  />
                  <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 shadow-lg shadow-amber-500/30">
                    <Zap className="h-3.5 w-3.5 text-white" />
                  </div>
                </motion.div>
                <h3 className="text-[13px] font-semibold text-white/60 mb-1.5">Ready to analyze</h3>
                <p className="text-[11px] text-white/25 max-w-[240px] leading-relaxed mb-7">
                  Paste any code on the left. Claude Opus 4.7 will find every bug, vulnerability, and anti-pattern — then fix them all.
                </p>
                <div className="grid grid-cols-2 gap-2 w-full max-w-[240px]">
                  {[
                    { icon: Shield, label: "Security holes", color: "text-red-400", bg: "bg-red-500/10 border-red-500/15" },
                    { icon: Bug, label: "Logic bugs", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/15" },
                    { icon: Gauge, label: "Performance", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/15" },
                    { icon: CheckCircle2, label: "Auto-fix", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/15" },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.07 }}
                      className={cn("flex items-center gap-2 rounded-xl border px-3 py-2.5", item.bg)}
                    >
                      <item.icon className={cn("h-3.5 w-3.5 shrink-0", item.color)} />
                      <span className="text-[10px] font-medium text-white/40">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Scanning state */}
            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center flex-1 p-10 text-center"
              >
                <div className="relative mb-7">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="h-16 w-16 rounded-full"
                    style={{
                      background: "conic-gradient(from 0deg, transparent 0deg, rgba(168,85,247,0.6) 90deg, transparent 180deg)",
                    }}
                  />
                  <div className="absolute inset-2 rounded-full bg-[#0a0f1c] flex items-center justify-center">
                    <Brain className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
                <p className="text-[13px] font-semibold text-white/60 mb-1">Analyzing your code…</p>
                <p className="text-[11px] text-white/30 mb-5">{LOADING_STEPS[stepIdx]}</p>
                {/* Progress dots */}
                <div className="flex gap-1 mb-6">
                  {LOADING_STEPS.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        backgroundColor: i <= stepIdx ? "rgb(168,85,247)" : "rgba(255,255,255,0.1)",
                        scaleY: i === stepIdx ? 1.6 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                      className="h-1 w-2 rounded-full origin-center"
                    />
                  ))}
                </div>
                {/* Step list */}
                <div className="w-full max-w-[220px] space-y-1.5 text-left">
                  {LOADING_STEPS.slice(0, stepIdx + 1).map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-[10px]"
                    >
                      <CheckCircle2 className={cn("h-3 w-3 shrink-0", i < stepIdx ? "text-emerald-500" : "text-purple-400")} />
                      <span className={i < stepIdx ? "text-white/40" : "text-white/20"}>{step}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Error state */}
            {error && !isScanning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center flex-1 p-10 text-center"
              >
                {error.includes("ANTHROPIC_API_KEY") ? (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4 shadow-lg shadow-amber-500/10">
                      <Sparkles className="h-7 w-7 text-amber-400" />
                    </div>
                    <p className="text-[13px] font-semibold text-white/70 mb-2">API key required</p>
                    <p className="text-[11px] text-white/30 mb-5 max-w-[240px] leading-relaxed">
                      Add your Anthropic API key to <code className="text-amber-400/70 bg-amber-500/10 px-1 rounded">.env.local</code> and restart the dev server.
                    </p>
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] px-4 py-3 text-left font-mono text-[10px] text-white/40 mb-4 w-full max-w-[280px]">
                      <p className="text-white/20 mb-1"># .env.local</p>
                      <p>ANTHROPIC_API_KEY=<span className="text-amber-400/70">sk-ant-your-key</span></p>
                    </div>
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-amber-500/70 hover:text-amber-400 transition-colors underline underline-offset-2"
                    >
                      Get your API key →
                    </a>
                  </>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 mb-4 shadow-lg shadow-red-500/10">
                      <AlertTriangle className="h-7 w-7 text-red-400" />
                    </div>
                    <p className="text-[13px] font-semibold text-white/60 mb-1">Scan failed</p>
                    <p className="text-[11px] text-white/30 mb-5 max-w-[220px]">{error}</p>
                    <button
                      onClick={scan}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] px-4 py-2 text-[11px] font-medium text-white/40 hover:text-white/70 transition-all"
                    >
                      Try again
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {/* Results */}
            {result && !isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col flex-1 overflow-hidden"
              >
                {/* Score bar */}
                <div className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.05] bg-[#0d1525]/40 shrink-0">
                  <ScoreRing score={result.score.before} label="Before" delay={0} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className={cn(
                          "text-[13px] font-bold",
                          result.score.after - result.score.before >= 30 ? "text-emerald-400" : "text-amber-400"
                        )}
                      >
                        +{result.score.after - result.score.before} pts
                      </motion.span>
                      <span className="text-[9px] font-mono text-white/25 border border-white/[0.07] rounded-md px-1.5 py-0.5 bg-white/[0.03]">
                        {result.language}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/35 leading-relaxed line-clamp-3">{result.summary}</p>
                  </div>
                  <ScoreRing score={result.score.after} label="After" delay={0.15} />
                </div>

                {/* Issues tab */}
                <AnimatePresence mode="wait">
                  {activeTab === "issues" && (
                    <motion.div
                      key="issues"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col flex-1 overflow-hidden"
                    >
                      {sevCounts.length > 0 && (
                        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/[0.05] flex-wrap shrink-0">
                          <button
                            onClick={() => setSevFilter(null)}
                            className={cn(
                              "text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all",
                              !sevFilter ? "bg-white/[0.1] text-white" : "text-white/30 hover:text-white/55 hover:bg-white/[0.04]"
                            )}
                          >
                            All ({result.issues.length})
                          </button>
                          {sevCounts.map(({ sev, count }) => (
                            <button
                              key={sev}
                              onClick={() => setSevFilter(sevFilter === sev ? null : sev)}
                              className={cn(
                                "text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all",
                                sevFilter === sev
                                  ? SEV[sev].badge
                                  : "text-white/30 hover:text-white/55 hover:bg-white/[0.04]"
                              )}
                            >
                              {sev} ({count})
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex-1 overflow-y-auto space-y-0 divide-y divide-white/[0.04]">
                        {filteredIssues.map((issue, i) => {
                          const cfg = SEV[issue.severity]
                          const Icon = TYPE_ICON[issue.type] ?? AlertCircle
                          const globalIdx = result.issues.indexOf(issue)
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: 8 }}
                              animate={globalIdx < visibleIssues ? { opacity: 1, x: 0 } : { opacity: 0, x: 8 }}
                              whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                              transition={{ duration: 0.2 }}
                              className="relative p-4 cursor-default"
                            >
                              {/* Left severity bar */}
                              <motion.div
                                initial={{ scaleY: 0 }}
                                animate={globalIdx < visibleIssues ? { scaleY: 1 } : { scaleY: 0 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                                className={cn("absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full origin-top", cfg.bar)}
                              />
                              <div className="flex items-start gap-3 pl-3">
                                <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border mt-0.5", cfg.bg, cfg.border)}>
                                  <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-md", cfg.badge)}>
                                      {issue.severity}
                                    </span>
                                    <span className="text-[9px] text-white/20 bg-white/[0.04] px-1.5 py-0.5 rounded-md">
                                      {issue.type}
                                    </span>
                                    {issue.line != null && (
                                      <span className="text-[9px] text-white/20 font-mono">:{issue.line}</span>
                                    )}
                                  </div>
                                  <p className="text-[11.5px] font-semibold text-white/75 mb-1">{issue.title}</p>
                                  <p className="text-[10.5px] text-white/35 leading-relaxed mb-2.5">{issue.description}</p>
                                  <div className="flex items-start gap-2 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/[0.15] px-3 py-2">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500/70 shrink-0 mt-px" />
                                    <p className="text-[10px] text-emerald-400/70 leading-relaxed">
                                      <span className="font-semibold text-emerald-400/90">Fix: </span>{issue.fix}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                        {filteredIssues.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <CheckCircle2 className="h-7 w-7 text-emerald-500/40 mb-2" />
                            <p className="text-[11px] text-white/25">No {sevFilter ?? ""} issues found</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Fixed code tab */}
                  {activeTab === "fixed" && (
                    <motion.div
                      key="fixed"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col flex-1 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05] bg-[#080c14] shrink-0">
                        <span className="text-[10px] text-white/20 font-mono">
                          {result.language.toLowerCase()} · fixed
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={downloadFixed}
                            className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium text-white/30 hover:text-white/55 transition-all"
                          >
                            <Download className="h-2.5 w-2.5" />Download
                          </button>
                          <button
                            onClick={copyFixed}
                            className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium text-white/30 hover:text-white/55 transition-all"
                          >
                            {copied
                              ? <><Check className="h-2.5 w-2.5 text-emerald-500" /><span className="text-emerald-400">Copied!</span></>
                              : <><Copy className="h-2.5 w-2.5" />Copy</>
                            }
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 flex font-mono text-[12px] leading-[1.65] overflow-y-auto bg-[#0d1117]">
                        <div
                          className="select-none text-right border-r border-white/[0.04] py-4 shrink-0 text-[11px]"
                          style={{ minWidth: "3.25rem", paddingLeft: "0.5rem", paddingRight: "0.75rem", color: "rgba(255,255,255,0.12)" }}
                        >
                          {result.fixedCode.split("\n").map((_, i) => (
                            <div key={i} className="leading-[1.65]">{i + 1}</div>
                          ))}
                        </div>
                        <pre className="flex-1 text-white/80 px-4 py-4 overflow-x-auto whitespace-pre text-[12px] leading-[1.65]">
                          {result.fixedCode}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
