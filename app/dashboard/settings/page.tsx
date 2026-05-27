'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { UserProfile, SmtpConfig } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Users, Settings, Loader2, Mail, Server, Lock,
  User, CheckCircle2, Eye, EyeOff,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

// ─── Users tab ───────────────────────────────────────────────────────────────

function UsersTab() {
  const { user: currentUser } = useAuth()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.schema('crm')
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message)
        else setProfiles(data ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500">{profiles.length} registered user{profiles.length !== 1 ? 's' : ''}</p>
      {profiles.map(p => (
        <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-semibold text-white shrink-0">
            {p.email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-zinc-100 truncate">{p.email}</p>
              {p.id === currentUser?.id && (
                <span className="text-xs bg-indigo-900/50 text-indigo-400 border border-indigo-800/50 rounded-full px-2 py-0.5 shrink-0">you</span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Joined {format(new Date(p.created_at), 'MMM d, yyyy')}
              <span className="text-zinc-600 ml-1">({formatDistanceToNow(new Date(p.created_at), { addSuffix: true })})</span>
            </p>
          </div>
          <User className="w-4 h-4 text-zinc-600 shrink-0" />
        </div>
      ))}
    </div>
  )
}

// ─── SMTP tab ─────────────────────────────────────────────────────────────────

function SmtpTab() {
  const { user } = useAuth()
  const [config, setConfig] = useState<SmtpConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [host, setHost] = useState('')
  const [port, setPort] = useState('587')
  const [secure, setSecure] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fromName, setFromName] = useState('')
  const [fromEmail, setFromEmail] = useState('')

  const fetchConfig = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.schema('crm')
      .from('smtp_configs')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    if (data) {
      setConfig(data)
      setHost(data.host)
      setPort(String(data.port))
      setSecure(data.secure)
      setUsername(data.username)
      setPassword(data.password)
      setFromName(data.from_name)
      setFromEmail(data.from_email)
    }
    setLoading(false)
  }, [user])

  useEffect(() => { fetchConfig() }, [fetchConfig])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const payload = {
      host: host.trim(),
      port: parseInt(port) || 587,
      secure,
      username: username.trim(),
      password,
      from_name: fromName.trim(),
      from_email: fromEmail.trim(),
      updated_at: new Date().toISOString(),
    }
    if (config) {
      const { error } = await supabase.schema('crm').from('smtp_configs').update(payload).eq('id', config.id)
      if (error) toast.error(error.message)
      else { toast.success('SMTP settings saved'); fetchConfig() }
    } else {
      const { error } = await supabase.schema('crm').from('smtp_configs').insert({ ...payload, user_id: user.id })
      if (error) toast.error(error.message)
      else { toast.success('SMTP settings saved'); fetchConfig() }
    }
    setSaving(false)
  }

  const handleTest = async () => {
    if (!user) return
    if (!host || !username || !password) {
      toast.error('Fill in host, username and password first')
      return
    }
    setTesting(true)
    try {
      const { error } = await supabase.functions.invoke('send-custom-email', {
        body: {
          to: user.email,
          subject: 'CRM SMTP Test',
          htmlContent: '<p>Your SMTP configuration is working correctly.</p>',
          smtpOverride: { host, port: parseInt(port) || 587, secure, username, password, fromName, fromEmail },
        },
      })
      if (error) throw error
      toast.success(`Test email sent to ${user.email}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Test failed')
    }
    setTesting(false)
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
  }

  return (
    <div className="space-y-6 max-w-xl">
      {config && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-800/40 rounded-lg px-3 py-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          SMTP configured
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5" /> SMTP Host</Label>
          <Input value={host} onChange={e => setHost(e.target.value)} placeholder="smtp.gmail.com" />
        </div>

        <div className="space-y-1.5">
          <Label>Port</Label>
          <Input
            type="number"
            value={port}
            onChange={e => setPort(e.target.value)}
            placeholder="587"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Security</Label>
          <div className="flex items-center gap-3 h-10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!secure}
                onChange={() => { setSecure(false); if (port === '465') setPort('587') }}
                className="accent-indigo-500"
              />
              <span className="text-sm text-zinc-300">STARTTLS (587)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={secure}
                onChange={() => { setSecure(true); setPort('465') }}
                className="accent-indigo-500"
              />
              <span className="text-sm text-zinc-300">SSL/TLS (465)</span>
            </label>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Username</Label>
          <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="you@gmail.com" autoComplete="off" />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Password / App password</Label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="new-password"
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>From Name</Label>
          <Input value={fromName} onChange={e => setFromName(e.target.value)} placeholder="Acme Sales" />
        </div>

        <div className="space-y-1.5">
          <Label>From Email</Label>
          <Input type="email" value={fromEmail} onChange={e => setFromEmail(e.target.value)} placeholder="sales@acme.com" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
        <Button variant="ghost" onClick={handleTest} disabled={testing}>
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          Send Test Email
        </Button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage users and configure your email settings</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Users
          </TabsTrigger>
          <TabsTrigger value="smtp" className="flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" /> SMTP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="smtp">
          <SmtpTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
