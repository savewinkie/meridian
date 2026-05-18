"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
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
        icon: GitCommit, color: "text-blue-400",
        text: `Pushed ${n} commit${n > 1 ? "s" : ""} to ${e.repo.name}`,
        sub: e.payload.commits[0]?.message?.split("\n")[0] || "",
        time: e.created_at,
      })
    } else if (e.type === "PullRequestEvent") {
      const pr = e.payload.pull_request
      if (e.payload.action === "opened") {
        items.push({ icon: GitPullRequest, color: "text-violet-400", text: `Opened PR #${pr.number} in ${e.repo.name}`, sub: pr.title, time: e.created_at })
      } else if (e.payload.action === "closed" && pr?.merged) {
        items.push({ icon: GitMerge, color: "text-emerald-400", text: `Merged PR #${pr.number} in ${e.repo.name}`, sub: pr.title, time: e.created_at })
      }
    } else if (e.type === "CreateEvent" && e.payload.ref_type === "repository") {
      items.push({ icon: FolderGit2, color: "text-amber-400", text: `Created repo ${e.repo.name}`, sub: "", time: e.created_at })
    } else if (e.type === "WatchEvent") {
      items.push({ icon: Star, color: "text-yellow-400", text: `Starred ${e.repo.name}`, sub: "", time: e.created_at })
    }
  }
  return items
}

function Skel({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.06] rounded-lg ${className}`} />
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
    <div className="p-6 lg:p-8 min-h-full"
      style={{ background: "radial-gradient(ellipse 100% 55% at 50% -10%, rgba(109,40,217,0.13) 0%, transparent 60%)" }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 flex items-start justify-between"
      >
        <div>
          {loading ? (
            <><Skel className="h-8 w-52 mb-2" /><Skel className="h-4 w-72" /></>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1.5">
                {greeting()},{" "}
                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  {displayName}
                </span>
              </h1>
              <p className="text-sm text-white/35">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                {openPRs.length > 0 && (
                  <> · <span className="text-amber-400/80 font-medium">{openPRs.length} open PR{openPRs.length !== 1 ? "s" : ""}</span> need your attention</>
                )}
              </p>
            </>
          )}
        </div>
        <Link href="/scanner">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 px-5 h-10 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all"
          >
            <Brain className="h-4 w-4" />
            Scan code
          </motion.button>
        </Link>
      </motion.div>

      {/* Connect GitHub banner */}
      {!loading && !hasToken && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] px-6 py-5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/20">
            <Github className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white/80">Connect GitHub to see your real data</p>
            <p className="text-xs text-white/35 mt-0.5">Sign in with GitHub to see your repos, open PRs, and activity.</p>
          </div>
          <Link href="/scanner/repo">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 px-4 h-9 text-xs font-semibold text-white shadow-lg shadow-amber-500/20 transition-all"
            >
              Connect GitHub
            </motion.button>
          </Link>
        </motion.div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Open PRs", value: openPRs.length, icon: GitPullRequest, iconColor: "text-blue-400", iconBg: "bg-blue-500/10 border-blue-500/20", glow: "rgba(59,130,246,0.12)", sub: "you're involved in" },
          { label: "Repositories", value: repoCount, icon: FolderGit2, iconColor: "text-violet-400", iconBg: "bg-violet-500/10 border-violet-500/20", glow: "rgba(139,92,246,0.12)", sub: "connected via GitHub" },
          { label: "Commits this week", value: commitsWeek, icon: GitCommit, iconColor: "text-amber-400", iconBg: "bg-amber-500/10 border-amber-500/20", glow: "rgba(245,158,11,0.12)", sub: "pushed in last 7 days" },
          { label: "Total stars", value: totalStars, icon: Star, iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10 border-emerald-500/20", glow: "rgba(16,185,129,0.12)", sub: "across all repos" },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl border border-white/[0.07] p-5 overflow-hidden hover:border-white/[0.12] transition-all"
            style={{ background: `radial-gradient(circle at 80% 20%, ${m.glow} 0%, transparent 55%), rgba(255,255,255,0.02)` }}
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border mb-4 ${m.iconBg}`}>
              <m.icon className={`h-5 w-5 ${m.iconColor}`} />
            </div>
            {loading ? (
              <Skel className="h-9 w-16 mb-1" />
            ) : (
              <div className="text-3xl font-bold text-white mb-0.5">{m.value.toLocaleString()}</div>
            )}
            <div className="text-sm text-white/50">{m.label}</div>
            <div className="text-xs text-white/25 mt-0.5">{m.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white/75">Commit Activity</h3>
              <p className="text-xs text-white/30 mt-0.5">Commits and PRs over the last 7 days</p>
            </div>
            <span className="text-[10px] font-semibold text-white/20 border border-white/[0.07] rounded-full px-2.5 py-1">
              Last 7 days
            </span>
          </div>
          <div className="px-5 pb-5">
            {loading ? (
              <Skel className="h-[200px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="commitsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="prsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.28)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.28)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#0d1525",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  />
                  <Area type="monotone" dataKey="commits" stroke="#8b5cf6" strokeWidth={2} fill="url(#commitsGrad)" name="Commits" />
                  <Area type="monotone" dataKey="prs" stroke="#10b981" strokeWidth={2} fill="url(#prsGrad)" name="PRs opened" />
                  <Area type="monotone" dataKey="merged" stroke="#f59e0b" strokeWidth={2} fill="transparent" strokeDasharray="4 2" name="PRs merged" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.025] overflow-hidden"
        >
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-sm font-semibold text-white/75">Recent Activity</h3>
            <p className="text-xs text-white/30 mt-0.5">Latest events from GitHub</p>
          </div>
          {loading ? (
            <div className="px-5 pb-5 space-y-4">
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
            <div className="flex flex-col items-center justify-center py-10 text-center px-5">
              <Github className="h-6 w-6 text-white/10 mb-2" />
              <p className="text-xs text-white/25">No recent activity</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {activityItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3">
                  <div className={`mt-0.5 shrink-0 ${item.color}`}>
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white/60 leading-tight">{item.text}</p>
                    {item.sub && <p className="text-[11px] text-white/28 mt-0.5 truncate">{item.sub}</p>}
                    <p className="text-[10px] text-white/18 mt-0.5">{formatRelativeTime(item.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Open PRs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-2xl border border-white/[0.07] bg-white/[0.025] overflow-hidden mb-4"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white/75">Open Pull Requests</h3>
            <p className="text-xs text-white/30 mt-0.5">PRs you're involved in across all repositories</p>
          </div>
          {user && (
            <a href={`https://github.com/pulls?q=is:open+involves:${user.login}`} target="_blank" rel="noopener noreferrer">
              <button className="flex items-center gap-1 text-xs text-white/25 hover:text-white/55 transition-colors">
                View on GitHub <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </a>
          )}
        </div>
        {loading ? (
          <div className="divide-y divide-white/[0.04]">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skel className="h-8 w-8 rounded-xl shrink-0" />
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
            <CheckCircle2 className="h-8 w-8 text-emerald-500/40 mb-3" />
            <p className="text-sm font-medium text-white/50">All clear!</p>
            <p className="text-xs text-white/25 mt-1">No open PRs you're involved in.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {openPRs.map((pr) => (
              <a
                key={pr.number}
                href={pr.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.025] transition-colors group"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.07]">
                  <GitPullRequest className="h-4 w-4 text-white/25" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/65 truncate group-hover:text-white/90 transition-colors">
                    {pr.title}
                    {pr.draft && <span className="ml-2 text-xs text-white/25 font-normal">(draft)</span>}
                  </p>
                  <p className="text-xs text-white/28 mt-0.5">
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
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    Open
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </motion.div>

      {/* Progress bars */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          {
            label: "Public repos",
            value: loading ? 0 : (user?.public_repos ?? 0),
            max: 100,
            color: "bg-blue-500",
            accent: "text-blue-400",
            desc: (v: number) => `${v} public repo${v !== 1 ? "s" : ""}`,
          },
          {
            label: "Open PRs",
            value: loading ? 0 : openPRs.length,
            max: 20,
            color: "bg-amber-500",
            accent: "text-amber-400",
            desc: (v: number) => v === 0 ? "All caught up" : `${v} PR${v !== 1 ? "s" : ""} need attention`,
          },
          {
            label: "Commits this week",
            value: loading ? 0 : commitsWeek,
            max: 50,
            color: "bg-emerald-500",
            accent: "text-emerald-400",
            desc: (v: number) => v > 20 ? "Very active week" : v > 10 ? "Active week" : v > 0 ? "Light activity" : "No commits yet",
          },
        ].map((item, i) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white/55">{item.label}</span>
              <span className={`text-sm font-bold ${item.accent}`}>{loading ? "—" : item.value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${loading ? 0 : Math.min((item.value / item.max) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                className={`h-full rounded-full ${item.color}`}
              />
            </div>
            <p className="text-xs text-white/25">{loading ? "Loading…" : item.desc(item.value)}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
