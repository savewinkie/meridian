"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle, TrendingDown, Clock, FileText, Github,
  Sparkles, ChevronRight, Star, GitFork, Lock,
} from "lucide-react"
import { cn, formatRelativeTime } from "@/lib/utils"

interface GHRepo {
  id: number
  name: string
  full_name: string
  private: boolean
  language: string | null
  size: number
  stargazers_count: number
  forks_count: number
  updated_at: string
  open_issues_count: number
  default_branch: string
}

const LANG_COLOR: Record<string, string> = {
  TypeScript: "text-blue-600 bg-blue-50",
  JavaScript: "text-yellow-600 bg-yellow-50",
  Python: "text-green-600 bg-green-50",
  Rust: "text-orange-600 bg-orange-50",
  Go: "text-cyan-600 bg-cyan-50",
  Java: "text-red-600 bg-red-50",
  "C++": "text-purple-600 bg-purple-50",
  PHP: "text-indigo-600 bg-indigo-50",
  Ruby: "text-pink-600 bg-pink-50",
}

function debtEstimate(repo: GHRepo): { hours: number; grade: string; gradeCls: string } {
  // Rough heuristic: size in KB → lines of code estimate → debt hours
  const loc = repo.size * 10
  const hours = Math.round(loc / 800)
  if (hours >= 20) return { hours, grade: "D", gradeCls: "text-red-600 bg-red-50" }
  if (hours >= 10) return { hours, grade: "C", gradeCls: "text-orange-600 bg-orange-50" }
  if (hours >= 5)  return { hours, grade: "B", gradeCls: "text-amber-600 bg-amber-50" }
  return { hours: Math.max(hours, 1), grade: "A", gradeCls: "text-emerald-600 bg-emerald-50" }
}

function Skel({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-muted", className)} />
}

export default function DebtPage() {
  const [repos, setRepos] = useState<GHRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [noGitHub, setNoGitHub] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.provider_token) { setNoGitHub(true); setLoading(false); return }
      const tok = session.provider_token
      try {
        const res = await fetch("https://api.github.com/user/repos?per_page=30&sort=updated&affiliation=owner", {
          headers: { Authorization: `Bearer ${tok}`, Accept: "application/vnd.github+json" },
        })
        const data = await res.json()
        if (Array.isArray(data)) setRepos(data)
      } catch { /* ignore */ }
      setLoading(false)
    })
  }, [])

  const totalEstimatedHours = repos.reduce((sum, r) => sum + debtEstimate(r).hours, 0)
  const langCounts: Record<string, number> = {}
  repos.forEach(r => { if (r.language) langCounts[r.language] = (langCounts[r.language] ?? 0) + 1 })
  const topLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729] mb-1">Tech Debt</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading repositories…" : noGitHub ? "Connect GitHub to analyse tech debt" :
              `Estimated debt across ${repos.length} repositories — run AI scans for precise analysis`}
          </p>
        </div>
        {!noGitHub && !loading && (
          <a href="/scanner/repo">
            <Button variant="amber" size="sm" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Run deep scan
            </Button>
          </a>
        )}
      </div>

      {noGitHub && (
        <Card className="border-amber-200 bg-amber-50/40 mb-6">
          <CardContent className="p-6 flex items-center gap-4">
            <Github className="h-8 w-8 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#0F1729]">GitHub not connected</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sign out and sign in with GitHub to see tech debt analysis.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      {!noGitHub && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Est. Debt",      value: loading ? "—" : `${totalEstimatedHours}h`, icon: Clock,        color: "text-amber-600",   bg: "bg-amber-50",   note: "estimated from repo size" },
            { label: "Repositories",   value: loading ? "—" : repos.length,               icon: FileText,     color: "text-blue-600",    bg: "bg-blue-50",    note: "owned repos" },
            { label: "Open Issues",    value: loading ? "—" : repos.reduce((s,r) => s + r.open_issues_count, 0), icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", note: "across all repos" },
            { label: "Primary Lang",   value: loading ? "—" : topLang,                    icon: TrendingDown, color: "text-purple-600",  bg: "bg-purple-50",  note: "most used language" },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", item.bg)}>
                    <item.icon className={cn("h-4 w-4", item.color)} />
                  </div>
                </div>
                {loading ? <Skel className="h-7 w-16 mb-1" /> :
                  <div className="text-2xl font-bold text-[#0F1729] mb-0.5">{item.value}</div>}
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="text-[10px] text-muted-foreground/50 mt-0.5">{item.note}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Deep scan CTA banner */}
      {!noGitHub && !loading && (
        <Card className="mb-6 border-dashed border-amber-300/50 bg-amber-50/20">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 shrink-0">
              <Sparkles className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0F1729]">Get precise tech debt analysis</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                The estimates above are based on repository size. Run an AI scan to get exact complexity scores,
                duplication percentages, and prioritised refactoring recommendations.
              </p>
            </div>
            <a href="/scanner/repo" className="shrink-0">
              <Button variant="amber" size="sm" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Scan repos
              </Button>
            </a>
          </CardContent>
        </Card>
      )}

      {/* Repo table */}
      {!noGitHub && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Repository Overview</CardTitle>
                <CardDescription>
                  {loading ? "Loading…" : `${repos.length} repositories · debt estimated from size`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <div className="flex items-center gap-4 px-6 py-2 bg-muted/30">
                <div className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Repository</div>
                <div className="w-20 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Est. Debt</div>
                <div className="w-16 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Grade</div>
                <div className="w-24 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Issues</div>
                <div className="w-28 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Updated</div>
                <div className="w-24" />
              </div>

              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                    <div className="flex-1 space-y-2">
                      <Skel className="h-3 w-48" />
                      <Skel className="h-2.5 w-32" />
                    </div>
                    <Skel className="h-5 w-12" />
                    <Skel className="h-5 w-10" />
                  </div>
                ))
              ) : repos.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">No repositories found</div>
              ) : (
                repos.map((repo) => {
                  const { hours, grade, gradeCls } = debtEstimate(repo)
                  const langStyle = LANG_COLOR[repo.language ?? ""] ?? "text-gray-500 bg-gray-50"
                  return (
                    <div key={repo.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors group cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {repo.private && <Lock className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                          <p className="text-sm font-mono font-medium text-foreground truncate group-hover:text-amber-600 transition-colors">
                            {repo.name}
                          </p>
                          {repo.language && (
                            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0", langStyle)}>
                              {repo.language}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          {repo.stargazers_count > 0 && (
                            <span className="flex items-center gap-0.5"><Star className="h-3 w-3" />{repo.stargazers_count}</span>
                          )}
                          {repo.forks_count > 0 && (
                            <span className="flex items-center gap-0.5"><GitFork className="h-3 w-3" />{repo.forks_count}</span>
                          )}
                          <span>{Math.round(repo.size / 1024 * 10) / 10} MB</span>
                        </div>
                        <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden w-40">
                          <div className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${Math.min(hours / 30 * 100, 100)}%` }} />
                        </div>
                      </div>

                      <div className="w-20 text-center">
                        <span className="text-sm font-semibold text-amber-600">{hours}h</span>
                        <p className="text-[10px] text-muted-foreground">estimated</p>
                      </div>

                      <div className="w-16 text-center">
                        <span className={cn("text-xs font-bold rounded-md px-2 py-0.5", gradeCls)}>{grade}</span>
                      </div>

                      <div className="w-24 text-center">
                        <span className={cn("text-xs font-semibold",
                          repo.open_issues_count > 10 ? "text-red-600" :
                          repo.open_issues_count > 3 ? "text-amber-600" : "text-muted-foreground")}>
                          {repo.open_issues_count}
                        </span>
                      </div>

                      <div className="w-28 text-right text-xs text-muted-foreground">
                        {formatRelativeTime(repo.updated_at)}
                      </div>

                      <a href={`/scanner/repo`} className="w-24 flex justify-end">
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Sparkles className="h-3 w-3" />Scan
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </a>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
