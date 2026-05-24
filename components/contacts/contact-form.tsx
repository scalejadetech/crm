'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Tag, Contact } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CompanyCombobox } from './company-combobox'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  initial?: Contact & { contact_tags?: Array<{ tag_id: string }> }
  onSave: () => void
  onClose: () => void
}

export function ContactForm({ initial, onSave, onClose }: Props) {
  const { user } = useAuth()
  const [fullName, setFullName] = useState(initial?.full_name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.contact_number ?? '')
  const [linkedin, setLinkedin] = useState(initial?.linkedin_url ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [companyId, setCompanyId] = useState<string | null>(initial?.company_id ?? null)
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initial?.contact_tags?.map(ct => ct.tag_id) ?? []
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.schema('crm').from('tags').select('*').eq('user_id', user.id).order('name').then(({ data }) => {
      setAllTags(data ?? [])
    })
  }, [user])

  const toggleTag = (id: string) => {
    setSelectedTagIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    try {
      let contactId = initial?.id

      if (initial) {
        const { error } = await supabase.schema('crm').from('contacts').update({
          full_name: fullName, email, contact_number: phone || null,
          linkedin_url: linkedin || null, notes: notes || null, company_id: companyId,
        }).eq('id', initial.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase.schema('crm').from('contacts').insert({
          full_name: fullName, email, contact_number: phone || null,
          linkedin_url: linkedin || null, notes: notes || null,
          company_id: companyId, user_id: user.id,
        }).select().single()
        if (error) throw error
        contactId = data.id
      }

      if (contactId) {
        // Replace tags
        await supabase.schema('crm').from('contact_tags').delete().eq('contact_id', contactId)
        if (selectedTagIds.length > 0) {
          await supabase.schema('crm').from('contact_tags').insert(
            selectedTagIds.map(tag_id => ({ contact_id: contactId!, tag_id }))
          )
        }
      }

      toast.success(initial ? 'Contact updated' : 'Contact created')
      onSave()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err))
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Full Name *</Label>
          <Input value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Jane Doe" />
        </div>
        <div className="space-y-1.5">
          <Label>Email *</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="jane@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000" type="tel" />
        </div>
        <div className="space-y-1.5">
          <Label>LinkedIn URL</Label>
          <Input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Company</Label>
        <CompanyCombobox value={companyId} onSelect={setCompanyId} />
      </div>

      <div className="space-y-1.5">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => {
            const selected = selectedTagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-all active:scale-95"
                style={{
                  backgroundColor: selected ? tag.color + '33' : 'transparent',
                  borderColor: selected ? tag.color : '#3f3f46',
                  color: selected ? tag.color : '#a1a1aa',
                }}
              >
                {selected && <X className="w-3 h-3" />}
                {tag.name}
              </button>
            )
          })}
          {allTags.length === 0 && <p className="text-sm text-zinc-500">No tags yet — create some in Tags page.</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes about this contact..." rows={3} />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? 'Update Contact' : 'Add Contact'}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  )
}
