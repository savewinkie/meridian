"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Github, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"
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
  const [reverseCanvas, setReverseCanvas] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)

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
    if (authError) { setError(authError.message); setLoading(false) }
    else {
      setReverseCanvas(true)
      setTimeout(() => { setSuccess(true); setLoading(false) }, 1800)
    }
  }

  const handleResend = async () => {
    if (!email || resendLoading || resendSent || isDemoMode) return
    setResendLoading(true)
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setResendLoading(false)
    setResendSent(true)
    setTimeout(() => setResendSent(false), 30000)
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
      {/* WebGL canvas background */}
      <div className="absolute inset-0 z-0">
        {!reverseCanvas && (
          <CanvasRevealEffect
            animationSpeed={3}
            containerClassName="bg-black"
            colors={[[217, 119, 87], [196, 104, 67]]}
            dotSize={5}
            reverse={false}
            showGradient={false}
          />
        )}
        {reverseCanvas && (
          <CanvasRevealEffect
            animationSpeed={4}
            containerClassName="bg-black"
            colors={[[16, 185, 129], [52, 211, 153]]}
            dotSize={5}
            reverse={true}
            showGradient={false}
          />
        )}
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
          <Link href="/login" className="text-sm text-white/40 hover:text-white transition-colors">
            Already have an account? <span className="text-[#d97757] hover:text-[#c46843]">Sign in →</span>
          </Link>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
          <AnimatePresence mode="wait">
            {success ? (
              /* Success state */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-sm text-center"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30"
                >
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </motion.div>
                <h1 className="text-[2rem] font-bold text-white mb-2">Check your inbox</h1>
                <p className="text-white/45 text-sm mb-2 leading-relaxed">
                  We sent a confirmation link to{" "}
                  <span className="text-white/70 font-medium">{email}</span>.
                  <br />Click it to activate your account.
                </p>
                <p className="text-white/25 text-xs mb-8 leading-relaxed">
                  No email? Check your spam folder — it can take a minute or two.
                </p>

                {/* Resend button */}
                <motion.button
                  onClick={handleResend}
                  disabled={resendLoading || resendSent || isDemoMode}
                  whileHover={{ scale: resendSent ? 1 : 1.015 }}
                  whileTap={{ scale: resendSent ? 1 : 0.985 }}
                  className="w-full h-11 rounded-full border border-white/[0.12] bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-white text-sm font-medium transition-all mb-3 disabled:opacity-50"
                >
                  {resendLoading ? "Sending…" : resendSent ? "Email sent!" : "Resend confirmation email"}
                </motion.button>

                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className="w-full h-12 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
                  >
                    Back to sign in
                  </motion.button>
                </Link>
              </motion.div>
            ) : (
              /* Sign up form */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-sm"
              >
                <div className="mb-8 text-center">
                  <h1 className="text-[2.2rem] font-bold leading-[1.1] tracking-tight text-white mb-2">
                    Start for free
                  </h1>
                  <p className="text-white/40 text-base">No credit card required</p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-3 mb-5"
                    >
                      <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                      <p className="text-xs text-red-400">{error}</p>
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
                  ) : <Github className="h-4 w-4" />}
                  {githubLoading ? "Connecting…" : "Sign up with GitHub"}
                </motion.button>

                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px flex-1 bg-white/[0.07]" />
                  <span className="text-[11px] text-white/25">or</span>
                  <div className="h-px flex-1 bg-white/[0.07]" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="First name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-12 rounded-full bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/25 text-sm px-4 focus:outline-none focus:border-[#d97757]/50 focus:bg-white/[0.07] transition-all text-center"
                    />
                    <input
                      placeholder="Last name"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-12 rounded-full bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/25 text-sm px-4 focus:outline-none focus:border-[#d97757]/50 focus:bg-white/[0.07] transition-all text-center"
                    />
                  </div>

                  <input
                    type="email"
                    placeholder="Email address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 rounded-full bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/25 text-sm px-5 focus:outline-none focus:border-[#d97757]/50 focus:bg-white/[0.07] transition-all text-center"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password (min. 8 characters)"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 rounded-full bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/25 text-sm px-5 pr-12 focus:outline-none focus:border-[#d97757]/50 focus:bg-white/[0.07] transition-all text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className="relative w-full h-12 rounded-full bg-gradient-to-r from-[#d97757] to-[#c46843] hover:from-[#c46843] hover:to-[#b5593a] text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#d97757]/25 overflow-hidden group"
                  >
                    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? "Creating account…" : <>Create free account <ArrowRight className="h-4 w-4" /></>}
                    </span>
                  </motion.button>
                </form>

                <p className="mt-6 text-center text-[11px] text-white/25 leading-relaxed">
                  By signing up, you agree to our{" "}
                  <Link href="/terms" className="underline text-white/35 hover:text-white/55 transition-colors">Terms</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="underline text-white/35 hover:text-white/55 transition-colors">Privacy Policy</Link>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
