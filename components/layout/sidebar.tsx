"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  GitPullRequest,
  BarChart3,
  Shield,
  AlertTriangle,
  Settings,
  ChevronDown,
  Zap,
  LogOut,
  Plus,
  Bell,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Reviews", href: "/reviews", icon: GitPullRequest, badge: 12 },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Security", href: "/security", icon: Shield, badge: 3, badgeVariant: "critical" as const },
  { name: "Tech Debt", href: "/debt", icon: AlertTriangle },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-[220px] flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-[57px] items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F1729]">
          <Zap className="h-3.5 w-3.5 text-amber-400" fill="currentColor" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-[#0F1729]">
          Meridian
        </span>
        <div className="ml-auto">
          <button className="relative text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
          </button>
        </div>
      </div>

      {/* Workspace selector */}
      <div className="border-b border-border p-3">
        <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors group">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-amber-600 text-[10px] font-bold text-white">
            A
          </div>
          <span className="flex-1 text-left text-sm font-medium text-foreground truncate">Acme Corp</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
        </button>
      </div>

      {/* New Review CTA */}
      <div className="px-3 py-2">
        <Button size="sm" variant="amber" className="w-full gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          New Review
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 pb-2 overflow-y-auto">
        <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Main
        </p>
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors group",
                isActive
                  ? "bg-[#0F1729] text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span
                  className={cn(
                    "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                    isActive
                      ? "bg-white/20 text-white"
                      : item.badgeVariant === "critical"
                      ? "bg-red-100 text-red-600"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted transition-colors group cursor-pointer">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src="" />
            <AvatarFallback className="bg-amber-100 text-amber-700 text-[11px] font-semibold">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">John Doe</p>
            <p className="text-[10px] text-muted-foreground truncate">john@acme.com</p>
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
