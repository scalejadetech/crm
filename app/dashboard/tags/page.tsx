'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Tag } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4', '#84cc16', '#a855f7',
]

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className="w-7 h-7 rounded-full border-2 transition-transform active:scale-90"
            style={{
              backgroundColor: c,
              borderColor: value === c ? '#fff' : 'transparent',
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
        />
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-28 font-mono text-xs"
          maxLength={7}
        />
      </div>
    </div>
  )
}

interface TagFormProps {
  initial?: Tag
  onSave: (name: string, color: string) => Promise<void>
  onClose: () => void
}

function TagForm({ initial, onSave, onClose }: TagFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? '#6366f1')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await onSave(name.trim(), color)
    setSaving(false)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Hot Lead"
          required
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label>Color</Label>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? 'Update Tag' : 'Create Tag'}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  )
}

export default function TagsPage() {
  const { user } = useAuth()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTag, setEditTag] = useState<Tag | null>(null)

  const fetchTags = async () => {
    if (!user) return
    const { data, error } = await supabase.schema('crm')
      .from('tags')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    if (error) toast.error(error.message)
    else setTags(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchTags() }, [user])

  const handleCreate = async (name: string, color: string) => {
    if (!user) return
    const { error } = await supabase.schema('crm').from('tags').insert({ name, color, user_id: user.id })
    if (error) toast.error(error.message)
    else { toast.success('Tag created'); fetchTags() }
  }

  const handleUpdate = async (name: string, color: string) => {
    if (!editTag) return
    const { error } = await supabase.schema('crm').from('tags').update({ name, color }).eq('id', editTag.id)
    if (error) toast.error(error.message)
    else { toast.success('Tag updated'); setEditTag(null); fetchTags() }
  }

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`Delete tag "${tag.name}"?`)) return
    const { error } = await supabase.schema('crm').from('tags').delete().eq('id', tag.id)
    if (error) toast.error(error.message)
    else { toast.success('Tag deleted'); fetchTags() }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Tags</h1>
          <p className="text-zinc-400 text-sm mt-1">Organise contacts with colored labels</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> New Tag</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Tag</DialogTitle></DialogHeader>
            <TagForm onSave={handleCreate} onClose={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : tags.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <div className="w-10 h-10 mx-auto mb-3 opacity-40 flex items-center justify-center"><span className="text-3xl">🏷️</span></div>
          <p>No tags yet. Create your first tag!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map(tag => (
            <div
              key={tag.id}
              className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
            >
              <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
              <span className="flex-1 text-zinc-100 font-medium">{tag.name}</span>
              <span className="text-xs font-mono text-zinc-500">{tag.color}</span>

              <button
                onClick={() => setEditTag(tag)}
                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(tag)}
                className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editTag} onOpenChange={open => { if (!open) setEditTag(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Tag</DialogTitle></DialogHeader>
          {editTag && (
            <TagForm
              initial={editTag}
              onSave={handleUpdate}
              onClose={() => setEditTag(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
