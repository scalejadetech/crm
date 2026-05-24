'use client'

import { Suspense } from 'react'
import { ContactProfile } from '@/components/contacts/contact-profile'
import { Loader2 } from 'lucide-react'

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>}>
      <ContactProfile />
    </Suspense>
  )
}
