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
} from 'lucide-react'

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
  'Manufacturing', 'Real Estate', 'Media', 'Consulting', 'Energy',
  'Transportation', 'Hospitality', 'Legal', 'Non-profit', 'Other',
]

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
      name,
      domain: domain || null,
      country: country || null,
      industry: industry || null,
      email: email || null,
      phone: phone || null,
      description: description || null,
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
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What does this company do?"
            rows={3}
          />
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

interface CompanyCardProps {
  company: Company & { _contactCount?: number }
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
                <Briefcase className="w-3 h-3 shrink-0" />
                {company.industry}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onEdit() }}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {company.country && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
            {company.country}
          </div>
        )}
        {company.email && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Mail className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
            <a href={`mailto:${company.email}`} className="hover:text-zinc-200 transition-colors truncate">{company.email}</a>
          </div>
        )}
        {company.phone && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Phone className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
            <a href={`tel:${company.phone}`} className="hover:text-zinc-200 transition-colors">{company.phone}</a>
          </div>
        )}
        {company.domain && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Globe className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
            <a
              href={company.domain.startsWith('http') ? company.domain : `https://${company.domain}`}
              target="_blank"
              rel="noopener noreferrer"
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

export default function CompaniesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editCompany, setEditCompany] = useState<Company | null>(null)

  const fetchCompanies = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase.schema('crm')
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    if (error) toast.error(error.message)
    else setCompanies(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchCompanies() }, [fetchCompanies])

  const handleDelete = async (company: Company) => {
    if (!confirm(`Delete "${company.name}"? Contacts linked to this company will become unlinked.`)) return
    const { error } = await supabase.schema('crm').from('companies').delete().eq('id', company.id)
    if (error) toast.error(error.message)
    else { toast.success('Company deleted'); fetchCompanies() }
  }

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.country ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Companies</h1>
          <p className="text-zinc-400 text-sm mt-1">{companies.length} total</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Add Company</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>Add Company</DialogTitle></DialogHeader>
            <CompanyForm onSave={() => { setCreateOpen(false); fetchCompanies() }} onClose={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, industry or country..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{search ? 'No companies match your search.' : 'No companies yet. Add your first!'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(company => (
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

      <Dialog open={!!editCompany} onOpenChange={open => { if (!open) setEditCompany(null) }}>
        <DialogContent className="max-w-xl">
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
