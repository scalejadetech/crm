'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { ContactWithRelations, EmailTemplate } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Send, Loader2, Eye, Code2, FileCode2, X, Save } from 'lucide-react'

const VARIABLES = ['{{full_name}}', '{{email}}', '{{company_name}}', '{{contact_number}}']

interface Props {
  contact: ContactWithRelations
  onSent?: () => void
}

function injectVariables(template: string, contact: ContactWithRelations): string {
  return template
    .replace(/\{\{full_name\}\}/g, contact.full_name)
    .replace(/\{\{email\}\}/g, contact.email)
    .replace(/\{\{company_name\}\}/g, contact.companies?.name ?? '')
    .replace(/\{\{contact_number\}\}/g, contact.contact_number ?? '')
}

export function EmailComposer({ contact, onSent }: Props) {
  const { user } = useAuth()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isHtml, setIsHtml] = useState(false)
  const [preview, setPreview] = useState(false)
  const [sending, setSending] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.schema('crm').from('email_templates').select('*').order('name').then(({ data }) => {
      setTemplates(data ?? [])
    })
  }, [user])

  const applyTemplate = (t: EmailTemplate) => {
    setSelectedTemplate(t)
    setBody(t.html_content)
    if (t.subject) setSubject(t.subject)
    setIsHtml(true)
    setPreview(false)
    setShowTemplatePicker(false)
  }

  const clearTemplate = () => {
    setSelectedTemplate(null)
    setBody('')
    setIsHtml(false)
    setPreview(false)
  }

  const injectedSubject = injectVariables(subject, contact)
  const injectedBody = injectVariables(body, contact)

  const handleSaveDraft = async () => {
    if (!subject.trim() && !body.trim()) {
      toast.error('Add a subject or body before saving')
      return
    }
    if (!user) return
    setSavingDraft(true)
    const { error } = await supabase.schema('crm').from('email_drafts').insert({
      user_id: user.id,
      subject: subject.trim(),
      body,
      is_html: isHtml,
      recipients: [{ contact_id: contact.id, email: contact.email, full_name: contact.full_name }],
    })
    if (error) toast.error(error.message)
    else toast.success('Draft saved — visible in the Emails tab')
    setSavingDraft(false)
  }

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and body are required')
      return
    }
    if (!user) return
    setSending(true)
    try {
      const htmlContent = isHtml
        ? injectedBody
        : injectedBody.replace(/\n/g, '<br/>')

      const { error } = await supabase.functions.invoke('send-custom-email', {
        body: { to: contact.email, subject: injectedSubject, htmlContent },
      })
      if (error) throw error

      await supabase.schema('crm')
        .from('contacts')
        .update({ last_contacted_at: new Date().toISOString() })
        .eq('id', contact.id)

      toast.success(`Email sent to ${contact.email}`)
      setSubject('')
      setBody('')
      setSelectedTemplate(null)
      setIsHtml(false)
      setPreview(false)
      onSent?.()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send email')
    }
    setSending(false)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">

      {/* Template picker */}
      <div>
        {selectedTemplate ? (
          <div className="flex items-center gap-2 bg-indigo-950/50 border border-indigo-800/50 rounded-lg px-3 py-2">
            <FileCode2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-sm text-indigo-300 flex-1 truncate">Using template: <span className="font-medium">{selectedTemplate.name}</span></span>
            <button onClick={clearTemplate} className="text-indigo-500 hover:text-indigo-300 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowTemplatePicker(p => !p)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            {showTemplatePicker ? 'Hide templates' : 'Use a template'}
          </button>
        )}

        {showTemplatePicker && !selectedTemplate && (
          <div className="mt-2 border border-zinc-700 rounded-lg overflow-hidden">
            {templates.length === 0 ? (
              <p className="text-xs text-zinc-500 px-3 py-2">No templates yet — create one in the Templates page.</p>
            ) : (
              templates.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0"
                >
                  <FileCode2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-200 font-medium truncate">{t.name}</p>
                    {t.subject && <p className="text-xs text-zinc-500 truncate">{t.subject}</p>}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Variable chips — only shown when not using HTML template */}
      {!isHtml && (
        <div>
          <p className="text-xs text-zinc-500 mb-2">Insert variable:</p>
          <div className="flex flex-wrap gap-1.5">
            {VARIABLES.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setBody(prev => prev + v)}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-indigo-400 rounded-md px-2 py-1 font-mono transition-colors"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>To</Label>
        <Input value={contact.email} readOnly className="opacity-60 cursor-default" />
      </div>

      <div className="space-y-1.5">
        <Label>Subject</Label>
        <Input
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Hi {{full_name}}, following up on..."
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>{isHtml ? 'Body (HTML template)' : 'Body'}</Label>
          <button
            type="button"
            onClick={() => setPreview(p => !p)}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {preview
              ? <><Code2 className="w-3.5 h-3.5" /> Edit</>
              : <><Eye className="w-3.5 h-3.5" /> Preview</>}
          </button>
        </div>

        {preview ? (
          isHtml ? (
            <iframe
              srcDoc={injectedBody}
              sandbox="allow-same-origin"
              title="Email preview"
              className="w-full h-72 rounded-lg border border-zinc-700 bg-white"
            />
          ) : (
            <div className="min-h-[180px] w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {injectedBody || <span className="text-zinc-600 italic">Nothing to preview</span>}
            </div>
          )
        ) : isHtml ? (
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            spellCheck={false}
            rows={10}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-xs text-zinc-300 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          />
        ) : (
          <Textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={`Dear {{full_name}},\n\nI wanted to reach out regarding...`}
            rows={7}
          />
        )}
      </div>

      {subject && (
        <div className="bg-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-400">
          <span className="text-zinc-600">Subject preview: </span>{injectedSubject}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSaveDraft} disabled={savingDraft} variant="ghost" className="flex-1">
          {savingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Draft
        </Button>
        <Button onClick={handleSend} disabled={sending} className="flex-1">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  )
}
