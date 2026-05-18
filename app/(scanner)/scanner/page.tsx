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
    title: "GitHub Repos",
    description: "Connect your GitHub account, browse your repositories, select files from the tree, and run a full AI scan across your entire codebase.",
    tags: ["Private repos", "File tree", "Bulk analysis"],
    badge: "NEW",
  },
]

export default function ScannerHubPage() {
  return (
    <div className="flex flex-col h-full bg-[#060b16] overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-0">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-900/10 border border-purple-500/20"
            >
              <Brain className="h-5 w-5 text-purple-400" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.15 }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 shadow-lg shadow-amber-500/30"
            >
              <Zap className="h-5 w-5 text-white" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">AI Scanner</h1>
          <p className="text-white/40 text-sm max-w-[420px] leading-relaxed">
            Choose a scan mode. Claude Opus 4.7 analyzes your code, finds every issue, and produces production-ready fixes.
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/[0.08] border border-purple-500/[0.15] px-3 py-1 mt-4"
          >
            <Sparkles className="h-3 w-3 text-purple-400" />
            <span className="text-[10px] font-semibold text-purple-300 tracking-wide">Powered by claude-opus-4-7</span>
          </motion.div>
        </motion.div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
          {MODES.map((mode, i) => (
            <motion.div
              key={mode.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={mode.href} className="group block">
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="relative rounded-2xl border border-white/[0.08] bg-[#0a0f1c] p-6 overflow-hidden transition-all duration-300"
                  style={{
                    background: `radial-gradient(circle at 0% 0%, ${mode.glow} 0%, transparent 60%), #0a0f1c`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `radial-gradient(circle at 0% 0%, ${mode.glowHover} 0%, transparent 60%), #0a0f1c`
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `radial-gradient(circle at 0% 0%, ${mode.glow} 0%, transparent 60%), #0a0f1c`
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                  }}
                >
                  {/* Badge */}
                  {mode.badge && (
                    <span className="absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
                      {mode.badge}
                    </span>
                  )}

                  {/* Icon */}
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border mb-4 ${mode.iconBg}`}>
                    <mode.icon className={`h-5 w-5 ${mode.iconColor}`} />
                  </div>

                  {/* Text */}
                  <h3 className="text-[15px] font-semibold text-white mb-2">{mode.title}</h3>
                  <p className="text-[12px] text-white/40 leading-relaxed mb-4">{mode.description}</p>

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

                  {/* CTA */}
                  <div className="flex items-center gap-1.5 text-[12px] font-medium text-white/40 group-hover:text-white/70 transition-colors">
                    Open scanner
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* Shimmer on hover */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent group-hover:translate-x-full transition-transform duration-700" />
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
          className="mt-10 text-[11px] text-white/20 text-center"
        >
          All scans are processed server-side. Your code is never stored.
        </motion.p>
      </div>
    </div>
  )
}
