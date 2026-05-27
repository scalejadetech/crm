import { createClient } from 'jsr:@supabase/supabase-js@2'
import nodemailer from 'npm:nodemailer'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { to, subject, htmlContent, smtpOverride } = await req.json()

    if (!to || !subject || !htmlContent) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, htmlContent' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Resolve SMTP: smtpOverride (test send) → user's saved config → env vars
    let smtpHost: string
    let smtpPort: number
    let smtpSecure: boolean
    let smtpUser: string
    let smtpPass: string
    let fromHeader: string

    if (smtpOverride) {
      smtpHost   = smtpOverride.host
      smtpPort   = smtpOverride.port ?? 587
      smtpSecure = smtpOverride.secure ?? false
      smtpUser   = smtpOverride.username
      smtpPass   = smtpOverride.password
      const fn   = smtpOverride.fromName
      const fe   = smtpOverride.fromEmail || smtpOverride.username
      fromHeader = fn ? `"${fn}" <${fe}>` : fe
    } else {
      const { data: cfg } = await supabase
        .schema('crm')
        .from('smtp_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (cfg && cfg.host) {
        smtpHost   = cfg.host
        smtpPort   = cfg.port
        smtpSecure = cfg.secure
        smtpUser   = cfg.username
        smtpPass   = cfg.password
        const fe   = cfg.from_email || cfg.username
        fromHeader = cfg.from_name ? `"${cfg.from_name}" <${fe}>` : fe
      } else {
        smtpHost   = Deno.env.get('SMTP_HOST') ?? ''
        smtpPort   = parseInt(Deno.env.get('SMTP_PORT') ?? '587')
        smtpSecure = Deno.env.get('SMTP_PORT') === '465'
        smtpUser   = Deno.env.get('SMTP_USER') ?? ''
        smtpPass   = Deno.env.get('SMTP_PASS') ?? ''
        fromHeader = `"CRM" <${smtpUser}>`
      }
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    })

    await transporter.sendMail({ from: fromHeader, to, subject, html: htmlContent })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
