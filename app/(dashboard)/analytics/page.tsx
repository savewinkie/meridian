"use client"

import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TrendingUp, TrendingDown, Users, Clock, GitMerge, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

const reviewTimeData = [
  { week: "W1", avgHours: 8.2, target: 4 },
  { week: "W2", avgHours: 6.8, target: 4 },
  { week: "W3", avgHours: 5.1, target: 4 },
  { week: "W4", avgHours: 4.7, target: 4 },
  { week: "W5", avgHours: 3.9, target: 4 },
  { week: "W6", avgHours: 3.2, target: 4 },
  { week: "W7", avgHours: 2.8, target: 4 },
  { week: "W8", avgHours: 2.4, target: 4 },
]

const mergeVelocityData = [
  { month: "Aug", merged: 42, opened: 48, rejected: 6 },
  { month: "Sep", merged: 58, opened: 63, rejected: 5 },
  { month: "Oct", merged: 71, opened: 74, rejected: 3 },
  { month: "Nov", merged: 65, opened: 68, rejected: 3 },
  { month: "Dec", merged: 89, opened: 91, rejected: 2 },
  { month: "Jan", merged: 94, opened: 96, rejected: 2 },
]

const qualityTrendData = [
  { week: "W1", score: 62, issues: 34 },
  { week: "W2", score: 65, issues: 28 },
  { week: "W3", score: 70, issues: 22 },
  { week: "W4", score: 73, issues: 18 },
  { week: "W5", score: 78, issues: 14 },
  { week: "W6", score: 81, issues: 11 },
  { week: "W7", score: 84, issues: 9 },
  { week: "W8", score: 87, issues: 7 },
]

const issuesByCategory = [
  { name: "Security", value: 34, color: "#EF4444" },
  { name: "Performance", value: 28, color: "#F59E0B" },
  { name: "Logic", value: 22, color: "#8B5CF6" },
  { name: "Style", value: 11, color: "#3B82F6" },
  { name: "Maintainability", value: 5, color: "#10B981" },
]

const teamLeaderboard = [
  { name: "Sarah Chen", initials: "SC", reviews: 47, avgTime: "1.8h", score: 96, trend: "up" },
  { name: "Marcus Williams", initials: "MW", reviews: 38, avgTime: "2.1h", score: 91, trend: "up" },
  { name: "Priya Nair", initials: "PN", reviews: 35, avgTime: "2.4h", score: 88, trend: "neutral" },
  { name: "John Doe", initials: "JD", reviews: 29, avgTime: "3.2h", score: 82, trend: "down" },
  { name: "Tom Rivera", initials: "TR", reviews: 24, avgTime: "2.9h", score: 79, trend: "up" },
]

const timeRanges = ["7 days", "30 days", "90 days", "All time"]

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1729] mb-1">Analytics</h1>
          <p className="text-sm text-muted-foreground">Team performance and code quality trends</p>
        </div>
        <div className="flex gap-1 border border-border rounded-lg p-1 bg-white">
          {timeRanges.map((range, i) => (
            <button
              key={range}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                i === 1 ? "bg-[#0F1729] text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Merge Rate", value: "97.8%", change: "+2.1%", up: true, icon: GitMerge, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Avg Review Time", value: "2.4h", change: "-42%", up: false, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Team Members", value: "12", change: "+2", up: true, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Issues Caught", value: "186", change: "+23%", up: true, icon: Shield, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", m.bg)}>
                  <m.icon className={cn("h-4 w-4", m.color)} />
                </div>
                <div className={cn("text-xs font-semibold flex items-center gap-0.5", m.up ? "text-emerald-600" : "text-red-500")}>
                  {m.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {m.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-[#0F1729] mb-0.5">{m.value}</div>
              <div className="text-xs text-muted-foreground">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Review Time Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Review Time</CardTitle>
                <CardDescription>Average hours per PR</CardDescription>
              </div>
              <Badge variant="success" className="text-xs">↓ 42% improvement</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={reviewTimeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(214 20% 90%)", borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="avgHours" stroke="#0F1729" strokeWidth={2.5} dot={{ r: 3, fill: "#0F1729" }} name="Avg hours" />
                <Line type="monotone" dataKey="target" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Merge Velocity */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Merge Velocity</CardTitle>
                <CardDescription>PRs opened vs merged per month</CardDescription>
              </div>
              <Badge variant="navy" className="text-xs">6 months</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mergeVelocityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(214 20% 90%)", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="opened" fill="#E5E7EB" radius={[4, 4, 0, 0]} name="Opened" />
                <Bar dataKey="merged" fill="#0F1729" radius={[4, 4, 0, 0]} name="Merged" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quality Score */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quality Score Trend</CardTitle>
            <CardDescription>Overall codebase quality score over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={qualityTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(214 20% 90%)", borderRadius: "8px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="score" stroke="#F59E0B" strokeWidth={2.5} fill="url(#scoreGrad)" name="Quality score" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Issues by Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Issues by Category</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={issuesByCategory}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {issuesByCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(214 20% 90%)", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 w-full">
              {issuesByCategory.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: cat.color }} />
                    <span className="text-muted-foreground">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{cat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Leaderboard</CardTitle>
          <CardDescription>Review activity and quality scores this month</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {teamLeaderboard.map((member, i) => (
              <div key={member.name} className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-muted-foreground">
                  #{i + 1}
                </div>
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-amber-100 text-amber-700 text-xs font-bold">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.reviews} reviews · {member.avgTime} avg</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#0F1729]">{member.score}</div>
                    <div className="text-[10px] text-muted-foreground">score</div>
                  </div>
                  {member.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  ) : member.trend === "down" ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
