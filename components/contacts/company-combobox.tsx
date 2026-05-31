'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Company } from '@/types/database'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Building2, Plus, Check } from 'lucide-react'

interface Props {
  value: string | null
  onSelect: (companyId: string) => void
}

export function CompanyCombobox({ value, onSelect }: Props) {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [open, setOpen] = useState(false)
  const [selectedName, setSelectedName] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Load initial name for existing value
  useEffect(() => {
    if (!value) { setSelectedName(''); setQuery(''); return }
    supabase.schema('crm').from('companies').select('name').eq('id', value).single().then(({ data }) => {
      if (data) { setSelectedName(data.name); setQuery(data.name) }
    })
  }, [value])

  useEffect(() => {
    if (query.length < 1) { setCompanies([]); return }
    const timer = setTimeout(async () => {
      const { data } = await supabase.schema('crm')
        .from('companies')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(8)
      setCompanies(data ?? [])
    }, 200)
    return () => clearTimeout(timer)
  }, [query, user])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleCreateAndSelect = async () => {
    if (!user || !query.trim()) return
    const { data, error } = await supabase.schema('crm')
      .from('companies')
      .insert({ name: query.trim(), user_id: user.id })
      .select()
      .single()
    if (data) {
      onSelect(data.id)
      setSelectedName(data.name)
      setQuery(data.name)
      setOpen(false)
    }
    if (error) console.error(error)
  }

  const exactMatch = companies.some(c => c.name.toLowerCase() === query.toLowerCase())

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <Input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search or create company..."
          className="pl-9"
        />
      </div>

      {open && (query.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
          {companies.map(c => (
            <button
              key={c.id}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => {
                onSelect(c.id)
                setSelectedName(c.name)
                setQuery(c.name)
                setOpen(false)
              }}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left hover:bg-zinc-800 transition-colors',
                value === c.id ? 'text-indigo-400' : 'text-zinc-200'
              )}
            >
              {value === c.id && <Check className="w-3.5 h-3.5 shrink-0" />}
              <Building2 className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
              {c.name}
            </button>
          ))}

          {!exactMatch && query.trim() && (
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={handleCreateAndSelect}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-indigo-400 hover:bg-zinc-800 transition-colors border-t border-zinc-700"
            >
              <Plus className="w-4 h-4 shrink-0" />
              Create &ldquo;{query.trim()}&rdquo;
            </button>
          )}

          {companies.length === 0 && exactMatch && (
            <div className="px-3 py-2.5 text-sm text-zinc-500">No results</div>
          )}
        </div>
      )}
    </div>
  )
}
