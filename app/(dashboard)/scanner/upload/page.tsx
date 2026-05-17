"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Upload, ArrowLeft, ChevronRight, Sparkles, FileCode2,
  X, CheckCircle2, Download, RefreshCw, Loader2,
  AlertCircle, AlertTriangle, Info, Code2, Copy, Check,
  Play, Zap, FileUp,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface FileEntry { name: string; content: string; size: number }
interface FileResult {
  name: string; language: string; score: { before: number; after: number }
  summary: string; issueCount: number; criticalCount: number
  issues: any[]; fixedCode: string; error?: string
}

const MAX_FILES = 20
const MAX_SIZE = 1024 * 1024 * 50
const ANALYSIS_LIMIT = 1024 * 50

// ─── Config ───────────────────────────────────────────────────────────────────

const SEV_CFG = {
  Critical: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", bar: "bg-red-500", icon: AlertCircle, dot: "bg-red-500" },
  High:     { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", bar: "bg-orange-500", icon: AlertTriangle, dot: "bg-orange-500" },
  Medium:   { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", bar: "bg-amber-400", icon: AlertTriangle, dot: "bg-amber-400" },
  Low:      { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", bar: "bg-blue-400", icon: Info, dot: "bg-blue-400" },
}

const LANG_COLOR: Record<string, string> = {
  typescript: "text-blue-400 bg-blue-400/10", javascript: "text-yellow-400 bg-yellow-400/10",
  python: "text-green-400 bg-green-400/10", rust: "text-orange-400 bg-orange-400/10",
  go: "text-cyan-400 bg-cyan-400/10", java: "text-red-400 bg-red-400/10",
  css: "text-purple-400 bg-purple-400/10", html: "text-orange-300 bg-orange-300/10",
}

const EXT_COLOR: Record<string, string> = {
  ts: "text-blue-400", tsx: "text-blue-300", js: "text-yellow-400", jsx: "text-yellow-300",
  py: "text-green-400", go: "text-cyan-400", rs: "text-orange-400", java: "text-red-400",
  css: "text-purple-400", scss: "text-pink-400", html: "text-orange-300", json: "text-amber-300",
  sql: "text-emerald-400", sh: "text-white/50",
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b/1024).toFixed(1)} KB`
  return `${(b/1024/1024).toFixed(1)} MB`
}

function getExt(name: string) { return name.split(".").pop()?.toLowerCase() ?? "" }

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 52 }: { score: number; size?: number }) {
  const r = size / 2 - 5
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"
  const glow = score >= 80 ? "rgba(16,185,129,0.3)" : score >= 60 ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)"
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3.5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${glow})`, transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}/>
      </svg>
      <span className="text-[13px] font-bold tabular-nums" style={{ color }}>{score}</span>
    </div>
  )
}

// ─── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({ result, index }: { result: FileResult; index: number }) {
  const [showIssues, setShowIssues] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const langStyle = LANG_COLOR[result.language?.toLowerCase()] ?? "text-white/30 bg-white/[0.05]"
  const improvement = result.score.after - result.score.before
  const critCount = result.issues?.filter((i:any) => i.severity === "Critical").length ?? 0
  const highCount = result.issues?.filter((i:any) => i.severity === "High").length ?? 0
  const medCount = result.issues?.filter((i:any) => i.severity === "Medium").length ?? 0
  const lowCount = result.issues?.filter((i:any) => i.severity === "Low").length ?? 0

  function copyFixed() {
    navigator.clipboard.writeText(result.fixedCode)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  function downloadFixed() {
    const blob = new Blob([result.fixedCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `fixed-${result.name}`; a.click()
    URL.revokeObjectURL(url)
  }

  if (result.error) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
        className="flex items-center gap-3 rounded-2xl border border-red-500/15 bg-red-500/5 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/15">
          <AlertCircle className="h-4 w-4 text-red-400"/>
        </div>
        <div>
          <p className="text-[12px] font-semibold text-white/70">{result.name}</p>
          <p className="text-[11px] text-red-400 mt-0.5">{result.error}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22,1,0.36,1] }}
      className="rounded-2xl border border-white/[0.07] bg-[#0a0f1c] overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-center">
              <div className="text-[9px] text-white/20 mb-1">Before</div>
              <ScoreRing score={result.score.before} size={48}/>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-px w-4 bg-white/10"/>
              {improvement > 0 && <span className="text-[9px] font-bold text-emerald-400">+{improvement}</span>}
            </div>
            <div className="text-center">
              <div className="text-[9px] text-white/20 mb-1">After</div>
              <ScoreRing score={result.score.after} size={48}/>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[13px] font-semibold text-white/80 truncate">{result.name}</span>
              {result.language && (
                <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide", langStyle)}>
                  {result.language}
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/35 leading-relaxed line-clamp-2">{result.summary}</p>
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              {critCount > 0 && <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/15 text-red-400"><span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block"/>{critCount} Critical</span>}
              {highCount > 0 && <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/15 text-orange-400"><span className="h-1.5 w-1.5 rounded-full bg-orange-500 inline-block"/>{highCount} High</span>}
              {medCount > 0 && <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/15 text-amber-400"><span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block"/>{medCount} Medium</span>}
              {lowCount > 0 && <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/15 text-blue-400"><span className="h-1.5 w-1.5 rounded-full bg-blue-400 inline-block"/>{lowCount} Low</span>}
              {result.issues?.length === 0 && <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-400"><CheckCircle2 className="h-3 w-3"/>Clean</span>}
            </div>
          </div>

          <button onClick={downloadFixed}
            className="flex items-center gap-1.5 shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] px-3 py-1.5 text-[10px] font-medium text-white/40 hover:text-white/70 transition-all">
            <Download className="h-3 w-3"/>Download
          </button>
        </div>
      </div>

      {/* Issues */}
      {result.issues?.length > 0 && (
        <div className="border-t border-white/[0.05]">
          <button onClick={() => setShowIssues(!showIssues)}
            className="flex items-center gap-2 w-full px-5 py-3 hover:bg-white/[0.02] transition-colors text-left">
            <ChevronDown className={cn("h-3.5 w-3.5 text-white/30 transition-transform duration-200", showIssues ? "rotate-0" : "-rotate-90")}/>
            <span className="text-[11px] font-medium text-white/40">{result.issues.length} issue{result.issues.length !== 1 ? "s" : ""} found</span>
            <div className="flex-1"/>
            {!showIssues && critCount > 0 && <span className="text-[9px] text-red-400/60">{critCount} critical</span>}
          </button>
          <AnimatePresence>
            {showIssues && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22,1,0.36,1] }} className="overflow-hidden">
                <div className="px-4 pb-4 space-y-2">
                  {result.issues.map((issue: any, j: number) => {
                    const sev = SEV_CFG[issue.severity as keyof typeof SEV_CFG] ?? SEV_CFG.Low
                    return (
                      <motion.div key={j} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: j * 0.03 }} className={cn("rounded-xl border p-4", sev.bg, sev.border)}>
                        <div className="flex items-start gap-2.5">
                          <sev.icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", sev.text)}/>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={cn("text-[10px] font-bold uppercase tracking-wide", sev.text)}>{issue.severity}</span>
                              {issue.type && <span className="text-[9px] text-white/20 border border-white/[0.08] px-1.5 py-0.5 rounded-md">{issue.type}</span>}
                              {issue.line != null && <span className="text-[9px] text-white/20 font-mono">line {issue.line}</span>}
                            </div>
                            <p className="text-[12px] font-semibold text-white/75 mb-1">{issue.title}</p>
                            <p className="text-[11px] text-white/35 leading-relaxed">{issue.description}</p>
                            {issue.fix && (
                              <p className="text-[10px] text-white/25 mt-2 pt-2 border-t border-white/[0.06] leading-relaxed">
                                <span className="text-white/40 font-medium">Fix: </span>{issue.fix}
                              </p>
                            )}
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
      )}

      {/* Fixed code */}
      {result.fixedCode && (
        <div className="border-t border-white/[0.05]">
          <button onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-2 w-full px-5 py-3 hover:bg-white/[0.02] transition-colors text-left">
            <ChevronDown className={cn("h-3.5 w-3.5 text-white/30 transition-transform duration-200", showCode ? "rotate-0" : "-rotate-90")}/>
            <Code2 className="h-3.5 w-3.5 text-emerald-400/50"/>
            <span className="text-[11px] font-medium text-white/40">Fixed code</span>
            <div className="flex-1"/>
            <span className="text-[9px] text-white/20">AI-corrected version</span>
          </button>
          <AnimatePresence>
            {showCode && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                <div className="relative mx-4 mb-4 rounded-xl overflow-hidden border border-white/[0.07] bg-[#060b14]">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05] bg-white/[0.02]">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/50"/>
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50"/>
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50"/>
                      <span className="ml-2 text-[10px] text-white/20 font-mono">{result.name}</span>
                    </div>
                    <button onClick={copyFixed}
                      className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.07] px-2.5 py-1 text-[10px] text-white/30 hover:text-white/60 transition-all">
                      {copied ? <><Check className="h-2.5 w-2.5 text-emerald-400"/>Copied</> : <><Copy className="h-2.5 w-2.5"/>Copy</>}
                    </button>
                  </div>
                  <pre className="p-4 text-[11px] text-white/55 font-mono leading-relaxed overflow-x-auto max-h-80 overflow-y-auto">
                    <code>{result.fixedCode}</code>
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

// Missing import fix
function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UploadScannerPage() {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [results, setResults] = useState<FileResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanningFile, setScanningFile] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return
    for (const file of Array.from(fileList)) {
      if (file.size > MAX_SIZE) continue
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (content) setFiles(prev => prev.find(f => f.name === file.name) || prev.length >= MAX_FILES ? prev : [...prev, { name: file.name, content, size: file.size }])
      }
      reader.readAsText(file)
    }
  }, [])

  async function scan() {
    if (!files.length) return
    setIsScanning(true); setResults(null); setError(null)
    const allResults: FileResult[] = []
    try {
      for (const file of files) {
        setScanningFile(file.name)
        const res = await fetch("/api/scan-batch", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: [{ name: file.name, content: file.content.slice(0, ANALYSIS_LIMIT) }] }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        allResults.push(data.results[0])
        setResults([...allResults])
      }
    } catch (err: any) {
      setError(err.message ?? "Scan failed. Please try again.")
    } finally {
      setScanningFile(null); setIsScanning(false)
    }
  }

  function reset() { setFiles([]); setResults(null); setError(null) }

  const allDone = results && results.length === files.length
  const totalCritical = results?.reduce((s,r) => s + (r.issues?.filter((i:any) => i.severity==="Critical").length ?? 0), 0) ?? 0
  const avgAfter = results?.length ? Math.round(results.reduce((s,r) => s + r.score.after, 0) / results.length) : 0

  return (
    <div className="flex flex-col h-full bg-[#060b16] overflow-y-auto">

      {/* Title bar */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center h-11 border-b border-white/[0.05] bg-[#070d1a]/80 backdrop-blur-md shrink-0 px-4">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/25">
          <Link href="/scanner" className="flex items-center gap-1 text-white/35 hover:text-white/60 transition-colors mr-1">
            <ArrowLeft className="h-3.5 w-3.5"/>
          </Link>
          <Upload className="h-3.5 w-3.5 text-emerald-400 shrink-0"/>
          <span className="text-white/40">meridian</span>
          <ChevronRight className="h-3 w-3"/>
          <span className="text-white/40">scanner</span>
          <ChevronRight className="h-3 w-3"/>
          <span className="text-emerald-400/70">upload</span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15] px-3 py-1">
            <Sparkles className="h-3 w-3 text-emerald-400"/>
            <span className="text-[10px] font-semibold text-emerald-300 tracking-wide">claude-sonnet-4-6</span>
          </div>
        </div>
        <div className="w-24 flex justify-end">
          {(results || files.length > 0) && !isScanning && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={reset}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/35 hover:text-white/60 transition-all">
              <RefreshCw className="h-3 w-3"/>New scan
            </motion.button>
          )}
        </div>
      </motion.div>

      <div className={cn("flex flex-col flex-1 gap-5 p-6", files.length === 0 && !results ? "items-center justify-center" : "")}>

        {/* Drop zone (always visible until results) */}
        {!results && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all w-full max-w-2xl",
              files.length === 0 ? "p-16" : "p-6",
              isDragging ? "border-emerald-500/40 bg-emerald-500/[0.04]" : "border-white/[0.07] hover:border-white/[0.12] hover:bg-white/[0.01]"
            )}>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)}/>
            <motion.div animate={{ scale: isDragging ? 1.12 : 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={cn("flex h-14 w-14 items-center justify-center rounded-2xl mb-4 transition-all",
                isDragging ? "bg-emerald-500/15 border border-emerald-500/25" : "bg-white/[0.03] border border-white/[0.06]"
              )}>
              <FileUp className={cn("h-6 w-6 transition-colors", isDragging ? "text-emerald-400" : "text-white/20")}/>
            </motion.div>
            <p className={cn("text-[13px] font-semibold mb-1 transition-colors", isDragging ? "text-emerald-300" : "text-white/50")}>
              {isDragging ? "Drop to add files" : files.length > 0 ? "Drop more files" : "Drop files here to scan"}
            </p>
            <p className="text-[11px] text-white/20">
              {files.length > 0 ? `${MAX_FILES - files.length} slots remaining` : `up to ${MAX_FILES} files · max 50 MB each`}
            </p>
          </motion.div>
        )}

        {/* File list + results header */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-3 w-full max-w-2xl">

              {/* Header */}
              <div className="flex items-center justify-between">
                {allDone ? (
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-semibold text-white/50">{results.length} file{results.length !== 1 ? "s" : ""} analyzed</span>
                    {totalCritical > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/15 text-red-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block"/>{totalCritical} critical
                      </span>
                    )}
                    <span className="text-[10px] text-emerald-400/60">avg {avgAfter}/100</span>
                  </div>
                ) : isScanning ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400"/>
                    <span className="text-[12px] font-medium text-white/40">Scanning with AI…</span>
                    {scanningFile && <span className="text-[10px] text-white/20 font-mono">{scanningFile}</span>}
                  </div>
                ) : (
                  <span className="text-[12px] font-semibold text-white/40">{files.length} file{files.length !== 1 ? "s" : ""} queued</span>
                )}

                {!isScanning && !results && (
                  <button onClick={scan}
                    className="group relative overflow-hidden flex items-center gap-2 rounded-xl px-5 py-2 text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-colors">
                    <Play className="h-3.5 w-3.5 fill-white"/>
                    Scan {files.length} file{files.length !== 1 ? "s" : ""}
                    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:translate-x-full transition-transform duration-700"/>
                  </button>
                )}
                {allDone && results.some(r => r.fixedCode) && (
                  <button onClick={() => results.forEach(r => r.fixedCode && (()=>{const b=new Blob([r.fixedCode],{type:"text/plain"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=`fixed-${r.name}`;a.click();URL.revokeObjectURL(u)})()} )
                    className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] px-4 py-2 text-[12px] font-medium text-white/50 hover:text-white/80 transition-all">
                    <Download className="h-3.5 w-3.5"/>Download all fixed
                  </button>
                )}
              </div>

              {/* Scanning progress or results */}
              {(isScanning || results) && (
                <div className="space-y-3">
                  {files.map((file, i) => {
                    const result = results?.find(r => r.name === file.name)
                    const scanning = scanningFile === file.name
                    const ext = getExt(file.name)
                    const extColor = EXT_COLOR[ext] ?? "text-white/30"

                    if (result) return <ResultCard key={file.name} result={result} index={i}/>

                    return (
                      <motion.div key={file.name}
                        animate={{ borderColor: scanning ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)" }}
                        className="flex items-center gap-3 rounded-2xl border bg-[#0a0f1c] px-5 py-4">
                        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border shrink-0 transition-all",
                          scanning ? "bg-emerald-500/10 border-emerald-500/15" : "bg-white/[0.02] border-white/[0.05]")}>
                          {scanning ? <Loader2 className="h-4 w-4 animate-spin text-emerald-400"/>
                            : <FileCode2 className={cn("h-4 w-4", extColor)}/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-white/60 truncate">{file.name}</p>
                          <p className={cn("text-[10px] mt-0.5 transition-colors",
                            scanning ? "text-emerald-400/60 animate-pulse" : "text-white/20")}>
                            {scanning ? "Analyzing with AI…" : `${formatBytes(file.size)} · Queued`}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Queue (before scan) */}
              {!isScanning && !results && (
                <div className="space-y-2">
                  {files.map((file, i) => {
                    const ext = getExt(file.name)
                    const extColor = EXT_COLOR[ext] ?? "text-white/30"
                    return (
                      <motion.div key={file.name}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0a0f1c] px-4 py-3 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.05] shrink-0">
                          <FileCode2 className={cn("h-4 w-4", extColor)}/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-white/65 truncate">{file.name}</p>
                          <p className="text-[10px] text-white/20 mt-0.5">{formatBytes(file.size)} · .{ext}</p>
                        </div>
                        <button onClick={() => setFiles(f => f.filter(x => x.name !== file.name))}
                          className="text-white/10 hover:text-white/50 transition-colors opacity-0 group-hover:opacity-100">
                          <X className="h-3.5 w-3.5"/>
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 w-full max-w-2xl">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5"/>
            <p className="text-[12px] text-red-400">{error}</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
