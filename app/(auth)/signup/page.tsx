"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"
import { LogoMark } from "@/components/logo"

const isDemoMode =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co"

const benefits = [
  "Free forever plan — no credit card",
  "AI reviews on every pull request",
  "Security scanning included",
  "Set up in under 5 minutes",
]

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 900))
      router.push("/dashboard")
      return
    }

    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
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

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060b16] px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-5">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Check your email</h1>
          <p className="text-sm text-white/40 mb-6">
            We sent a confirmation link to <span className="text-white/60">{email}</span>. Click it to activate your account.
          </p>
          <Link
            href="/login"
            className="text-sm text-amber-500/80 hover:text-amber-400 transition-colors"
          >
            Back to sign in
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#060b16]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[460px] flex-col justify-between p-12 relative overflow-hidden bg-[#070d1a] border-r border-white/[0.06]">
        <div className="absolute inset-0 dot-grid-dark opacity-60" />
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-amber-500/8 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-500/5 blur-[80px] rounded-full" />

        <Link href="/" className="relative flex items-center gap-2.5">
          <LogoMark size={30} />
          <span className="text-[15px] font-semibold text-white">Qualix</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <h2 className="text-[22px] font-bold text-white mb-3 leading-tight">
            Better code starts here.
          </h2>
          <p className="text-white/40 text-sm mb-8 leading-relaxed">
            Join 500+ engineering teams who ship with confidence. Set up in minutes, not hours.
          </p>
          <ul className="space-y-3.5">
            {benefits.map((b, i) => (
              <motion.li
                key={b}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15 shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-amber-400" />
                </div>
                <span className="text-sm text-white/60">{b}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative flex items-center gap-4"
        >
          <div className="flex -space-x-2">
            {["JD", "SC", "MW", "PN"].map((initials) => (
              <div
                key={initials}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/10 border-2 border-[#070d1a] text-amber-400 text-[10px] font-bold"
              >
                {initials}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/30">
            <strong className="text-white/60">500+</strong> teams already onboard
          </p>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <LogoMark size={28} />
          <span className="text-sm font-semibold text-white">Qualix</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-sm text-white/40">Free forever. No credit card required.</p>
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
              <span className="bg-[#060b16] px-3 text-[11px] text-white/25">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="first" className="text-xs text-white/50">First name</Label>
                <Input
                  id="first"
                  placeholder="Jane"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last" className="text-xs text-white/50">Last name</Label>
                <Input
                  id="last"
                  placeholder="Smith"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-white/50">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-white/50">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                {loading ? "Creating account…" : "Create account"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </span>
              <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:translate-x-full transition-transform duration-700" />
            </motion.button>
          </form>

          <p className="mt-4 text-center text-[11px] text-white/25">
            By signing up you agree to our{" "}
            <Link href="#" className="text-amber-500/60 hover:text-amber-400 transition-colors">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="text-amber-500/60 hover:text-amber-400 transition-colors">Privacy Policy</Link>.
          </p>

          <p className="mt-6 text-center text-sm text-white/30">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-amber-500/80 hover:text-amber-400 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
