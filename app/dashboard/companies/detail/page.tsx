'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Company, Contact } from '@/types/database'
import { toast } from 'sonner'
import {
  ArrowLeft, Building2, Globe, Mail, Phone, MapPin,
  Briefcase, Loader2, Users, ExternalLink, User, Plus,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ContactForm } from '@/components/contacts/contact-form'

export default function CompanyDetailPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const router = useRouter()
  const { user } = useAuth()

  const [company, setCompany] = useState<Company | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)

  const fetchData = useCallback(async () => {
    if (!user || !id) return
    const [companyRes, contactsRes] = await Promise.all([
      supabase.schema('crm').from('companies').select('*').eq('id', id).eq('user_id', user.id).single(),
      supabase.schema('crm').from('contacts').select('*').eq('company_id', id).eq('user_id', user.id).order('full_name'),
    ])
    if (companyRes.error) {
      toast.error('Company not found')
      router.push('/dashboard/companies')
      return
    }
    setCompany(companyRes.data)
    setContacts(contactsRes.data ?? [])
    setLoading(false)
  }, [user, id, router])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    )
  }

  if (!company) return null

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link
        href="/dashboard/companies"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Companies
      </Link>

      {/* Company header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">{company.name}</h1>
            {company.industry && (
              <p className="text-sm text-indigo-400 flex items-center gap-1.5 mt-0.5">
                <Briefcase className="w-3.5 h-3.5" />
                {company.industry}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {company.country && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <MapPin className="w-4 h-4 shrink-0 text-zinc-500" />
              {company.country}
            </div>
          )}
          {company.email && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Mail className="w-4 h-4 shrink-0 text-zinc-500" />
              <a href={`mailto:${company.email}`} className="hover:text-zinc-200 transition-colors truncate">
                {company.email}
              </a>
            </div>
          )}
          {company.phone && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Phone className="w-4 h-4 shrink-0 text-zinc-500" />
              <a href={`tel:${company.phone}`} className="hover:text-zinc-200 transition-colors">
                {company.phone}
              </a>
            </div>
          )}
          {company.domain && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Globe className="w-4 h-4 shrink-0 text-zinc-500" />
              <a
                href={company.domain.startsWith('http') ? company.domain : `https://${company.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-200 transition-colors truncate flex items-center gap-1"
              >
                {company.domain}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          )}
        </div>

        {company.description && (
          <p className="mt-4 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800 pt-4">
            {company.description}
          </p>
        )}
      </div>

      {/* People section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-100">People</h2>
            <span className="text-sm text-zinc-500 ml-1">{contacts.length}</span>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Contact
          </Button>
        </div>

        {contacts.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-xl">
            <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No contacts linked to this company yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map(contact => (
              <Link
                key={contact.id}
                href={`/dashboard/contacts/profile?id=${contact.id}`}
                className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-900/50 flex items-center justify-center shrink-0 text-indigo-300 font-semibold text-sm">
                  {contact.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-100 group-hover:text-white transition-colors truncate">
                    {contact.full_name}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{contact.email}</p>
                </div>
                {contact.last_contacted_at && (
                  <p className="text-xs text-zinc-600 shrink-0 hidden sm:block">
                    {formatDistanceToNow(new Date(contact.last_contacted_at), { addSuffix: true })}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Add Contact to {company.name}</DialogTitle></DialogHeader>
          <ContactForm
            defaultCompanyId={company.id}
            onSave={() => { setAddOpen(false); fetchData() }}
            onClose={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
