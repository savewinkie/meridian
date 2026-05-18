"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Brain, Globe, Upload, Github, Check, ArrowRight } from "lucide-react"

const TOOLS = [
  {
    id: "code",
    Icon: Brain,
    title: "Code Analyzer",
    description: "Paste any snippet for instant security & quality review.",
    features: ["SQL injection & XSS detection", "Secret key leaks", "Fix suggestions"],
    iconBg: "bg-[#D97757]/10",
    iconColor: "text-[#D97757]",
    hoverBorder: "hover:border-[#D97757]/30",
    storageKey: "qualix_free_code",
    href: "/scanner/code",
  },
  {
    id: "website",
    Icon: Globe,
    title: "Website Scanner",
    description: "Scan any public URL for frontend & security issues.",
    features: ["Performance audit", "SEO & accessibility", "Security headers"],
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    hoverBorder: "hover:border-blue-300/50",
    storageKey: "qualix_free_website",
    href: "/scanner/website",
  },
  {
    id: "upload",
    Icon: Upload,
    title: "File Upload",
    description: "Drop up to 10 files for batch AI analysis.",
    features: ["Multi-language support", "Download fixed files", "Copy improved code"],
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
    hoverBorder: "hover:border-purple-300/50",
    storageKey: "qualix_free_upload",
    href: "/scanner/upload",
  },
  {
    id: "repo",
    Icon: Github,
    title: "GitHub Repos",
    description: "Browse your repos and scan specific files.",
    features: ["All your repositories", "File-level selection", "Full context analysis"],
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    hoverBorder: "hover:border-emerald-300/50",
    storageKey: "qualix_free_repo",
    href: "/scanner/repo",
  },
]

function ToolCard({ tool, used, index }: { tool: typeof TOOLS[0]; used: boolean; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ transitionDelay: `${index * 90}ms` }}
      className={cn("transition-all duration-700 ease-out", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
      <Link href={used ? "/signup" : tool.href}
        className={cn(
          "block rounded-2xl border border-[#E8DDD0] bg-white p-5 h-full group transition-all duration-300",
          tool.hoverBorder,
          "hover:shadow-md"
        )}>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110", tool.iconBg)}>
          <tool.Icon className={cn("h-5 w-5", tool.iconColor)} />
        </div>
        <p className="text-sm font-semibold text-[#1A1504] mb-1.5">{tool.title}</p>
        <p className="text-[12px] text-[#8C7B6E] leading-relaxed mb-4">{tool.description}</p>
        <ul className="space-y-1.5 mb-5">
          {tool.features.map(f => (
            <li key={f} className="flex items-center gap-1.5 text-[11px] text-[#8C7B6E]">
              <Check className="h-3 w-3 text-[#D97757]/60 shrink-0" />{f}
            </li>
          ))}
        </ul>

        {used ? (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#D97757] group-hover:text-[#C46843] transition-colors">
            Sign up for unlimited <ArrowRight className="h-3 w-3" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#8C7B6E] group-hover:text-[#D97757] transition-colors">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            1 free scan · Try it <ArrowRight className="h-3 w-3" />
          </div>
        )}
      </Link>
    </div>
  )
}

export function LiveDemo() {
  const [freeUses, setFreeUses] = useState<Record<string, boolean>>({})
  const [headerVisible, setHeaderVisible] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const state: Record<string, boolean> = {}
    TOOLS.forEach(t => { state[t.id] = localStorage.getItem(t.storageKey) === "1" })
    setFreeUses(state)
  }, [])

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setHeaderVisible(true) }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const allUsed = TOOLS.every(t => freeUses[t.id])

  return (
    <section id="demo" className="py-24 border-y border-[#E8DDD0] overflow-hidden bg-[#F5F0E8]">
      <div className="mx-auto max-w-5xl px-6">

        <div ref={headerRef}
          className={cn("text-center mb-14 transition-all duration-700 ease-out", headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D97757]/25 bg-[#D97757]/[0.06] px-4 py-1.5 mb-6">
            <div className="h-1.5 w-1.5 rounded-full bg-[#D97757] animate-pulse" />
            <span className="text-xs font-semibold text-[#D97757] tracking-wide">LIVE DEMO</span>
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl text-[#1A1504] tracking-tight mb-4">
            Try every tool,<br />free.
          </h2>
          <p className="text-[#8C7B6E] text-base max-w-lg mx-auto leading-relaxed">
            One free scan per tool — no account needed. Sign up for unlimited access across all scanners.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {TOOLS.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} used={freeUses[tool.id] ?? false} index={i} />
          ))}
        </div>

        {allUsed ? (
          <div className="rounded-2xl border border-[#D97757]/20 bg-[#D97757]/[0.05] p-6 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A1504] mb-0.5">You&apos;ve tried all the tools!</p>
              <p className="text-xs text-[#8C7B6E]">Sign up for unlimited scans, no credit card required.</p>
            </div>
            <Link href="/signup">
              <button className="flex items-center gap-1.5 rounded-xl bg-[#D97757] hover:bg-[#C46843] px-4 py-2 text-sm font-semibold text-white transition-colors shrink-0">
                Get started free <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xs text-[#8C7B6E]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#D97757] hover:text-[#C46843] underline underline-offset-2 transition-colors">
                Sign in →
              </Link>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
