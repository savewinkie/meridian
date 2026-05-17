"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Shield, Search, AlertCircle, XCircle, Info, CheckCircle2,
  AlertTriangle, ExternalLink, Package, Github, RefreshCw,
} from "lucide-react"
import { cn, formatRelativeTime } from "@/lib/utils"

interface DependabotAlert {
  number: number
  state: string
  dependency: {
    package: { ecosystem: string; name: string }
    manifest_path: string
  }
  security_advisory: {
    summary: string
    severity: "low" | "medium" | "high" | "critical"
    cve_id: string | null
  }
  html_url: string
  created_at: string
  auto_dismissed_at: string | null
}

interface GHRepo {
  full_name: string
  private: boolean
  language: string | null
}

const SEV = {
  critical: { label: "Critical", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: XCircle, bar: "bg-red-500" },
  high:     { label: "High",     color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: AlertCircle, bar: "bg-orange-500" },
  medium:   { label: "Medium",   color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle, bar: "bg-amber-400" },
  low:      { label: "Low",      color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Info, bar: "bg-blue-400" },
}

function Skel({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-muted", className)} />
}

export default function SecurityPage() {
  const [alerts, setAlerts] = useState<(DependabotAlert & { repo: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [noGitHub, setNoGitHub] = useState(false)
  const [search, setSearch] = useState("")
  const [sevFilter, setSevFilter] = useState("all")
  const [scannedRepos, setScannedRepos] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.provider_token) { setNoGitHub(true); setLoading(false); return }
      const tok = session.provider_token

      try {
        const repoRes = await fetch("https://api.github.com/user/repos?per_page=30&sort=updated", {
          headers: { Authorization: `Bearer ${tok}`, Accept: "application/vnd.github+json" },
        })
        const repos: GHRepo[] = await repoRes.json()
        setScannedRepos(repos.length)

        const allAlerts: (DependabotAlert & { repo: string })[] = []
        await Promise.all(repos.slice(0, 15).map(async (repo) => {
          try {
            const res = await fetch(
              `https://api.github.com/repos/${repo.full_name}/dependabot/alerts?state=open&per_page=10`,
              { headers: { Authorization: `Bearer ${tok}`, Accept: "application/vnd.github+json" } }
            )
            if (!res.ok) return
            const data: DependabotAlert[] = await res.json()
            if (Array.isArray(data)) {
              allAlerts.push(...data.map(a => ({ ...a, repo: repo.full_name })))
            }
          } catch { /* repo has no dependabot or no access */ }
        }))

        // Sort: critical first, then high, medium, low
        const order = { critical: 0, high: 1, medium: 2, low: 3 }
        allAlerts.sort((a, b) => (order[a.security_advisory.severity] ?? 4) - (order[b.security_advisory.severity] ?? 4))
        setAlerts(allAlerts)
      } catch { /* ignore */ }

      setLoading(false)
    })
  }, [])

  const filtered = alerts.filter(a => {
    const matchSearch = a.security_advisory.summary.toLowerCase().includes(search.toLowerCase()) ||
      a.dependency.package.name.toLowerCase().includes(search.toLowerCase()) ||
      a.repo.toLowerCase().includes(search.toLowerCase())
    const matchSev = sevFilter === "all" || a.security_advisory.severity === sevFilter
    return matchSearch && matchSev
  })

  const critCount = alerts.filter(a => a.security_advisory.severity === "critical").length
  const highCount = alerts.filter(a => a.security_advisory.severity === "high").length
  const medCount  = alerts.filter(a => a.security_advisory.severity === "medium").length
  const lowCount  = alerts.filter(a => a.security_advisory.severity === "low").length

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729] mb-1">Security</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Scanning repositories…" : noGitHub ? "Connect GitHub to scan for vulnerabilities" :
              alerts.length === 0 ? `No open vulnerabilities across ${scannedRepos} repositories` :
              critCount > 0 ? <span className="text-red-600 font-medium">{critCount} critical vulnerabilities require attention</span> :
              `${alerts.length} open vulnerabilities across ${scannedRepos} repositories`}
          </p>
        </div>
        {!noGitHub && !loading && (
          <Button variant="amber" size="sm" className="gap-1.5" onClick={() => { setLoading(true); window.location.reload() }}>
            <RefreshCw className="h-3.5 w-3.5" />
            Re-scan
          </Button>
        )}
      </div>

      {noGitHub && (
        <Card className="border-amber-200 bg-amber-50/40 mb-6">
          <CardContent className="p-6 flex items-center gap-4">
            <Github className="h-8 w-8 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#0F1729]">GitHub not connected</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sign out and sign in with GitHub to enable security scanning.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Severity cards */}
      {!noGitHub && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {([
            { key: "critical", count: loading ? null : critCount },
            { key: "high",     count: loading ? null : highCount },
            { key: "medium",   count: loading ? null : medCount  },
            { key: "low",      count: loading ? null : lowCount  },
          ] as const).map(({ key, count }) => {
            const s = SEV[key]
            return (
              <Card key={key}
                className={cn("cursor-pointer transition-all hover:shadow-md",
                  sevFilter === key ? `border-2 ${s.border}` : "")}
                onClick={() => setSevFilter(sevFilter === key ? "all" : key)}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", s.bg)}>
                      <s.icon className={cn("h-5 w-5", s.color)} />
                    </div>
                    {count === null ? <Skel className="h-7 w-8" /> :
                      <span className={cn("text-2xl font-bold", s.color)}>{count}</span>}
                  </div>
                  <p className="text-sm font-medium text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">severity</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Clean state */}
      {!loading && !noGitHub && alerts.length === 0 && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-6 flex items-center gap-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">No dependency vulnerabilities found</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dependabot scanned {scannedRepos} repositories — all clear.
                Use the Scanner to run a deep AI code review for logic and security issues.
              </p>
            </div>
            <a href="/scanner/repo" className="ml-auto shrink-0">
              <Button variant="outline" size="sm">Run AI scan</Button>
            </a>
          </CardContent>
        </Card>
      )}

      {/* Scan progress banner */}
      {loading && !noGitHub && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-semibold text-foreground">Scanning Dependabot alerts…</span>
            </div>
            <div className="space-y-2">
              {["Dependency scan", "Vulnerability check", "CVE lookup"].map((label, i) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-36 text-xs text-muted-foreground">{label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full animate-pulse" style={{ width: `${60 + i * 15}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {!noGitHub && alerts.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search vulnerabilities…" value={search}
              onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-1 border border-border rounded-lg p-1 bg-white">
            {["all", "critical", "high", "medium", "low"].map((s) => (
              <button key={s} onClick={() => setSevFilter(s)}
                className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize",
                  sevFilter === s ? "bg-[#0F1729] text-white" : "text-muted-foreground hover:text-foreground")}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Alerts table */}
      {!noGitHub && (loading || alerts.length > 0) && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4 px-6 py-4">
                    <Skel className="h-8 w-8 rounded-lg shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <Skel className="h-3 w-72" />
                      <Skel className="h-2.5 w-48" />
                    </div>
                  </div>
                ))
              ) : (
                filtered.map((alert) => {
                  const sev = SEV[alert.security_advisory.severity] ?? SEV.low
                  return (
                    <div key={`${alert.repo}-${alert.number}`}
                      className="flex items-start gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border mt-0.5", sev.bg, sev.border)}>
                        <Package className={cn("h-4 w-4", sev.color)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{alert.security_advisory.summary}</p>
                          <span className={cn("text-[10px] font-bold rounded-full px-2 py-0.5 border", sev.bg, sev.border, sev.color)}>
                            {sev.label}
                          </span>
                          {alert.security_advisory.cve_id && (
                            <Badge variant="outline" className="text-[10px] font-mono">{alert.security_advisory.cve_id}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-mono font-medium">{alert.repo}</span>
                          {" · "}
                          <span className="font-mono">{alert.dependency.package.ecosystem}/{alert.dependency.package.name}</span>
                          {" · "}{formatRelativeTime(alert.created_at)}
                        </p>
                      </div>

                      <a href={alert.html_url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                          <ExternalLink className="h-3 w-3" />
                          View
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
