"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Zap, Loader2, Copy, Check, ChevronDown, AlertTriangle,
  Shield, Bug, Gauge, Code2, Brain, CheckCircle2, AlertCircle,
  Sparkles, Download, RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Config ───────────────────────────────────────────────────────────────────

const SEV = {
  Critical: {
    color: "text-red-600", bg: "bg-red-50", border: "border-red-200",
    badge: "bg-red-100 text-red-700", ring: "#ef4444",
  },
  High: {
    color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200",
    badge: "bg-orange-100 text-orange-700", ring: "#f97316",
  },
  Medium: {
    color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700", ring: "#f59e0b",
  },
  Low: {
    color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700", ring: "#3b82f6",
  },
}

const TYPE_ICON: Record<string, any> = {
  Security: Shield,
  Bug: Bug,
  Performance: Gauge,
  Logic: Brain,
  Style: Code2,
}

const LANGUAGES = [
  "Auto-detect", "JavaScript", "TypeScript", "Python", "Java",
  "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin",
  "SQL", "Bash", "YAML", "JSON", "HTML", "CSS",
]

const LOADING_STEPS = [
  "Loading claude-opus-4-7…",
  "Parsing code structure…",
  "Analyzing logic flow…",
  "Scanning for vulnerabilities…",
  "Cross-referencing OWASP Top 10…",
  "Detecting performance bottlenecks…",
  "Identifying anti-patterns…",
  "Generating optimal fixes…",
  "Validating corrections…",
  "Finalizing comprehensive report…",
]

const PLACEHOLDER = `async function getUser(userId) {
  // Fetch user from database
  const query = \`SELECT * FROM users WHERE id = \${userId}\`
  const result = await db.query(query)
  console.log("User password:", result[0].password)
  return result[0]
}

function verifyToken(token) {
  const decoded = jwt.decode(token)  // Missing signature verification
  if (decoded.exp < Date.now()) return null
  return decoded
}

const API_KEY = "sk_live_abc123secret"  // Hardcoded secret`

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 30
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444"
  const grade = score >= 80 ? "Excellent" : score >= 60 ? "Fair" : score >= 40 ? "Poor" : "Critical"

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 76 76">
          <circle cx="38" cy="38" r={r} fill="none" stroke="#f3f4f6" strokeWidth="7" />
          <circle
            cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold leading-none" style={{ color }}>{score}</span>
          <span className="text-[9px] text-muted-foreground">/100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-[10px]" style={{ color }}>{grade}</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
      result.issues.forEach((_, i) => {
        setTimeout(() => setVisibleIssues(i + 1), i * 130 + 250)
      })
    }
  }, [result])

  async function scan() {
    if (!code.trim()) return
    setIsScanning(true)
    setResult(null)
    setError(null)
    setStepIdx(0)
    setSevFilter(null)
    intervalRef.current = setInterval(() => setStepIdx((i) => (i + 1) % LOADING_STEPS.length), 900)

    try {
      const res = await fetch("/api/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: language === "Auto-detect" ? "auto" : language,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      setActiveTab("issues")
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
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadFixed() {
    if (!result?.fixedCode) return
    const ext: Record<string, string> = {
      javascript: "js", typescript: "ts", python: "py", java: "java",
      go: "go", rust: "rs", ruby: "rb", php: "php", sql: "sql",
      bash: "sh", yaml: "yaml", html: "html", css: "css",
    }
    const lang = result.language.toLowerCase()
    const filename = `fixed.${ext[lang] ?? "txt"}`
    const blob = new Blob([result.fixedCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  const filteredIssues = result?.issues.filter(i => !sevFilter || i.severity === sevFilter) ?? []
  const sevCounts = result
    ? (["Critical", "High", "Medium", "Low"] as const).map((s) => ({
        sev: s, count: result.issues.filter((i) => i.severity === s).length,
      })).filter((x) => x.count > 0)
    : []

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-center gap-4 px-8 py-5 border-b border-border bg-card/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-md shadow-purple-200">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">AI Code Scanner</h1>
          <p className="text-xs text-muted-foreground">Find every bug, security hole, and performance issue — then fix them all</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            <span className="text-xs font-bold text-purple-700">claude-opus-4-7</span>
          </div>
          {result && (
            <button
              onClick={() => { setResult(null); setError(null); setCode("") }}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />New scan
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-0 h-full min-h-0">

          {/* Left — Code editor */}
          <div className="flex flex-col border-r border-border">
            {/* Editor toolbar */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-muted/20">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/50" />
              </div>
              <span className="text-[11px] text-muted-foreground font-mono flex-1">untitled · meridian-scanner</span>

              {/* Language picker */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {language}
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-border bg-card shadow-xl z-20 overflow-hidden"
                    >
                      <div className="max-h-56 overflow-y-auto py-1">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang}
                            onClick={() => { setLanguage(lang); setLangOpen(false) }}
                            className={cn(
                              "w-full text-left px-3 py-2 text-xs transition-colors",
                              lang === language
                                ? "bg-amber-50 text-amber-700 font-semibold"
                                : "text-foreground hover:bg-muted"
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

            {/* Code area */}
            <div className="flex-1 flex font-mono text-[12.5px] leading-[1.65] overflow-y-auto bg-[#0d1117] min-h-[340px]">
              <div
                className="text-white/20 text-right select-none border-r border-white/5 py-4 shrink-0"
                style={{ minWidth: "3.5rem", paddingLeft: "0.75rem", paddingRight: "0.75rem" }}
              >
                {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <textarea
                value={code}
                onChange={(e) => { setCode(e.target.value); if (result) { setResult(null); setError(null) } }}
                spellCheck={false}
                className="flex-1 bg-transparent text-white/85 resize-none outline-none px-4 py-4 placeholder:text-white/20"
                rows={Math.max(lines.length, 18)}
                placeholder={PLACEHOLDER}
              />
            </div>

            {/* Editor footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-[#070d1a]">
              <span className="text-[11px] text-white/25 font-mono">
                {lines.length} lines · {code.length} chars
              </span>
              <Button
                onClick={scan}
                disabled={isScanning || !code.trim()}
                variant="amber"
                size="sm"
                className="gap-2 min-w-[230px] shadow-lg shadow-amber-500/20"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    <span className="text-xs truncate">{LOADING_STEPS[stepIdx]}</span>
                  </>
                ) : (
                  <>
                    <Brain className="h-3.5 w-3.5" />
                    Scan & Fix with Opus 4.7
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right — Results panel */}
          <div className="flex flex-col bg-[#fafaf8]">

            {/* Empty state */}
            {!result && !isScanning && !error && (
              <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
                <div className="relative mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200">
                    <Brain className="h-10 w-10 text-purple-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 border-2 border-white shadow-sm">
                    <Zap className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">Ready to scan your code</h3>
                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
                  Paste any code on the left — JavaScript, Python, Go, SQL, Bash — and Claude Opus 4.7 will perform a deep analysis and rewrite it completely.
                </p>
                <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                  {[
                    { icon: Shield, label: "Security holes", color: "text-red-500" },
                    { icon: Bug, label: "Logic bugs", color: "text-orange-500" },
                    { icon: Gauge, label: "Performance", color: "text-blue-500" },
                    { icon: CheckCircle2, label: "Auto-fix", color: "text-emerald-500" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 rounded-xl bg-card border border-border px-3 py-2.5">
                      <item.icon className={cn("h-4 w-4 shrink-0", item.color)} />
                      <span className="text-xs font-medium text-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scanning state */}
            {isScanning && (
              <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
                <div className="relative mb-8">
                  <div className="h-20 w-20 rounded-full border-2 border-purple-200 flex items-center justify-center">
                    <Loader2 className="h-9 w-9 text-purple-500 animate-spin" />
                  </div>
                  <div className="absolute -inset-3 rounded-full border border-purple-200/40 animate-ping" style={{ animationDuration: "2.5s" }} />
                  <div className="absolute -inset-6 rounded-full border border-purple-100/30 animate-ping" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />
                </div>
                <p className="text-base font-semibold text-foreground mb-1">Claude Opus 4.7 is analyzing…</p>
                <p className="text-sm text-muted-foreground mb-6">{LOADING_STEPS[stepIdx]}</p>
                <div className="flex gap-1.5 mb-8">
                  {LOADING_STEPS.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: i === stepIdx ? 1 : 0.25, scaleX: i === stepIdx ? 1.5 : 1 }}
                      className="h-1 w-3 rounded-full bg-purple-500 origin-center"
                    />
                  ))}
                </div>
                <div className="w-full max-w-xs space-y-2 text-left">
                  {LOADING_STEPS.slice(0, stepIdx + 1).map((step, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0", i < stepIdx ? "text-emerald-500" : "text-purple-400")} />
                      <span className={i < stepIdx ? "text-foreground" : ""}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error state */}
            {error && !isScanning && (
              <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-200 mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">Scan failed</p>
                <p className="text-xs text-muted-foreground mb-6 max-w-xs">{error}</p>
                <Button variant="outline" size="sm" onClick={scan}>Try again</Button>
              </div>
            )}

            {/* Results */}
            {result && !isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col flex-1 overflow-hidden"
              >
                {/* Score bar */}
                <div className="flex items-center gap-6 px-6 py-4 border-b border-border bg-card">
                  <ScoreRing score={result.score.before} label="Before" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "text-sm font-bold",
                        result.score.after - result.score.before >= 30 ? "text-emerald-600" : "text-amber-600"
                      )}>
                        +{result.score.after - result.score.before} pts improvement
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">{result.language}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{result.summary}</p>
                  </div>
                  <ScoreRing score={result.score.after} label="After" />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border bg-card shrink-0">
                  <button
                    onClick={() => setActiveTab("issues")}
                    className={cn(
                      "flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2",
                      activeTab === "issues"
                        ? "border-amber-500 text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    Issues
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", activeTab === "issues" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground")}>
                      {result.issues.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("fixed")}
                    className={cn(
                      "flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2",
                      activeTab === "fixed"
                        ? "border-amber-500 text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Fixed Code
                  </button>
                </div>

                {/* Issues tab */}
                {activeTab === "issues" && (
                  <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Severity filter */}
                    {sevCounts.length > 0 && (
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20 flex-wrap shrink-0">
                        <button
                          onClick={() => setSevFilter(null)}
                          className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-colors", !sevFilter ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground")}
                        >
                          All ({result.issues.length})
                        </button>
                        {sevCounts.map(({ sev, count }) => (
                          <button
                            key={sev}
                            onClick={() => setSevFilter(sevFilter === sev ? null : sev)}
                            className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-colors", sevFilter === sev ? SEV[sev].badge + " ring-1 ring-current" : "bg-muted text-muted-foreground hover:text-foreground")}
                          >
                            {sev} ({count})
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto divide-y divide-border">
                      {filteredIssues.map((issue, i) => {
                        const cfg = SEV[issue.severity]
                        const Icon = TYPE_ICON[issue.type] ?? AlertCircle
                        const globalIdx = result.issues.indexOf(issue)
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 12 }}
                            animate={globalIdx < visibleIssues ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
                            transition={{ duration: 0.25 }}
                            className="p-4"
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border mt-0.5", cfg.bg, cfg.border)}>
                                <Icon className={cn("h-4 w-4", cfg.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md", cfg.badge)}>{issue.severity}</span>
                                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">{issue.type}</span>
                                  {issue.line != null && (
                                    <span className="text-[10px] text-muted-foreground font-mono">Line {issue.line}</span>
                                  )}
                                  <span className="text-xs font-semibold text-foreground">{issue.title}</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">{issue.description}</p>
                                <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                                    <span className="font-semibold">Fix applied: </span>{issue.fix}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                      {filteredIssues.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
                          <p className="text-sm text-muted-foreground">No {sevFilter ?? ""} issues found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Fixed code tab */}
                {activeTab === "fixed" && (
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0">
                      <span className="text-[11px] text-muted-foreground font-mono">{result.language.toLowerCase()} · fixed version</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={downloadFixed}
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Download className="h-3 w-3" />Download
                        </button>
                        <button
                          onClick={copyFixed}
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          {copied
                            ? <><Check className="h-3 w-3 text-emerald-600" />Copied!</>
                            : <><Copy className="h-3 w-3" />Copy</>
                          }
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 flex font-mono text-[12px] leading-[1.65] overflow-y-auto bg-[#0d1117]">
                      <div
                        className="text-white/20 text-right select-none border-r border-white/5 py-4 shrink-0"
                        style={{ minWidth: "3.5rem", paddingLeft: "0.75rem", paddingRight: "0.75rem" }}
                      >
                        {result.fixedCode.split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}
                      </div>
                      <pre className="flex-1 text-white/85 px-4 py-4 overflow-x-auto whitespace-pre text-[12px] leading-[1.65]">
                        {result.fixedCode}
                      </pre>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
