'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Supabase puts tokens in the URL hash — onAuthStateChange picks them up automatically.
    // We just wait for the session to be established, then redirect.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe()
        router.replace('/dashboard')
      } else if (event === 'PASSWORD_RECOVERY') {
        subscription.unsubscribe()
        router.replace('/auth/reset-password')
      }
    })

    // If there's an error in the hash (e.g. otp_expired), redirect to login with message
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash.includes('error=')) {
        const params = new URLSearchParams(hash.slice(1))
        const desc = params.get('error_description') ?? 'Link expired or invalid'
        router.replace(`/auth/login?error=${encodeURIComponent(desc)}`)
      }
    }

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      <p className="text-zinc-400 text-sm">Verifying your email…</p>
    </div>
  )
}
