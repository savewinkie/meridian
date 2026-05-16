"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LogoMark } from "@/components/logo"

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const code = new URLSearchParams(window.location.search).get("code")

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
        if (err) {
          setError(err.message)
          setTimeout(() => router.push("/login?error=Could+not+sign+in"), 2000)
        } else {
          router.push("/dashboard")
        }
      })
    } else {
      // No code — check if session already exists (e.g. implicit flow)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.push("/dashboard")
        } else {
          router.push("/login?error=Could+not+sign+in")
        }
      })
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060b16]">
      <div className="flex flex-col items-center gap-5">
        <LogoMark size={36} />
        {error ? (
          <p className="text-sm text-red-400">{error} — redirecting…</p>
        ) : (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
            <p className="text-sm text-white/40">Completing sign in…</p>
          </>
        )}
      </div>
    </div>
  )
}
