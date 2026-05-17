"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Github, ArrowLeft, ChevronRight, Sparkles, Eye, EyeOff,
  Loader2, FolderOpen, FileCode2, ChevronDown, Play,
  CheckCircle2, Download, Star, GitFork,
  Lock, Unlock, Brain, X, GripVertical,
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
  tree, path = "", selected, onToggle, expanded, onExpand, flatNodes,
}: {
  tree: Record<string, any>
  path?: string
  selected: Set<string>
  onToggle: (p: string) => void
  expanded: Set<string>
  onExpand: (p: string) => void
  flatNodes: TreeNode[]
}) {
  const entries = Object.entries(tree).sort(([, a], [, b]) => {
    if (a._type === "tree" && b._type !== "tree") return -1
    if (a._type !== "tree" && b._type === "tree") return 1
    return 0
  })

  function handleFolderDragStart(e: React.DragEvent, folderPath: string) {
    const files = flatNodes
      .filter(n => n.type === "blob" && n.path.startsWith(folderPath + "/") && isCodeFile(n.path))
      .map(n => n.path)
    if (files.length === 0) { e.preventDefault(); return }
    e.dataTransfer.effectAllowed = "copy"
    e.dataTransfer.setData("meridian-files", JSON.stringify(files))
  }

  function handleFileDragStart(e: React.DragEvent, filePath: string) {
    e.dataTransfer.effectAllowed = "copy"
    e.dataTransfer.setData("meridian-files", JSON.stringify([filePath]))
  }

  return (
    <div className="space-y-0">
      {entries.map(([name, node]) => {
        const fullPath = path ? `${path}/${name}` : name
        if (node._type === "tree") {
          const isExp = expanded.has(fullPath)
          const folderFiles = flatNodes.filter(n => n.type === "blob" && n.path.startsWith(fullPath + "/") && isCodeFile(n.path))
          return (
            <div key={fullPath}>
              <div
                draggable={folderFiles.length > 0}
                onDragStart={(e) => handleFolderDragStart(e, fullPath)}
                className="group flex items-center gap-1.5 w-full px-2 py-1 rounded-lg hover:bg-white/[0.04] transition-colors cursor-grab active:cursor-grabbing"
              >
                <button
                  onClick={() => onExpand(fullPath)}
                  className="flex items-center gap-1.5 flex-1 text-left"
                >
                  <ChevronDown className={cn("h-3 w-3 text-white/25 shrink-0 transition-transform", isExp ? "rotate-0" : "-rotate-90")} />
                  <FolderOpen className="h-3.5 w-3.5 text-amber-400/50 shrink-0" />
                  <span className="text-[11px] text-white/55 truncate">{name}</span>
                  {folderFiles.length > 0 && (
                    <span className="text-[9px] text-white/20 ml-1">{folderFiles.length}</span>
                  )}
                </button>
                <GripVertical className="h-3 w-3 text-white/15 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {isExp && node._children && (
                <div className="pl-4">
                  <FileTree
                    tree={node._children}
                    path={fullPath}
                    selected={selected}
                    onToggle={onToggle}
                    expanded={expanded}
                    onExpand={onExpand}
                    flatNodes={flatNodes}
                  />
                </div>
              )}
            </div>
          )
        }
        if (!isCodeFile(name)) return null
        const isSelected = selected.has(fullPath)
        return (
          <div
            key={fullPath}
            draggable
            onDragStart={(e) => handleFileDragStart(e, fullPath)}
            onClick={() => onToggle(fullPath)}
            className={cn(
              "group flex items-center gap-1.5 w-full px-2 py-1 rounded-lg transition-colors text-left cursor-grab active:cursor-grabbing select-none",
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
            <span className={cn("text-[11px] truncate flex-1", isSelected ? "text-emerald-300" : "text-white/45")}>{name}</span>
            <GripVertical className="h-3 w-3 text-white/15 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )
      })}
    </div>
  )
}

export default function RepoScannerPage() {
  const [token, setToken] = useState("")
  const [tokenSource, setTokenSource] = useState<"oauth" | "pat" | null>(null)
  const [showPat, setShowPat] = useState(false)
  const [patInput, setPatInput] = useState("")
  const [repos, setRepos] = useState<GHRepo[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [repoError, setRepoError] = useState<string | null>(null)
  const [selectedRepo, setSelectedRepo] = useState<GHRepo | null>(null)
  const [tree, setTree] = useState<Record<string, any> | null>(null)
  const [flatNodes, setFlatNodes] = useState<TreeNode[]>([])
  const [loadingTree, setLoadingTree] = useState(false)
  const [treeError, setTreeError] = useState<string | null>(null)
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [isScanning, setIsScanning] = useState(false)
  const [scanningFile, setScanningFile] = useState<string | null>(null)
  const [results, setResults] = useState<FileResult[] | null>(null)
  const [expandedResult, setExpandedResult] = useState<string | null>(null)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsLoggedIn(!!session)
        if (session?.provider_token) {
          setToken(session.provider_token)
          setTokenSource("oauth")
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
        headers: { Authorization: `Bearer ${t}`, "Accept": "application/vnd.github.v3+json" },
      })
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
      setRepos(await res.json())
    } catch (err: any) {
      setRepoError(err.message)
    } finally {
      setLoadingRepos(false)
    }
  }

  async function connectGithub() {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "repo read:user user:email",
      },
    })
  }

  function loadWithPat() {
    if (!patInput.trim()) return
    localStorage.setItem("meridian_gh_pat", patInput.trim())
    setToken(patInput.trim())
    setTokenSource("pat")
    fetchReposWithToken(patInput.trim())
  }

  async function loadTree(repo: GHRepo) {
    setSelectedRepo(repo); setTree(null); setFlatNodes([]); setLoadingTree(true); setTreeError(null)
    setSelectedFiles(new Set()); setResults(null)

    try {
      const res = await fetch(
        `https://api.github.com/repos/${repo.full_name}/git/trees/${repo.default_branch}?recursive=1`,
        { headers: { Authorization: `Bearer ${token}`, "Accept": "application/vnd.github.v3+json" } }
      )
      if (!res.ok) throw new Error(`Could not load file tree: ${res.status}`)
      const data = await res.json()
      const nodes: TreeNode[] = data.tree.filter((n: any) => n.type === "blob" && n.path && !n.path.includes("node_modules") && !n.path.includes(".git"))
      setFlatNodes(nodes)
      setTree(buildTree(nodes))
      const rootDirs = nodes
        .map(n => n.path.split("/")[0])
        .filter((d, i, arr) => arr.indexOf(d) === i && !d.includes("."))
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

  function addFiles(paths: string[]) {
    setSelectedFiles(prev => {
      const next = new Set(prev)
      for (const p of paths) {
        if (next.size >= 10) break
        next.add(p)
      }
      return next
    })
  }

  function removeFile(path: string) {
    setSelectedFiles(prev => {
      const next = new Set(prev)
      next.delete(path)
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

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
    setIsDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const raw = e.dataTransfer.getData("meridian-files")
    if (!raw) return
    try {
      const paths: string[] = JSON.parse(raw)
      addFiles(paths)
    } catch {}
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
          { headers: { Authorization: `Bearer ${token}`, "Accept": "application/vnd.github.v3+json" } }
        )
        const fileData = await res.json()
        const content = atob(fileData.content.replace(/\n/g, ""))

        const scanRes = await fetch("/api/scan-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: [{ name: filePath.split("/").pop() ?? filePath, content: content.slice(0, 50000) }] }),
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

  const queuedFiles = Array.from(selectedFiles)

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
            <span className="text-[10px] font-semibold text-purple-300 tracking-wide">claude-sonnet-4-6</span>
          </div>
        </div>
        <div className="w-24" />
      </motion.div>

      <div className="flex flex-1 min-h-0">

        {/* ── Left: PAT + repo list ─────────────────────────────────────── */}
        <div className="flex flex-col w-72 border-r border-white/[0.05] shrink-0 overflow-y-auto">

          {/* GitHub connection status */}
          <div className="p-4 border-b border-white/[0.05]">
            {!sessionChecked ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="h-4 w-4 animate-spin text-white/30" />
              </div>
            ) : tokenSource === "oauth" ? (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Github className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white/70">GitHub connected</p>
                  <p className="text-[9px] text-white/30">Loading your repos…</p>
                </div>
              </div>
            ) : !isLoggedIn ? (
              <div className="text-center py-2">
                <p className="text-[11px] text-white/40 mb-3">Sign in to access your repos</p>
                <button onClick={connectGithub}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] h-9 text-[11px] font-semibold text-white transition-colors">
                  <Github className="h-3.5 w-3.5" />Sign in with GitHub
                </button>
              </div>
            ) : (
              <div>
                <button onClick={connectGithub}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 h-9 text-[11px] font-semibold text-white transition-colors mb-3">
                  <Github className="h-3.5 w-3.5" />Connect GitHub account
                </button>
                <div className="relative mb-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.06]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#060b16] px-2 text-[9px] text-white/20">or use a personal token</span>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type={showPat ? "text" : "password"}
                    value={patInput}
                    onChange={(e) => setPatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadWithPat()}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full h-8 bg-white/[0.04] border border-white/[0.08] rounded-lg pl-3 pr-8 text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/30 transition-all font-mono"
                  />
                  <button type="button" onClick={() => setShowPat(!showPat)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                    {showPat ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>
                <button onClick={loadWithPat} disabled={!patInput.trim() || loadingRepos}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] disabled:opacity-40 h-7 text-[10px] font-medium text-white/60 transition-colors">
                  {loadingRepos ? <Loader2 className="h-3 w-3 animate-spin" /> : "Load with token"}
                </button>
              </div>
            )}
            {repoError && <p className="mt-2 text-[10px] text-red-400">{repoError}</p>}
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
            {tree && !loadingTree && (
              <span className="text-[9px] text-white/20">drag to scan →</span>
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
                flatNodes={flatNodes}
              />
            )}
          </div>
        </div>

        {/* ── Right: drop zone + results ────────────────────────────────── */}
        <div
          className="flex flex-col flex-1 overflow-hidden"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] shrink-0">
            <span className="text-[11px] font-semibold text-white/40">
              {results
                ? `${results.length} file${results.length !== 1 ? "s" : ""} scanned`
                : queuedFiles.length > 0
                ? `${queuedFiles.length}/10 file${queuedFiles.length !== 1 ? "s" : ""} queued`
                : "Drop zone"}
            </span>
            <div className="flex items-center gap-2">
              {queuedFiles.length > 0 && !isScanning && (
                <button
                  onClick={() => { setSelectedFiles(new Set()); setResults(null) }}
                  className="text-[9px] text-white/20 hover:text-white/50 transition-colors"
                >
                  clear
                </button>
              )}
              {results && results.some(r => r.fixedCode) && (
                <button
                  onClick={() => results.forEach(r => r.fixedCode && downloadResult(r))}
                  className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] px-3 py-1.5 text-[10px] font-medium text-white/40 hover:text-white/70 transition-all"
                >
                  <Download className="h-3 w-3" />Download all fixed
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">

            {/* Empty / drop state */}
            {!results && !isScanning && queuedFiles.length === 0 && (
              <motion.div
                animate={{
                  borderColor: isDragOver ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.06)",
                  backgroundColor: isDragOver ? "rgba(168,85,247,0.04)" : "rgba(255,255,255,0)",
                }}
                transition={{ duration: 0.15 }}
                className="h-full min-h-[300px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors"
              >
                <motion.div
                  animate={{ scale: isDragOver ? 1.15 : 1, opacity: isDragOver ? 1 : 0.4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-2xl mb-4 transition-colors",
                    isDragOver ? "bg-purple-500/20 border border-purple-500/30" : "bg-white/[0.03] border border-white/[0.06]"
                  )}
                >
                  <Brain className={cn("h-7 w-7 transition-colors", isDragOver ? "text-purple-400" : "text-white/20")} />
                </motion.div>
                <p className={cn("text-[13px] font-medium mb-1 transition-colors", isDragOver ? "text-purple-300" : "text-white/25")}>
                  {isDragOver ? "Release to queue for scanning" : "Drag files or folders here"}
                </p>
                <p className="text-[11px] text-white/15">
                  {isDragOver ? "" : "or click files in the tree to select them"}
                </p>
              </motion.div>
            )}

            {/* Queued files list */}
            {!results && !isScanning && queuedFiles.length > 0 && (
              <div className="space-y-2">
                <AnimatePresence>
                  {queuedFiles.map((filePath, i) => (
                    <motion.div
                      key={filePath}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#0a0f1c] px-4 py-3"
                    >
                      <FileCode2 className="h-4 w-4 text-white/25 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-white/60 truncate">{filePath.split("/").pop()}</p>
                        <p className="text-[9px] text-white/20 truncate font-mono">{filePath}</p>
                      </div>
                      <button
                        onClick={() => removeFile(filePath)}
                        className="text-white/15 hover:text-white/50 transition-colors shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Drop more indicator */}
                {queuedFiles.length < 10 && (
                  <motion.div
                    animate={{
                      borderColor: isDragOver ? "rgba(168,85,247,0.3)" : "rgba(255,255,255,0.04)",
                      backgroundColor: isDragOver ? "rgba(168,85,247,0.04)" : "transparent",
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed py-3 transition-colors"
                  >
                    <span className="text-[10px] text-white/20">
                      {isDragOver ? "Release to add" : `Drop more files — ${10 - queuedFiles.length} slots left`}
                    </span>
                  </motion.div>
                )}

                <button
                  onClick={scanSelected}
                  className="group relative overflow-hidden w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 h-10 text-[12px] font-semibold text-white transition-colors mt-2"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  Scan {queuedFiles.length} file{queuedFiles.length !== 1 ? "s" : ""}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </div>
            )}

            {/* Scanning progress */}
            {isScanning && (
              <div className="space-y-2">
                {queuedFiles.map(filePath => {
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

            {/* Results */}
            {results && !isScanning && (
              <div className="space-y-2">
                {results.map((result, i) => {
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

                <button
                  onClick={() => { setResults(null); setSelectedFiles(new Set()) }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05] h-9 text-[11px] text-white/30 hover:text-white/60 transition-all mt-2"
                >
                  Scan more files
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
