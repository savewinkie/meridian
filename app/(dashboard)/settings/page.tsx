"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Github, GitBranch, Zap, Shield, Users, CreditCard,
  CheckCircle2, Plus, Trash2, Crown, Settings,
  AlertTriangle, Lock, Bell, Key, Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"

const teamMembers = [
  { name: "Sarah Chen", email: "sarah@acme.com", initials: "SC", role: "owner", joined: "Jan 2024" },
  { name: "Marcus Williams", email: "marcus@acme.com", initials: "MW", role: "admin", joined: "Jan 2024" },
  { name: "Priya Nair", email: "priya@acme.com", initials: "PN", role: "member", joined: "Feb 2024" },
  { name: "John Doe", email: "john@acme.com", initials: "JD", role: "member", joined: "Feb 2024" },
  { name: "Tom Rivera", email: "tom@acme.com", initials: "TR", role: "member", joined: "Mar 2024" },
]

const connectedRepos = [
  { name: "acme/backend", provider: "GitHub", prs: 124, lastScan: "2 min ago", active: true },
  { name: "acme/frontend", provider: "GitHub", prs: 89, lastScan: "5 min ago", active: true },
  { name: "acme/api", provider: "GitHub", prs: 67, lastScan: "12 min ago", active: true },
  { name: "acme/docs", provider: "GitHub", prs: 23, lastScan: "1h ago", active: false },
]

const roleConfig = {
  owner: { label: "Owner", cls: "bg-amber-100 text-amber-700" },
  admin: { label: "Admin", cls: "bg-blue-100 text-blue-700" },
  member: { label: "Member", cls: "bg-gray-100 text-gray-600" },
}

const policyRules = [
  { id: 1, label: "Block merge on critical security issues", enabled: true },
  { id: 2, label: "Require AI review before human review", enabled: true },
  { id: 3, label: "Auto-assign reviewers based on file ownership", enabled: false },
  { id: 4, label: "Fail CI if review score below 70", enabled: false },
  { id: 5, label: "Require 2 approvals for high-risk PRs", enabled: true },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
        checked ? "bg-amber-500" : "bg-gray-200"
      )}
    >
      <span className={cn(
        "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
        checked ? "translate-x-5" : "translate-x-1"
      )} />
    </button>
  )
}

export default function SettingsPage() {
  const [policies, setPolicies] = useState(policyRules)
  const [inviteEmail, setInviteEmail] = useState("")

  const togglePolicy = (id: number) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p))
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1729] mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your workspace, integrations, and billing.</p>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="h-auto p-1 flex-wrap gap-1">
          <TabsTrigger value="integrations" className="gap-1.5 text-xs">
            <Github className="h-3.5 w-3.5" />Integrations
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />Team
          </TabsTrigger>
          <TabsTrigger value="policies" className="gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5" />Policies
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5 text-xs">
            <CreditCard className="h-3.5 w-3.5" />Billing
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-1.5 text-xs">
            <Settings className="h-3.5 w-3.5" />General
          </TabsTrigger>
        </TabsList>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          {/* Repositories */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Connected Repositories</CardTitle>
                  <CardDescription>Repositories monitored by Meridian</CardDescription>
                </div>
                <Button size="sm" variant="amber" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add repository
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {connectedRepos.map((repo) => (
                  <div key={repo.name} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F1729]/5">
                      <Github className="h-4 w-4 text-[#0F1729]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold font-mono text-foreground">{repo.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {repo.prs} PRs reviewed · Last scan {repo.lastScan}
                      </p>
                    </div>
                    <Badge variant={repo.active ? "success" : "muted"} className="text-xs">
                      {repo.active ? "Active" : "Paused"}
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* GitHub App */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">GitHub App</CardTitle>
              <CardDescription>Configure the Meridian GitHub App installation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-emerald-200 bg-emerald-50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Connected to GitHub</p>
                    <p className="text-xs text-muted-foreground">acme-corp organization · 4 repos</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Configure</Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <GitBranch className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">GitLab</p>
                    <p className="text-xs text-muted-foreground">Not connected</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Anthropic API */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Configuration</CardTitle>
              <CardDescription>Configure the Claude API for AI-powered reviews</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                  <Zap className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Claude API</p>
                  <p className="text-xs text-muted-foreground">Powered by Anthropic</p>
                </div>
                <Badge variant="success" className="ml-auto">Active</Badge>
              </div>
              <div className="space-y-1.5">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input type="password" value="sk-ant-••••••••••••••••••••••" readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Model</span>
                <Badge variant="navy">claude-sonnet-4-6</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Team Members</CardTitle>
                  <CardDescription>{teamMembers.length} members in Acme Corp</CardDescription>
                </div>
              </div>
            </CardHeader>

            {/* Invite */}
            <CardContent className="pb-0">
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  type="email"
                  className="max-w-xs"
                />
                <Button variant="amber" size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Invite
                </Button>
              </div>
              <Separator />
            </CardContent>

            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {teamMembers.map((member) => {
                  const rc = roleConfig[member.role as keyof typeof roleConfig]
                  return (
                    <div key={member.email} className="flex items-center gap-4 px-6 py-4">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-amber-100 text-amber-700 text-xs font-bold">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{member.name}</p>
                          {member.role === "owner" && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{member.email} · Joined {member.joined}</p>
                      </div>
                      <span className={cn("text-xs font-semibold rounded-full px-2.5 py-0.5", rc.cls)}>
                        {rc.label}
                      </span>
                      {member.role !== "owner" && (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies */}
        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review Policies</CardTitle>
              <CardDescription>Configure automated review rules for your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {policies.map((policy) => (
                <div key={policy.id} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
                  <div className="flex items-start gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground">{policy.label}</span>
                  </div>
                  <Toggle checked={policy.enabled} onChange={() => togglePolicy(policy.id)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review Requirements</CardTitle>
              <CardDescription>Minimum thresholds before a PR can be merged</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Min. Approvals Required</Label>
                  <Input type="number" defaultValue={1} min={1} max={10} />
                </div>
                <div className="space-y-1.5">
                  <Label>Min. AI Score to Approve</Label>
                  <Input type="number" defaultValue={70} min={0} max={100} />
                </div>
              </div>
              <Button variant="navy" size="sm">Save requirements</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between p-5 rounded-xl bg-[#0F1729] text-white mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold">Pro Plan</span>
                    <Badge variant="warning" className="text-[10px]">Active</Badge>
                  </div>
                  <p className="text-white/60 text-sm">$29/month · Renews Jan 15, 2027</p>
                  <div className="mt-4 space-y-1.5 text-sm text-white/70">
                    {["Unlimited repositories", "Unlimited AI reviews", "5 team members", "Priority support"].map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">$29</div>
                  <div className="text-white/40 text-xs">/month</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">Change plan</Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  Cancel subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex h-9 w-14 items-center justify-center rounded-md bg-white border border-border">
                  <span className="text-xs font-bold text-blue-600">VISA</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">•••• •••• •••• 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/26</p>
                </div>
                <Button variant="ghost" size="sm" className="ml-auto text-xs">Update</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workspace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Organization name</Label>
                <Input defaultValue="Acme Corp" />
              </div>
              <div className="space-y-1.5">
                <Label>Workspace slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">meridian.dev/</span>
                  <Input defaultValue="acme" className="w-40" />
                </div>
              </div>
              <Button variant="navy" size="sm">Save changes</Button>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions — proceed with caution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-100 bg-red-50/50">
                <div>
                  <p className="text-sm font-semibold text-foreground">Delete workspace</p>
                  <p className="text-xs text-muted-foreground">Permanently delete this workspace and all data</p>
                </div>
                <Button variant="destructive" size="sm">Delete</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
