"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Github, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react"
import { LogoMark } from "@/components/logo"
import dynamic from "next/dynamic"
const CanvasRevealEffect = dynamic(
  () => import("@/components/ui/canvas-reveal-effect").then(m => ({ default: m.CanvasRevealEffect })),
  { ssr: false }
)

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
      const msg = authError.message
      if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials")) {
        setError("__no_account__")
      } else if (msg.includes("Email not confirmed")) {
        setError("__unverified__")
      } else {
        setError(msg)
      }
      setLoading(false)
    } else { router.push("/dashboard"); router.refresh() }
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
    if (authError) { setError(authError.message); setGithubLoading(false) }
  }

  return (
    <div className="relative flex w-full flex-col min-h-screen bg-black overflow-hidden">
      {/* WebGL dot matrix background */}
      <div className="absolute inset-0 z-0">
        <CanvasRevealEffect
          animationSpeed={3}
          containerClassName="bg-black"
          colors={[[124, 58, 237], [139, 92, 246]]}
          dotSize={5}
          reverse={false}
          showGradient={false}
        />
        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(0,0,0,0.85)_30%,transparent_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 400 }}>
              <LogoMark size={28} />
            </motion.div>
            <span className="text-[15px] font-semibold text-white">Qualix</span>
          </Link>
          <Link href="/signup" className="text-sm text-white/40 hover:text-white transition-colors">
            No account? <span className="text-violet-400 hover:text-violet-300">Sign up →</span>
          </Link>
        </div>

        {/* Form */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm"
          >
            <div className="mb-8 text-center">
              <h1 className="text-[2.2rem] font-bold leading-[1.1] tracking-tight text-white mb-2">
                Welcome back
              </h1>
              <p className="text-white/40 text-base">Sign in to continue to Qualix</p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl border px-3.5 py-3 mb-5"
                  style={
                    error === "__no_account__" || error === "__unverified__"
                      ? { background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.2)" }
                      : { background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }
                  }
                >
                  {error === "__no_account__" ? (
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-px" />
                      <div>
                        <p className="text-xs font-semibold text-amber-300">No account found</p>
                        <p className="text-xs text-amber-400/70 mt-0.5">
                          Wrong email or password, or you haven't signed up yet.{" "}
                          <Link href="/signup" className="underline underline-offset-2 text-amber-300 hover:text-amber-200 transition-colors">
                            Create a free account →
                          </Link>
                        </p>
                      </div>
                    </div>
                  ) : error === "__unverified__" ? (
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-px" />
                      <div>
                        <p className="text-xs font-semibold text-amber-300">Verify your email first</p>
                        <p className="text-xs text-amber-400/70 mt-0.5">
                          Check your inbox for a confirmation link.{" "}
                          <Link href="/signup" className="underline underline-offset-2 text-amber-300 hover:text-amber-200 transition-colors">
                            Resend from sign up →
                          </Link>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                      <p className="text-xs text-red-400">{error}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* GitHub */}
            <motion.button
              onClick={handleGitHub}
              disabled={githubLoading || loading}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="w-full flex items-center justify-center gap-2.5 rounded-full border border-white/[0.12] bg-white/[0.06] backdrop-blur-sm hover:bg-white/[0.1] hover:border-white/20 px-4 h-12 text-sm font-medium text-white/80 hover:text-white transition-all mb-5 disabled:opacity-50 group overflow-hidden relative"
            >
              <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-full transition-transform duration-700" />
              {githubLoading ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
                </svg>
              ) : (
                <Github className="h-4 w-4" />
              )}
              {githubLoading ? "Connecting…" : "Continue with GitHub"}
            </motion.button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-white/[0.07]" />
              <span className="text-[11px] text-white/25">or</span>
              <div className="h-px flex-1 bg-white/[0.07]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 rounded-full bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/25 text-sm px-5 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all text-center"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 rounded-full bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/25 text-sm px-5 pr-12 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all text-center"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="text-right">
                <Link href="#" className="text-xs text-white/30 hover:text-violet-400 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="relative w-full h-12 rounded-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25 overflow-hidden group"
              >
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? "Signing in…" : <>Sign in <ArrowRight className="h-4 w-4" /></>}
                </span>
              </motion.button>
            </form>

            <p className="mt-8 text-center text-[11px] text-white/25 leading-relaxed">
              By signing in, you agree to our{" "}
              <Link href="#" className="underline text-white/35 hover:text-white/55 transition-colors">Terms</Link>
              {" "}and{" "}
              <Link href="#" className="underline text-white/35 hover:text-white/55 transition-colors">Privacy Policy</Link>.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
