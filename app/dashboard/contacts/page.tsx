'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { ContactWithRelations } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ContactForm } from '@/components/contacts/contact-form'
import { Plus, Search, ChevronRight, Building2, Mail, Clock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

export default function ContactsPage() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<ContactWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const fetchContacts = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase.schema('crm')
      .from('contacts')
      .select(`*, companies(*), contact_tags(tag_id, tags(*))`)
      .order('full_name')
    if (error) toast.error(error.message)
    else setContacts((data as ContactWithRelations[]) ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  const filtered = contacts.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.companies?.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Contacts</h1>
          <p className="text-zinc-400 text-sm mt-1">{contacts.length} total</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Add Contact</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
            <ContactForm onSave={() => { setCreateOpen(false); fetchContacts() }} onClose={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or company..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p>{search ? 'No contacts match your search.' : 'No contacts yet. Add your first!'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(contact => (
            <Link
              key={contact.id}
              href={`/dashboard/contacts/profile?id=${contact.id}`}
              className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-semibold text-white shrink-0">
                {contact.full_name[0]?.toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-zinc-100 truncate">{contact.full_name}</p>
                  {contact.last_contacted_at && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-500 shrink-0">
                      <Clock className="w-3 h-3" />
                      {timeAgo(contact.last_contacted_at)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-zinc-500 truncate">
                    <Mail className="w-3 h-3 shrink-0" />{contact.email}
                  </span>
                  {contact.companies && (
                    <span className="flex items-center gap-1 text-xs text-zinc-500 truncate">
                      <Building2 className="w-3 h-3 shrink-0" />{contact.companies.name}
                    </span>
                  )}
                </div>
                {/* Mobile: last contacted below */}
                {contact.last_contacted_at && (
                  <p className="sm:hidden flex items-center gap-1 text-xs text-emerald-500 mt-0.5">
                    <Clock className="w-3 h-3" />
                    Last emailed {timeAgo(contact.last_contacted_at)}
                  </p>
                )}
                {contact.contact_tags && contact.contact_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {contact.contact_tags.slice(0, 4).map(ct => (
                      <Badge key={ct.tags.id} color={ct.tags.color}>{ct.tags.name}</Badge>
                    ))}
                    {contact.contact_tags.length > 4 && (
                      <Badge>+{contact.contact_tags.length - 4}</Badge>
                    )}
                  </div>
                )}
              </div>

              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
