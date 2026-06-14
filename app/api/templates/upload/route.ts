import { micromark } from 'micromark'
import { createServerClient } from '@/lib/supabase-server'

// POST /api/templates/upload
// Accepts a markdown file (multipart/form-data, field `file`) or raw markdown
// (JSON body `{ markdown }`), converts it to HTML and stores it as an
// email template.
export async function POST(req: Request) {
  const client = createServerClient()
  const contentType = req.headers.get('content-type') ?? ''

  let user_id = ''
  let name = ''
  let subject = ''
  let markdown = ''

  if (contentType.includes('multipart/form-data')) {
    let form: FormData
    try { form = await req.formData() } catch { return Response.json({ error: 'Invalid form data' }, { status: 400 }) }

    user_id = String(form.get('user_id') ?? '')
    subject = String(form.get('subject') ?? '')

    const file = form.get('file')
    if (file instanceof File) {
      markdown = await file.text()
      name = String(form.get('name') ?? file.name.replace(/\.(md|markdown)$/i, ''))
    } else {
      markdown = String(form.get('markdown') ?? '')
      name = String(form.get('name') ?? '')
    }
  } else {
    let body: Record<string, unknown>
    try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
    const b = body as Record<string, string>
    user_id = b.user_id ?? ''
    name = b.name ?? ''
    subject = b.subject ?? ''
    markdown = b.markdown ?? ''
  }

  if (!user_id) return Response.json({ error: 'user_id is required' }, { status: 422 })
  if (!markdown.trim()) return Response.json({ error: 'markdown content is required' }, { status: 422 })
  if (!name.trim()) return Response.json({ error: 'name is required' }, { status: 422 })

  const html_content = micromark(markdown)

  const { data, error } = await client
    .from('email_templates')
    .insert({ user_id, name, subject, html_content })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data }, { status: 201 })
}
