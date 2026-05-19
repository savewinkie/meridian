"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Brain, Globe, Upload, Github, Check, ArrowRight, Lock } from "lucide-react"

const TOOLS = [
  {
    id: "code",
    Icon: Brain,
    title: "Code Analyzer",
    description: "Paste any snippet for instant security & quality review.",
    features: ["SQL injection & XSS detection", "Secret key leaks", "Fix suggestions"],
    storageKey: "qualix_free_code",
    href: "/scanner/code",
  },
  {
    id: "website",
    Icon: Globe,
    title: "Website Scanner",
    description: "Scan any public URL for frontend & security issues.",
    features: ["Performance audit", "SEO & accessibility", "Security headers"],
    storageKey: "qualix_free_website",
    href: "/scanner/website",
  },
  {
    id: "upload",
    Icon: Upload,
    title: "File Upload",
    description: "Drop up to 10 files for batch AI analysis.",
    features: ["Multi-language support", "Download fixed files", "Copy improved code"],
    storageKey: "qualix_free_upload",
    href: "/scanner/upload",
  },
  {
    id: "repo",
    Icon: Github,
    title: "GitHub Repos",
    description: "Browse your repos and scan specific files.",
    features: ["All your repositories", "File-level selection", "Full context analysis"],
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
        className="relative block rounded-2xl border border-[#262626] bg-[#0f0f0f] p-5 h-full group transition-all duration-300 hover:border-[#333333] hover:bg-[#141414] overflow-hidden">

        {/* Locked overlay */}
        {used && (
          <div className="absolute inset-0 rounded-2xl bg-[#0a0a0a]/75 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 z-10 transition-opacity duration-200">
            <div className="w-10 h-10 rounded-full bg-[#d97757]/10 border border-[#d97757]/25 flex items-center justify-center mb-0.5">
              <Lock className="h-4.5 w-4.5 text-[#d97757]" />
            </div>
            <p className="text-xs font-semibold text-[#ededea]">Sign in to continue</p>
            <p className="text-[11px] text-[#9b9b9b]">1 free scan used</p>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-[#d97757] group-hover:opacity-100 opacity-80 transition-opacity">
              Create free account <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        )}

        <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-4 bg-[#d97757]/10 transition-transform duration-300 group-hover:scale-110">
          <tool.Icon className="h-5 w-5 text-[#d97757]" />
        </div>
        <p className="text-sm font-semibold text-[#ededea] mb-1.5">{tool.title}</p>
        <p className="text-[12px] text-[#9b9b9b]/70 leading-relaxed mb-4">{tool.description}</p>
        <ul className="space-y-1.5 mb-5">
          {tool.features.map(f => (
            <li key={f} className="flex items-center gap-1.5 text-[11px] text-[#9b9b9b]/60">
              <Check className="h-3 w-3 text-[#d97757]/60 shrink-0" />{f}
            </li>
          ))}
        </ul>

        {!used && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#9b9b9b]/50 group-hover:text-[#d97757] transition-colors duration-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
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
    <section id="demo" className="py-24 border-y border-[#1a1a1a] overflow-hidden">
      <div className="mx-auto max-w-5xl px-6">

        <div ref={headerRef}
          className={cn("text-center mb-14 transition-all duration-700 ease-out", headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d97757]/20 bg-[#d97757]/5 px-4 py-1.5 mb-6">
            <div className="h-1.5 w-1.5 rounded-full bg-[#d97757] animate-pulse" />
            <span className="text-xs font-semibold text-[#d97757] tracking-wide">LIVE DEMO</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#ededea] tracking-tight mb-4">
            Try every tool,<br />free.
          </h2>
          <p className="text-[#9b9b9b] text-base max-w-lg mx-auto leading-relaxed">
            One free scan per tool — no account needed. Sign up for unlimited access across all scanners.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {TOOLS.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} used={freeUses[tool.id] ?? false} index={i} />
          ))}
        </div>

        {allUsed ? (
          <div className="rounded-2xl border border-[#d97757]/15 bg-[#d97757]/[0.05] p-6 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#ededea] mb-0.5">You&apos;ve tried all the tools!</p>
              <p className="text-xs text-[#9b9b9b]">Sign up for unlimited scans, no credit card required.</p>
            </div>
            <Link href="/signup">
              <button className="btn-orange flex items-center gap-1.5 shrink-0">
                Get started free <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xs text-[#555555]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#9b9b9b] hover:text-[#ededea] underline underline-offset-2 transition-colors">
                Sign in →
              </Link>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
