"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Code2, Globe, Upload, Github, ArrowRight, Sparkles, Brain, Zap } from "lucide-react"

const MODES = [
  {
    href: "/scanner/code",
    icon: Code2,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    glow: "rgba(245,158,11,0.08)",
    glowHover: "rgba(245,158,11,0.14)",
    stripColor: "from-amber-500/60 via-amber-400/40 to-transparent",
    cardTint: "rgba(245,158,11,0.025)",
    title: "Code Scanner",
    description: "Paste any code snippet and Claude Opus 4.7 will find every bug, security hole, and anti-pattern — then produce a fully fixed version.",
    tags: ["JavaScript", "TypeScript", "Python", "Go", "Rust", "+15"],
    badge: null,
  },
  {
    href: "/scanner/website",
    icon: Globe,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    glow: "rgba(59,130,246,0.08)",
    glowHover: "rgba(59,130,246,0.14)",
    stripColor: "from-blue-500/60 via-blue-400/40 to-transparent",
    cardTint: "rgba(59,130,246,0.025)",
    title: "Website Scanner",
    description: "Enter any URL and get a deep analysis of its HTML, CSS, JavaScript, performance, SEO, and security posture with actionable fixes.",
    tags: ["HTML", "CSS", "JS", "SEO", "Performance", "Security"],
    badge: null,
  },
  {
    href: "/scanner/upload",
    icon: Upload,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    glow: "rgba(16,185,129,0.08)",
    glowHover: "rgba(16,185,129,0.14)",
    stripColor: "from-emerald-500/60 via-emerald-400/40 to-transparent",
    cardTint: "rgba(16,185,129,0.025)",
    title: "File Upload",
    description: "Drag and drop up to 10 files for a batch scan. Download fixed versions of all files with a single click once the analysis completes.",
    tags: ["Batch scan", "Auto-fix", "Download all"],
    badge: "NEW",
  },
  {
    href: "/scanner/repo",
    icon: Github,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10 border-purple-500/20",
    glow: "rgba(168,85,247,0.08)",
    glowHover: "rgba(168,85,247,0.14)",
    stripColor: "from-purple-500/60 via-violet-400/40 to-transparent",
    cardTint: "rgba(168,85,247,0.025)",
    title: "GitHub Repos",
    description: "Connect your GitHub account, browse your repositories, select files from the tree, and run a full AI scan across your entire codebase.",
    tags: ["Private repos", "File tree", "Bulk analysis"],
    badge: "NEW",
  },
]

export default function ScannerHubPage() {
  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(109,40,217,0.18) 0%, transparent 60%),
          #030712
        `,
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-0">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.07] px-4 py-1.5 mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
            </span>
            <span className="text-[11px] font-semibold text-violet-300 tracking-wide">AI Code Analysis</span>
          </motion.div>

          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Scan.{" "}
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Fix.</span>{" "}
            Ship.
          </h1>
          <p className="text-white/40 text-sm max-w-[400px] leading-relaxed mx-auto">
            Four AI-powered tools built on Claude Opus 4.7
          </p>
        </motion.div>

        {/* Mode cards — 2×2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl">
          {MODES.map((mode, i) => (
            <motion.div
              key={mode.href}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={mode.href} className="group block h-full">
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="relative rounded-2xl border border-white/[0.07] overflow-hidden transition-all duration-300 h-full flex flex-col"
                  style={{ background: `#030712` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `radial-gradient(circle at 10% 20%, ${mode.glowHover} 0%, transparent 55%), #030712`
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `#030712`
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"
                  }}
                >
                  {/* Colored gradient strip at top */}
                  <div className={`h-[3px] w-full bg-gradient-to-r ${mode.stripColor}`} />

                  <div className="p-6 flex flex-col flex-1">
                    {/* Badge */}
                    {mode.badge && (
                      <span className="absolute top-6 right-5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
                        {mode.badge}
                      </span>
                    )}

                    {/* Icon — larger */}
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border mb-5 ${mode.iconBg}`}>
                      <mode.icon className={`h-6 w-6 ${mode.iconColor}`} />
                    </div>

                    {/* Text */}
                    <h3 className="text-base font-semibold text-white mb-2">{mode.title}</h3>
                    <p className="text-[13px] text-white/40 leading-relaxed mb-5 flex-1">{mode.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {mode.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-white/30 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA with arrow animation */}
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-white/35 group-hover:text-white/65 transition-colors mt-auto">
                      Try now
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>

                  {/* Shimmer on hover */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.025] to-transparent group-hover:translate-x-full transition-transform duration-700" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-[11px] text-white/18 text-center"
        >
          All scans are processed server-side. Your code is never stored.
        </motion.p>
      </div>
    </div>
  )
}
