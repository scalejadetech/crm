'use client'

import Link from 'next/link'
import { Terminal, ExternalLink } from 'lucide-react'

export default function DeveloperRedirectPage() {
  return (
    <div className="p-6 max-w-xl mx-auto mt-20 text-center space-y-4">
      <div className="w-14 h-14 rounded-xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center mx-auto">
        <Terminal className="w-7 h-7 text-indigo-400" />
      </div>
      <h1 className="text-2xl font-bold text-zinc-100">API Docs</h1>
      <p className="text-zinc-400 text-sm">
        The API documentation has moved to its own standalone page.
      </p>
      <Link
        href="/docs"
        target="_blank"
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        Open API Docs <ExternalLink className="w-4 h-4" />
      </Link>
    </div>
  )
}
