import { createServerClient } from '@/lib/supabase-server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const user_id = url.searchParams.get('user_id')
  if (!user_id) return Response.json({ error: 'user_id is required' }, { status: 422 })

  const client = createServerClient()
  const search = url.searchParams.get('search') ?? ''
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 200)
  const offset = Number(url.searchParams.get('offset') ?? 0)

  let query = client
    .from('contacts')
    .select('*, companies(*)', { count: 'exact' })
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)

  const { data, error, count } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data, total: count, limit, offset })
}

export async function POST(req: Request) {
  const client = createServerClient()

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { user_id, full_name, email, contact_number, linkedin_url, notes, company_id } = body as Record<string, string>

  if (!user_id) return Response.json({ error: 'user_id is required' }, { status: 422 })
  if (!full_name || !email) return Response.json({ error: 'full_name and email are required' }, { status: 422 })

  const { data, error } = await client
    .from('contacts')
    .insert({ user_id, full_name, email, contact_number, linkedin_url, notes, company_id })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data }, { status: 201 })
}
