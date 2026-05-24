'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { ContactWithRelations } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Send, Loader2, Eye, Code2 } from 'lucide-react'

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
  const [preview, setPreview] = useState(false)
  const [sending, setSending] = useState(false)

  const injectedSubject = injectVariables(subject, contact)
  const injectedBody = injectVariables(body, contact)

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and body are required')
      return
    }
    if (!user) return
    setSending(true)
    try {
      const { error } = await supabase.functions.invoke('send-custom-email', {
        body: {
          to: contact.email,
          subject: injectedSubject,
          htmlContent: injectedBody.replace(/\n/g, '<br/>'),
        },
      })
      if (error) throw error

      // Stamp last_contacted_at on the contact record
      await supabase.schema('crm')
        .from('contacts')
        .update({ last_contacted_at: new Date().toISOString() })
        .eq('id', contact.id)

      toast.success(`Email sent to ${contact.email}`)
      setSubject('')
      setBody('')
      onSent?.()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send email')
    }
    setSending(false)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
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
          <Label>Body</Label>
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
          <div className="min-h-[180px] w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
            {injectedBody || <span className="text-zinc-600 italic">Nothing to preview</span>}
          </div>
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

      <Button onClick={handleSend} disabled={sending} className="w-full">
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {sending ? 'Sending...' : 'Send Email'}
      </Button>
    </div>
  )
}
