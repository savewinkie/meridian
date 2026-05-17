"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  GitPullRequest, Search, AlertCircle, CheckCircle2,
  Clock, ChevronRight, RefreshCw, MessageSquare, ExternalLink, Github,
} from "lucide-react"
import { formatRelativeTime, cn } from "@/lib/utils"

interface GHPr {
  id: number
  number: number
  title: string
  html_url: string
  state: string
  user: { login: string; avatar_url: string }
  repository_url: string
  created_at: string
  updated_at: string
  comments: number
  labels: { name: string; color: string }[]
  pull_request: { merged_at: string | null }
}

function repoName(repository_url: string) {
  const parts = repository_url.split("/")
  return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`
}

function prStatus(pr: GHPr): "open" | "merged" | "closed" {
  if (pr.state === "closed") return pr.pull_request?.merged_at ? "merged" : "closed"
  return "open"
}

const statusConfig = {
  open:   { label: "Open",   variant: "warning"  as const, icon: Clock },
  merged: { label: "Merged", variant: "success"  as const, icon: CheckCircle2 },
  closed: { label: "Closed", variant: "muted"    as const, icon: RefreshCw },
}

function riskFromLabels(labels: { name: string }[]) {
  const names = labels.map(l => l.name.toLowerCase())
  if (names.some(n => n.includes("security") || n.includes("critical") || n.includes("urgent")))
    return { label: "Critical", cls: "bg-red-100 text-red-700" }
  if (names.some(n => n.includes("bug") || n.includes("high") || n.includes("breaking")))
    return { label: "High", cls: "bg-orange-100 text-orange-700" }
  if (names.some(n => n.includes("medium") || n.includes("feat") || n.includes("feature")))
    return { label: "Medium", cls: "bg-amber-100 text-amber-700" }
  return { label: "Low", cls: "bg-emerald-100 text-emerald-700" }
}

function Skel({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-muted", className)} />
}

export default function ReviewsPage() {
  const [prs, setPrs] = useState<GHPr[]>([])
  const [login, setLogin] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [noGitHub, setNoGitHub] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.provider_token) { setNoGitHub(true); setLoading(false); return }
      const tok = session.provider_token
      const gh = session.user.user_metadata?.user_name ?? session.user.user_metadata?.preferred_username ?? ""
      setToken(tok)
      setLogin(gh)

      try {
        // Open PRs the user is involved in
        const [openRes, closedRes] = await Promise.all([
          fetch(`https://api.github.com/search/issues?q=is:pr+is:open+involves:${gh}&sort=updated&per_page=20`, {
            headers: { Authorization: `Bearer ${tok}`, Accept: "application/vnd.github+json" },
          }),
          fetch(`https://api.github.com/search/issues?q=is:pr+is:closed+involves:${gh}&sort=updated&per_page=10`, {
            headers: { Authorization: `Bearer ${tok}`, Accept: "application/vnd.github+json" },
          }),
        ])
        const [openData, closedData] = await Promise.all([openRes.json(), closedRes.json()])
        const combined = [...(openData.items ?? []), ...(closedData.items ?? [])]
        // deduplicate by id
        const seen = new Set<number>()
        const unique = combined.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true })
        setPrs(unique)
      } catch {
        // ignore — show empty
      }
      setLoading(false)
    })
  }, [])

  const filtered = prs.filter(pr => {
    const repo = repoName(pr.repository_url)
    const matchSearch = pr.title.toLowerCase().includes(search.toLowerCase()) ||
      repo.toLowerCase().includes(search.toLowerCase()) ||
      pr.user.login.toLowerCase().includes(search.toLowerCase())
    const status = prStatus(pr)
    const matchStatus = statusFilter === "all" || status === statusFilter
    return matchSearch && matchStatus
  })

  const openCount = prs.filter(p => prStatus(p) === "open").length
  const mergedCount = prs.filter(p => prStatus(p) === "merged").length
  const closedCount = prs.filter(p => prStatus(p) === "closed").length

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729] mb-1">Pull Requests</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : noGitHub ? "Connect GitHub to see your pull requests" :
              `${openCount} open · ${mergedCount} merged · ${closedCount} closed`}
          </p>
        </div>
        {!noGitHub && login && (
          <a href={`https://github.com/${login}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              Open GitHub
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
              <p className="text-xs text-muted-foreground mt-0.5">Sign out and sign in again with GitHub to see your pull requests.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats row */}
      {!noGitHub && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Open",   count: loading ? "…" : openCount,   color: "text-amber-600",   bg: "bg-amber-50",   key: "open" },
            { label: "Merged", count: loading ? "…" : mergedCount,  color: "text-emerald-600", bg: "bg-emerald-50", key: "merged" },
            { label: "Closed", count: loading ? "…" : closedCount,  color: "text-gray-500",    bg: "bg-gray-50",    key: "closed" },
          ].map((s) => (
            <Card key={s.label}
              className={cn("cursor-pointer transition-colors hover:border-amber-200", statusFilter === s.key ? "border-amber-300" : "")}
              onClick={() => setStatusFilter(statusFilter === s.key ? "all" : s.key)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold", s.bg, s.color)}>
                  {s.count}
                </div>
                <span className="text-sm font-medium text-foreground">{s.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      {!noGitHub && (
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search PRs, repos, authors…" value={search}
              onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-1 border border-border rounded-lg p-1 bg-white">
            {[["all","All"],["open","Open"],["merged","Merged"],["closed","Closed"]].map(([key, label]) => (
              <button key={key} onClick={() => setStatusFilter(key)}
                className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  statusFilter === key ? "bg-[#0F1729] text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PR List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skel className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skel className="h-3 w-64" />
                    <Skel className="h-2.5 w-40" />
                  </div>
                  <Skel className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : noGitHub || filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <GitPullRequest className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                {noGitHub ? "Connect GitHub to see pull requests" : "No pull requests found"}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {!noGitHub && "Try adjusting your search or filters"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <div className="flex items-center gap-4 px-6 py-3 bg-muted/30">
                <div className="w-8" />
                <div className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pull Request</div>
                <div className="w-24 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Risk</div>
                <div className="w-16 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Comments</div>
                <div className="w-24 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</div>
                <div className="w-8" />
              </div>

              {filtered.map((pr) => {
                const repo = repoName(pr.repository_url)
                const status = prStatus(pr)
                const st = statusConfig[status]
                const risk = riskFromLabels(pr.labels)
                return (
                  <a key={pr.id} href={pr.html_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={pr.user.avatar_url} />
                      <AvatarFallback className="bg-amber-100 text-amber-700 text-[10px] font-bold">
                        {pr.user.login.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-amber-600 transition-colors">
                          {pr.title}
                        </p>
                        {pr.labels.slice(0, 2).map(l => (
                          <span key={l.name} className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{ background: `#${l.color}20`, color: `#${l.color}` }}>
                            {l.name}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        #{pr.number} · <span className="font-mono">{repo}</span>
                        {" · "}{pr.user.login}
                        {" · "}{formatRelativeTime(pr.updated_at)}
                      </p>
                    </div>

                    <div className="w-24">
                      <span className={cn("text-xs font-semibold rounded-full px-2.5 py-1", risk.cls)}>
                        {risk.label}
                      </span>
                    </div>

                    <div className="w-16 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      {pr.comments > 0 && <><MessageSquare className="h-3 w-3" />{pr.comments}</>}
                    </div>

                    <div className="w-24">
                      <Badge variant={st.variant} className="text-[11px]">{st.label}</Badge>
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-amber-500 transition-colors shrink-0" />
                  </a>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
