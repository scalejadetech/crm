'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { EmailTemplate } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Plus, Pencil, Trash2, Loader2, Mail, Eye, Code2,
  FileCode2, ChevronRight,
} from 'lucide-react'

const STARTER_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: sans-serif; background: #f4f4f5; margin: 0; padding: 32px; }
    .card { background: #fff; border-radius: 12px; padding: 32px; max-width: 560px; margin: 0 auto; }
    h1 { color: #1e1b4b; margin-top: 0; }
    p { color: #52525b; line-height: 1.6; }
    .btn { display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px;
           border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hi {{full_name}},</h1>
    <p>I wanted to reach out regarding an exciting opportunity for {{company_name}}.</p>
    <p>Would you be available for a quick call this week?</p>
    <a class="btn" href="mailto:{{email}}">Reply now</a>
  </div>
</body>
</html>`

const VARIABLES = ['{{full_name}}', '{{email}}', '{{company_name}}', '{{contact_number}}']

interface EditorProps {
  initial?: EmailTemplate
  onSave: () => void
  onClose: () => void
}

function TemplateEditor({ initial, onSave, onClose }: EditorProps) {
  const { user } = useAuth()
  const [name, setName] = useState(initial?.name ?? '')
  const [subject, setSubject] = useState(initial?.subject ?? '')
  const [html, setHtml] = useState(initial?.html_content ?? STARTER_HTML)
  const [tab, setTab] = useState<'code' | 'preview'>('code')
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertVariable = (v: string) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = html.slice(0, start) + v + html.slice(end)
    setHtml(next)
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + v.length
      el.focus()
    })
  }

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Template name is required'); return }
    if (!user) return
    setSaving(true)
    const payload = { name: name.trim(), subject: subject.trim(), html_content: html }
    if (initial) {
      const { error } = await supabase.schema('crm').from('email_templates').update(payload).eq('id', initial.id)
      if (error) toast.error(error.message)
      else { toast.success('Template saved'); onSave() }
    } else {
      const { error } = await supabase.schema('crm').from('email_templates').insert({ ...payload, user_id: user.id })
      if (error) toast.error(error.message)
      else { toast.success('Template created'); onSave() }
    }
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Template Name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Welcome email" autoFocus />
        </div>
        <div className="space-y-1.5">
          <Label>Default Subject</Label>
          <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Hi {{full_name}}, quick note..." />
        </div>
      </div>

      <div>
        <p className="text-xs text-zinc-500 mb-2">Insert variable at cursor:</p>
        <div className="flex flex-wrap gap-1.5">
          {VARIABLES.map(v => (
            <button
              key={v}
              type="button"
              onClick={() => insertVariable(v)}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-indigo-400 rounded-md px-2 py-1 font-mono transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>HTML Content</Label>
          <div className="flex rounded-lg border border-zinc-700 overflow-hidden text-xs">
            <button
              onClick={() => setTab('code')}
              className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${tab === 'code' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Code2 className="w-3.5 h-3.5" /> Code
            </button>
            <button
              onClick={() => setTab('preview')}
              className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${tab === 'preview' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          </div>
        </div>

        {tab === 'code' ? (
          <textarea
            ref={textareaRef}
            value={html}
            onChange={e => setHtml(e.target.value)}
            spellCheck={false}
            rows={18}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-xs text-zinc-300 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          />
        ) : (
          <iframe
            srcDoc={html}
            sandbox="allow-same-origin"
            title="Template preview"
            className="w-full h-96 rounded-lg border border-zinc-700 bg-white"
          />
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? 'Update Template' : 'Create Template'}
        </Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTemplate, setEditTemplate] = useState<EmailTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)

  const fetchTemplates = useCallback(async () => {
    const { data, error } = await supabase.schema('crm')
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) toast.error(error.message)
    else setTemplates(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  const handleDelete = async (t: EmailTemplate) => {
    if (!confirm(`Delete template "${t.name}"?`)) return
    const { error } = await supabase.schema('crm').from('email_templates').delete().eq('id', t.id)
    if (error) toast.error(error.message)
    else { toast.success('Template deleted'); fetchTemplates() }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Email Templates</h1>
          <p className="text-zinc-400 text-sm mt-1">{templates.length} template{templates.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Template
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <FileCode2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No templates yet. Create your first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <div
              key={t.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-100 truncate">{t.name}</p>
                {t.subject && <p className="text-xs text-zinc-500 truncate mt-0.5">{t.subject}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setPreviewTemplate(t)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  title="Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditTemplate(t)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(t)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Email Template</DialogTitle></DialogHeader>
          <TemplateEditor onSave={() => { setCreateOpen(false); fetchTemplates() }} onClose={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTemplate} onOpenChange={open => { if (!open) setEditTemplate(null) }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Template</DialogTitle></DialogHeader>
          {editTemplate && (
            <TemplateEditor
              initial={editTemplate}
              onSave={() => { setEditTemplate(null); fetchTemplates() }}
              onClose={() => setEditTemplate(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={open => { if (!open) setPreviewTemplate(null) }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-zinc-400" />
              {previewTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <iframe
              srcDoc={previewTemplate.html_content}
              sandbox="allow-same-origin"
              title="Template preview"
              className="w-full h-[60vh] rounded-lg border border-zinc-700 bg-white"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
