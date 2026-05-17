"use client"

import { useEffect, useState } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  GitPullRequest, ChevronRight, CheckCircle2, Brain,
  GitMerge, GitCommit, Github, Star, FolderGit2,
} from "lucide-react"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface GHUser {
  login: string
  name: string | null
  avatar_url: string
  public_repos: number
}

interface GHEvent {
  id: string
  type: string
  repo: { name: string }
  payload: any
  created_at: string
}

interface GHPR {
  number: number
  title: string
  html_url: string
  repository_url: string
  updated_at: string
  labels: { name: string; color: string }[]
  draft?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

function repoShortName(repositoryUrl: string) {
  return repositoryUrl.replace("https://api.github.com/repos/", "").split("/").pop() ?? ""
}

function buildChartData(events: GHEvent[]) {
  const days: Record<string, { date: string; commits: number; prs: number; merged: number }> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days[key] = { date: d.toLocaleDateString("en-US", { weekday: "short" }), commits: 0, prs: 0, merged: 0 }
  }
  for (const e of events) {
    const day = e.created_at.slice(0, 10)
    if (!days[day]) continue
    if (e.type === "PushEvent") days[day].commits += e.payload.commits?.length || 0
    if (e.type === "PullRequestEvent") {
      if (e.payload.action === "opened") days[day].prs++
      if (e.payload.action === "closed" && e.payload.pull_request?.merged) days[day].merged++
    }
  }
  return Object.values(days)
}

function buildActivity(events: GHEvent[], limit = 5) {
  const items: { icon: any; color: string; text: string; sub: string; time: string }[] = []
  for (const e of events) {
    if (items.length >= limit) break
    if (e.type === "PushEvent" && e.payload.commits?.length) {
      const n = e.payload.commits.length
      items.push({
        icon: GitCommit, color: "text-blue-500",
        text: `Pushed ${n} commit${n > 1 ? "s" : ""} to ${e.repo.name}`,
        sub: e.payload.commits[0]?.message?.split("\n")[0] || "",
        time: e.created_at,
      })
    } else if (e.type === "PullRequestEvent") {
      const pr = e.payload.pull_request
      if (e.payload.action === "opened") {
        items.push({ icon: GitPullRequest, color: "text-purple-500", text: `Opened PR #${pr.number} in ${e.repo.name}`, sub: pr.title, time: e.created_at })
      } else if (e.payload.action === "closed" && pr?.merged) {
        items.push({ icon: GitMerge, color: "text-emerald-500", text: `Merged PR #${pr.number} in ${e.repo.name}`, sub: pr.title, time: e.created_at })
      }
    } else if (e.type === "CreateEvent" && e.payload.ref_type === "repository") {
      items.push({ icon: FolderGit2, color: "text-amber-500", text: `Created repo ${e.repo.name}`, sub: "", time: e.created_at })
    } else if (e.type === "WatchEvent") {
      items.push({ icon: Star, color: "text-yellow-500", text: `Starred ${e.repo.name}`, sub: "", time: e.created_at })
    }
  }
  return items
}

function Skel({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [hasToken, setHasToken] = useState(false)
  const [user, setUser] = useState<GHUser | null>(null)
  const [openPRs, setOpenPRs] = useState<GHPR[]>([])
  const [events, setEvents] = useState<GHEvent[]>([])
  const [repoCount, setRepoCount] = useState(0)
  const [totalStars, setTotalStars] = useState(0)
  const [commitsWeek, setCommitsWeek] = useState(0)

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        const ghToken = session?.provider_token
        if (!ghToken) { setLoading(false); return }
        setHasToken(true)

        const h = { Authorization: `Bearer ${ghToken}`, Accept: "application/vnd.github.v3+json" }

        try {
          const [userRes, reposRes] = await Promise.all([
            fetch("https://api.github.com/user", { headers: h }),
            fetch("https://api.github.com/user/repos?per_page=100&sort=updated", { headers: h }),
          ])
          const userData: GHUser = await userRes.json()
          const reposData: any[] = await reposRes.json()
          setUser(userData)
          if (Array.isArray(reposData)) {
            setRepoCount(reposData.length)
            setTotalStars(reposData.reduce((s, r) => s + (r.stargazers_count || 0), 0))
          }

          const [prsRes, evtRes] = await Promise.all([
            fetch(`https://api.github.com/search/issues?q=is:pr+is:open+involves:${userData.login}&sort=updated&per_page=10`, { headers: h }),
            fetch("https://api.github.com/user/events?per_page=50", { headers: h }),
          ])
          const prsData = await prsRes.json()
          const evtData: GHEvent[] = await evtRes.json()

          if (Array.isArray(prsData.items)) setOpenPRs(prsData.items)
          if (Array.isArray(evtData)) {
            setEvents(evtData)
            const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
            setCommitsWeek(
              evtData
                .filter(e => e.type === "PushEvent" && new Date(e.created_at).getTime() > cutoff)
                .reduce((s, e) => s + (e.payload.commits?.length || 0), 0)
            )
          }
        } catch (err) {
          console.error("Dashboard fetch error:", err)
        }
        setLoading(false)
      })
    })
  }, [])

  const chartData = buildChartData(events)
  const activityItems = buildActivity(events)
  const displayName = user?.name?.split(" ")[0] || user?.login || "there"

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          {loading ? (
            <><Skel className="h-8 w-52 mb-2" /><Skel className="h-4 w-72" /></>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#0F1729] mb-1">
                {greeting()}, {displayName} ☀️
              </h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                {openPRs.length > 0 && (
                  <> · <span className="text-amber-600 font-medium">{openPRs.length} open PR{openPRs.length !== 1 ? "s" : ""}</span> you're involved in</>
                )}
              </p>
            </>
          )}
        </div>
        <Link href="/scanner">
          <Button variant="amber" size="sm" className="gap-1.5">
            <Brain className="h-3.5 w-3.5" />
            Scan code
          </Button>
        </Link>
      </div>

      {/* Connect GitHub banner */}
      {!loading && !hasToken && (
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <Github className="h-5 w-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">Connect GitHub to see your real data</p>
              <p className="text-xs text-amber-700 mt-0.5">Sign in with GitHub to see your repos, open PRs, and activity.</p>
            </div>
            <Link href="/scanner/repo">
              <Button variant="amber" size="sm">Connect GitHub</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Open PRs", value: openPRs.length, icon: GitPullRequest, iconColor: "text-blue-600", iconBg: "bg-blue-50", sub: "you're involved in" },
          { label: "Repositories", value: repoCount, icon: FolderGit2, iconColor: "text-purple-600", iconBg: "bg-purple-50", sub: "connected via GitHub" },
          { label: "Commits this week", value: commitsWeek, icon: GitCommit, iconColor: "text-amber-600", iconBg: "bg-amber-50", sub: "pushed in last 7 days" },
          { label: "Total stars", value: totalStars, icon: Star, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", sub: "across all repos" },
        ].map((m) => (
          <Card key={m.label} className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${m.iconBg}`}>
                  <m.icon className={`h-5 w-5 ${m.iconColor}`} />
                </div>
              </div>
              {loading ? (
                <Skel className="h-9 w-16 mb-1" />
              ) : (
                <div className="text-3xl font-bold text-[#0F1729] mb-0.5">{m.value}</div>
              )}
              <div className="text-sm text-muted-foreground">{m.label}</div>
              <div className="text-xs text-muted-foreground/60 mt-0.5">{m.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Commit Activity</CardTitle>
                <CardDescription>Commits and PRs over the last 7 days</CardDescription>
              </div>
              <Badge variant="muted" className="text-xs">Last 7 days</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skel className="h-[200px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="commitsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F1729" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0F1729" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="prsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(214 20% 90%)", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                  <Area type="monotone" dataKey="commits" stroke="#0F1729" strokeWidth={2} fill="url(#commitsGrad)" name="Commits" />
                  <Area type="monotone" dataKey="prs" stroke="#10B981" strokeWidth={2} fill="url(#prsGrad)" name="PRs opened" />
                  <Area type="monotone" dataKey="merged" stroke="#F59E0B" strokeWidth={2} fill="transparent" strokeDasharray="4 2" name="PRs merged" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest events from GitHub</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="px-6 py-4 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skel className="h-4 w-4 mt-0.5 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skel className="h-3 w-full" />
                      <Skel className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activityItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-6">
                <Github className="h-6 w-6 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activityItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 px-6 py-3">
                    <div className={`mt-0.5 shrink-0 ${item.color}`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground leading-tight">{item.text}</p>
                      {item.sub && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.sub}</p>}
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatRelativeTime(item.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Open PRs Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Open Pull Requests</CardTitle>
              <CardDescription>PRs you're involved in across all repositories</CardDescription>
            </div>
            {user && (
              <a href={`https://github.com/pulls?q=is:open+involves:${user.login}`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
                  View on GitHub <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skel className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skel className="h-3.5 w-3/4" />
                    <Skel className="h-3 w-1/2" />
                  </div>
                  <Skel className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : openPRs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-6">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-3" />
              <p className="text-sm font-medium text-foreground">All clear!</p>
              <p className="text-xs text-muted-foreground mt-1">No open PRs you're involved in.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {openPRs.map((pr) => (
                <a
                  key={pr.number}
                  href={pr.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-amber-600 transition-colors">
                      {pr.title}
                      {pr.draft && <span className="ml-2 text-xs text-muted-foreground font-normal">(draft)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      #{pr.number} · <span className="font-mono">{repoShortName(pr.repository_url)}</span> · {formatRelativeTime(pr.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {pr.labels.slice(0, 2).map(label => (
                      <span
                        key={label.name}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                        style={{ borderColor: `#${label.color}40`, color: `#${label.color}`, backgroundColor: `#${label.color}15` }}
                      >
                        {label.name}
                      </span>
                    ))}
                    <Badge variant="warning" className="text-xs">Open</Badge>
                  </div>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom stat bars */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Public repos",
            value: loading ? 0 : (user?.public_repos ?? 0),
            max: 100,
            color: "bg-blue-500", text: "text-blue-600",
            desc: (v: number) => `${v} public repo${v !== 1 ? "s" : ""}`,
          },
          {
            label: "Open PRs",
            value: loading ? 0 : openPRs.length,
            max: 20,
            color: "bg-amber-500", text: "text-amber-600",
            desc: (v: number) => v === 0 ? "All caught up" : `${v} PR${v !== 1 ? "s" : ""} need attention`,
          },
          {
            label: "Commits this week",
            value: loading ? 0 : commitsWeek,
            max: 50,
            color: "bg-emerald-500", text: "text-emerald-600",
            desc: (v: number) => v > 20 ? "Very active week" : v > 10 ? "Active week" : v > 0 ? "Light activity" : "No commits yet",
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <span className={`text-sm font-bold ${item.text}`}>{loading ? "—" : item.value}</span>
              </div>
              <Progress value={loading ? 0 : Math.min((item.value / item.max) * 100, 100)} className="h-2" indicatorClassName={item.color} />
              <p className="text-xs text-muted-foreground mt-2">{loading ? "Loading…" : item.desc(item.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  )
}
