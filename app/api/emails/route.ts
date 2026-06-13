import { createServerClient } from '@/lib/supabase-server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const user_id = url.searchParams.get('user_id')
  if (!user_id) return Response.json({ error: 'user_id is required' }, { status: 422 })

  const client = createServerClient()
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 200)
  const offset = Number(url.searchParams.get('offset') ?? 0)

  const { data, error, count } = await client
    .from('email_drafts')
    .select('*', { count: 'exact' })
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data, total: count, limit, offset })
}

export async function POST(req: Request) {
  const client = createServerClient()

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { user_id, subject, body: emailBody, is_html, recipients } = body as {
    user_id: string
    subject: string
    body: string
    is_html?: boolean
    recipients: Array<{ contact_id: string | null; email: string; full_name: string }>
  }

  if (!user_id) return Response.json({ error: 'user_id is required' }, { status: 422 })
  if (!subject || !emailBody) return Response.json({ error: 'subject and body are required' }, { status: 422 })
  if (!Array.isArray(recipients) || recipients.length === 0) return Response.json({ error: 'recipients must be a non-empty array' }, { status: 422 })

  const { data, error } = await client
    .from('email_drafts')
    .insert({ user_id, subject, body: emailBody, is_html: is_html ?? false, recipients })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data }, { status: 201 })
}
