'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { HardDrive, Loader2 } from 'lucide-react'

const FREE_TIER_BYTES = 1 * 1024 * 1024 * 1024 // 1 GB

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(2)} MB`
  return `${(bytes / 1073741824).toFixed(2)} GB`
}

export default function StoragePage() {
  const [usedBytes, setUsedBytes] = useState<number | null>(null)
  const [buckets, setBuckets] = useState<{ name: string; bytes: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsage() {
      const { data: bucketList, error } = await supabase.storage.listBuckets()
      if (error || !bucketList) { setLoading(false); return }

      let total = 0
      const bucketStats: { name: string; bytes: number }[] = []

      await Promise.all(
        bucketList.map(async (bucket) => {
          const { data: files } = await supabase.storage.from(bucket.name).list('', { limit: 1000 })
          const bytes = (files ?? []).reduce((sum, f) => {
            const size = (f.metadata as Record<string, unknown> | null)?.size
            return sum + (typeof size === 'number' ? size : 0)
          }, 0)
          total += bytes
          bucketStats.push({ name: bucket.name, bytes })
        })
      )

      setBuckets(bucketStats.sort((a, b) => b.bytes - a.bytes))
      setUsedBytes(total)
      setLoading(false)
    }
    fetchUsage()
  }, [])

  const pct = usedBytes !== null ? Math.min((usedBytes / FREE_TIER_BYTES) * 100, 100) : 0
  const available = usedBytes !== null ? FREE_TIER_BYTES - usedBytes : null

  const barColor =
    pct > 90 ? 'bg-red-500' :
    pct > 70 ? 'bg-amber-500' :
    'bg-indigo-500'

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Storage</h1>
        <p className="text-zinc-400 text-sm mt-1">Supabase free tier — 1 GB included</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main usage card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-lg bg-indigo-500/10">
                <HardDrive className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Total Storage</p>
                <p className="text-xs text-zinc-500">Across all buckets</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-800 rounded-full h-3 mb-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-300 font-medium">
                {formatBytes(usedBytes ?? 0)} used
              </span>
              <span className="text-zinc-500">
                {formatBytes(available ?? FREE_TIER_BYTES)} available
              </span>
            </div>

            <div className="mt-2 text-right text-xs text-zinc-600">
              {pct.toFixed(1)}% of 1 GB
            </div>
          </div>

          {/* Per-bucket breakdown */}
          {buckets.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-sm font-medium text-zinc-400 mb-4">Breakdown by bucket</p>
              <div className="space-y-3">
                {buckets.map(b => {
                  const bPct = usedBytes ? (b.bytes / FREE_TIER_BYTES) * 100 : 0
                  return (
                    <div key={b.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-zinc-300 font-mono truncate">{b.name}</span>
                        <span className="text-zinc-500 shrink-0 ml-4">{formatBytes(b.bytes)}</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-600"
                          style={{ width: `${Math.min(bPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {buckets.length === 0 && (
            <p className="text-center text-zinc-600 text-sm py-4">No buckets found in this project.</p>
          )}
        </div>
      )}
    </div>
  )
}
