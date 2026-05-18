"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, ArrowRight, Eye, EyeOff, Sparkles, Shield, Zap, AlertCircle } from "lucide-react"
import { LogoMark } from "@/components/logo"

const isDemoMode =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 800))
      router.push("/dashboard")
      return
    }

    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  const handleGitHub = async () => {
    setGithubLoading(true)
    setError(null)

    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 800))
      router.push("/dashboard")
      return
    }

    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "repo read:user user:email",
      },
    })

    if (authError) {
      setError(authError.message)
      setGithubLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#060b16]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[460px] flex-col justify-between p-12 relative overflow-hidden bg-[#070d1a] border-r border-white/[0.06]">
        <div className="absolute inset-0 dot-grid-dark opacity-60" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/8 blur-[100px] rounded-full" />
        <div className="absolute top-1/3 left-0 w-60 h-60 bg-purple-500/5 blur-[80px] rounded-full" />

        <Link href="/" className="relative flex items-center gap-2.5">
          <LogoMark size={30} />
          <span className="text-[15px] font-semibold text-white">Refract</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="flex items-center gap-2 mb-6">
            {[Shield, Zap, Sparkles].map((Icon, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 300 }}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20"
              >
                <Icon className="h-4 w-4 text-amber-400" />
              </motion.div>
            ))}
          </div>
          <blockquote className="text-white/70 text-[17px] leading-relaxed mb-6 font-light">
            "Refract caught a critical security vulnerability in our auth flow that would have exposed user data. It paid for itself in the first week."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
              SC
            </div>
            <div>
              <p className="text-sm font-semibold text-white/80">Sarah Chen</p>
              <p className="text-xs text-white/30">CTO, Flowbase</p>
            </div>
          </div>
        </motion.div>

        <p className="relative text-[11px] text-white/20">© {new Date().getFullYear()} Refract, Inc.</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <LogoMark size={28} />
          <span className="text-sm font-semibold text-white">Refract</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-sm text-white/40">Sign in to your account to continue.</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-3 mb-4"
            >
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </motion.div>
          )}

          {/* GitHub OAuth */}
          <motion.button
            onClick={handleGitHub}
            disabled={githubLoading || loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="group relative w-full flex items-center justify-center gap-2.5 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07] px-4 h-11 text-sm font-medium text-white/70 hover:text-white transition-all mb-4 overflow-hidden disabled:opacity-50"
          >
            {githubLoading ? (
              <svg className="h-4 w-4 animate-spin text-white/60" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
              </svg>
            ) : (
              <Github className="h-4 w-4" />
            )}
            {githubLoading ? "Connecting to GitHub…" : "Continue with GitHub"}
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-full transition-transform duration-700" />
          </motion.button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#060b16] px-3 text-[11px] text-white/25">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-white/50">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs text-white/50">Password</Label>
                <Link href="#" className="text-xs text-amber-500/70 hover:text-amber-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-full flex items-center justify-center gap-2 rounded-xl h-11 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors overflow-hidden shadow-lg shadow-amber-500/20"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? "Signing in…" : "Sign in"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </span>
              <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:translate-x-full transition-transform duration-700" />
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-white/30">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-amber-500/80 hover:text-amber-400 transition-colors">
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
