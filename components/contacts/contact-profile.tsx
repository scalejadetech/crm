'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { ContactWithRelations } from '@/types/database'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ContactForm } from './contact-form'
import { EmailComposer } from './email-composer'
import { toast } from 'sonner'
import {
  ArrowLeft, Mail, Phone, Link as LinkIcon, Building2,
  Pencil, Trash2, Loader2, FileText, MessageSquare, Clock,
} from 'lucide-react'

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

export function ContactProfile() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const { user } = useAuth()
  const router = useRouter()
  const [contact, setContact] = useState<ContactWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  const fetchContact = useCallback(async () => {
    if (!user || !id) return
    const { data, error } = await supabase.schema('crm')
      .from('contacts')
      .select('*, companies(*), contact_tags(tag_id, tags(*))')
      .eq('id', id)
      .single()
    if (error) { toast.error('Contact not found'); router.push('/dashboard/contacts') }
    else setContact(data as ContactWithRelations)
    setLoading(false)
  }, [id, user, router])

  useEffect(() => { fetchContact() }, [fetchContact])

  const handleDelete = async () => {
    if (!id) return
    if (!confirm('Delete this contact? This will also delete associated deals.')) return
    const { error } = await supabase.schema('crm').from('contacts').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Contact deleted'); router.push('/dashboard/contacts') }
  }

  if (loading) return (
    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
  )
  if (!contact) return null

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-indigo-700 flex items-center justify-center text-2xl font-bold text-white shrink-0">
          {contact.full_name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-zinc-100">{contact.full_name}</h1>
          {contact.companies && (
            <div className="flex items-center gap-1.5 text-zinc-400 text-sm mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
              {contact.companies.name}
            </div>
          )}
          {contact.last_contacted_at && (
            <div className="flex items-center gap-1.5 text-emerald-500 text-sm mt-1">
              <Clock className="w-3.5 h-3.5" />
              Last contacted {timeAgo(contact.last_contacted_at)}
            </div>
          )}
          {contact.contact_tags && contact.contact_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {contact.contact_tags.map(ct => (
                <Badge key={ct.tags.id} color={ct.tags.color}>{ct.tags.name}</Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-700 transition-colors"
        >
          <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-sm text-zinc-300 truncate">{contact.email}</span>
        </a>
        {contact.contact_number && (
          <a
            href={`tel:${contact.contact_number}`}
            className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-700 transition-colors"
          >
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-sm text-zinc-300 truncate">{contact.contact_number}</span>
          </a>
        )}
        {contact.linkedin_url && (
          <a
            href={contact.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-700 transition-colors"
          >
            <LinkIcon className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-sm text-zinc-300 truncate">LinkedIn</span>
          </a>
        )}
      </div>

      <Tabs defaultValue="notes">
        <TabsList>
          <TabsTrigger value="notes"><FileText className="w-3.5 h-3.5 mr-1.5" />Notes</TabsTrigger>
          <TabsTrigger value="email"><MessageSquare className="w-3.5 h-3.5 mr-1.5" />Email Composer</TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 min-h-[160px]">
            {contact.notes ? (
              <p className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{contact.notes}</p>
            ) : (
              <p className="text-zinc-600 text-sm italic">No notes. Edit the contact to add notes.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="email">
          <EmailComposer contact={contact} onSent={fetchContact} />
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Edit Contact</DialogTitle></DialogHeader>
          <ContactForm
            initial={contact as unknown as Parameters<typeof ContactForm>[0]['initial']}
            onSave={() => { setEditOpen(false); fetchContact() }}
            onClose={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
