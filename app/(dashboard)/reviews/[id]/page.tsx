"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  GitPullRequest, ArrowLeft, AlertCircle, CheckCircle2, XCircle,
  Sparkles, ChevronDown, ChevronUp, MessageSquare, Shield,
  Clock, GitMerge, FileText, ChevronRight, Brain,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock PR data
const pr = {
  id: "247",
  number: 247,
  title: "feat: add OAuth2 provider integration",
  description: "Adds support for OAuth2 authentication with Google, GitHub, and custom providers. Includes token refresh, scope management, and provider-specific error handling.",
  author: "Sarah Chen",
  authorInitials: "SC",
  repo: "acme/backend",
  baseBranch: "main",
  headBranch: "feat/oauth2",
  additions: 412,
  deletions: 87,
  changedFiles: 14,
  riskScore: 78,
  reviewStatus: "pending",
  createdAt: "2h ago",
}

const aiSummary = {
  overall: "This PR introduces OAuth2 authentication. The implementation is mostly solid but contains 2 critical security issues that must be resolved before merging. JWT validation is missing in the token refresh flow, and client secrets are logged in plaintext.",
  issues: [
    {
      id: 1, severity: "critical", category: "security",
      file: "src/auth/oauth.ts", line: 84,
      title: "JWT tokens not validated on refresh",
      description: "The token refresh endpoint at line 84 decodes the JWT without verifying the signature. An attacker could forge a refresh token with an extended expiry.",
      suggestion: "Use jwt.verify() with the secret key instead of jwt.decode().",
      resolved: false,
    },
    {
      id: 2, severity: "critical", category: "security",
      file: "src/auth/providers.ts", line: 23,
      title: "OAuth client secret logged in plaintext",
      description: "Line 23 logs the full provider config including the client_secret to the application logs. This is a credential exposure risk.",
      suggestion: "Remove sensitive fields from the log statement or use a log sanitizer.",
      resolved: false,
    },
    {
      id: 3, severity: "warning", category: "performance",
      file: "src/auth/session.ts", line: 156,
      title: "Synchronous crypto operation in hot path",
      description: "crypto.createHash() is called synchronously in the request handler. Under load this will block the event loop.",
      suggestion: "Use the async crypto.subtle API or move the hashing to a worker thread.",
      resolved: false,
    },
    {
      id: 4, severity: "info", category: "maintainability",
      file: "src/auth/oauth.ts", line: 210,
      title: "Duplicate error handling logic",
      description: "The error handling pattern at lines 210-240 is identical to lines 310-340. Consider extracting to a shared utility.",
      suggestion: "Extract handleOAuthError() and reuse across both flows.",
      resolved: true,
    },
  ],
}

const diffFiles = [
  {
    path: "src/auth/oauth.ts",
    additions: 187,
    deletions: 34,
    hunks: [
      {
        lines: [
          { n: 80, type: "neutral", code: "  async refreshToken(userId: string, provider: string) {" },
          { n: 81, type: "neutral", code: "    const storedToken = await this.tokenStore.get(userId)" },
          { n: 82, type: "neutral", code: "    if (!storedToken) throw new AuthError('No token found')" },
          { n: 83, type: "neutral", code: "    try {" },
          { n: 84, type: "removed", code: "      const payload = jwt.decode(storedToken.refreshToken)" },
          { n: 84, type: "added", code: "      const payload = jwt.verify(storedToken.refreshToken, process.env.JWT_SECRET!)" },
          { n: 85, type: "neutral", code: "      if (!payload || payload.exp < Date.now() / 1000) {" },
          { n: 86, type: "neutral", code: "        throw new AuthError('Refresh token expired')" },
          { n: 87, type: "neutral", code: "      }" },
          { n: 88, type: "added", code: "      await this.auditLog.record({ action: 'token_refresh', userId })" },
        ],
        issueId: 1,
      },
    ],
  },
  {
    path: "src/auth/providers.ts",
    additions: 89,
    deletions: 12,
    hunks: [
      {
        lines: [
          { n: 20, type: "neutral", code: "  async configure(config: ProviderConfig) {" },
          { n: 21, type: "neutral", code: "    this.providers.set(config.name, config)" },
          { n: 22, type: "neutral", code: "    this.logger.info('Provider configured', {" },
          { n: 23, type: "removed", code: "      ...config," },
          { n: 23, type: "added", code: "      name: config.name, scopes: config.scopes," },
          { n: 24, type: "neutral", code: "    })" },
          { n: 25, type: "neutral", code: "  }" },
        ],
        issueId: 2,
      },
    ],
  },
]

const severityConfig = {
  critical: { variant: "critical" as const, icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  warning: { variant: "warning" as const, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  info: { variant: "info" as const, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
}

function IssueCard({ issue }: { issue: typeof aiSummary.issues[0] }) {
  const [expanded, setExpanded] = useState(true)
  const config = severityConfig[issue.severity as keyof typeof severityConfig]

  return (
    <div className={cn("rounded-lg border", config.border, issue.resolved ? "opacity-60" : "")}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <config.icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.color)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{issue.title}</span>
            <Badge variant={config.variant} className="text-[10px]">
              {issue.severity}
            </Badge>
            <Badge variant="muted" className="text-[10px]">
              {issue.category}
            </Badge>
            {issue.resolved && (
              <Badge variant="success" className="text-[10px]">resolved</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {issue.file}:{issue.line}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className={cn("px-4 pb-4 border-t pt-3", config.border)}>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {issue.description}
          </p>
          <div className={cn("rounded-md p-3", config.bg)}>
            <p className="text-xs font-semibold text-foreground mb-1">Suggestion</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{issue.suggestion}</p>
          </div>
          {!issue.resolved && (
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Mark resolved
              </Button>
              <Button size="sm" variant="ghost" className="text-xs h-7">
                Dismiss
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DiffView({ file }: { file: typeof diffFiles[0] }) {
  const [expanded, setExpanded] = useState(true)
  const relatedIssues = aiSummary.issues.filter(i => i.file === file.path)

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left border-b border-border"
      >
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="flex-1 text-sm font-mono font-medium text-foreground">{file.path}</span>
        <div className="flex items-center gap-3 text-xs">
          {relatedIssues.length > 0 && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {relatedIssues.length} issue{relatedIssues.length > 1 ? "s" : ""}
            </div>
          )}
          <span className="text-emerald-600 font-mono">+{file.additions}</span>
          <span className="text-red-500 font-mono">-{file.deletions}</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="font-mono text-[12.5px] leading-6 overflow-x-auto">
          {file.hunks.map((hunk, hi) => (
            <div key={hi}>
              {hunk.lines.map((line, li) => {
                const isAnnotated = li === hunk.lines.findIndex(l => l.type === "removed" || l.type === "added")
                const issue = hunk.issueId ? aiSummary.issues.find(i => i.id === hunk.issueId) : null

                return (
                  <div key={li}>
                    <div
                      className={cn(
                        "flex items-start group",
                        line.type === "added" ? "bg-emerald-50 border-l-2 border-emerald-400" :
                        line.type === "removed" ? "bg-red-50 border-l-2 border-red-400" :
                        "border-l-2 border-transparent hover:bg-muted/30"
                      )}
                    >
                      <span className="w-12 shrink-0 px-3 py-1 text-muted-foreground/40 select-none text-right">
                        {line.n}
                      </span>
                      <pre className={cn(
                        "flex-1 px-4 py-1 whitespace-pre overflow-x-auto",
                        line.type === "added" ? "text-emerald-800" :
                        line.type === "removed" ? "text-red-700 line-through opacity-60" :
                        "text-gray-700"
                      )}>
                        {line.type === "added" ? "+ " : line.type === "removed" ? "- " : "  "}
                        {line.code}
                      </pre>
                    </div>

                    {/* Inline AI annotation after the relevant line */}
                    {isAnnotated && issue && li === hunk.lines.findIndex(l => l.type === "removed") && (
                      <div className="mx-4 my-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <div className="flex items-start gap-2.5">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500">
                            <Sparkles className="h-3 w-3 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-[11px] font-bold text-amber-700">Refract AI</span>
                              <Badge variant={severityConfig[issue.severity as keyof typeof severityConfig].variant} className="text-[10px]">
                                {issue.severity}
                              </Badge>
                              <span className="text-[10px] text-amber-600/60">{issue.category}</span>
                            </div>
                            <p className="text-[12px] text-amber-900/80 leading-relaxed font-sans">{issue.description}</p>
                            <div className="mt-2 rounded-md bg-white/70 border border-amber-200 p-2">
                              <p className="text-[11px] text-amber-700"><strong>Fix:</strong> {issue.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ReviewDetailPage({ params }: { params: { id: string } }) {
  const criticalCount = aiSummary.issues.filter(i => i.severity === "critical" && !i.resolved).length

  return (
    <div className="p-8">
      {/* Back link */}
      <Link href="/reviews" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to reviews
      </Link>

      {/* PR Header */}
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F1729]">
            <GitPullRequest className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[#0F1729] mb-1">{pr.title}</h1>
            <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
              <span className="font-mono text-xs">{pr.repo}</span>
              <span>#{pr.number}</span>
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                {pr.headBranch} → {pr.baseBranch}
              </span>
              <span>{pr.createdAt}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm">Request changes</Button>
            <Button variant="amber" size="sm" className="gap-1.5" disabled={criticalCount > 0}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve
            </Button>
          </div>
        </div>

        {/* PR Stats bar */}
        <div className="flex items-center gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-1.5">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-amber-100 text-amber-700 text-[10px] font-bold">{pr.authorInitials}</AvatarFallback>
            </Avatar>
            <span className="text-foreground font-medium">{pr.author}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 font-mono text-xs">+{pr.additions}</div>
          <div className="flex items-center gap-1 text-red-500 font-mono text-xs">-{pr.deletions}</div>
          <div className="text-muted-foreground text-xs">{pr.changedFiles} files changed</div>
          <div className={cn(
            "text-xs font-semibold rounded-full px-2.5 py-0.5",
            pr.riskScore >= 80 ? "bg-red-100 text-red-700" :
            pr.riskScore >= 60 ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"
          )}>
            Risk score: {pr.riskScore}
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Tabs */}
      <Tabs defaultValue="review" className="space-y-6">
        <TabsList>
          <TabsTrigger value="review" className="gap-1.5">
            <Brain className="h-3.5 w-3.5" />
            AI Review
            {criticalCount > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">
                {criticalCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="diff">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Diff ({pr.changedFiles} files)
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* AI Review Tab */}
        <TabsContent value="review" className="space-y-4">
          {/* AI Summary */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F1729] mb-1">
                    Refract AI Summary
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {aiSummary.overall}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs">
                    <span className="flex items-center gap-1 text-red-600 font-semibold">
                      <XCircle className="h-3.5 w-3.5" />
                      {aiSummary.issues.filter(i => i.severity === "critical").length} Critical
                    </span>
                    <span className="flex items-center gap-1 text-amber-600 font-semibold">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {aiSummary.issues.filter(i => i.severity === "warning").length} Warning
                    </span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {aiSummary.issues.filter(i => i.severity === "info").length} Info
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issue list */}
          <div className="space-y-3">
            {aiSummary.issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </TabsContent>

        {/* Diff Tab */}
        <TabsContent value="diff" className="space-y-4">
          {diffFiles.map((file) => (
            <DiffView key={file.path} file={file} />
          ))}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiSummary.issues.filter(i => i.category === "security").map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
              {aiSummary.issues.filter(i => i.category === "security").length === 0 && (
                <div className="flex flex-col items-center py-12 text-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-3" />
                  <p className="text-sm font-medium text-foreground">No security issues found</p>
                  <p className="text-xs text-muted-foreground mt-1">This PR looks clean from a security perspective.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
