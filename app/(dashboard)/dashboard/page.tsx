"use client"

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  GitPullRequest, Shield, Clock, TrendingUp, TrendingDown,
  ChevronRight, AlertCircle, CheckCircle2, Zap, ArrowUpRight,
  GitMerge, Brain, AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"

const prVolumeData = [
  { date: "Mon", opened: 8, merged: 5, issues: 2 },
  { date: "Tue", opened: 12, merged: 9, issues: 3 },
  { date: "Wed", opened: 7, merged: 11, issues: 1 },
  { date: "Thu", opened: 15, merged: 8, issues: 5 },
  { date: "Fri", opened: 10, merged: 13, issues: 2 },
  { date: "Sat", opened: 3, merged: 4, issues: 0 },
  { date: "Sun", opened: 5, merged: 3, issues: 1 },
]

const recentPRs = [
  {
    id: "247", title: "feat: add OAuth2 provider integration",
    repo: "acme/backend", author: "SC", riskScore: 78,
    reviewStatus: "pending", issues: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 23).toISOString(),
  },
  {
    id: "246", title: "fix: resolve memory leak in worker pool",
    repo: "acme/backend", author: "MW", riskScore: 32,
    reviewStatus: "completed", issues: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 67).toISOString(),
  },
  {
    id: "245", title: "refactor: migrate to new design system",
    repo: "acme/frontend", author: "PN", riskScore: 45,
    reviewStatus: "in_progress", issues: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
  },
  {
    id: "244", title: "chore: upgrade dependencies to latest",
    repo: "acme/frontend", author: "JD", riskScore: 21,
    reviewStatus: "completed", issues: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
  },
  {
    id: "243", title: "feat: add Stripe billing integration",
    repo: "acme/api", author: "TR", riskScore: 91,
    reviewStatus: "pending", issues: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
  },
]

const activity = [
  {
    type: "ai_review", icon: Brain, color: "text-purple-500",
    text: "AI reviewed PR #247 in acme/backend", sub: "3 issues found · 2 critical",
    time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    type: "merge", icon: GitMerge, color: "text-emerald-500",
    text: "Marcus merged PR #246", sub: "acme/backend · memory leak fix",
    time: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    type: "security", icon: Shield, color: "text-red-500",
    text: "Security scan flagged exposed API key", sub: "acme/config · Critical severity",
    time: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    type: "review", icon: CheckCircle2, color: "text-blue-500",
    text: "Sarah approved PR #245", sub: "acme/frontend",
    time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    type: "ai_review", icon: Brain, color: "text-purple-500",
    text: "AI reviewed PR #243 in acme/api", sub: "5 issues found · 3 critical",
    time: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
  },
]

const riskColors = (score: number) => {
  if (score >= 80) return "bg-red-100 text-red-700"
  if (score >= 60) return "bg-orange-100 text-orange-700"
  if (score >= 40) return "bg-amber-100 text-amber-700"
  return "bg-emerald-100 text-emerald-700"
}

const reviewStatusConfig = {
  pending: { label: "Pending", variant: "warning" as const },
  in_progress: { label: "In review", variant: "info" as const },
  completed: { label: "Reviewed", variant: "success" as const },
}

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729] mb-1">Good morning, John ☀️</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            {" · "}
            <span className="text-amber-600 font-medium">5 PRs</span> awaiting review
          </p>
        </div>
        <Link href="/reviews">
          <Button variant="amber" size="sm" className="gap-1.5">
            <GitPullRequest className="h-3.5 w-3.5" />
            View all reviews
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Open PRs", value: "24", change: "+3", up: true,
            icon: GitPullRequest, iconColor: "text-blue-600", iconBg: "bg-blue-50",
            sub: "vs last week",
          },
          {
            label: "Critical Issues", value: "8", change: "-2", up: false,
            icon: AlertCircle, iconColor: "text-red-600", iconBg: "bg-red-50",
            sub: "vs last week",
          },
          {
            label: "Avg Review Time", value: "2.4h", change: "-18%", up: false,
            icon: Clock, iconColor: "text-amber-600", iconBg: "bg-amber-50",
            sub: "vs last week",
          },
          {
            label: "Quality Score", value: "87", change: "+4", up: true,
            icon: Zap, iconColor: "text-emerald-600", iconBg: "bg-emerald-50",
            sub: "out of 100",
          },
        ].map((metric) => (
          <Card key={metric.label} className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${metric.iconBg}`}>
                  <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${
                  metric.up ? "text-emerald-600" : "text-red-500"
                }`}>
                  {metric.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {metric.change}
                </div>
              </div>
              <div className="text-3xl font-bold text-[#0F1729] mb-0.5">{metric.value}</div>
              <div className="text-sm text-muted-foreground">{metric.label}</div>
              <div className="text-xs text-muted-foreground/60 mt-0.5">{metric.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* PR Volume Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">PR Activity</CardTitle>
                <CardDescription>Opened, merged, and issues this week</CardDescription>
              </div>
              <Badge variant="muted" className="text-xs">Last 7 days</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={prVolumeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="openedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F1729" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0F1729" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="mergedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "white", border: "1px solid hsl(214 20% 90%)",
                    borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Area type="monotone" dataKey="opened" stroke="#0F1729" strokeWidth={2} fill="url(#openedGrad)" name="Opened" />
                <Area type="monotone" dataKey="merged" stroke="#10B981" strokeWidth={2} fill="url(#mergedGrad)" name="Merged" />
                <Area type="monotone" dataKey="issues" stroke="#F59E0B" strokeWidth={2} fill="transparent" name="Issues" strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest events across your repos</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {activity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 px-6 py-3">
                  <div className={`mt-0.5 shrink-0 ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground leading-tight">{item.text}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.sub}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {formatRelativeTime(item.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent PRs Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Pull Requests</CardTitle>
              <CardDescription>Latest PRs across all repositories</CardDescription>
            </div>
            <Link href="/reviews">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentPRs.map((pr) => {
              const status = reviewStatusConfig[pr.reviewStatus as keyof typeof reviewStatusConfig]
              return (
                <Link
                  key={pr.id}
                  href={`/reviews/${pr.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-amber-600 transition-colors">
                      {pr.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      #{pr.id} · <span className="font-mono">{pr.repo}</span>
                      {" · "}{formatRelativeTime(pr.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {pr.issues > 0 && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {pr.issues}
                      </div>
                    )}
                    <div className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${riskColors(pr.riskScore)}`}>
                      {pr.riskScore}
                    </div>
                    <Badge variant={status.variant} className="text-xs">
                      {status.label}
                    </Badge>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[9px] bg-amber-100 text-amber-700 font-bold">
                        {pr.author}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quality Score Card */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Security Score", value: 92, color: "bg-emerald-500", text: "text-emerald-600" },
          { label: "Review Coverage", value: 78, color: "bg-amber-500", text: "text-amber-600" },
          { label: "Debt Ratio", value: 34, color: "bg-orange-500", text: "text-orange-600", inverted: true },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <span className={`text-sm font-bold ${item.text}`}>{item.value}%</span>
              </div>
              <Progress
                value={item.value}
                className="h-2"
                indicatorClassName={item.color}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {item.inverted
                  ? item.value < 40 ? "Below average — good" : "Above average"
                  : item.value >= 80 ? "Excellent" : item.value >= 60 ? "Good" : "Needs improvement"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
