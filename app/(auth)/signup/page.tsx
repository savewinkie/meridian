"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, Github, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react"

const benefits = [
  "Free forever plan — no credit card",
  "AI reviews on every pull request",
  "Security scanning included",
  "Set up in under 5 minutes",
]

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[480px] bg-[#0F1729] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-amber-500/10 blur-3xl rounded-full" />

        <Link href="/" className="relative flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <Zap className="h-4 w-4 text-amber-400" fill="currentColor" />
          </div>
          <span className="text-base font-semibold text-white">Meridian</span>
        </Link>

        <div className="relative">
          <h2 className="text-2xl font-bold text-white mb-3">
            Better code starts here.
          </h2>
          <p className="text-white/50 text-sm mb-8 leading-relaxed">
            Join 500+ engineering teams who ship with confidence. Set up in minutes, not hours.
          </p>

          <ul className="space-y-4">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-sm text-white/70">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-4">
          <div className="flex -space-x-2">
            {["JD", "SC", "MW", "PN"].map((initials) => (
              <div
                key={initials}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 border-2 border-[#0F1729] text-amber-400 text-[10px] font-bold"
              >
                {initials}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/40">
            <strong className="text-white/70">500+</strong> teams already onboard
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-[#FAFAF8]">
        <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F1729]">
            <Zap className="h-4 w-4 text-amber-400" fill="currentColor" />
          </div>
          <span className="text-base font-semibold text-[#0F1729]">Meridian</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0F1729] mb-2">Create your account</h1>
            <p className="text-sm text-muted-foreground">
              Free forever. No credit card required.
            </p>
          </div>

          <Button variant="outline" className="w-full mb-6 gap-2 h-11">
            <Github className="h-4 w-4" />
            Continue with GitHub
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#FAFAF8] px-3 text-xs text-muted-foreground">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="first">First name</Label>
                <Input id="first" placeholder="Jane" required className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last">Last name</Label>
                <Input id="last" placeholder="Smith" required className="h-11" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" placeholder="you@company.com" required className="h-11" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="navy" size="lg" className="w-full gap-2" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By signing up you agree to our{" "}
            <Link href="#" className="text-amber-600 hover:underline">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="text-amber-600 hover:underline">Privacy Policy</Link>.
          </p>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-amber-600 hover:text-amber-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
