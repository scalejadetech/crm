import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export function createServerClient() {
  return createClient<Database>(url, serviceKey, {
    db: { schema: 'crm' },
    auth: { persistSession: false },
  })
}
