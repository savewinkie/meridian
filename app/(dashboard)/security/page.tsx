"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Shield, Search, AlertCircle, XCircle, Info,
  ChevronRight, CheckCircle2, Filter, Eye,
  ExternalLink, Lock, Key, Bug, AlertTriangle,
} from "lucide-react"
import { cn, formatRelativeTime } from "@/lib/utils"

const securityStats = [
  { label: "Critical", count: 3, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
  { label: "High", count: 8, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: AlertCircle },
  { label: "Medium", count: 14, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle },
  { label: "Low", count: 21, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Info },
]

const issues = [
  { id: "S-001", title: "OAuth client secret exposed in logs", file: "src/auth/providers.ts", line: 23, severity: "critical", category: "secret", repo: "acme/backend", pr: "247", status: "open", cve: null, createdAt: new Date(Date.now() - 1000 * 60 * 23).toISOString() },
  { id: "S-002", title: "JWT signature validation skipped on refresh", file: "src/auth/oauth.ts", line: 84, severity: "critical", category: "vulnerability", repo: "acme/backend", pr: "247", status: "open", cve: null, createdAt: new Date(Date.now() - 1000 * 60 * 23).toISOString() },
  { id: "S-003", title: "Hardcoded database credentials", file: "config/database.js", line: 12, severity: "critical", category: "secret", repo: "acme/api", pr: null, status: "open", cve: null, createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
  { id: "S-004", title: "SQL injection via unsanitized user input", file: "src/queries/user.ts", line: 67, severity: "high", category: "vulnerability", repo: "acme/api", pr: "243", status: "open", cve: "CVE-2024-1234", createdAt: new Date(Date.now() - 1000 * 60 * 480).toISOString() },
  { id: "S-005", title: "Outdated dependency with known CVE", file: "package.json", line: null, severity: "high", category: "dependency", repo: "acme/frontend", pr: null, status: "open", cve: "CVE-2024-5678", createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString() },
  { id: "S-006", title: "CORS wildcard origin in production", file: "src/server.ts", line: 34, severity: "high", category: "misconfiguration", repo: "acme/api", pr: "241", status: "dismissed", cve: null, createdAt: new Date(Date.now() - 1000 * 60 * 1200).toISOString() },
  { id: "S-007", title: "Sensitive data in localStorage", file: "src/utils/storage.ts", line: 89, severity: "medium", category: "vulnerability", repo: "acme/frontend", pr: "242", status: "open", cve: null, createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString() },
  { id: "S-008", title: "Missing rate limiting on auth endpoint", file: "src/routes/auth.ts", line: 156, severity: "medium", category: "misconfiguration", repo: "acme/api", pr: null, status: "resolved", cve: null, createdAt: new Date(Date.now() - 1000 * 60 * 2880).toISOString() },
]

const categoryIcon = {
  secret: Key,
  vulnerability: Bug,
  misconfiguration: AlertTriangle,
  dependency: ExternalLink,
}

const severityConfig = {
  critical: { variant: "critical" as const, cls: "text-red-600 bg-red-50 border-red-100" },
  high: { variant: "destructive" as const, cls: "text-orange-600 bg-orange-50 border-orange-100" },
  medium: { variant: "warning" as const, cls: "text-amber-600 bg-amber-50 border-amber-100" },
  low: { variant: "info" as const, cls: "text-blue-600 bg-blue-50 border-blue-100" },
}

const statusConfig = {
  open: { label: "Open", variant: "destructive" as const },
  dismissed: { label: "Dismissed", variant: "muted" as const },
  resolved: { label: "Resolved", variant: "success" as const },
}

export default function SecurityPage() {
  const [search, setSearch] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")

  const filtered = issues.filter((issue) => {
    const matchSearch = issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.file.toLowerCase().includes(search.toLowerCase()) ||
      issue.repo.toLowerCase().includes(search.toLowerCase())
    const matchSeverity = severityFilter === "all" || issue.severity === severityFilter
    return matchSearch && matchSeverity
  })

  const openCount = issues.filter(i => i.status === "open").length
  const criticalCount = issues.filter(i => i.severity === "critical" && i.status === "open").length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729] mb-1">Security</h1>
          <p className="text-sm text-muted-foreground">
            {criticalCount > 0 ? (
              <span className="text-red-600 font-medium">{criticalCount} critical issues require immediate attention</span>
            ) : (
              `${openCount} open issues across all repositories`
            )}
          </p>
        </div>
        <Button variant="amber" size="sm" className="gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          Run scan
        </Button>
      </div>

      {/* Severity cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {securityStats.map((stat) => (
          <Card
            key={stat.label}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              severityFilter === stat.label.toLowerCase() ? `border-2 ${stat.border}` : ""
            )}
            onClick={() => setSeverityFilter(
              severityFilter === stat.label.toLowerCase() ? "all" : stat.label.toLowerCase()
            )}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <span className={cn("text-2xl font-bold", stat.color)}>{stat.count}</span>
              </div>
              <p className="text-sm font-medium text-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground">severity</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scan health */}
      <Card className="mb-6 border-emerald-200 bg-emerald-50/30">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-semibold text-foreground">Last scan complete</span>
            </div>
            <span className="text-xs text-muted-foreground">2 minutes ago · acme/backend</span>
          </div>
          <div className="space-y-2">
            {[
              { label: "Secret detection", value: 100, ok: true },
              { label: "Dependency scan", value: 100, ok: true },
              { label: "SAST analysis", value: 87, ok: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-36 text-xs text-muted-foreground">{item.label}</span>
                <Progress
                  value={item.value}
                  className="flex-1 h-1.5"
                  indicatorClassName={item.ok ? "bg-emerald-500" : "bg-amber-500"}
                />
                <span className={cn("text-xs font-semibold w-8 text-right", item.ok ? "text-emerald-600" : "text-amber-600")}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search issues…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1 border border-border rounded-lg p-1 bg-white">
          {["all", "critical", "high", "medium", "low"].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize",
                severityFilter === s ? "bg-[#0F1729] text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Issues table */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filtered.map((issue) => {
              const CatIcon = categoryIcon[issue.category as keyof typeof categoryIcon]
              const sev = severityConfig[issue.severity as keyof typeof severityConfig]
              const st = statusConfig[issue.status as keyof typeof statusConfig]
              return (
                <div key={issue.id} className="flex items-start gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border mt-0.5", sev.cls)}>
                    <CatIcon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{issue.title}</p>
                      <Badge variant={sev.variant} className="text-[10px]">{issue.severity}</Badge>
                      {issue.cve && (
                        <Badge variant="outline" className="text-[10px] font-mono">{issue.cve}</Badge>
                      )}
                      <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{issue.repo}</span>
                      {" · "}
                      <span className="font-mono">{issue.file}{issue.line ? `:${issue.line}` : ""}</span>
                      {issue.pr && <span> · PR #{issue.pr}</span>}
                      {" · "}
                      {formatRelativeTime(issue.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {issue.status === "open" && (
                      <>
                        <Button size="sm" variant="ghost" className="h-7 text-xs">Dismiss</Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
