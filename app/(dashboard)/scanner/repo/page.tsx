"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Github, ArrowLeft, ChevronRight, Sparkles, Eye, EyeOff,
  Loader2, FolderOpen, FileCode2, ChevronDown, Play,
  CheckCircle2, Download, Star, GitFork, Lock, Unlock,
  Brain, X, GripVertical, AlertTriangle, AlertCircle,
  Info, Zap, Code2, Copy, Check, CheckSquare2,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface GHRepo {
  id: number; name: string; full_name: string; description: string | null
  private: boolean; stargazers_count: number; forks_count: number
  language: string | null; updated_at: string; default_branch: string
}
interface TreeNode { path: string; type: "blob" | "tree"; sha: string }
interface FileResult {
  name: string; language: string; score: { before: number; after: number }
  summary: string; issueCount: number; criticalCount: number; highCount?: number
  issues: any[]; fixedCode: string; error?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

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
  vue: "text-emerald-400 bg-emerald-400/10", svelte: "text-orange-500 bg-orange-500/10",
}

const CODE_EXTS = new Set([
  "js","ts","jsx","tsx","py","java","go","rs","rb","php",
  "cs","cpp","c","h","swift","kt","sql","sh","yaml","yml",
  "json","html","css","scss","vue","svelte",
])

function isCodeFile(path: string) {
  return CODE_EXTS.has(path.split(".").pop()?.toLowerCase() ?? "")
}

function buildTree(nodes: TreeNode[]) {
  const tree: Record<string, any> = {}
  for (const node of nodes) {
    const parts = node.path.split("/")
    let cursor = tree
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (i === parts.length - 1) { cursor[part] = { ...node, _type: node.type } }
      else { cursor[part] = cursor[part] ?? { _type: "tree", _children: {} }; cursor = cursor[part]._children ?? (cursor[part]._children = {}) }
    }
  }
  return tree
}

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
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3.5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${glow})`, transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <span className="text-[13px] font-bold tabular-nums" style={{ color }}>{score}</span>
    </div>
  )
}

// ─── File Tree ────────────────────────────────────────────────────────────────

function FileTree({ tree, path = "", selected, onToggle, expanded, onExpand, flatNodes }: {
  tree: Record<string, any>; path?: string; selected: Set<string>
  onToggle: (p: string) => void; expanded: Set<string>; onExpand: (p: string) => void; flatNodes: TreeNode[]
}) {
  const entries = Object.entries(tree).sort(([,a],[,b]) => {
    if (a._type === "tree" && b._type !== "tree") return -1
    if (a._type !== "tree" && b._type === "tree") return 1
    return 0
  })

  function folderDrag(e: React.DragEvent, fp: string) {
    const files = flatNodes.filter(n => n.type==="blob" && n.path.startsWith(fp+"/") && isCodeFile(n.path)).map(n=>n.path)
    if (!files.length) { e.preventDefault(); return }
    e.dataTransfer.effectAllowed = "copy"
    e.dataTransfer.setData("meridian-files", JSON.stringify(files))
  }

  return (
    <div>
      {entries.map(([name, node]) => {
        const fullPath = path ? `${path}/${name}` : name
        if (node._type === "tree") {
          const isExp = expanded.has(fullPath)
          const count = flatNodes.filter(n=>n.type==="blob"&&n.path.startsWith(fullPath+"/")&&isCodeFile(n.path)).length
          return (
            <div key={fullPath}>
              <div draggable={count>0} onDragStart={e=>folderDrag(e,fullPath)}
                className="group flex items-center gap-1.5 w-full px-2 py-[3px] rounded-md hover:bg-white/[0.04] transition-colors cursor-grab">
                <button onClick={()=>onExpand(fullPath)} className="flex items-center gap-1.5 flex-1 min-w-0 text-left">
                  <ChevronDown className={cn("h-3 w-3 text-white/20 shrink-0 transition-transform duration-150",isExp?"rotate-0":"-rotate-90")}/>
                  <FolderOpen className="h-3.5 w-3.5 text-amber-400/40 shrink-0"/>
                  <span className="text-[11px] text-white/50 truncate">{name}</span>
                  {count>0 && <span className="text-[9px] text-white/15 shrink-0 ml-0.5">{count}</span>}
                </button>
                <GripVertical className="h-3 w-3 text-white/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"/>
              </div>
              {isExp && node._children && (
                <div className="pl-3.5 border-l border-white/[0.04] ml-3.5">
                  <FileTree tree={node._children} path={fullPath} selected={selected} onToggle={onToggle} expanded={expanded} onExpand={onExpand} flatNodes={flatNodes}/>
                </div>
              )}
            </div>
          )
        }
        if (!isCodeFile(name)) return null
        const isSel = selected.has(fullPath)
        return (
          <div key={fullPath} draggable
            onDragStart={e=>{e.dataTransfer.effectAllowed="copy";e.dataTransfer.setData("meridian-files",JSON.stringify([fullPath]))}}
            onClick={()=>onToggle(fullPath)}
            className={cn("group flex items-center gap-1.5 px-2 py-[3px] rounded-md cursor-pointer select-none transition-all",
              isSel?"bg-violet-500/10":"hover:bg-white/[0.04]"
            )}>
            <div className={cn("h-3.5 w-3.5 shrink-0 rounded flex items-center justify-center border transition-all",
              isSel?"bg-violet-500 border-violet-500":"border-white/15"
            )}>
              {isSel && <Check className="h-2 w-2 text-white"/>}
            </div>
            <FileCode2 className={cn("h-3.5 w-3.5 shrink-0 transition-colors",isSel?"text-violet-400":"text-white/20")}/>
            <span className={cn("text-[11px] truncate flex-1 transition-colors",isSel?"text-violet-300":"text-white/40")}>{name}</span>
            <GripVertical className="h-3 w-3 text-white/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"/>
          </div>
        )
      })}
    </div>
  )
}

// ─── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({ result, index }: { result: FileResult; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const shortName = result.name.split("/").pop() ?? result.name
  const langKey = result.language?.toLowerCase() ?? ""
  const langStyle = LANG_COLOR[langKey] ?? "text-white/30 bg-white/[0.05]"
  const improvement = result.score.after - result.score.before
  const critCount = result.issues?.filter((i:any)=>i.severity==="Critical").length ?? 0
  const highCount = result.issues?.filter((i:any)=>i.severity==="High").length ?? 0
  const medCount = result.issues?.filter((i:any)=>i.severity==="Medium").length ?? 0
  const lowCount = result.issues?.filter((i:any)=>i.severity==="Low").length ?? 0

  function copyFixed() {
    navigator.clipboard.writeText(result.fixedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadFixed() {
    const blob = new Blob([result.fixedCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `fixed-${shortName}`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22,1,0.36,1] }}
      className="rounded-2xl border border-white/[0.07] bg-[#0a0f1c] overflow-hidden"
    >
      {/* Error state */}
      {result.error && (
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/15">
            <AlertCircle className="h-4 w-4 text-red-400"/>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-white/70">{shortName}</p>
            <p className="text-[11px] text-red-400 mt-0.5">{result.error}</p>
          </div>
        </div>
      )}

      {!result.error && (
        <>
          {/* Header */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start gap-4">
              {/* Score rings */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-center">
                  <div className="text-[9px] text-white/20 mb-1">Before</div>
                  <ScoreRing score={result.score.before} size={48}/>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-px w-5 bg-white/10"/>
                  {improvement > 0 && (
                    <span className="text-[9px] font-bold text-emerald-400">+{improvement}</span>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-white/20 mb-1">After</div>
                  <ScoreRing score={result.score.after} size={48}/>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[13px] font-semibold text-white/80 truncate">{shortName}</span>
                  {result.language && (
                    <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide", langStyle)}>
                      {result.language}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/35 leading-relaxed line-clamp-2">{result.summary}</p>

                {/* Severity pills */}
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {critCount > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/15 text-red-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block"/>{critCount} Critical
                    </span>
                  )}
                  {highCount > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/15 text-orange-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500 inline-block"/>{highCount} High
                    </span>
                  )}
                  {medCount > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/15 text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block"/>{medCount} Medium
                    </span>
                  )}
                  {lowCount > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/15 text-blue-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 inline-block"/>{lowCount} Low
                    </span>
                  )}
                  {result.issues?.length === 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-400">
                      <CheckCircle2 className="h-3 w-3"/>No issues
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={downloadFixed}
                  className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] px-3 py-1.5 text-[10px] font-medium text-white/40 hover:text-white/70 transition-all">
                  <Download className="h-3 w-3"/>Download
                </button>
              </div>
            </div>
          </div>

          {/* Issues toggle */}
          {result.issues?.length > 0 && (
            <div className="border-t border-white/[0.05]">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 w-full px-5 py-3 hover:bg-white/[0.02] transition-colors text-left"
              >
                <ChevronDown className={cn("h-3.5 w-3.5 text-white/30 transition-transform duration-200", expanded ? "rotate-0" : "-rotate-90")}/>
                <span className="text-[11px] font-medium text-white/40">
                  {result.issues.length} issue{result.issues.length !== 1 ? "s" : ""} found
                </span>
                <div className="flex-1"/>
                {!expanded && critCount > 0 && (
                  <span className="text-[9px] text-red-400/60">{critCount} critical need attention</span>
                )}
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22,1,0.36,1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {result.issues.map((issue: any, j: number) => {
                        const sev = SEV_CFG[issue.severity as keyof typeof SEV_CFG] ?? SEV_CFG.Low
                        return (
                          <motion.div
                            key={j}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: j * 0.03 }}
                            className={cn("rounded-xl border p-4", sev.bg, sev.border)}
                          >
                            <div className="flex items-start gap-2.5">
                              <sev.icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", sev.text)}/>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className={cn("text-[10px] font-bold uppercase tracking-wide", sev.text)}>
                                    {issue.severity}
                                  </span>
                                  {issue.type && (
                                    <span className="text-[9px] text-white/20 border border-white/[0.08] px-1.5 py-0.5 rounded-md">
                                      {issue.type}
                                    </span>
                                  )}
                                  {issue.line != null && (
                                    <span className="text-[9px] text-white/20 font-mono">line {issue.line}</span>
                                  )}
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

          {/* Fixed code toggle */}
          {result.fixedCode && (
            <div className="border-t border-white/[0.05]">
              <button
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-2 w-full px-5 py-3 hover:bg-white/[0.02] transition-colors text-left"
              >
                <ChevronDown className={cn("h-3.5 w-3.5 text-white/30 transition-transform duration-200", showCode ? "rotate-0" : "-rotate-90")}/>
                <Code2 className="h-3.5 w-3.5 text-violet-400/50"/>
                <span className="text-[11px] font-medium text-white/40">Fixed code</span>
                <div className="flex-1"/>
                <span className="text-[9px] text-white/20">AI-corrected version</span>
              </button>

              <AnimatePresence>
                {showCode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="relative mx-4 mb-4 rounded-xl overflow-hidden border border-white/[0.07] bg-[#060b14]">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05] bg-white/[0.02]">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-red-500/50"/>
                          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50"/>
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50"/>
                          <span className="ml-2 text-[10px] text-white/20 font-mono">{shortName}</span>
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
        </>
      )}
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RepoScannerPage() {
  const [token, setToken] = useState("")
  const [tokenSource, setTokenSource] = useState<"oauth"|"pat"|null>(null)
  const [showPat, setShowPat] = useState(false)
  const [patInput, setPatInput] = useState("")
  const [repos, setRepos] = useState<GHRepo[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [repoError, setRepoError] = useState<string|null>(null)
  const [selectedRepo, setSelectedRepo] = useState<GHRepo|null>(null)
  const [tree, setTree] = useState<Record<string,any>|null>(null)
  const [flatNodes, setFlatNodes] = useState<TreeNode[]>([])
  const [loadingTree, setLoadingTree] = useState(false)
  const [treeError, setTreeError] = useState<string|null>(null)
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [isScanning, setIsScanning] = useState(false)
  const [scanningFile, setScanningFile] = useState<string|null>(null)
  const [results, setResults] = useState<FileResult[]|null>(null)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const codeFiles = flatNodes.filter(n => n.type === "blob" && isCodeFile(n.path)).map(n => n.path)
  const queuedFiles = Array.from(selectedFiles)

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsLoggedIn(!!session)
        if (session?.provider_token) {
          setToken(session.provider_token); setTokenSource("oauth")
          fetchReposWithToken(session.provider_token)
        } else {
          const saved = localStorage.getItem("meridian_gh_pat")
          if (saved) { setToken(saved); setTokenSource("pat"); setPatInput(saved); fetchReposWithToken(saved) }
        }
        setSessionChecked(true)
      })
    })
  }, [])

  async function fetchReposWithToken(t: string) {
    setLoadingRepos(true); setRepoError(null); setRepos([]); setSelectedRepo(null); setTree(null)
    try {
      const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator", {
        headers: { Authorization: `Bearer ${t}`, Accept: "application/vnd.github.v3+json" },
      })
      if (!res.ok) throw new Error(`GitHub API ${res.status}`)
      setRepos(await res.json())
    } catch (err: any) { setRepoError(err.message) }
    finally { setLoadingRepos(false) }
  }

  async function connectGithub() {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({ provider: "github", options: {
      redirectTo: `${window.location.origin}/auth/callback`, scopes: "repo read:user user:email"
    }})
  }

  function loadWithPat() {
    if (!patInput.trim()) return
    localStorage.setItem("meridian_gh_pat", patInput.trim())
    setToken(patInput.trim()); setTokenSource("pat"); fetchReposWithToken(patInput.trim())
  }

  async function loadTree(repo: GHRepo) {
    setSelectedRepo(repo); setTree(null); setFlatNodes([]); setLoadingTree(true); setTreeError(null)
    setSelectedFiles(new Set()); setResults(null)
    try {
      const res = await fetch(
        `https://api.github.com/repos/${repo.full_name}/git/trees/${repo.default_branch}?recursive=1`,
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" } }
      )
      if (!res.ok) throw new Error(`Could not load tree: ${res.status}`)
      const data = await res.json()
      const nodes: TreeNode[] = data.tree.filter((n: any) =>
        n.type === "blob" && n.path && !n.path.includes("node_modules") && !n.path.includes(".git")
        && !n.path.includes("dist/") && !n.path.includes(".next/")
      )
      setFlatNodes(nodes); setTree(buildTree(nodes))
      const rootDirs = nodes.map(n=>n.path.split("/")[0]).filter((d,i,a)=>a.indexOf(d)===i&&!d.includes("."))
      setExpandedDirs(new Set(rootDirs.slice(0,3)))
    } catch (err: any) { setTreeError(err.message) }
    finally { setLoadingTree(false) }
  }

  function toggleFile(path: string) {
    setSelectedFiles(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else if (next.size < 10) next.add(path)
      return next
    })
  }

  function selectAll() {
    const toSelect = codeFiles.slice(0, 10)
    setSelectedFiles(new Set(toSelect))
  }

  function deselectAll() { setSelectedFiles(new Set()) }

  function addFiles(paths: string[]) {
    setSelectedFiles(prev => {
      const next = new Set(prev)
      for (const p of paths) { if (next.size >= 10) break; next.add(p) }
      return next
    })
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setIsDragOver(true)
  }
  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false)
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setIsDragOver(false)
    try { const p = JSON.parse(e.dataTransfer.getData("meridian-files")); addFiles(p) } catch {}
  }

  async function scanSelected() {
    if (!selectedFiles.size || !selectedRepo) return
    setIsScanning(true); setResults(null)
    const allResults: FileResult[] = []
    for (const filePath of Array.from(selectedFiles)) {
      setScanningFile(filePath)
      try {
        const res = await fetch(
          `https://api.github.com/repos/${selectedRepo.full_name}/contents/${filePath}`,
          { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" } }
        )
        const fd = await res.json()
        const content = atob(fd.content.replace(/\n/g,""))
        const scanRes = await fetch("/api/scan-batch", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: [{ name: filePath.split("/").pop()??filePath, content: content.slice(0,50000) }] }),
        })
        const scanData = await scanRes.json()
        if (scanData.error) throw new Error(scanData.error)
        allResults.push({ ...scanData.results[0], name: filePath })
      } catch (err: any) {
        allResults.push({ name: filePath, error: err.message, language:"", score:{before:0,after:0}, summary:"", issueCount:0, criticalCount:0, issues:[], fixedCode:"" })
      }
      setResults([...allResults])
    }
    setScanningFile(null); setIsScanning(false)
  }

  // Aggregate stats for results header
  const totalIssues = results?.reduce((s,r) => s + (r.issues?.length??0), 0) ?? 0
  const totalCritical = results?.reduce((s,r) => s + (r.issues?.filter((i:any)=>i.severity==="Critical").length??0), 0) ?? 0
  const avgAfter = results?.length ? Math.round(results.reduce((s,r)=>s+r.score.after,0)/results.length) : 0

  return (
    <div className="flex flex-col h-full bg-[#060b16]">

      {/* Title bar */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
        className="flex items-center h-11 border-b border-white/[0.05] bg-[#070d1a]/80 backdrop-blur-md shrink-0 px-4">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/25">
          <Link href="/scanner" className="flex items-center gap-1 text-white/35 hover:text-white/60 transition-colors mr-1">
            <ArrowLeft className="h-3.5 w-3.5"/>
          </Link>
          <Github className="h-3.5 w-3.5 text-violet-400 shrink-0"/>
          <span className="text-white/40">meridian</span>
          <ChevronRight className="h-3 w-3"/>
          <span className="text-white/40">scanner</span>
          <ChevronRight className="h-3 w-3"/>
          <span className="text-violet-400/70">repos</span>
          {selectedRepo && <><ChevronRight className="h-3 w-3"/><span className="text-white/50">{selectedRepo.name}</span></>}
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5 rounded-full bg-violet-500/[0.08] border border-violet-500/[0.15] px-3 py-1">
            <Sparkles className="h-3 w-3 text-violet-400"/>
            <span className="text-[10px] font-semibold text-violet-300 tracking-wide">claude-sonnet-4-6</span>
          </div>
        </div>
        <div className="w-24"/>
      </motion.div>

      <div className="flex flex-1 min-h-0">

        {/* ── Left: repos ───────────────────────────────────────────────── */}
        <div className="flex flex-col w-64 border-r border-white/[0.05] shrink-0 overflow-hidden">
          {/* Connection */}
          <div className="p-3 border-b border-white/[0.05] shrink-0">
            {!sessionChecked ? (
              <div className="flex items-center justify-center py-3"><Loader2 className="h-4 w-4 animate-spin text-white/30"/></div>
            ) : tokenSource === "oauth" ? (
              <div className="flex items-center gap-2.5 px-1 py-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                  <Github className="h-3.5 w-3.5 text-emerald-400"/>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white/60">GitHub connected</p>
                  <p className="text-[9px] text-white/25">{repos.length > 0 ? `${repos.length} repos loaded` : "Loading repos…"}</p>
                </div>
              </div>
            ) : !isLoggedIn ? (
              <button onClick={connectGithub} className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] h-9 text-[11px] font-semibold text-white transition-colors">
                <Github className="h-3.5 w-3.5"/>Sign in with GitHub
              </button>
            ) : (
              <div className="space-y-2">
                <button onClick={connectGithub} className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 h-9 text-[11px] font-semibold text-white transition-colors">
                  <Github className="h-3.5 w-3.5"/>Connect GitHub
                </button>
                <div className="relative">
                  <input type={showPat?"text":"password"} value={patInput} onChange={e=>setPatInput(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&loadWithPat()} placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full h-8 bg-white/[0.04] border border-white/[0.08] rounded-lg pl-3 pr-8 text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/30 font-mono"/>
                  <button type="button" onClick={()=>setShowPat(!showPat)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50">
                    {showPat?<EyeOff className="h-3 w-3"/>:<Eye className="h-3 w-3"/>}
                  </button>
                </div>
                <button onClick={loadWithPat} disabled={!patInput.trim()||loadingRepos}
                  className="w-full flex items-center justify-center rounded-lg bg-white/[0.05] hover:bg-white/[0.08] disabled:opacity-40 h-7 text-[10px] font-medium text-white/60 transition-colors">
                  {loadingRepos?<Loader2 className="h-3 w-3 animate-spin"/>:"Load with token"}
                </button>
              </div>
            )}
            {repoError && <p className="mt-2 text-[10px] text-red-400">{repoError}</p>}
          </div>

          {/* Repo list */}
          <div className="flex-1 overflow-y-auto py-1.5 px-1.5">
            {loadingRepos && (
              <div className="space-y-1 p-1">
                {[...Array(5)].map((_,i) => (
                  <div key={i} className="h-14 rounded-xl bg-white/[0.02] animate-pulse"/>
                ))}
              </div>
            )}
            {repos.length === 0 && !loadingRepos && (
              <div className="flex flex-col items-center justify-center py-10 text-center px-3">
                <Github className="h-6 w-6 text-white/10 mb-2"/>
                <p className="text-[10px] text-white/20">Connect GitHub to see your repos</p>
              </div>
            )}
            {repos.map(repo => (
              <button key={repo.id} onClick={()=>loadTree(repo)}
                className={cn("w-full text-left px-3 py-2.5 rounded-xl transition-all mb-0.5 group",
                  selectedRepo?.id===repo.id ? "bg-violet-500/10 border border-violet-500/20" : "hover:bg-white/[0.04] border border-transparent"
                )}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  {repo.private?<Lock className="h-2.5 w-2.5 text-white/20 shrink-0"/>:<Unlock className="h-2.5 w-2.5 text-white/15 shrink-0"/>}
                  <span className="text-[11px] font-medium text-white/70 truncate">{repo.name}</span>
                </div>
                {repo.description && <p className="text-[10px] text-white/25 truncate mb-1 ml-4">{repo.description}</p>}
                <div className="flex items-center gap-2.5 text-[9px] text-white/20 ml-4">
                  {repo.language && <span className="text-white/30">{repo.language}</span>}
                  <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5"/>{repo.stargazers_count}</span>
                  <span className="flex items-center gap-0.5"><GitFork className="h-2.5 w-2.5"/>{repo.forks_count}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Middle: file tree ─────────────────────────────────────────── */}
        <div className="flex flex-col w-60 border-r border-white/[0.05] shrink-0">
          {/* Header with select all */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.05] shrink-0 gap-2">
            <span className="text-[11px] font-semibold text-white/40 truncate">
              {selectedRepo ? selectedRepo.name : "Select a repo"}
            </span>
            {tree && !loadingTree && codeFiles.length > 0 && (
              <button
                onClick={selectedFiles.size === codeFiles.slice(0,10).length && codeFiles.slice(0,10).every(f=>selectedFiles.has(f)) ? deselectAll : selectAll}
                className="flex items-center gap-1 shrink-0 text-[9px] font-semibold text-violet-400/70 hover:text-violet-300 transition-colors"
              >
                <CheckSquare2 className="h-3 w-3"/>
                {selectedFiles.size > 0 ? "Deselect" : `All (${Math.min(codeFiles.length,10)})`}
              </button>
            )}
          </div>

          {/* File count bar */}
          {tree && !loadingTree && (
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.04] bg-white/[0.01] shrink-0">
              <FileCode2 className="h-3 w-3 text-white/15"/>
              <span className="text-[9px] text-white/20">{codeFiles.length} code files</span>
              {selectedFiles.size > 0 && (
                <span className="ml-auto text-[9px] font-semibold text-violet-400">{selectedFiles.size}/10 selected</span>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto py-1.5 px-1.5">
            {loadingTree && (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-4 w-4 animate-spin text-white/30"/></div>
            )}
            {treeError && <p className="px-3 py-2 text-[10px] text-red-400">{treeError}</p>}
            {!selectedRepo && !loadingTree && (
              <div className="flex flex-col items-center justify-center py-10 text-center px-3">
                <FolderOpen className="h-6 w-6 text-white/10 mb-2"/>
                <p className="text-[10px] text-white/20">Pick a repo to browse files</p>
              </div>
            )}
            {tree && !loadingTree && (
              <FileTree tree={tree} selected={selectedFiles} onToggle={toggleFile}
                expanded={expandedDirs} onExpand={p=>setExpandedDirs(prev=>{const n=new Set(prev);n.has(p)?n.delete(p):n.add(p);return n})}
                flatNodes={flatNodes}/>
            )}
          </div>

          {/* Scan button */}
          {selectedFiles.size > 0 && !results && !isScanning && (
            <div className="px-3 py-3 border-t border-white/[0.05] shrink-0">
              <button onClick={scanSelected}
                className="group relative overflow-hidden w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 h-9 text-[11px] font-semibold text-white transition-colors">
                <Play className="h-3.5 w-3.5 fill-white"/>
                Scan {selectedFiles.size} file{selectedFiles.size!==1?"s":""}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:translate-x-full transition-transform duration-700"/>
              </button>
            </div>
          )}
        </div>

        {/* ── Right: results ────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>

          {/* Results header */}
          <div className="flex items-center gap-3 px-5 py-2.5 border-b border-white/[0.05] shrink-0">
            {results && !isScanning ? (
              <>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-[11px] font-semibold text-white/50">{results.length} file{results.length!==1?"s":""} analyzed</span>
                  {totalCritical > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/15 text-red-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block"/>{totalCritical} critical
                    </span>
                  )}
                  <span className="text-[10px] text-white/20">·</span>
                  <span className="text-[10px] text-white/25">{totalIssues} total issues</span>
                  <span className="text-[10px] text-white/20">·</span>
                  <span className="text-[10px] text-emerald-400/70">avg score {avgAfter}/100</span>
                </div>
                <div className="flex items-center gap-2">
                  {results.some(r=>r.fixedCode) && (
                    <button onClick={()=>results.forEach(r=>r.fixedCode&&(()=>{const b=new Blob([r.fixedCode],{type:"text/plain"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=`fixed-${r.name.split("/").pop()}`;a.click();URL.revokeObjectURL(u)})())}
                      className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] px-3 py-1.5 text-[10px] font-medium text-white/40 hover:text-white/70 transition-all">
                      <Download className="h-3 w-3"/>Download all
                    </button>
                  )}
                  <button onClick={()=>{setResults(null);setSelectedFiles(new Set())}}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] px-3 py-1.5 text-[10px] font-medium text-white/40 hover:text-white/70 transition-all">
                    <Zap className="h-3 w-3"/>New scan
                  </button>
                </div>
              </>
            ) : isScanning ? (
              <div className="flex items-center gap-2 flex-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400"/>
                <span className="text-[11px] font-medium text-white/40">Scanning with AI…</span>
                {scanningFile && <span className="text-[10px] text-white/20 font-mono truncate">{scanningFile.split("/").pop()}</span>}
              </div>
            ) : (
              <span className="text-[11px] font-semibold text-white/30 flex-1">
                {queuedFiles.length > 0 ? `${queuedFiles.length} file${queuedFiles.length!==1?"s":""} queued` : "Analysis"}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5">

            {/* Empty drop zone */}
            {!results && !isScanning && queuedFiles.length === 0 && (
              <motion.div
                animate={{
                  borderColor: isDragOver ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.05)",
                  backgroundColor: isDragOver ? "rgba(139,92,246,0.04)" : "transparent",
                }}
                className="h-full min-h-[320px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed"
              >
                <motion.div animate={{ scale: isDragOver ? 1.12 : 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={cn("flex h-16 w-16 items-center justify-center rounded-2xl mb-5 transition-all duration-200",
                    isDragOver ? "bg-violet-500/15 border border-violet-500/25" : "bg-white/[0.03] border border-white/[0.06]"
                  )}>
                  <Brain className={cn("h-7 w-7 transition-colors", isDragOver ? "text-violet-400" : "text-white/15")}/>
                </motion.div>
                <p className={cn("text-[14px] font-semibold mb-1.5 transition-colors", isDragOver ? "text-violet-300" : "text-white/20")}>
                  {isDragOver ? "Drop to queue" : "Drag files here to scan"}
                </p>
                <p className="text-[11px] text-white/15">
                  {isDragOver ? "" : "or select files in the tree, then click Scan"}
                </p>
              </motion.div>
            )}

            {/* Queue */}
            {!results && !isScanning && queuedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] text-white/30 font-medium">{queuedFiles.length} file{queuedFiles.length!==1?"s":""} ready to scan</p>
                  <button onClick={deselectAll} className="text-[10px] text-white/20 hover:text-white/50 transition-colors">Clear all</button>
                </div>
                <AnimatePresence>
                  {queuedFiles.map((fp, i) => (
                    <motion.div key={fp}
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0a0f1c] px-4 py-3 group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/15 shrink-0">
                        <FileCode2 className="h-3.5 w-3.5 text-violet-400/70"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-white/65 truncate">{fp.split("/").pop()}</p>
                        <p className="text-[10px] text-white/20 truncate font-mono mt-0.5">{fp}</p>
                      </div>
                      <button onClick={()=>setSelectedFiles(prev=>{const n=new Set(prev);n.delete(fp);return n})}
                        className="text-white/10 hover:text-white/50 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                        <X className="h-3.5 w-3.5"/>
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {queuedFiles.length < 10 && (
                  <motion.div animate={{ borderColor: isDragOver ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.04)" }}
                    className="flex items-center justify-center rounded-xl border border-dashed py-3">
                    <span className="text-[10px] text-white/15">
                      {isDragOver ? "Release to add" : `${10-queuedFiles.length} more slot${10-queuedFiles.length!==1?"s":""} available`}
                    </span>
                  </motion.div>
                )}
              </div>
            )}

            {/* Scanning progress */}
            {isScanning && (
              <div className="space-y-2">
                {queuedFiles.map(fp => {
                  const done = results?.find(r=>r.name===fp)
                  const scanning = scanningFile === fp
                  return (
                    <motion.div key={fp}
                      animate={{ borderColor: scanning ? "rgba(139,92,246,0.25)" : done ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)" }}
                      className="flex items-center gap-3 rounded-xl border bg-[#0a0f1c] px-4 py-3"
                    >
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 transition-all",
                        done ? "bg-emerald-500/10 border-emerald-500/15" : scanning ? "bg-violet-500/10 border-violet-500/15" : "bg-white/[0.02] border-white/[0.05]"
                      )}>
                        {done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400"/>
                          : scanning ? <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400"/>
                          : <div className="h-1.5 w-1.5 rounded-full bg-white/15"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-white/55 truncate">{fp.split("/").pop()}</p>
                        <p className={cn("text-[10px] mt-0.5 transition-colors",
                          done ? "text-emerald-400/60" : scanning ? "text-violet-400/60 animate-pulse" : "text-white/15"
                        )}>
                          {done ? `Score: ${done.score.before} → ${done.score.after}` : scanning ? "Analyzing with AI…" : "Queued"}
                        </p>
                      </div>
                      {done && done.criticalCount > 0 && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/15 text-red-400 shrink-0">
                          {done.criticalCount} critical
                        </span>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Results */}
            {results && !isScanning && (
              <div className="space-y-4">
                {results.map((result, i) => (
                  <ResultCard key={result.name} result={result} index={i}/>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
