"use client"

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingDown, TrendingUp, Clock, FileText, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const debtTrendData = [
  { month: "Aug", hours: 142 },
  { month: "Sep", hours: 156 },
  { month: "Oct", hours: 134 },
  { month: "Nov", hours: 128 },
  { month: "Dec", hours: 115 },
  { month: "Jan", hours: 98 },
]

const debtByCategory = [
  { name: "Duplication", hours: 38, color: "#F59E0B" },
  { name: "Complexity", hours: 29, color: "#EF4444" },
  { name: "Test Coverage", hours: 18, color: "#8B5CF6" },
  { name: "Outdated APIs", hours: 8, color: "#3B82F6" },
  { name: "Code Smells", hours: 5, color: "#10B981" },
]

const hotspots = [
  { file: "src/payments/processor.ts", debt: 14.2, complexity: 89, coverage: 32, duplications: 3, trend: "up" },
  { file: "src/auth/middleware.ts", debt: 11.8, complexity: 76, coverage: 45, duplications: 5, trend: "down" },
  { file: "src/api/routes/index.ts", debt: 9.4, complexity: 71, coverage: 28, duplications: 2, trend: "neutral" },
  { file: "src/utils/transforms.ts", debt: 7.6, complexity: 58, coverage: 61, duplications: 8, trend: "down" },
  { file: "src/db/migrations/legacy.ts", debt: 6.9, complexity: 45, coverage: 12, duplications: 1, trend: "up" },
  { file: "src/cache/redis.ts", debt: 5.2, complexity: 52, coverage: 55, duplications: 0, trend: "neutral" },
  { file: "src/notifications/email.ts", debt: 4.1, complexity: 38, coverage: 70, duplications: 4, trend: "down" },
]

const debtSummary = [
  { label: "Total Debt", value: "98h", change: "-17h", up: false, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Hotspot Files", value: "23", change: "+2", up: true, icon: FileText, color: "text-red-600", bg: "bg-red-50" },
  { label: "Avg Complexity", value: "C", change: "vs D", up: false, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Test Coverage", value: "68%", change: "+6%", up: true, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
]

const complexityGrade = (score: number) => {
  if (score >= 80) return { grade: "D", cls: "text-red-600 bg-red-50" }
  if (score >= 60) return { grade: "C", cls: "text-orange-600 bg-orange-50" }
  if (score >= 40) return { grade: "B", cls: "text-amber-600 bg-amber-50" }
  return { grade: "A", cls: "text-emerald-600 bg-emerald-50" }
}

export default function DebtPage() {
  const totalDebt = debtByCategory.reduce((a, b) => a + b.hours, 0)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729] mb-1">Tech Debt</h1>
          <p className="text-sm text-muted-foreground">
            {totalDebt}h of accumulated debt across all repositories
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          Export report
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {debtSummary.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", item.bg)}>
                  <item.icon className={cn("h-4 w-4", item.color)} />
                </div>
                <div className={cn("flex items-center gap-0.5 text-xs font-semibold", item.up ? "text-emerald-600" : "text-amber-600")}>
                  {item.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {item.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-[#0F1729] mb-0.5">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Debt trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Debt Trend</CardTitle>
                <CardDescription>Total estimated hours to resolve</CardDescription>
              </div>
              <Badge variant="success" className="text-xs">↓ 31% reduction</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={debtTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid hsl(214 20% 90%)", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(v) => [`${v}h`, "Debt"]}
                />
                <Area type="monotone" dataKey="hours" stroke="#F59E0B" strokeWidth={2.5} fill="url(#debtGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Category</CardTitle>
            <CardDescription>Hours to resolve</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={debtByCategory} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#6B7280" }} width={90} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(214 20% 90%)", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                  {debtByCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-3 space-y-2">
              {debtByCategory.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: cat.color }} />
                    <span className="text-muted-foreground">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{cat.hours}h</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hotspot files */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Debt Hotspots</CardTitle>
              <CardDescription>Files with the most accumulated technical debt</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
              View all 23 files <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            <div className="flex items-center gap-4 px-6 py-2 bg-muted/30">
              <div className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">File</div>
              <div className="w-16 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Debt</div>
              <div className="w-20 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Complexity</div>
              <div className="w-20 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Coverage</div>
              <div className="w-16 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Dups</div>
            </div>
            {hotspots.map((file) => {
              const grade = complexityGrade(file.complexity)
              return (
                <div key={file.file} className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors group cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono font-medium text-foreground truncate group-hover:text-amber-600 transition-colors">
                      {file.file}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1">
                      <div
                        className="h-1.5 rounded-full bg-amber-500"
                        style={{ width: `${Math.min(file.debt / 15 * 100, 100)}%`, maxWidth: "160px" }}
                      />
                    </div>
                  </div>

                  <div className="w-16 text-center">
                    <span className="text-sm font-semibold text-amber-600">{file.debt}h</span>
                  </div>

                  <div className="w-20 text-center">
                    <span className={cn("text-xs font-bold rounded-md px-2 py-0.5", grade.cls)}>
                      {grade.grade} · {file.complexity}
                    </span>
                  </div>

                  <div className="w-20 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={cn("text-xs font-semibold", file.coverage < 40 ? "text-red-600" : file.coverage < 60 ? "text-amber-600" : "text-emerald-600")}>
                        {file.coverage}%
                      </span>
                      <Progress
                        value={file.coverage}
                        className="h-1 w-12"
                        indicatorClassName={file.coverage < 40 ? "bg-red-500" : file.coverage < 60 ? "bg-amber-500" : "bg-emerald-500"}
                      />
                    </div>
                  </div>

                  <div className="w-16 text-center">
                    <span className={cn("text-xs font-semibold", file.duplications > 4 ? "text-red-600" : file.duplications > 1 ? "text-amber-600" : "text-muted-foreground")}>
                      {file.duplications}
                    </span>
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
