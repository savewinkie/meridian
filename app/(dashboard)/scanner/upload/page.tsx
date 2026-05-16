"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Upload, ArrowLeft, ChevronRight, Sparkles, FileCode2,
  X, CheckCircle2, Download, RefreshCw,
  Loader2, AlertTriangle, Play, Package,
} from "lucide-react"

interface FileEntry {
  name: string
  content: string
  size: number
}

interface FileResult {
  name: string
  language: string
  score: { before: number; after: number }
  summary: string
  issueCount: number
  criticalCount: number
  highCount: number
  issues: any[]
  fixedCode: string
  error?: string
}

const MAX_FILES = 10
const MAX_SIZE = 1024 * 100 // 100 KB per file

const SEV = {
  Critical: { badge: "bg-red-500/15 text-red-400", bar: "bg-red-500" },
  High:     { badge: "bg-orange-500/15 text-orange-400", bar: "bg-orange-500" },
  Medium:   { badge: "bg-amber-500/15 text-amber-400", bar: "bg-amber-500" },
  Low:      { badge: "bg-blue-500/15 text-blue-400", bar: "bg-blue-500" },
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function ScoreChip({ before, after }: { before: number; after: number }) {
  const color = after >= 80 ? "#10b981" : after >= 60 ? "#f59e0b" : "#f97316"
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-white/30">{before}</span>
      <span className="text-[9px] text-white/20">→</span>
      <span className="text-[11px] font-bold" style={{ color }}>{after}</span>
    </div>
  )
}

export default function UploadScannerPage() {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [results, setResults] = useState<FileResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedFile, setExpandedFile] = useState<string | null>(null)
  const [expandedTab, setExpandedTab] = useState<"issues" | "fixed">("issues")
  const [scanningFile, setScanningFile] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return
    const newFiles: FileEntry[] = []
    for (const file of Array.from(fileList)) {
      if (files.length + newFiles.length >= MAX_FILES) break
      if (file.size > MAX_SIZE) continue
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (content) {
          setFiles(prev => {
            if (prev.find(f => f.name === file.name)) return prev
            return [...prev, { name: file.name, content, size: file.size }]
          })
        }
      }
      reader.readAsText(file)
    }
  }, [files])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  function removeFile(name: string) {
    setFiles(f => f.filter(x => x.name !== name))
    if (results) setResults(r => r?.filter(x => x.name !== name) ?? null)
  }

  async function scan() {
    if (!files.length) return
    setIsScanning(true); setResults(null); setError(null); setExpandedFile(null)

    try {
      // Show progress by scanning file-by-file and updating state
      const allResults: FileResult[] = []
      for (const file of files) {
        setScanningFile(file.name)
        const res = await fetch("/api/scan-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: [{ name: file.name, content: file.content }] }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        allResults.push(data.results[0])
        setResults([...allResults])
      }
    } catch (err: any) {
      setError(err.message ?? "Scan failed. Please try again.")
    } finally {
      setScanningFile(null)
      setIsScanning(false)
    }
  }

  function downloadFile(result: FileResult) {
    const ext: Record<string, string> = {
      javascript: "js", typescript: "ts", python: "py", java: "java", go: "go",
      rust: "rs", ruby: "rb", php: "php", sql: "sql", bash: "sh", html: "html", css: "css",
    }
    const lang = (result.language ?? "").toLowerCase()
    const blob = new Blob([result.fixedCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `fixed-${result.name}`; a.click()
    URL.revokeObjectURL(url)
  }

  function downloadAll() {
    results?.forEach(r => { if (r.fixedCode) downloadFile(r) })
  }

  const expandedResult = results?.find(r => r.name === expandedFile)

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
          <Upload className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="text-white/40">meridian</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white/40">scanner</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-emerald-400/70">upload</span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5 rounded-full bg-purple-500/[0.08] border border-purple-500/[0.15] px-3 py-1">
            <Sparkles className="h-3 w-3 text-purple-400" />
            <span className="text-[10px] font-semibold text-purple-300 tracking-wide">claude-opus-4-7</span>
          </div>
        </div>
        <div className="w-24 flex justify-end">
          {results && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => { setFiles([]); setResults(null); setError(null) }}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/35 hover:text-white/60 transition-all"
            >
              <RefreshCw className="h-3 w-3" />New scan
            </motion.button>
          )}
        </div>
      </motion.div>

      <div className="flex flex-col flex-1 gap-5 p-6">

        {/* Drop zone */}
        {!results && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all",
              isDragging
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-white/[0.08] bg-[#0a0f1c] hover:border-white/[0.14] hover:bg-white/[0.02]"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
            <motion.div
              animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4"
            >
              <Upload className="h-6 w-6 text-emerald-400" />
            </motion.div>
            <p className="text-[13px] font-semibold text-white/60 mb-1">
              {isDragging ? "Drop files here" : "Drag & drop files"}
            </p>
            <p className="text-[11px] text-white/25">
              or click to browse · up to {MAX_FILES} files · max 100 KB each
            </p>
          </motion.div>
        )}

        {/* File list */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] text-white/30 font-medium">{files.length} file{files.length !== 1 ? "s" : ""} queued</p>
                {!results && !isScanning && (
                  <motion.button
                    onClick={scan}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative overflow-hidden flex items-center gap-2 rounded-xl px-5 py-2 text-[12.5px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-colors"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    Scan all {files.length} files
                    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                  </motion.button>
                )}
                {results && results.length === files.length && (
                  <button
                    onClick={downloadAll}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] px-4 py-2 text-[12px] font-medium text-white/50 hover:text-white/80 transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download all fixed files
                  </button>
                )}
              </div>

              {files.map((file, i) => {
                const result = results?.find(r => r.name === file.name)
                const isCurrentlyScanning = scanningFile === file.name
                const isExpanded = expandedFile === file.name

                return (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl border border-white/[0.07] bg-[#0a0f1c] overflow-hidden"
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors",
                        result && "cursor-pointer"
                      )}
                      onClick={() => {
                        if (result && !result.error) {
                          setExpandedFile(isExpanded ? null : file.name)
                          setExpandedTab("issues")
                        }
                      }}
                    >
                      <FileCode2 className="h-4 w-4 text-white/30 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-white/70 truncate">{file.name}</p>
                        <p className="text-[10px] text-white/25">{formatBytes(file.size)}</p>
                      </div>

                      {/* Status */}
                      {isCurrentlyScanning && (
                        <div className="flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">Scanning…</span>
                        </div>
                      )}
                      {result && !isCurrentlyScanning && !result.error && (
                        <div className="flex items-center gap-3">
                          <ScoreChip before={result.score.before} after={result.score.after} />
                          {result.criticalCount > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-400">
                              {result.criticalCount} critical
                            </span>
                          )}
                          <span className="text-[9px] text-white/20">{result.issueCount} issues</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); downloadFile(result) }}
                            className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] px-2 py-1 text-[10px] text-white/30 hover:text-white/60 transition-all"
                          >
                            <Download className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      )}
                      {result?.error && (
                        <span className="text-[10px] text-red-400">{result.error}</span>
                      )}
                      {!result && !isCurrentlyScanning && !isScanning && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFile(file.name) }}
                          className="text-white/20 hover:text-white/50 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Expanded result */}
                    <AnimatePresence>
                      {isExpanded && result && !result.error && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-white/[0.05]"
                        >
                          {/* Tabs */}
                          <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-white/[0.05]">
                            {(["issues", "fixed"] as const).map(tab => (
                              <button
                                key={tab}
                                onClick={() => setExpandedTab(tab)}
                                className={cn(
                                  "relative px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all",
                                  expandedTab === tab
                                    ? "bg-white/[0.06] text-white"
                                    : "text-white/35 hover:text-white/60"
                                )}
                              >
                                {tab === "issues" ? "Issues" : "Fixed Code"}
                                {tab === "issues" && (
                                  <span className="ml-1.5 text-[9px] font-bold px-1 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                                    {result.issues.length}
                                  </span>
                                )}
                              </button>
                            ))}
                            <div className="ml-auto">
                              <p className="text-[10px] text-white/25">{result.summary}</p>
                            </div>
                          </div>

                          {expandedTab === "issues" && (
                            <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.04]">
                              {result.issues.map((issue: any, j: number) => (
                                <div key={j} className="relative px-5 py-3">
                                  <div className={cn("absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full", SEV[issue.severity as keyof typeof SEV]?.bar ?? "bg-white/20")} />
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-md", SEV[issue.severity as keyof typeof SEV]?.badge ?? "bg-white/10 text-white/40")}>
                                      {issue.severity}
                                    </span>
                                    <span className="text-[11px] font-medium text-white/70">{issue.title}</span>
                                  </div>
                                  <p className="text-[10px] text-white/35 leading-relaxed">{issue.description}</p>
                                </div>
                              ))}
                              {result.issues.length === 0 && (
                                <div className="flex items-center gap-2 px-5 py-4">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                  <span className="text-[11px] text-white/40">No issues found</span>
                                </div>
                              )}
                            </div>
                          )}

                          {expandedTab === "fixed" && (
                            <pre className="max-h-64 overflow-y-auto overflow-x-auto font-mono text-[11px] text-white/70 px-4 py-3 leading-relaxed bg-[#0d1117] whitespace-pre">
                              {result.fixedCode}
                            </pre>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3"
          >
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-[12px] text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Empty state */}
        {files.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-8 w-8 text-white/10 mb-3" />
            <p className="text-[11px] text-white/20">Drop files above to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
