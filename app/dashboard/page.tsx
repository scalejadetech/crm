'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Users, Building2, Kanban, Tag } from 'lucide-react'

interface Stats {
  contacts: number
  companies: number
  deals: number
  tags: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({ contacts: 0, companies: 0, deals: 0, tags: 0 })

  useEffect(() => {
    if (!user) return
    const fetchStats = async () => {
      const [contacts, companies, deals, tags] = await Promise.all([
        supabase.schema('crm').from('contacts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.schema('crm').from('companies').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.schema('crm').from('deals').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.schema('crm').from('tags').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ])
      setStats({
        contacts: contacts.count ?? 0,
        companies: companies.count ?? 0,
        deals: deals.count ?? 0,
        tags: tags.count ?? 0,
      })
    }
    fetchStats()
  }, [user])

  const cards = [
    { label: 'Contacts', value: stats.contacts, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Companies', value: stats.companies, icon: Building2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Deals', value: stats.deals, icon: Kanban, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Tags', value: stats.tags, icon: Tag, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Overview</h1>
        <p className="text-zinc-400 text-sm mt-1">Welcome back, {user?.email}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-3xl font-bold text-zinc-100">{value}</p>
            <p className="text-sm text-zinc-400 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
