'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Company } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Plus, Search, Building2, Globe, Mail, Phone,
  MapPin, Briefcase, Pencil, Trash2, Loader2,
  Users, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 18

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
  'Manufacturing', 'Real Estate', 'Media', 'Consulting', 'Energy',
  'Transportation', 'Hospitality', 'Legal', 'Mining', 'Non-profit', 'Other',
]

type ContactFilter = 'all' | 'zero' | 'low' | 'high'

type CompanyWithCount = Company & { contactCount: number }

// ─── CompanyForm ──────────────────────────────────────────────────────────────

interface CompanyFormProps {
  initial?: Company
  onSave: () => void
  onClose: () => void
}

function CompanyForm({ initial, onSave, onClose }: CompanyFormProps) {
  const { user } = useAuth()
  const [name, setName] = useState(initial?.name ?? '')
  const [domain, setDomain] = useState(initial?.domain ?? '')
  const [country, setCountry] = useState(initial?.country ?? '')
  const [industry, setIndustry] = useState(initial?.industry ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const payload = {
      name, domain: domain || null, country: country || null,
      industry: industry || null, email: email || null,
      phone: phone || null, description: description || null,
    }
    if (initial) {
      const { error } = await supabase.schema('crm').from('companies').update(payload).eq('id', initial.id)
      if (error) toast.error(error.message)
      else { toast.success('Company updated'); onSave() }
    } else {
      const { error } = await supabase.schema('crm').from('companies').insert({ ...payload, user_id: user.id })
      if (error) toast.error(error.message)
      else { toast.success('Company created'); onSave() }
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Company Name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Acme Corp" autoFocus />
        </div>
        <div className="space-y-1.5">
          <Label>Industry</Label>
          <select
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select industry...</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Country</Label>
          <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. United States" />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@acme.com" />
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Website / Domain</Label>
          <Input value={domain} onChange={e => setDomain(e.target.value)} placeholder="acme.com" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this company do?" rows={3} />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? 'Update Company' : 'Add Company'}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  )
}

// ─── CompanyCard ──────────────────────────────────────────────────────────────

interface CompanyCardProps {
  company: CompanyWithCount
  onEdit: () => void
  onDelete: () => void
  onClick: () => void
}

function CompanyCard({ company, onEdit, onDelete, onClick }: CompanyCardProps) {
  return (
    <div
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-zinc-100 truncate">{company.name}</p>
            {company.industry && (
              <p className="text-xs text-indigo-400 flex items-center gap-1 mt-0.5">
                <Briefcase className="w-3 h-3 shrink-0" />{company.industry}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={e => { e.stopPropagation(); onEdit() }} className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete() }} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {/* Contact count badge */}
        <div className="flex items-center gap-2 text-xs">
          <Users className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
          <span className={cn(
            'font-medium',
            company.contactCount === 0 ? 'text-zinc-600' :
            company.contactCount > 10 ? 'text-indigo-400' : 'text-zinc-400'
          )}>
            {company.contactCount} contact{company.contactCount !== 1 ? 's' : ''}
          </span>
        </div>

        {company.country && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-500" />{company.country}
          </div>
        )}
        {company.email && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Mail className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
            <a href={`mailto:${company.email}`} onClick={e => e.stopPropagation()} className="hover:text-zinc-200 transition-colors truncate">{company.email}</a>
          </div>
        )}
        {company.phone && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Phone className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
            <a href={`tel:${company.phone}`} onClick={e => e.stopPropagation()} className="hover:text-zinc-200 transition-colors">{company.phone}</a>
          </div>
        )}
        {company.domain && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Globe className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
            <a
              href={company.domain.startsWith('http') ? company.domain : `https://${company.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="hover:text-zinc-200 transition-colors truncate"
            >
              {company.domain}
            </a>
          </div>
        )}
        {company.description && (
          <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">{company.description}</p>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const CONTACT_FILTER_LABELS: Record<ContactFilter, string> = {
  all: 'All',
  zero: '0 contacts',
  low: '1 – 10',
  high: '> 10',
}

export default function CompaniesPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [companies, setCompanies] = useState<CompanyWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [contactFilter, setContactFilter] = useState<ContactFilter>('all')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [editCompany, setEditCompany] = useState<Company | null>(null)

  const fetchCompanies = useCallback(async () => {
    setLoading(true)

    const { data, error } = await supabase.schema('crm')
      .from('companies')
      .select('*, contacts(count)')
      .order('name')

    if (error) { toast.error(error.message); setLoading(false); return }

    const mapped: CompanyWithCount[] = (data ?? []).map((c: Company & { contacts: { count: number }[] }) => ({
      ...c,
      contactCount: c.contacts?.[0]?.count ?? 0,
    }))

    setCompanies(mapped)
    setLoading(false)
  }, [])

  useEffect(() => { fetchCompanies() }, [fetchCompanies])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [search, contactFilter])

  const handleDelete = async (company: Company) => {
    if (!confirm(`Delete "${company.name}"? Contacts linked to this company will become unlinked.`)) return
    const { error } = await supabase.schema('crm').from('companies').delete().eq('id', company.id)
    if (error) toast.error(error.message)
    else { toast.success('Company deleted'); fetchCompanies() }
  }

  // Apply search + contact count filter
  const filtered = companies.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.industry ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (c.country ?? '').toLowerCase().includes(search.toLowerCase())

    const matchCount =
      contactFilter === 'all' ? true :
      contactFilter === 'zero' ? c.contactCount === 0 :
      contactFilter === 'low'  ? c.contactCount >= 1 && c.contactCount <= 10 :
      c.contactCount > 10

    return matchSearch && matchCount
  })

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Companies</h1>
          <p className="text-zinc-400 text-sm mt-1">{filtered.length} of {companies.length} total</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Add Company</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl min-h-[540px]">
            <DialogHeader><DialogTitle>Add Company</DialogTitle></DialogHeader>
            <CompanyForm onSave={() => { setCreateOpen(false); fetchCompanies() }} onClose={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, industry or country..."
            className="pl-9"
          />
        </div>

        {/* Contact count filter pills */}
        <div className="flex items-center gap-1.5 bg-zinc-800/60 rounded-lg p-1 shrink-0">
          {(Object.keys(CONTACT_FILTER_LABELS) as ContactFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setContactFilter(f)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap',
                contactFilter === f
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              {CONTACT_FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{search || contactFilter !== 'all' ? 'No companies match your filters.' : 'No companies yet. Add your first!'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map(company => (
            <CompanyCard
              key={company.id}
              company={company}
              onEdit={() => setEditCompany(company)}
              onDelete={() => handleDelete(company)}
              onClick={() => router.push(`/dashboard/companies/detail?id=${company.id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-zinc-500">
            Page {page} of {totalPages} &mdash; showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="text-zinc-600 px-1 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                        page === p ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                      )}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editCompany} onOpenChange={open => { if (!open) setEditCompany(null) }}>
        <DialogContent className="max-w-2xl min-h-[540px]">
          <DialogHeader><DialogTitle>Edit Company</DialogTitle></DialogHeader>
          {editCompany && (
            <CompanyForm
              initial={editCompany}
              onSave={() => { setEditCompany(null); fetchCompanies() }}
              onClose={() => setEditCompany(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
