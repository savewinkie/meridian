"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Github, GitBranch, Zap, Shield, Users, CreditCard,
  CheckCircle2, Crown, Settings, ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"

const policyRules = [
  { id: 1, label: "Block merge on critical security issues", enabled: true },
  { id: 2, label: "Require AI review before human review", enabled: true },
  { id: 3, label: "Auto-assign reviewers based on file ownership", enabled: false },
  { id: 4, label: "Fail CI if review score below 70", enabled: false },
  { id: 5, label: "Require 2 approvals for high-risk PRs", enabled: true },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
        checked ? "bg-amber-500" : "bg-gray-200")}>
      <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
        checked ? "translate-x-5" : "translate-x-1")} />
    </button>
  )
}

function Skel({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-muted", className)} />
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [policies, setPolicies] = useState(policyRules)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user)
      setLoading(false)
    })
  }, [])

  const togglePolicy = (id: number) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p))
  }

  const ghLogin    = user?.user_metadata?.user_name ?? user?.user_metadata?.preferred_username ?? ""
  const ghName     = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? ghLogin
  const avatarUrl  = user?.user_metadata?.avatar_url ?? ""
  const email      = user?.email ?? ""
  const isGitHub   = user?.app_metadata?.provider === "github"
  const initials   = ghName ? ghName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "?"

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1729] mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account, integrations, and preferences.</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="h-auto p-1 flex-wrap gap-1">
          <TabsTrigger value="account" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />Account
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-1.5 text-xs">
            <Github className="h-3.5 w-3.5" />Integrations
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

        {/* Account */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Profile</CardTitle>
              <CardDescription>Your connected GitHub account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex items-center gap-4">
                  <Skel className="h-16 w-16 rounded-full shrink-0" />
                  <div className="space-y-2">
                    <Skel className="h-4 w-36" />
                    <Skel className="h-3 w-52" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 shrink-0">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-amber-100 text-amber-700 text-lg font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-base font-semibold text-foreground">{ghName || "Unknown"}</p>
                      <Crown className="h-4 w-4 text-amber-500" />
                      <Badge variant="success" className="text-[10px]">Owner</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{email}</p>
                    {ghLogin && (
                      <a href={`https://github.com/${ghLogin}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-amber-600 transition-colors mt-0.5">
                        <Github className="h-3 w-3" />@{ghLogin}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Sign out</p>
                  <p className="text-xs text-muted-foreground">Sign out of your Qualix account</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>Sign out</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">GitHub</CardTitle>
              <CardDescription>Your connected GitHub account used for scanning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/20">
                  <Skel className="h-5 w-5 rounded" />
                  <div className="space-y-1.5 flex-1">
                    <Skel className="h-3.5 w-40" />
                    <Skel className="h-3 w-28" />
                  </div>
                </div>
              ) : isGitHub ? (
                <div className="flex items-center justify-between p-4 rounded-lg border border-emerald-200 bg-emerald-50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-amber-100 text-amber-700 text-xs font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <p className="text-sm font-semibold text-foreground">Connected to GitHub</p>
                      </div>
                      <p className="text-xs text-muted-foreground">@{ghLogin} · {email}</p>
                    </div>
                  </div>
                  <a href={`https://github.com/${ghLogin}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" />Profile
                    </Button>
                  </a>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-lg border border-amber-200 bg-amber-50">
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">GitHub not connected</p>
                      <p className="text-xs text-muted-foreground">Sign in with GitHub to unlock repo scanning</p>
                    </div>
                  </div>
                  <Button size="sm" variant="amber" onClick={async () => {
                    const supabase = createClient()
                    await supabase.auth.signInWithOAuth({ provider: "github",
                      options: { scopes: "repo read:user user:email", redirectTo: `${window.location.origin}/auth/callback` } })
                  }}>Connect GitHub</Button>
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <GitBranch className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">GitLab</p>
                    <p className="text-xs text-muted-foreground">Not connected · Coming soon</p>
                  </div>
                </div>
                <Badge variant="muted" className="text-xs">Soon</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Configuration</CardTitle>
              <CardDescription>Powered by Anthropic's Claude API</CardDescription>
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Model</span>
                <Badge variant="navy">claude-sonnet-4-6</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Max duration</span>
                <span className="text-xs font-mono text-muted-foreground">300s per scan</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies */}
        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review Policies</CardTitle>
              <CardDescription>Configure automated review rules</CardDescription>
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
                    <span className="text-lg font-bold">Free Plan</span>
                    <Badge variant="success" className="text-[10px]">Active</Badge>
                  </div>
                  <p className="text-white/60 text-sm">No charge · Access to all core features</p>
                  <div className="mt-4 space-y-1.5 text-sm text-white/70">
                    {["GitHub repo scanning", "Website scanner", "File upload scanner", "AI-powered analysis"].map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">$0</div>
                  <div className="text-white/40 text-xs">/month</div>
                </div>
              </div>
              <Button variant="amber" size="sm">Upgrade to Pro</Button>
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
                <Label>Display name</Label>
                {loading ? <Skel className="h-9 w-full" /> :
                  <Input defaultValue={ghName || ghLogin || "My Workspace"} />}
              </div>
              <div className="space-y-1.5">
                <Label>Workspace slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">meridian.dev/</span>
                  {loading ? <Skel className="h-9 w-40" /> :
                    <Input defaultValue={ghLogin || "my-workspace"} className="w-40" />}
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
