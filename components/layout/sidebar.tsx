"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  GitPullRequest,
  BarChart3,
  Shield,
  AlertTriangle,
  Settings,
  ChevronDown,
  LogOut,
  Plus,
  Bell,
  Brain,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/logo"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Scanner", href: "/scanner", icon: Brain, isNew: true },
  { name: "Reviews", href: "/reviews", icon: GitPullRequest, badge: 12 },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Security", href: "/security", icon: Shield, badge: 3, badgeVariant: "critical" as const },
  { name: "Tech Debt", href: "/debt", icon: AlertTriangle },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
        setUser(session?.user ?? null)
      })
      return () => subscription.unsubscribe()
    })
  }, [])

  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const avatar    = user?.user_metadata?.avatar_url
  const username  = user?.user_metadata?.user_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User"
  const fullName  = user?.user_metadata?.full_name || user?.user_metadata?.name || username
  const email     = user?.email || ""
  const initials  = username.slice(0, 2).toUpperCase()
  const wsInitial = username[0]?.toUpperCase() || "M"

  return (
    <div className="flex h-full w-[220px] flex-col border-r border-white/[0.06] bg-[#080d1a]">
      {/* Logo */}
      <div className="flex h-[57px] items-center gap-2.5 border-b border-white/[0.06] px-4">
        <LogoMark size={28} />
        <span className="text-[15px] font-semibold tracking-tight text-white">
          Refract
        </span>
        <div className="ml-auto">
          <button className="relative text-white/30 hover:text-white/70 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
          </button>
        </div>
      </div>

      {/* Workspace selector */}
      <div className="border-b border-white/[0.06] p-3">
        <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-white/[0.05] transition-colors group">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-amber-600 text-[10px] font-bold text-white">
            {wsInitial}
          </div>
          <span className="flex-1 text-left text-sm font-medium text-white/80 truncate">{fullName || username}</span>
          <ChevronDown className="h-3.5 w-3.5 text-white/30 shrink-0 group-hover:text-white/60 transition-colors" />
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
        <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">
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
                "relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors group",
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-amber-400" />
              )}
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
                )}
              />
              <span className="flex-1">{item.name}</span>
              {item.isNew && !isActive && (
                <span className="text-[9px] font-bold bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded-full">
                  NEW
                </span>
              )}
              {item.badge && !item.isNew && (
                <span
                  className={cn(
                    "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                    isActive
                      ? "bg-white/15 text-white"
                      : item.badgeVariant === "critical"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-white/[0.07] text-white/40"
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
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-white/[0.05] transition-colors group">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={avatar} />
            <AvatarFallback className="bg-amber-500/20 text-amber-400 text-[11px] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/80 truncate">{username}</p>
            <p className="text-[10px] text-white/30 truncate">{email}</p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="text-white/25 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
