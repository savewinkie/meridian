"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Zap, Loader2, Check, X, AlertTriangle, Info, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

// ─── Types ──────────────────────────────────────────────────────────────────

interface Issue {
  line: number | null
  severity: "Critical" | "High" | "Medium" | "Low"
  category: string
  title: string
  description: string
  suggestion: string
}

interface AnalysisResult {
  score: number
  summary: string
  issues: Issue[]
}

// ─── Code Examples ───────────────────────────────────────────────────────────

const CODE_EXAMPLES: Record<string, string> = {
  "SQL Injection": `async function getUser(userId) {
  const db = getDatabase()
  // Build query with user input
  const query = \`SELECT * FROM users
    WHERE id = \${userId} AND active = true\`
  const result = await db.query(query)
  console.log("User fetched:", result[0].password)
  return result[0]
}`,

  "Auth Bypass": `function verifyToken(token) {
  // Decode and verify JWT
  const decoded = jwt.decode(token)
  if (!decoded) return null
  if (decoded.exp < Date.now() / 1000) return null
  return decoded
}

function requireAdmin(req, res, next) {
  const token = req.headers.authorization
  const user = verifyToken(token)
  if (user && user.role === 'admin') next()
  else res.status(401).send('Unauthorized')
}`,

  "Secret Leak": `const stripe = require('stripe')

const STRIPE_SECRET = "sk_live_4xRmKj9AbcDef123456789"
const DB_PASSWORD   = "prod_admin_2024!@#"

async function chargeCard(amount, cardToken) {
  const s = stripe(STRIPE_SECRET)
  const charge = await s.charges.create({
    amount,
    currency: 'usd',
    source: cardToken,
  })
  return charge
}`,
}

const LOADING_STEPS = [
  "Parsing code structure…",
  "Scanning for vulnerabilities…",
  "Checking authentication patterns…",
  "Analyzing data handling…",
  "Reviewing error handling…",
  "Generating fix suggestions…",
]

const SEV_CONFIG = {
  Critical: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", dot: "bg-red-400" },
  High:     { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", dot: "bg-orange-400" },
  Medium:   { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-400" },
  Low:      { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", dot: "bg-blue-400" },
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 28
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = score >= 71 ? "#10b981" : score >= 41 ? "#f59e0b" : "#ef4444"
  const label = score >= 71 ? "Good" : score >= 41 ? "Fair" : "Critical"

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 shrink-0">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle
            cx="36" cy="36" r={r} fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={c} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white leading-none">{score}</span>
          <span className="text-[9px] text-white/40">/100</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-white mb-0.5">Quality Score</p>
        <p style={{ color }} className="text-xs font-semibold">{label}</p>
      </div>
    </div>
  )
}

// ─── Live Demo ────────────────────────────────────────────────────────────────

export function LiveDemo() {
  const examples = Object.keys(CODE_EXAMPLES) as Array<keyof typeof CODE_EXAMPLES>
  const [selected, setSelected] = useState<string>(examples[0])
  const [code, setCode] = useState(CODE_EXAMPLES[examples[0]])
  const [dropOpen, setDropOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState("")
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [visibleIssues, setVisibleIssues] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function selectExample(name: string) {
    setSelected(name)
    setCode(CODE_EXAMPLES[name])
    setResult(null)
    setError(null)
    setDropOpen(false)
  }

  useEffect(() => {
    if (result) {
      setVisibleIssues(0)
      result.issues.forEach((_, i) => {
        setTimeout(() => setVisibleIssues(i + 1), i * 150 + 200)
      })
    }
  }, [result])

  async function analyze() {
    setIsAnalyzing(true)
    setResult(null)
    setError(null)
    let msgIdx = 0
    setLoadingMsg(LOADING_STEPS[0])
    intervalRef.current = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_STEPS.length
      setLoadingMsg(LOADING_STEPS[msgIdx])
    }, 700)

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (err: any) {
      setError(err.message ?? "Analysis failed. Please try again.")
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setIsAnalyzing(false)
    }
  }

  const lines = code.split("\n")

  return (
    <section id="demo" className="py-24 border-y border-white/5">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 mb-6">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-400 tracking-wide">LIVE DEMO</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Analyze your code,<br />right now.
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto">
            Paste any code snippet below and watch Meridian AI find security vulnerabilities,
            bugs, and quality issues — powered by Claude.
          </p>
        </div>

        {/* Demo card */}
        <div className="rounded-2xl border border-white/10 bg-[#070d1a] overflow-hidden shadow-2xl shadow-black/40">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#050a14]">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
            </div>
            <div className="flex-1 flex items-center gap-3">
              <span className="text-[11px] text-white/30 font-mono">meridian-demo.ts</span>
            </div>
            {/* Example selector */}
            <div className="relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <span>{selected}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {dropOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-white/10 bg-[#0d1526] shadow-xl z-10 overflow-hidden">
                  {examples.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => selectExample(ex)}
                      className={cn("w-full text-left px-4 py-2.5 text-xs transition-colors", ex === selected ? "text-amber-400 bg-amber-500/10" : "text-white/60 hover:text-white hover:bg-white/5")}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Code editor */}
          <div className="flex font-mono text-[12px] leading-6 max-h-64 overflow-y-auto">
            <div className="text-white/20 text-right select-none border-r border-white/5 py-4 shrink-0" style={{ minWidth: "3rem", paddingLeft: "0.75rem", paddingRight: "0.75rem" }}>
              {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea
              value={code}
              onChange={(e) => { setCode(e.target.value); setResult(null); setError(null) }}
              spellCheck={false}
              className="flex-1 bg-transparent text-white/75 resize-none outline-none px-4 py-4 min-h-[120px]"
              rows={Math.max(lines.length, 8)}
              placeholder="Paste your code here…"
            />
          </div>

          {/* Analyze button */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-[#050a14]">
            <span className="text-[11px] text-white/25 font-mono">{lines.length} lines · {code.length} chars</span>
            <Button
              onClick={analyze}
              disabled={isAnalyzing || !code.trim()}
              variant="amber"
              size="sm"
              className="gap-2 shadow-lg shadow-amber-500/20 min-w-[180px]"
            >
              {isAnalyzing ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span className="text-xs">{loadingMsg}</span></>
              ) : (
                <><Zap className="h-3.5 w-3.5" />Analyze with Meridian AI</>
              )}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-4">
            {/* Score row */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <ScoreRing score={result.score} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">AI Summary</p>
                  <p className="text-sm text-white/70 leading-relaxed">{result.summary}</p>
                </div>
                <div className="flex gap-3 shrink-0">
                  {(["Critical", "High", "Medium", "Low"] as const).map((sev) => {
                    const count = result.issues.filter((i) => i.severity === sev).length
                    if (!count) return null
                    return (
                      <div key={sev} className="text-center">
                        <div className={cn("text-xl font-bold tabular-nums", SEV_CONFIG[sev].color)}>{count}</div>
                        <div className="text-[9px] text-white/30 uppercase tracking-wide">{sev}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Issues */}
            {result.issues.map((issue, i) => {
              const cfg = SEV_CONFIG[issue.severity]
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded-2xl border p-5 transition-all duration-500",
                    cfg.bg, cfg.border,
                    i < visibleIssues ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  )}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("h-2 w-2 rounded-full mt-2 shrink-0", cfg.dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={cn("text-xs font-bold", cfg.color)}>{issue.severity}</span>
                        <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-md">{issue.category}</span>
                        {issue.line && <span className="text-[10px] text-white/25">Line {issue.line}</span>}
                        <span className="text-sm font-semibold text-white">{issue.title}</span>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed mb-3">{issue.description}</p>
                      <div className="flex items-start gap-2 rounded-xl bg-white/5 border border-white/5 px-3 py-2.5">
                        <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-white/55 leading-relaxed"><span className="text-amber-400 font-semibold">Fix: </span>{issue.suggestion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
