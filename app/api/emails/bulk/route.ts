import { createServerClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const client = createServerClient()

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { user_id, drafts } = body as {
    user_id: string
    drafts: Array<{
      subject: string
      body: string
      is_html?: boolean
      recipients: Array<{ contact_id: string | null; email: string; full_name: string }>
    }>
  }

  if (!user_id) return Response.json({ error: 'user_id is required' }, { status: 422 })
  if (!Array.isArray(drafts) || drafts.length === 0) {
    return Response.json({ error: 'drafts must be a non-empty array' }, { status: 422 })
  }

  const invalid = drafts.findIndex(d => !d.subject || !d.body || !Array.isArray(d.recipients) || d.recipients.length === 0)
  if (invalid !== -1) {
    return Response.json({ error: `drafts[${invalid}]: subject, body, and recipients are required` }, { status: 422 })
  }

  const rows = drafts.map(d => ({
    user_id,
    subject: d.subject,
    body: d.body,
    is_html: d.is_html ?? false,
    recipients: d.recipients,
  }))

  const { data, error } = await client
    .from('email_drafts')
    .insert(rows)
    .select()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data, count: data.length }, { status: 201 })
}
