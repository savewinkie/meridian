"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  TrendingUp, TrendingDown, GitMerge, Star, GitFork,
  Github, GitCommit, GitPullRequest, Lock, Globe,
} from "lucide-react"
import { cn, formatRelativeTime } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface GHEvent {
  id: string; type: string
  repo: { name: string }
  payload: any
  created_at: string
}
interface GHPR {
  id: number; state: string; created_at: string; closed_at: string | null
  pull_request?: { merged_at: string | null }
  title: string; html_url: string
  repository_url: string
  user: { login: string; avatar_url: string }
}
interface GHRepo {
  id: number; name: string; full_name: string; private: boolean
  language: string | null; stargazers_count: number; forks_count: number
  open_issues_count: number; updated_at: string; size: number
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

function buildCommitChart(events: GHEvent[], days: number) {
  const now = Date.now()
  const result: { label: string; commits: number }[] = []
  if (days <= 30) {
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now - i * 86400000)
      const dateStr = d.toISOString().slice(0, 10)
      const label = days <= 7
        ? d.toLocaleDateString("en", { weekday: "short" })
        : d.toLocaleDateString("en", { month: "short", day: "numeric" })
      const commits = events
        .filter(e => e.type === "PushEvent" && e.created_at.slice(0, 10) === dateStr)
        .reduce((s, e) => s + (e.payload?.commits?.length || 0), 0)
      result.push({ label, commits })
    }
  } else {
    const weeks = Math.ceil(days / 7)
    for (let i = weeks - 1; i >= 0; i--) {
      const wStart = now - (i + 1) * 7 * 86400000
      const wEnd   = now - i * 7 * 86400000
      const d = new Date(wEnd)
      const label = d.toLocaleDateString("en", { month: "short", day: "numeric" })
      const commits = events
        .filter(e => {
          if (e.type !== "PushEvent") return false
          const t = new Date(e.created_at).getTime()
          return t >= wStart && t < wEnd
        })
        .reduce((s, e) => s + (e.payload?.commits?.length || 0), 0)
      result.push({ label, commits })
    }
  }
  return result
}

function buildPRVelocity(prs: GHPR[]) {
  const now = new Date()
  const months: Record<string, { month: string; opened: number; merged: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleDateString("en", { month: "short" })
    months[key] = { month: label, opened: 0, merged: 0 }
  }
  for (const pr of prs) {
    const ok = pr.created_at.slice(0, 7)
    if (months[ok]) months[ok].opened++
    const ma = pr.pull_request?.merged_at
    if (ma) {
      const mk = ma.slice(0, 7)
      if (months[mk]) months[mk].merged++
    }
  }
  return Object.values(months)
}

function buildLangData(repos: GHRepo[]) {
  const counts: Record<string, number> = {}
  for (const r of repos) if (r.language) counts[r.language] = (counts[r.language] || 0) + 1
  const COLORS = ["#3B82F6","#F59E0B","#10B981","#8B5CF6","#EF4444","#06B6D4","#EC4899"]
  return Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,7)
    .map(([name, value], i) => ({ name, value, color: COLORS[i] }))
}

function repoName(url: string) {
  const p = url.split("/"); return `${p[p.length-2]}/${p[p.length-1]}`
}

function Skel({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-muted", className)} />
}

const RANGE_DAYS: Record<string, number> = { "7 days": 7, "30 days": 30, "90 days": 90 }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [repos, setRepos]   = useState<GHRepo[]>([])
  const [prs, setPrs]       = useState<GHPR[]>([])
  const [events, setEvents] = useState<GHEvent[]>([])
  const [login, setLogin]   = useState("")
  const [avatar, setAvatar] = useState("")
  const [loading, setLoading] = useState(true)
  const [noGitHub, setNoGitHub] = useState(false)
  const [range, setRange]   = useState("30 days")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.provider_token) { setNoGitHub(true); setLoading(false); return }
      const tok = session.provider_token
      const gh  = session.user.user_metadata?.user_name ?? session.user.user_metadata?.preferred_username ?? ""
      setLogin(gh)
      setAvatar(session.user.user_metadata?.avatar_url ?? "")

      try {
        const [repoRes, prRes, ev1Res, ev2Res] = await Promise.all([
          fetch("https://api.github.com/user/repos?per_page=50&sort=updated&affiliation=owner",
            { headers: { Authorization: `Bearer ${tok}`, Accept: "application/vnd.github+json" } }),
          fetch(`https://api.github.com/search/issues?q=is:pr+involves:${gh}&sort=updated&per_page=100`,
            { headers: { Authorization: `Bearer ${tok}`, Accept: "application/vnd.github+json" } }),
          fetch(`https://api.github.com/users/${gh}/events?per_page=100&page=1`,
            { headers: { Authorization: `Bearer ${tok}`, Accept: "application/vnd.github+json" } }),
          fetch(`https://api.github.com/users/${gh}/events?per_page=100&page=2`,
            { headers: { Authorization: `Bearer ${tok}`, Accept: "application/vnd.github+json" } }),
        ])
        const [repoData, prData, ev1, ev2] = await Promise.all([
          repoRes.json(), prRes.json(), ev1Res.json(), ev2Res.json(),
        ])
        if (Array.isArray(repoData)) setRepos(repoData)
        if (Array.isArray(prData?.items)) setPrs(prData.items)
        const evAll = [...(Array.isArray(ev1) ? ev1 : []), ...(Array.isArray(ev2) ? ev2 : [])]
        setEvents(evAll)
      } catch { /* ignore */ }
      setLoading(false)
    })
  }, [])

  const days = RANGE_DAYS[range] ?? 30

  const commitChart = useMemo(() => buildCommitChart(events, days), [events, days])
  const prChart     = useMemo(() => buildPRVelocity(prs), [prs])
  const langData    = useMemo(() => buildLangData(repos), [repos])

  const totalStars   = repos.reduce((s, r) => s + r.stargazers_count, 0)
  const openPRs      = prs.filter(p => p.state === "open").length
  const mergedPRs    = prs.filter(p => p.pull_request?.merged_at).length
  const cutoff       = new Date(Date.now() - days * 86400000).toISOString()
  const recentCommits = events
    .filter(e => e.type === "PushEvent" && e.created_at >= cutoff)
    .reduce((s, e) => s + (e.payload?.commits?.length || 0), 0)
  const topRepos = [...repos].sort((a,b) => b.stargazers_count - a.stargazers_count).slice(0, 5)

  const mergeRate = prs.length > 0 ? Math.round(mergedPRs / prs.length * 100) : 0

  const tooltipStyle = { background: "white", border: "1px solid hsl(214 20% 90%)", borderRadius: "8px", fontSize: "12px" }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729] mb-1">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading GitHub data…" : noGitHub ? "Connect GitHub to see analytics" :
              `Activity for @${login} · ${repos.length} repos · ${prs.length} PRs tracked`}
          </p>
        </div>
        <div className="flex gap-1 border border-border rounded-lg p-1 bg-white">
          {Object.keys(RANGE_DAYS).map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                range === r ? "bg-[#0F1729] text-white" : "text-muted-foreground hover:text-foreground")}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {noGitHub && (
        <Card className="border-amber-200 bg-amber-50/40 mb-6">
          <CardContent className="p-6 flex items-center gap-4">
            <Github className="h-8 w-8 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#0F1729]">GitHub not connected</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sign in with GitHub to see your analytics.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Repos",    value: loading ? "…" : repos.length,       icon: Github,         color: "text-blue-600",    bg: "bg-blue-50" },
          { label: "Total Stars",    value: loading ? "…" : totalStars,          icon: Star,           color: "text-amber-600",   bg: "bg-amber-50" },
          { label: "Open PRs",       value: loading ? "…" : openPRs,             icon: GitPullRequest, color: "text-purple-600",  bg: "bg-purple-50" },
          { label: `Commits (${range})`, value: loading ? "…" : recentCommits,  icon: GitCommit,      color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", m.bg)}>
                  <m.icon className={cn("h-4 w-4", m.color)} />
                </div>
              </div>
              {loading ? <Skel className="h-7 w-16 mb-1" /> :
                <div className="text-2xl font-bold text-[#0F1729] mb-0.5">{m.value}</div>}
              <div className="text-xs text-muted-foreground">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Commit activity */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Commit Activity</CardTitle>
                <CardDescription>Commits pushed in the last {range}</CardDescription>
              </div>
              {!loading && <Badge variant="navy" className="text-xs">{recentCommits} commits</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <Skel className="h-[200px] w-full" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={commitChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="commitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F1729" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0F1729" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false}
                    interval={days <= 7 ? 0 : days <= 30 ? 4 : "preserveStartEnd"} />
                  <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="commits" stroke="#0F1729" strokeWidth={2.5}
                    fill="url(#commitGrad)" name="Commits" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* PR Velocity */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">PR Velocity</CardTitle>
                <CardDescription>Pull requests opened vs merged</CardDescription>
              </div>
              {!loading && mergeRate > 0 && (
                <Badge variant={mergeRate >= 70 ? "success" : "warning"} className="text-xs">
                  {mergeRate}% merge rate
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <Skel className="h-[200px] w-full" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={prChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="opened" fill="#E5E7EB" radius={[4,4,0,0]} name="Opened" />
                  <Bar dataKey="merged" fill="#0F1729" radius={[4,4,0,0]} name="Merged" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent PRs */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Pull Requests</CardTitle>
            <CardDescription>{prs.filter(p => p.state === "open").length} open · {mergedPRs} merged</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_,i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skel className="h-7 w-7 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skel className="h-3 w-52" /><Skel className="h-2.5 w-36" />
                    </div>
                    <Skel className="h-5 w-14 rounded-full" />
                  </div>
                ))}
              </div>
            ) : prs.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No PRs found</div>
            ) : (
              <div className="divide-y divide-border">
                {prs.slice(0, 6).map(pr => {
                  const repo = repoName(pr.repository_url)
                  const merged = !!pr.pull_request?.merged_at
                  return (
                    <a key={pr.id} href={pr.html_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors group">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarImage src={pr.user.avatar_url} />
                        <AvatarFallback className="text-[9px] bg-amber-100 text-amber-700">
                          {pr.user.login.slice(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-foreground truncate group-hover:text-amber-600 transition-colors">
                          {pr.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">{repo} · {formatRelativeTime(pr.created_at)}</p>
                      </div>
                      <span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0",
                        pr.state === "open" ? "bg-amber-100 text-amber-700" :
                        merged ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500")}>
                        {pr.state === "open" ? "Open" : merged ? "Merged" : "Closed"}
                      </span>
                    </a>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Language breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Languages</CardTitle>
            <CardDescription>By number of repositories</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {loading ? <Skel className="h-40 w-40 rounded-full mb-4" /> : langData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8">No language data</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={langData} cx="50%" cy="50%" innerRadius={42} outerRadius={68}
                      paddingAngle={3} dataKey="value">
                      {langData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v} repos`, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 w-full mt-1">
                  {langData.map(l => (
                    <div key={l.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                        <span className="text-muted-foreground">{l.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">{l.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top repos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Repositories</CardTitle>
          <CardDescription>Your most starred repositories</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            <div className="flex items-center gap-4 px-6 py-2 bg-muted/30">
              <div className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Repository</div>
              <div className="w-16 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Stars</div>
              <div className="w-16 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Forks</div>
              <div className="w-20 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Issues</div>
              <div className="w-28 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Updated</div>
            </div>
            {loading ? (
              [...Array(5)].map((_,i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="flex-1 space-y-2">
                    <Skel className="h-3 w-40" /><Skel className="h-2.5 w-24" />
                  </div>
                  <Skel className="h-4 w-10" /><Skel className="h-4 w-10" />
                </div>
              ))
            ) : topRepos.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No repositories found</div>
            ) : (
              topRepos.map((repo) => {
                const LANG_COLOR: Record<string,string> = {
                  TypeScript:"text-blue-600 bg-blue-50", JavaScript:"text-yellow-600 bg-yellow-50",
                  Python:"text-green-600 bg-green-50", Rust:"text-orange-600 bg-orange-50",
                  Go:"text-cyan-600 bg-cyan-50", Java:"text-red-600 bg-red-50",
                }
                const langStyle = LANG_COLOR[repo.language ?? ""] ?? "text-gray-500 bg-gray-50"
                return (
                  <a key={repo.id} href={`https://github.com/${repo.full_name}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {repo.private
                          ? <Lock className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                          : <Globe className="h-3 w-3 text-muted-foreground/30 shrink-0" />}
                        <p className="text-sm font-mono font-medium text-foreground truncate group-hover:text-amber-600 transition-colors">
                          {repo.name}
                        </p>
                        {repo.language && (
                          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0", langStyle)}>
                            {repo.language}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-16 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3" />{repo.stargazers_count}
                    </div>
                    <div className="w-16 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <GitFork className="h-3 w-3" />{repo.forks_count}
                    </div>
                    <div className="w-20 text-center">
                      <span className={cn("text-xs font-semibold",
                        repo.open_issues_count > 10 ? "text-red-600" :
                        repo.open_issues_count > 3  ? "text-amber-600" : "text-muted-foreground")}>
                        {repo.open_issues_count}
                      </span>
                    </div>
                    <div className="w-28 text-right text-xs text-muted-foreground">
                      {formatRelativeTime(repo.updated_at)}
                    </div>
                  </a>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
