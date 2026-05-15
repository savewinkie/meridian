"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  GitPullRequest, Search, Filter, AlertCircle, CheckCircle2,
  Clock, ArrowUpDown, ChevronRight, GitMerge, RefreshCw,
} from "lucide-react"
import { formatRelativeTime, cn } from "@/lib/utils"

const allPRs = [
  { id: "247", title: "feat: add OAuth2 provider integration", repo: "acme/backend", author: "Sarah Chen", authorInitials: "SC", branch: "feat/oauth2", riskScore: 78, reviewStatus: "pending", issues: 3, additions: 412, deletions: 87, files: 14, createdAt: new Date(Date.now() - 1000 * 60 * 23).toISOString() },
  { id: "246", title: "fix: resolve memory leak in worker pool", repo: "acme/backend", author: "Marcus Williams", authorInitials: "MW", branch: "fix/worker-leak", riskScore: 32, reviewStatus: "completed", issues: 0, additions: 45, deletions: 112, files: 3, createdAt: new Date(Date.now() - 1000 * 60 * 67).toISOString() },
  { id: "245", title: "refactor: migrate to new design system", repo: "acme/frontend", author: "Priya Nair", authorInitials: "PN", branch: "refactor/design-system", riskScore: 45, reviewStatus: "in_progress", issues: 1, additions: 843, deletions: 721, files: 67, createdAt: new Date(Date.now() - 1000 * 60 * 140).toISOString() },
  { id: "244", title: "chore: upgrade all dependencies to latest", repo: "acme/frontend", author: "John Doe", authorInitials: "JD", branch: "chore/deps-upgrade", riskScore: 21, reviewStatus: "completed", issues: 0, additions: 12, deletions: 10, files: 2, createdAt: new Date(Date.now() - 1000 * 60 * 320).toISOString() },
  { id: "243", title: "feat: add Stripe billing integration", repo: "acme/api", author: "Tom Rivera", authorInitials: "TR", branch: "feat/stripe-billing", riskScore: 91, reviewStatus: "pending", issues: 5, additions: 1203, deletions: 45, files: 28, createdAt: new Date(Date.now() - 1000 * 60 * 480).toISOString() },
  { id: "242", title: "feat: implement real-time notifications", repo: "acme/frontend", author: "Sarah Chen", authorInitials: "SC", branch: "feat/realtime-notifs", riskScore: 54, reviewStatus: "in_progress", issues: 2, additions: 378, deletions: 12, files: 11, createdAt: new Date(Date.now() - 1000 * 60 * 650).toISOString() },
  { id: "241", title: "fix: handle edge case in payment processor", repo: "acme/api", author: "Marcus Williams", authorInitials: "MW", branch: "fix/payment-edge", riskScore: 67, reviewStatus: "completed", issues: 0, additions: 89, deletions: 34, files: 5, createdAt: new Date(Date.now() - 1000 * 60 * 800).toISOString() },
  { id: "240", title: "docs: update API reference", repo: "acme/docs", author: "Priya Nair", authorInitials: "PN", branch: "docs/api-update", riskScore: 8, reviewStatus: "completed", issues: 0, additions: 234, deletions: 89, files: 8, createdAt: new Date(Date.now() - 1000 * 60 * 1200).toISOString() },
]

const statusConfig = {
  pending: { label: "Pending", variant: "warning" as const, icon: Clock },
  in_progress: { label: "In review", variant: "info" as const, icon: RefreshCw },
  completed: { label: "Reviewed", variant: "success" as const, icon: CheckCircle2 },
}

const riskLabel = (score: number) => {
  if (score >= 80) return { label: "Critical", cls: "bg-red-100 text-red-700" }
  if (score >= 60) return { label: "High", cls: "bg-orange-100 text-orange-700" }
  if (score >= 40) return { label: "Medium", cls: "bg-amber-100 text-amber-700" }
  return { label: "Low", cls: "bg-emerald-100 text-emerald-700" }
}

export default function ReviewsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = allPRs.filter((pr) => {
    const matchSearch = pr.title.toLowerCase().includes(search.toLowerCase()) ||
      pr.repo.toLowerCase().includes(search.toLowerCase()) ||
      pr.author.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || pr.reviewStatus === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1729] mb-1">Pull Requests</h1>
        <p className="text-sm text-muted-foreground">
          {allPRs.filter(p => p.reviewStatus === "pending").length} pending review ·{" "}
          {allPRs.length} total this month
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending", count: allPRs.filter(p => p.reviewStatus === "pending").length, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "In Review", count: allPRs.filter(p => p.reviewStatus === "in_progress").length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Completed", count: allPRs.filter(p => p.reviewStatus === "completed").length, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((s) => (
          <Card key={s.label} className={cn("cursor-pointer transition-colors hover:border-amber-200", statusFilter === s.label.toLowerCase().replace(" ", "_") ? "border-amber-300" : "")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold", s.bg, s.color)}>
                {s.count}
              </div>
              <span className="text-sm font-medium text-foreground">{s.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search PRs, repos, authors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-1 border border-border rounded-lg p-1 bg-white">
          {["all", "pending", "in_progress", "completed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize",
                statusFilter === s
                  ? "bg-[#0F1729] text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {s === "in_progress" ? "In Review" : s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          Filter
        </Button>
      </div>

      {/* PR List */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <GitPullRequest className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No pull requests found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {/* Table header */}
              <div className="flex items-center gap-4 px-6 py-3 bg-muted/30">
                <div className="w-8" />
                <div className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Pull Request
                </div>
                <div className="w-24 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                  Risk
                </div>
                <div className="w-28 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                  Changes
                </div>
                <div className="w-24 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </div>
                <div className="w-8" />
              </div>

              {filtered.map((pr) => {
                const risk = riskLabel(pr.riskScore)
                const status = statusConfig[pr.reviewStatus as keyof typeof statusConfig]
                return (
                  <Link
                    key={pr.id}
                    href={`/reviews/${pr.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group"
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-amber-100 text-amber-700 text-[10px] font-bold">
                        {pr.authorInitials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-amber-600 transition-colors">
                          {pr.title}
                        </p>
                        {pr.issues > 0 && (
                          <div className="flex shrink-0 items-center gap-1 text-[11px] text-red-600 bg-red-50 rounded-full px-2 py-0.5">
                            <AlertCircle className="h-3 w-3" />
                            {pr.issues}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        #{pr.id} · <span className="font-mono">{pr.repo}</span>
                        {" · "}{pr.author}
                        {" · "}{formatRelativeTime(pr.createdAt)}
                      </p>
                    </div>

                    <div className="w-24 text-right">
                      <span className={cn("text-xs font-semibold rounded-full px-2.5 py-1", risk.cls)}>
                        {risk.label} {pr.riskScore}
                      </span>
                    </div>

                    <div className="w-28 text-right">
                      <p className="text-xs font-mono">
                        <span className="text-emerald-600">+{pr.additions}</span>
                        {" "}
                        <span className="text-red-500">-{pr.deletions}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground">{pr.files} files</p>
                    </div>

                    <div className="w-24">
                      <Badge variant={status.variant} className="text-[11px]">
                        {status.label}
                      </Badge>
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-amber-500 transition-colors shrink-0" />
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
