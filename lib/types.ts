export type Organization = {
  id: string
  name: string
  slug: string
  plan: "free" | "pro" | "enterprise"
  created_at: string
}

export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  organization_id: string | null
  role: "owner" | "admin" | "member"
  created_at: string
}

export type Repository = {
  id: string
  organization_id: string
  name: string
  full_name: string
  provider: "github" | "gitlab" | "bitbucket"
  provider_id: string
  default_branch: string
  is_active: boolean
  created_at: string
}

export type PullRequest = {
  id: string
  repository_id: string
  repository_name: string
  provider_number: number
  title: string
  description: string | null
  author: string
  author_avatar: string | null
  base_branch: string
  head_branch: string
  status: "open" | "merged" | "closed"
  review_status: "pending" | "in_progress" | "completed"
  risk_score: number | null
  additions: number
  deletions: number
  changed_files: number
  created_at: string
  updated_at: string
  merged_at: string | null
}

export type Review = {
  id: string
  pull_request_id: string
  reviewer_id: string | null
  type: "ai" | "human"
  status: "pending" | "approved" | "changes_requested"
  summary: string | null
  created_at: string
}

export type ReviewComment = {
  id: string
  review_id: string
  file_path: string
  line_number: number
  body: string
  severity: "info" | "warning" | "error" | "critical"
  category: "security" | "performance" | "style" | "logic" | "maintainability"
  is_resolved: boolean
  created_at: string
}

export type SecurityIssue = {
  id: string
  repository_id: string
  repository_name: string
  pull_request_id: string | null
  file_path: string
  line_number: number | null
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  category: "secret" | "vulnerability" | "misconfiguration" | "dependency"
  status: "open" | "dismissed" | "resolved"
  cve_id: string | null
  created_at: string
}

export type TechDebtItem = {
  id: string
  repository_id: string
  file_path: string
  category: "duplication" | "complexity" | "coverage" | "outdated" | "smell"
  debt_minutes: number
  description: string
  created_at: string
}

export type AnalyticsPoint = {
  date: string
  value: number
  label?: string
}

export type MetricCard = {
  label: string
  value: string | number
  change: number
  trend: "up" | "down" | "neutral"
  unit?: string
  description?: string
}
