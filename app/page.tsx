'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

export default function RootPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (user) router.replace('/dashboard')
    else router.replace('/auth/login')
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
    </div>
  )
}
