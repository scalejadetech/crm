import type { ReactNode } from 'react'

export const metadata = { title: 'API Docs — CRM' }

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-zinc-950/90 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="font-semibold text-zinc-100">CRM</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400 text-sm">API Docs</span>
        </div>
        <a
          href="/dashboard"
          className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg"
        >
          ← Back to Dashboard
        </a>
      </header>
      <main>{children}</main>
    </div>
  )
}
