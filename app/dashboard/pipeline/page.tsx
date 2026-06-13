'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { DealWithRelations, DealStage, ContactWithRelations } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Loader2, DollarSign, ChevronRight, Trash2, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const STAGES: DealStage[] = ['Lead', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost']

const STAGE_COLORS: Record<DealStage, string> = {
  Lead: 'border-zinc-600',
  Discovery: 'border-blue-600',
  Proposal: 'border-violet-600',
  Negotiation: 'border-amber-500',
  Won: 'border-emerald-500',
  Lost: 'border-red-600',
}

const STAGE_HEADER_COLORS: Record<DealStage, string> = {
  Lead: 'text-zinc-400',
  Discovery: 'text-blue-400',
  Proposal: 'text-violet-400',
  Negotiation: 'text-amber-400',
  Won: 'text-emerald-400',
  Lost: 'text-red-400',
}

function AddDealForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [value, setValue] = useState('')
  const [stage, setStage] = useState<DealStage>('Lead')
  const [notes, setNotes] = useState('')
  const [contactId, setContactId] = useState('')
  const [contacts, setContacts] = useState<ContactWithRelations[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.schema('crm').from('contacts').select('*, companies(*)').order('full_name').then(({ data }) => {
      setContacts((data as ContactWithRelations[]) ?? [])
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const { error } = await supabase.schema('crm').from('deals').insert({
      title, value: parseFloat(value) || 0, stage,
      notes: notes.trim() || null,
      contact_id: contactId || null, user_id: user.id,
    })
    if (error) toast.error(error.message)
    else { toast.success('Deal created'); onSave() }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Deal Title *</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Enterprise SaaS Deal" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Value ($)</Label>
          <Input value={value} onChange={e => setValue(e.target.value)} placeholder="10000" type="number" min="0" step="0.01" />
        </div>
        <div className="space-y-1.5">
          <Label>Stage</Label>
          <select
            value={stage}
            onChange={e => setStage(e.target.value as DealStage)}
            className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes or context about this deal..." rows={3} />
      </div>
      <div className="space-y-1.5">
        <Label>Contact</Label>
        <select
          value={contactId}
          onChange={e => setContactId(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">No contact</option>
          {contacts.map(c => (
            <option key={c.id} value={c.id}>{c.full_name} {c.companies ? `(${c.companies.name})` : ''}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Add Deal
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  )
}

function DealCard({
  deal,
  onStageChange,
  onDelete,
}: {
  deal: DealWithRelations
  onStageChange: (id: string, stage: DealStage) => void
  onDelete: (id: string) => void
}) {
  const currentIndex = STAGES.indexOf(deal.stage)

  return (
    <div className={cn('bg-zinc-900 border-l-2 border border-zinc-800 rounded-lg p-3 select-none', STAGE_COLORS[deal.stage])}>
      <div className="flex items-start justify-between gap-1">
        <p className="font-medium text-zinc-100 text-sm leading-snug flex-1">{deal.title}</p>
        <button
          onClick={() => onDelete(deal.id)}
          className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-colors shrink-0 -mt-0.5 -mr-0.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1 mt-1.5">
        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-sm font-semibold text-emerald-400">
          {deal.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}
        </span>
      </div>

      {deal.contacts && (
        <p className="text-xs text-zinc-500 mt-1 truncate">
          {deal.contacts.full_name}
          {deal.contacts.companies ? ` · ${deal.contacts.companies.name}` : ''}
        </p>
      )}
      {deal.notes && (
        <p className="flex items-start gap-1 text-xs text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">
          <FileText className="w-3 h-3 shrink-0 mt-0.5" />
          {deal.notes}
        </p>
      )}

      <div className="flex items-center gap-1 mt-2">
        {currentIndex > 0 && (
          <button
            onClick={() => onStageChange(deal.id, STAGES[currentIndex - 1])}
            className="text-xs text-zinc-500 hover:text-zinc-300 px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-colors flex items-center gap-0.5"
          >
            <ChevronRight className="w-3 h-3 rotate-180" />
            {STAGES[currentIndex - 1]}
          </button>
        )}
        <span className="flex-1" />
        {currentIndex < STAGES.length - 1 && (
          <button
            onClick={() => onStageChange(deal.id, STAGES[currentIndex + 1])}
            className="text-xs text-zinc-500 hover:text-zinc-300 px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-colors flex items-center gap-0.5"
          >
            {STAGES[currentIndex + 1]}
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const { user } = useAuth()
  const [deals, setDeals] = useState<DealWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  const fetchDeals = useCallback(async () => {
    const { data, error } = await supabase.schema('crm')
      .from('deals')
      .select('*, contacts(*, companies(*))')
      .order('created_at', { ascending: false })
    if (error) toast.error(error.message)
    else setDeals((data as DealWithRelations[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchDeals() }, [fetchDeals])

  const handleStageChange = async (id: string, stage: DealStage) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, stage } : d))
    const { error } = await supabase.schema('crm').from('deals').update({ stage }).eq('id', id)
    if (error) { toast.error(error.message); fetchDeals() }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this deal?')) return
    setDeals(prev => prev.filter(d => d.id !== id))
    const { error } = await supabase.schema('crm').from('deals').delete().eq('id', id)
    if (error) { toast.error(error.message); fetchDeals() }
    else toast.success('Deal deleted')
  }

  const stageDeals = (stage: DealStage) => deals.filter(d => d.stage === stage)
  const stageTotal = (stage: DealStage) => stageDeals(stage).reduce((sum, d) => sum + (d.value ?? 0), 0)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Pipeline</h1>
          <p className="text-zinc-400 text-sm mt-1">{deals.length} deals</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Add Deal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Deal</DialogTitle></DialogHeader>
            <AddDealForm onSave={() => { setCreateOpen(false); fetchDeals() }} onClose={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 160px)' }}>
          {STAGES.map(stage => (
            <div key={stage} className="flex-shrink-0 w-64 flex flex-col">
              {/* Column header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className={cn('text-sm font-semibold', STAGE_HEADER_COLORS[stage])}>{stage}</span>
                  <span className="ml-2 text-xs text-zinc-600 bg-zinc-800 rounded-full px-1.5 py-0.5">
                    {stageDeals(stage).length}
                  </span>
                </div>
                {stageTotal(stage) > 0 && (
                  <span className="text-xs text-emerald-500 font-medium">
                    ${stageTotal(stage).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 flex-1">
                {stageDeals(stage).map(deal => (
                  <DealCard key={deal.id} deal={deal} onStageChange={handleStageChange} onDelete={handleDelete} />
                ))}
                {stageDeals(stage).length === 0 && (
                  <div className="border-2 border-dashed border-zinc-800 rounded-lg p-4 text-center text-xs text-zinc-600">
                    No deals
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
