"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Github, ArrowLeft, ChevronRight, Sparkles, Key, Eye, EyeOff,
  Loader2, FolderOpen, FileCode2, ChevronDown, Play,
  CheckCircle2, Download, Star, GitFork,
  Lock, Unlock, Brain,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface GHRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
  default_branch: string
}

interface TreeNode {
  path: string
  type: "blob" | "tree"
  sha: string
}

interface FileResult {
  name: string
  language: string
  score: { before: number; after: number }
  summary: string
  issueCount: number
  criticalCount: number
  issues: any[]
  fixedCode: string
  error?: string
}

const SEV = {
  Critical: { badge: "bg-red-500/15 text-red-400", bar: "bg-red-500" },
  High:     { badge: "bg-orange-500/15 text-orange-400", bar: "bg-orange-500" },
  Medium:   { badge: "bg-amber-500/15 text-amber-400", bar: "bg-amber-500" },
  Low:      { badge: "bg-blue-500/15 text-blue-400", bar: "bg-blue-500" },
}

const CODE_EXTS = new Set([
  "js", "ts", "jsx", "tsx", "py", "java", "go", "rs", "rb", "php",
  "cs", "cpp", "c", "h", "swift", "kt", "sql", "sh", "yaml", "yml",
  "json", "html", "css", "scss", "vue", "svelte",
])

function isCodeFile(path: string) {
  const ext = path.split(".").pop()?.toLowerCase() ?? ""
  return CODE_EXTS.has(ext)
}

function buildTree(nodes: TreeNode[]) {
  const tree: Record<string, any> = {}
  for (const node of nodes) {
    const parts = node.path.split("/")
    let cursor = tree
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (i === parts.length - 1) {
        cursor[part] = { ...node, _type: node.type }
      } else {
        cursor[part] = cursor[part] ?? { _type: "tree", _children: {} }
        cursor = cursor[part]._children ?? (cursor[part]._children = {})
      }
    }
  }
  return tree
}

function FileTree({
  tree, path = "", selected, onToggle, expanded, onExpand,
}: {
  tree: Record<string, any>
  path?: string
  selected: Set<string>
  onToggle: (p: string) => void
  expanded: Set<string>
  onExpand: (p: string) => void
}) {
  const entries = Object.entries(tree).sort(([, a], [, b]) => {
    if (a._type === "tree" && b._type !== "tree") return -1
    if (a._type !== "tree" && b._type === "tree") return 1
    return 0
  })

  return (
    <div className="space-y-0">
      {entries.map(([name, node]) => {
        const fullPath = path ? `${path}/${name}` : name
        if (node._type === "tree") {
          const isExp = expanded.has(fullPath)
          return (
            <div key={fullPath}>
              <button
                onClick={() => onExpand(fullPath)}
                className="flex items-center gap-1.5 w-full px-2 py-1 rounded-lg hover:bg-white/[0.04] transition-colors text-left"
              >
                <ChevronDown className={cn("h-3 w-3 text-white/25 shrink-0 transition-transform", isExp ? "rotate-0" : "-rotate-90")} />
                <FolderOpen className="h-3.5 w-3.5 text-amber-400/50 shrink-0" />
                <span className="text-[11px] text-white/55 truncate">{name}</span>
              </button>
              {isExp && node._children && (
                <div className="pl-4">
                  <FileTree
                    tree={node._children}
                    path={fullPath}
                    selected={selected}
                    onToggle={onToggle}
                    expanded={expanded}
                    onExpand={onExpand}
                  />
                </div>
              )}
            </div>
          )
        }
        if (!isCodeFile(name)) return null
        const isSelected = selected.has(fullPath)
        return (
          <button
            key={fullPath}
            onClick={() => onToggle(fullPath)}
            className={cn(
              "flex items-center gap-1.5 w-full px-2 py-1 rounded-lg transition-colors text-left",
              isSelected ? "bg-emerald-500/10" : "hover:bg-white/[0.04]"
            )}
          >
            <div className={cn(
              "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border",
              isSelected ? "bg-emerald-500 border-emerald-500" : "border-white/20"
            )}>
              {isSelected && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
            </div>
            <FileCode2 className="h-3.5 w-3.5 text-white/25 shrink-0" />
            <span className={cn("text-[11px] truncate", isSelected ? "text-emerald-300" : "text-white/45")}>{name}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function RepoScannerPage() {
  const [pat, setPat] = useState("")
  const [showPat, setShowPat] = useState(false)
  const [patSaved, setPatSaved] = useState(false)
  const [repos, setRepos] = useState<GHRepo[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [repoError, setRepoError] = useState<string | null>(null)
  const [selectedRepo, setSelectedRepo] = useState<GHRepo | null>(null)
  const [tree, setTree] = useState<Record<string, any> | null>(null)
  const [loadingTree, setLoadingTree] = useState(false)
  const [treeError, setTreeError] = useState<string | null>(null)
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [isScanning, setIsScanning] = useState(false)
  const [scanningFile, setScanningFile] = useState<string | null>(null)
  const [results, setResults] = useState<FileResult[] | null>(null)
  const [expandedResult, setExpandedResult] = useState<string | null>(null)

  // Load saved PAT on mount
  useEffect(() => {
    const saved = localStorage.getItem("meridian_gh_pat")
    if (saved) { setPat(saved); setPatSaved(true) }
  }, [])

  async function loadRepos() {
    if (!pat.trim()) return
    localStorage.setItem("meridian_gh_pat", pat.trim())
    setPatSaved(true)
    setLoadingRepos(true); setRepoError(null); setRepos([]); setSelectedRepo(null); setTree(null)

    try {
      const res = await fetch("https://api.github.com/user/repos?per_page=50&sort=updated", {
        headers: { Authorization: `token ${pat.trim()}`, "Accept": "application/vnd.github.v3+json" },
      })
      if (!res.ok) throw new Error(`GitHub API error: ${res.status} — check your token`)
      const data: GHRepo[] = await res.json()
      setRepos(data)
    } catch (err: any) {
      setRepoError(err.message)
    } finally {
      setLoadingRepos(false)
    }
  }

  async function loadTree(repo: GHRepo) {
    setSelectedRepo(repo); setTree(null); setLoadingTree(true); setTreeError(null)
    setSelectedFiles(new Set()); setResults(null)

    try {
      const res = await fetch(
        `https://api.github.com/repos/${repo.full_name}/git/trees/${repo.default_branch}?recursive=1`,
        { headers: { Authorization: `token ${pat.trim()}`, "Accept": "application/vnd.github.v3+json" } }
      )
      if (!res.ok) throw new Error(`Could not load file tree: ${res.status}`)
      const data = await res.json()
      const nodes: TreeNode[] = data.tree.filter((n: any) => n.type === "blob" && n.path && !n.path.includes("node_modules") && !n.path.includes(".git"))
      setTree(buildTree(nodes))
      // Auto-expand root
      const rootDirs = nodes
        .map(n => n.path.split("/")[0])
        .filter((d, i, arr) => arr.indexOf(d) === i && d.includes(".") === false)
      setExpandedDirs(new Set(rootDirs.slice(0, 3)))
    } catch (err: any) {
      setTreeError(err.message)
    } finally {
      setLoadingTree(false)
    }
  }

  function toggleFile(path: string) {
    setSelectedFiles(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else if (next.size < 10) next.add(path)
      return next
    })
  }

  function toggleDir(path: string) {
    setExpandedDirs(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  async function scanSelected() {
    if (!selectedFiles.size || !selectedRepo) return
    setIsScanning(true); setResults(null)

    const allResults: FileResult[] = []
    for (const filePath of Array.from(selectedFiles)) {
      setScanningFile(filePath)
      try {
        // Fetch file content from GitHub
        const res = await fetch(
          `https://api.github.com/repos/${selectedRepo.full_name}/contents/${filePath}`,
          { headers: { Authorization: `token ${pat.trim()}`, "Accept": "application/vnd.github.v3+json" } }
        )
        const fileData = await res.json()
        const content = atob(fileData.content.replace(/\n/g, ""))

        // Send to batch scan API
        const scanRes = await fetch("/api/scan-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: [{ name: filePath.split("/").pop() ?? filePath, content: content.slice(0, 20000) }] }),
        })
        const scanData = await scanRes.json()
        if (scanData.error) throw new Error(scanData.error)
        allResults.push({ ...scanData.results[0], name: filePath })
      } catch (err: any) {
        allResults.push({ name: filePath, error: err.message, language: "", score: { before: 0, after: 0 }, summary: "", issueCount: 0, criticalCount: 0, issues: [], fixedCode: "" })
      }
      setResults([...allResults])
    }
    setScanningFile(null)
    setIsScanning(false)
  }

  function downloadResult(result: FileResult) {
    const blob = new Blob([result.fixedCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    const name = result.name.split("/").pop() ?? result.name
    a.href = url; a.download = `fixed-${name}`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full bg-[#060b16]">

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
          <Github className="h-3.5 w-3.5 text-purple-400 shrink-0" />
          <span className="text-white/40">meridian</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white/40">scanner</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-purple-400/70">repos</span>
          {selectedRepo && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white/50">{selectedRepo.name}</span>
            </>
          )}
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5 rounded-full bg-purple-500/[0.08] border border-purple-500/[0.15] px-3 py-1">
            <Sparkles className="h-3 w-3 text-purple-400" />
            <span className="text-[10px] font-semibold text-purple-300 tracking-wide">claude-opus-4-7</span>
          </div>
        </div>
        <div className="w-24" />
      </motion.div>

      <div className="flex flex-1 min-h-0">

        {/* ── Left: PAT + repo list ─────────────────────────────────────── */}
        <div className="flex flex-col w-72 border-r border-white/[0.05] shrink-0 overflow-y-auto">

          {/* PAT input */}
          <div className="p-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-1.5 mb-2">
              <Key className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] font-semibold text-white/60">GitHub Token</span>
              {patSaved && <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">saved</span>}
            </div>
            <div className="relative">
              <input
                type={showPat ? "text" : "password"}
                value={pat}
                onChange={(e) => { setPat(e.target.value); setPatSaved(false) }}
                onKeyDown={(e) => e.key === "Enter" && loadRepos()}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full h-9 bg-white/[0.04] border border-white/[0.08] rounded-xl pl-3 pr-8 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPat(!showPat)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
              >
                {showPat ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>
            </div>
            <button
              onClick={loadRepos}
              disabled={!pat.trim() || loadingRepos}
              className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed h-8 text-[11px] font-semibold text-white transition-colors"
            >
              {loadingRepos ? <Loader2 className="h-3 w-3 animate-spin" /> : <Github className="h-3 w-3" />}
              {loadingRepos ? "Loading repos…" : "Load repositories"}
            </button>
            {repoError && <p className="mt-1.5 text-[10px] text-red-400">{repoError}</p>}
            <p className="mt-2 text-[9px] text-white/20 leading-relaxed">
              Needs <code className="text-white/30">repo</code> scope. Token is stored in localStorage only.
            </p>
          </div>

          {/* Repo list */}
          <div className="flex-1 overflow-y-auto py-2 px-2">
            {repos.length === 0 && !loadingRepos && (
              <div className="flex flex-col items-center justify-center py-8 text-center px-3">
                <Github className="h-6 w-6 text-white/10 mb-2" />
                <p className="text-[10px] text-white/20">Enter your GitHub token above to load your repos</p>
              </div>
            )}
            {repos.map((repo) => (
              <button
                key={repo.id}
                onClick={() => loadTree(repo)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-xl transition-all mb-0.5",
                  selectedRepo?.id === repo.id
                    ? "bg-purple-500/10 border border-purple-500/20"
                    : "hover:bg-white/[0.04] border border-transparent"
                )}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  {repo.private ? <Lock className="h-2.5 w-2.5 text-white/20 shrink-0" /> : <Unlock className="h-2.5 w-2.5 text-white/15 shrink-0" />}
                  <span className="text-[11px] font-medium text-white/70 truncate">{repo.name}</span>
                </div>
                {repo.description && (
                  <p className="text-[10px] text-white/25 truncate mb-1">{repo.description}</p>
                )}
                <div className="flex items-center gap-2.5 text-[9px] text-white/20">
                  {repo.language && <span>{repo.language}</span>}
                  <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5" />{repo.stargazers_count}</span>
                  <span className="flex items-center gap-0.5"><GitFork className="h-2.5 w-2.5" />{repo.forks_count}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Middle: file tree ─────────────────────────────────────────── */}
        <div className="flex flex-col w-64 border-r border-white/[0.05] shrink-0">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.05] shrink-0">
            <span className="text-[11px] font-semibold text-white/40">
              {selectedRepo ? selectedRepo.name : "Select a repo"}
            </span>
            {selectedFiles.size > 0 && (
              <span className="text-[9px] text-white/30">{selectedFiles.size}/10 selected</span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-2">
            {loadingTree && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin text-white/30" />
              </div>
            )}
            {treeError && (
              <p className="px-3 py-2 text-[10px] text-red-400">{treeError}</p>
            )}
            {!selectedRepo && !loadingTree && (
              <div className="flex flex-col items-center justify-center py-10 text-center px-3">
                <FolderOpen className="h-6 w-6 text-white/10 mb-2" />
                <p className="text-[10px] text-white/20">Choose a repo from the left to browse files</p>
              </div>
            )}
            {tree && !loadingTree && (
              <FileTree
                tree={tree}
                selected={selectedFiles}
                onToggle={toggleFile}
                expanded={expandedDirs}
                onExpand={toggleDir}
              />
            )}
          </div>
          {selectedFiles.size > 0 && !results && !isScanning && (
            <div className="px-3 py-3 border-t border-white/[0.05] shrink-0">
              <button
                onClick={scanSelected}
                className="group relative overflow-hidden w-full flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 h-9 text-[11px] font-semibold text-white transition-colors"
              >
                <Play className="h-3 w-3 fill-white" />
                Scan {selectedFiles.size} file{selectedFiles.size !== 1 ? "s" : ""}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          )}
        </div>

        {/* ── Right: results ────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] shrink-0">
            <span className="text-[11px] font-semibold text-white/40">
              {results ? `${results.length} file${results.length !== 1 ? "s" : ""} scanned` : "Results"}
            </span>
            {results && results.some(r => r.fixedCode) && (
              <button
                onClick={() => results.forEach(r => r.fixedCode && downloadResult(r))}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] px-3 py-1.5 text-[10px] font-medium text-white/40 hover:text-white/70 transition-all"
              >
                <Download className="h-3 w-3" />Download all fixed
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {!results && !isScanning && selectedFiles.size === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Brain className="h-8 w-8 text-white/10 mb-3" />
                <p className="text-[12px] text-white/25">Select files from the tree and click Scan</p>
              </div>
            )}

            {isScanning && (
              <div className="space-y-2">
                {Array.from(selectedFiles).map(filePath => {
                  const done = results?.find(r => r.name === filePath)
                  const scanning = scanningFile === filePath
                  return (
                    <div key={filePath} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0a0f1c] px-4 py-3">
                      <FileCode2 className="h-4 w-4 text-white/25 shrink-0" />
                      <span className="flex-1 text-[11px] text-white/50 truncate">{filePath.split("/").pop()}</span>
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : scanning ? (
                        <Loader2 className="h-4 w-4 animate-spin text-purple-400 shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-white/10 shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {results && !isScanning && results.map((result, i) => {
              const isExp = expandedResult === result.name
              const shortName = result.name.split("/").pop() ?? result.name
              return (
                <motion.div
                  key={result.name}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-white/[0.07] bg-[#0a0f1c] overflow-hidden"
                >
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => setExpandedResult(isExp ? null : result.name)}
                  >
                    <FileCode2 className="h-4 w-4 text-white/25 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-white/70 truncate">{shortName}</p>
                      {result.error ? (
                        <p className="text-[10px] text-red-400">{result.error}</p>
                      ) : (
                        <p className="text-[10px] text-white/25 truncate">{result.summary}</p>
                      )}
                    </div>
                    {!result.error && (
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-white/30">{result.score.before}</span>
                          <span className="text-[9px] text-white/20">→</span>
                          <span className={cn(
                            "text-[12px] font-bold",
                            result.score.after >= 80 ? "text-emerald-400" : result.score.after >= 60 ? "text-amber-400" : "text-orange-400"
                          )}>{result.score.after}</span>
                        </div>
                        {result.criticalCount > 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-400">
                            {result.criticalCount} critical
                          </span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadResult(result) }}
                          className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] px-2 py-1 text-[10px] text-white/30 hover:text-white/60 transition-all"
                        >
                          <Download className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {isExp && !result.error && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/[0.05]"
                      >
                        <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
                          {result.issues.map((issue: any, j: number) => (
                            <div key={j} className="relative px-5 py-3">
                              <div className={cn("absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full", SEV[issue.severity as keyof typeof SEV]?.bar ?? "bg-white/20")} />
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-md", SEV[issue.severity as keyof typeof SEV]?.badge ?? "bg-white/10 text-white/40")}>
                                  {issue.severity}
                                </span>
                                <span className="text-[11px] font-medium text-white/70">{issue.title}</span>
                                {issue.line != null && <span className="text-[9px] text-white/20 font-mono">:{issue.line}</span>}
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
