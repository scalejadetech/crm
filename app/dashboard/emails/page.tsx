'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { EmailDraft, ContactWithRelations, EmailTemplate } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Send, Loader2, Trash2, Eye, Code2, FileCode2, X,
  Plus, Users, Mail, ChevronDown, ChevronUp, Upload, Pencil, Download, FileSpreadsheet,
} from 'lucide-react'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'

type Recipient = { contact_id: string | null; email: string; full_name: string }

const VARIABLES = ['{{full_name}}', '{{email}}', '{{company_name}}']

function injectVariables(template: string, r: Recipient): string {
  return template
    .replace(/\{\{full_name\}\}/g, r.full_name)
    .replace(/\{\{email\}\}/g, r.email)
    .replace(/\{\{company_name\}\}/g, '')
}

// ─── Import template ──────────────────────────────────────────────────────────
// Columns recognised by handleXlsxImport. `subject` and `body` are read from the
// first row only and pre-fill the composer; `email` (required) and `full_name`
// are read from every row to build the recipient list.
const TEMPLATE_ROWS = [
  {
    email: 'jane.doe@example.com',
    full_name: 'Jane Doe',
    subject: 'Quick question, {{full_name}}',
    body: 'Hi {{full_name}},\n\nI wanted to reach out regarding...\n\nBest,\nYour Name',
  },
  { email: 'john.smith@example.com', full_name: 'John Smith', subject: '', body: '' },
  { email: 'team@acme.com', full_name: 'Acme Team', subject: '', body: '' },
]

function buildTemplateSheet() {
  return XLSX.utils.json_to_sheet(TEMPLATE_ROWS, {
    header: ['email', 'full_name', 'subject', 'body'],
  })
}

function downloadTemplate(format: 'xlsx' | 'csv') {
  const ws = buildTemplateSheet()
  if (format === 'xlsx') {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Recipients')
    XLSX.writeFile(wb, 'email-import-template.xlsx')
    return
  }
  const csv = XLSX.utils.sheet_to_csv(ws)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'email-import-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Contact picker modal ─────────────────────────────────────────────────────

function ContactPicker({ onAdd, onClose }: { onAdd: (r: Recipient[]) => void; onClose: () => void }) {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<ContactWithRelations[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.schema('crm')
      .from('contacts')
      .select('*, companies(*), contact_tags(*, tags(*))')
      .order('full_name')
      .then(({ data }) => { setContacts((data as ContactWithRelations[]) ?? []); setLoading(false) })
  }, [user])

  const filtered = contacts.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
  })

  const handleAdd = () => {
    onAdd(contacts.filter(c => selected.has(c.id)).map(c => ({ contact_id: c.id, email: c.email, full_name: c.full_name })))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <h3 className="font-semibold text-zinc-100">Add contacts</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-4 py-3 border-b border-zinc-800">
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-800">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
          ) : filtered.map(c => (
            <button key={c.id} type="button" onClick={() => toggle(c.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left">
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${selected.has(c.id) ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-600'}`}>
                {selected.has(c.id) && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">{c.full_name}</p>
                <p className="text-xs text-zinc-500 truncate">{c.email}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500">{selected.size} selected</span>
          <Button onClick={handleAdd} disabled={selected.size === 0} size="sm">Add {selected.size || ''} contact{selected.size !== 1 ? 's' : ''}</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Compose panel ────────────────────────────────────────────────────────────

function ComposePanel({ onSaved }: { onSaved: () => void }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isHtml, setIsHtml] = useState(false)
  const [preview, setPreview] = useState(false)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [showTemplateMenu, setShowTemplateMenu] = useState(false)
  const xlsxInputRef = useRef<HTMLInputElement>(null)

  const handleXlsxImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target!.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })

        if (rows.length === 0) { toast.error('The file is empty.'); return }

        // Read subject, body, is_html from first row
        const first = rows[0]
        const getCol = (row: Record<string, string>, ...keys: string[]) =>
          Object.entries(row).find(([k]) => keys.includes(k.toLowerCase()))?.[1]?.trim() ?? ''

        const importedSubject = getCol(first, 'subject')
        const importedBody = getCol(first, 'body', 'message', 'content')

        const imported: Recipient[] = []
        const skipped: string[] = []

        for (const row of rows) {
          const email = getCol(row, 'email')
          const full_name = getCol(row, 'full_name', 'name') || email

          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            if (email) skipped.push(email)
            continue
          }
          imported.push({ contact_id: null, email, full_name })
        }

        if (imported.length === 0) {
          toast.error('No valid emails found. Ensure your file has an "email" column.')
        } else {
          if (importedSubject) setSubject(importedSubject)
          if (importedBody) setBody(importedBody)
          addRecipients(imported)
          setOpen(true)
          toast.success(
            skipped.length > 0
              ? `Imported ${imported.length} recipients, skipped ${skipped.length} invalid`
              : `Imported ${imported.length} recipient${imported.length !== 1 ? 's' : ''} — review and save as draft`
          )
        }
      } catch {
        toast.error('Failed to parse file. Make sure it is a valid .xlsx or .csv file.')
      }
      e.target.value = ''
    }
    reader.readAsArrayBuffer(file)
  }

  useEffect(() => {
    if (!user) return
    supabase.schema('crm').from('email_templates').select('*').order('name')
      .then(({ data }) => setTemplates(data ?? []))
  }, [user])

  const removeRecipient = (email: string) => setRecipients(prev => prev.filter(r => r.email !== email))

  const addRecipients = (incoming: Recipient[]) => {
    setRecipients(prev => {
      const existing = new Set(prev.map(r => r.email))
      return [...prev, ...incoming.filter(r => !existing.has(r.email))]
    })
  }

  const handleSave = async () => {
    if (!subject.trim() || !body.trim()) { toast.error('Subject and body are required'); return }
    if (recipients.length === 0) { toast.error('Add at least one recipient'); return }
    if (!user) return
    setSaving(true)
    const { error } = await supabase.schema('crm').from('email_drafts').insert({
      user_id: user.id, subject: subject.trim(), body, is_html: isHtml, recipients,
    })
    if (error) toast.error(error.message)
    else {
      toast.success('Draft saved')
      setSubject(''); setBody(''); setRecipients([]); setIsHtml(false); setPreview(false); setOpen(false)
      onSaved()
    }
    setSaving(false)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors">
        <span className="font-medium text-zinc-200 flex items-center gap-2">
          <Mail className="w-4 h-4 text-indigo-400" /> Compose new draft
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-zinc-800 pt-4">
          {/* Recipients */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Recipients</Label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setShowPicker(true)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add from contacts
                </button>
                <button type="button" onClick={() => xlsxInputRef.current?.click()}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                  <Upload className="w-3.5 h-3.5" /> Import XLSX / CSV
                </button>
                <div className="relative">
                  <button type="button" onClick={() => setShowTemplateMenu(p => !p)}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                    <Download className="w-3.5 h-3.5" /> Template
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showTemplateMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowTemplateMenu(false)} />
                      <div className="absolute right-0 mt-1 z-20 w-44 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
                        <button type="button"
                          onClick={() => { downloadTemplate('xlsx'); setShowTemplateMenu(false) }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Download .xlsx
                        </button>
                        <button type="button"
                          onClick={() => { downloadTemplate('csv'); setShowTemplateMenu(false) }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800 transition-colors border-t border-zinc-800">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" /> Download .csv
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={xlsxInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleXlsxImport}
                />
              </div>
            </div>
            {recipients.length === 0
              ? <p className="text-xs text-zinc-600 italic">
                  No recipients yet — add from contacts or import an XLSX / CSV with an{' '}
                  <span className="font-mono text-zinc-500">email</span> column (download the template above).
                </p>
              : <div className="flex flex-wrap gap-1.5">
                  {recipients.map(r => (
                    <span key={r.email} className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded-full px-2.5 py-1 text-xs text-zinc-300">
                      {r.full_name}
                      <button onClick={() => removeRecipient(r.email)} className="text-zinc-500 hover:text-zinc-200 transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
            }
          </div>

          {/* Template picker */}
          <div>
            <button type="button" onClick={() => setShowTemplatePicker(p => !p)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
              <FileCode2 className="w-3.5 h-3.5" />{showTemplatePicker ? 'Hide templates' : 'Use a template'}
            </button>
            {showTemplatePicker && (
              <div className="mt-2 border border-zinc-700 rounded-lg overflow-hidden">
                {templates.length === 0
                  ? <p className="text-xs text-zinc-500 px-3 py-2">No templates yet.</p>
                  : templates.map(t => (
                      <button key={t.id} type="button" onClick={() => { setBody(t.html_content); if (t.subject) setSubject(t.subject); setIsHtml(true); setShowTemplatePicker(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0">
                        <FileCode2 className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-zinc-200 font-medium truncate">{t.name}</p>
                          {t.subject && <p className="text-xs text-zinc-500 truncate">{t.subject}</p>}
                        </div>
                      </button>
                    ))
                }
              </div>
            )}
          </div>

          {!isHtml && (
            <div>
              <p className="text-xs text-zinc-500 mb-2">Insert variable:</p>
              <div className="flex flex-wrap gap-1.5">
                {VARIABLES.map(v => (
                  <button key={v} type="button" onClick={() => setBody(prev => prev + v)}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-indigo-400 rounded-md px-2 py-1 font-mono transition-colors">{v}</button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject line..." />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>{isHtml ? 'Body (HTML)' : 'Body'}</Label>
              <button type="button" onClick={() => setPreview(p => !p)}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                {preview ? <><Code2 className="w-3.5 h-3.5" /> Edit</> : <><Eye className="w-3.5 h-3.5" /> Preview</>}
              </button>
            </div>
            {preview
              ? isHtml
                ? <iframe srcDoc={body} sandbox="allow-same-origin" title="Preview" className="w-full h-64 rounded-lg border border-zinc-700 bg-white" />
                : <div className="min-h-[160px] rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-200 whitespace-pre-wrap">{body || <span className="text-zinc-600 italic">Nothing to preview</span>}</div>
              : isHtml
                ? <textarea value={body} onChange={e => setBody(e.target.value)} rows={8} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-xs text-zinc-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y" />
                : <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder={`Dear {{full_name}},\n\n...`} rows={6} />
            }
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Save to Drafts
          </Button>
        </div>
      )}
      {showPicker && <ContactPicker onAdd={addRecipients} onClose={() => setShowPicker(false)} />}
    </div>
  )
}

// ─── Draft preview drawer ─────────────────────────────────────────────────────

function DraftPreview({ draft, onClose }: { draft: EmailDraft; onClose: () => void }) {
  const sample = draft.recipients[0] ?? { contact_id: null, email: '', full_name: '' }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div>
            <p className="font-semibold text-zinc-100 truncate">{draft.subject || '(no subject)'}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{draft.recipients.length} recipient{draft.recipients.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors shrink-0"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-4 py-3 border-b border-zinc-800 flex flex-wrap gap-1.5">
          {draft.recipients.map(r => (
            <span key={r.email} className="text-xs bg-zinc-800 border border-zinc-700 rounded-full px-2.5 py-1 text-zinc-300">
              {r.full_name} &lt;{r.email}&gt;
            </span>
          ))}
        </div>
        <div className="flex-1 overflow-auto p-4">
          {draft.is_html
            ? <iframe srcDoc={injectVariables(draft.body, sample)} sandbox="allow-same-origin" title="Preview" className="w-full h-64 rounded-lg border border-zinc-700 bg-white" />
            : <div className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-300 whitespace-pre-wrap">{draft.body}</div>
          }
        </div>
      </div>
    </div>
  )
}

// ─── Edit draft modal ─────────────────────────────────────────────────────────

function EditDraftModal({ draft, onSaved, onClose }: { draft: EmailDraft; onSaved: () => void; onClose: () => void }) {
  const { user } = useAuth()
  const [subject, setSubject] = useState(draft.subject)
  const [body, setBody] = useState(draft.body)
  const [isHtml, setIsHtml] = useState(draft.is_html)
  const [preview, setPreview] = useState(false)
  const [recipients, setRecipients] = useState<Recipient[]>(draft.recipients)
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)

  const removeRecipient = (email: string) => setRecipients(prev => prev.filter(r => r.email !== email))

  const addRecipients = (incoming: Recipient[]) => {
    setRecipients(prev => {
      const existing = new Set(prev.map(r => r.email))
      return [...prev, ...incoming.filter(r => !existing.has(r.email))]
    })
  }

  const handleSave = async () => {
    if (!subject.trim() || !body.trim()) { toast.error('Subject and body are required'); return }
    if (recipients.length === 0) { toast.error('Add at least one recipient'); return }
    if (!user) return
    setSaving(true)
    const { error } = await supabase.schema('crm').from('email_drafts').update({
      subject: subject.trim(), body, is_html: isHtml, recipients,
    }).eq('id', draft.id)
    if (error) toast.error(error.message)
    else { toast.success('Draft updated'); onSaved(); onClose() }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <h3 className="font-semibold text-zinc-100 flex items-center gap-2"><Pencil className="w-4 h-4 text-indigo-400" /> Edit draft</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Recipients */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Recipients</Label>
              <button type="button" onClick={() => setShowPicker(true)}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add from contacts
              </button>
            </div>
            {recipients.length === 0
              ? <p className="text-xs text-zinc-600 italic">No recipients yet</p>
              : <div className="flex flex-wrap gap-1.5">
                  {recipients.map(r => (
                    <span key={r.email} className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded-full px-2.5 py-1 text-xs text-zinc-300">
                      {r.full_name}
                      <button onClick={() => removeRecipient(r.email)} className="text-zinc-500 hover:text-zinc-200 transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
            }
          </div>

          {!isHtml && (
            <div>
              <p className="text-xs text-zinc-500 mb-2">Insert variable:</p>
              <div className="flex flex-wrap gap-1.5">
                {VARIABLES.map(v => (
                  <button key={v} type="button" onClick={() => setBody(prev => prev + v)}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-indigo-400 rounded-md px-2 py-1 font-mono transition-colors">{v}</button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject line..." />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>{isHtml ? 'Body (HTML)' : 'Body'}</Label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setIsHtml(p => !p)}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                  <FileCode2 className="w-3.5 h-3.5" />{isHtml ? 'Plain text' : 'HTML'}
                </button>
                <button type="button" onClick={() => setPreview(p => !p)}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                  {preview ? <><Code2 className="w-3.5 h-3.5" /> Edit</> : <><Eye className="w-3.5 h-3.5" /> Preview</>}
                </button>
              </div>
            </div>
            {preview
              ? isHtml
                ? <iframe srcDoc={body} sandbox="allow-same-origin" title="Preview" className="w-full h-64 rounded-lg border border-zinc-700 bg-white" />
                : <div className="min-h-[160px] rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-200 whitespace-pre-wrap">{body || <span className="text-zinc-600 italic">Nothing to preview</span>}</div>
              : isHtml
                ? <textarea value={body} onChange={e => setBody(e.target.value)} rows={8} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-xs text-zinc-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y" />
                : <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder={`Dear {{full_name}},\n\n...`} rows={6} />
            }
          </div>
        </div>

        <div className="px-4 py-3 border-t border-zinc-800">
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
            Save changes
          </Button>
        </div>
      </div>
      {showPicker && <ContactPicker onAdd={addRecipients} onClose={() => setShowPicker(false)} />}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmailsPage() {
  const { user } = useAuth()
  const [drafts, setDrafts] = useState<EmailDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [preview, setPreview] = useState<EmailDraft | null>(null)
  const [editingDraft, setEditingDraft] = useState<EmailDraft | null>(null)

  const fetchDrafts = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.schema('crm')
      .from('email_drafts').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setDrafts((data as EmailDraft[]) ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchDrafts() }, [fetchDrafts])

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
  })

  const toggleAll = () => setSelected(prev => prev.size === drafts.length ? new Set() : new Set(drafts.map(d => d.id)))

  const handleDelete = async () => {
    if (selected.size === 0) return
    setDeleting(true)
    const ids = [...selected]
    const { error } = await supabase.schema('crm').from('email_drafts').delete().in('id', ids)
    if (error) toast.error(error.message)
    else { toast.success(`Deleted ${ids.length} draft${ids.length !== 1 ? 's' : ''}`); setSelected(new Set()); fetchDrafts() }
    setDeleting(false)
  }

  const handleSendSelected = async () => {
    if (selected.size === 0) return
    setSending(true)
    const toSend = drafts.filter(d => selected.has(d.id))
    let ok = 0; let fail = 0

    for (const draft of toSend) {
      for (const recipient of draft.recipients) {
        const htmlContent = draft.is_html
          ? injectVariables(draft.body, recipient)
          : injectVariables(draft.body, recipient).replace(/\n/g, '<br/>')
        const { error } = await supabase.functions.invoke('send-custom-email', {
          body: { to: recipient.email, subject: injectVariables(draft.subject, recipient), htmlContent },
        })
        if (error) { fail++; console.error(error) }
        else {
          ok++
          if (recipient.contact_id) {
            await supabase.schema('crm').from('contacts').update({ last_contacted_at: new Date().toISOString() }).eq('id', recipient.contact_id)
          }
        }
      }
    }

    await supabase.schema('crm').from('email_drafts').delete().in('id', [...selected])
    if (fail === 0) toast.success(`Sent ${ok} email${ok !== 1 ? 's' : ''}`)
    else toast.error(`Sent ${ok}, failed ${fail}`)
    setSelected(new Set()); fetchDrafts(); setSending(false)
  }

  const allSelected = drafts.length > 0 && selected.size === drafts.length
  const someSelected = selected.size > 0

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Emails</h1>
        <p className="text-zinc-400 text-sm mt-1">Compose drafts and send bulk emails to your contacts</p>
      </div>

      <ComposePanel onSaved={fetchDrafts} />

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            {/* Select all toggle */}
            <button type="button" onClick={toggleAll} disabled={drafts.length === 0}
              className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors disabled:opacity-30
                         border-zinc-600 hover:border-indigo-500"
              style={{ background: allSelected ? '#4f46e5' : someSelected ? '#312e81' : 'transparent', borderColor: allSelected || someSelected ? '#4f46e5' : undefined }}>
              {allSelected
                ? <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : someSelected
                  ? <div className="w-2 h-0.5 bg-indigo-300 rounded" />
                  : null}
            </button>
            <span className="text-sm font-semibold text-zinc-300">
              Drafts {drafts.length > 0 && <span className="text-zinc-500 font-normal">({drafts.length})</span>}
            </span>
            {someSelected && <span className="text-xs text-zinc-500">{selected.size} selected</span>}
          </div>

          {someSelected && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={handleDelete} disabled={deleting}
                className="text-red-400 hover:text-red-300 hover:bg-red-950/30">
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Delete
              </Button>
              <Button size="sm" onClick={handleSendSelected} disabled={sending}>
                {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {sending ? 'Sending...' : `Send ${selected.size}`}
              </Button>
            </div>
          )}
        </div>

        {/* Header row */}
        {drafts.length > 0 && (
          <div className="grid grid-cols-[2.5rem_1fr_6rem_5rem_2.5rem] px-4 py-2 border-b border-zinc-800 text-xs text-zinc-500 font-medium">
            <div />
            <div>Subject / Recipients</div>
            <div className="text-center">Recipients</div>
            <div className="text-right">Date</div>
            <div />
          </div>
        )}

        {/* Rows */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <Mail className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No drafts yet</p>
            <p className="text-xs mt-1">Compose one above or save a draft from a contact&apos;s email composer</p>
          </div>
        ) : (
          drafts.map(draft => {
            const isSelected = selected.has(draft.id)
            return (
              <div key={draft.id}
                className={`grid grid-cols-[2.5rem_1fr_6rem_5rem_2.5rem] items-center px-4 py-3 border-b border-zinc-800 last:border-0 transition-colors
                  ${isSelected ? 'bg-indigo-950/30' : 'hover:bg-zinc-800/40'}`}>
                {/* Toggle */}
                <div className="flex items-center">
                  <button type="button" onClick={() => toggleSelect(draft.id)}
                    className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      background: isSelected ? '#4f46e5' : 'transparent',
                      borderColor: isSelected ? '#4f46e5' : '#52525b',
                    }}>
                    {isSelected && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                </div>

                {/* Subject + recipient names */}
                <button type="button" onClick={() => setPreview(draft)} className="text-left min-w-0 pr-4">
                  <p className="text-sm font-medium text-zinc-200 truncate">
                    {draft.subject || <span className="italic text-zinc-500">(no subject)</span>}
                  </p>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    {draft.recipients.map(r => r.full_name).join(', ')}
                  </p>
                </button>

                {/* Recipients count */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                    <Users className="w-3 h-3" />{draft.recipients.length}
                  </span>
                </div>

                {/* Date */}
                <div className="text-right text-xs text-zinc-500">
                  {format(new Date(draft.created_at), 'MMM d')}
                </div>

                {/* Edit */}
                <div className="flex justify-end">
                  <button type="button" onClick={e => { e.stopPropagation(); setEditingDraft(draft) }}
                    className="text-zinc-500 hover:text-indigo-400 transition-colors p-1 rounded">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {preview && <DraftPreview draft={preview} onClose={() => setPreview(null)} />}
      {editingDraft && <EditDraftModal draft={editingDraft} onSaved={fetchDrafts} onClose={() => setEditingDraft(null)} />}
    </div>
  )
}
