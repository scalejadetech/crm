'use client'

import { useEffect, useState, useRef } from 'react'
import { rtdb } from '@/lib/firebase'
import { ref, push, get, remove, child } from 'firebase/database'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { FileText, Upload, Trash2, Eye, X, Loader2, AlertTriangle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface MdFile {
  id: string
  name: string
  content: string
  size: number
  createdAt: number
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(2)} MB`
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function MdPage() {
  const { user } = useAuth()
  const [files, setFiles] = useState<MdFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [viewing, setViewing] = useState<MdFile | null>(null)
  const [confirmErase, setConfirmErase] = useState(false)
  const [erasing, setErasing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const userPath = `md_files/${user?.id}`

  async function fetchFiles() {
    if (!user?.id) return
    setLoading(true)
    try {
      const snap = await get(ref(rtdb, userPath))
      if (!snap.exists()) { setFiles([]); setLoading(false); return }
      const data = snap.val() as Record<string, Omit<MdFile, 'id'>>
      const list = Object.entries(data)
        .map(([id, val]) => ({ id, ...val }))
        .sort((a, b) => b.createdAt - a.createdAt)
      setFiles(list)
    } catch {
      toast.error('Failed to load files')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (user?.id) fetchFiles()
  }, [user?.id])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []).filter(f => f.name.endsWith('.md'))
    if (!picked.length) { toast.error('Only .md files are accepted'); return }
    setUploading(true)
    for (const file of picked) {
      try {
        const content = await file.text()
        await push(ref(rtdb, userPath), {
          name: file.name,
          content,
          size: file.size,
          createdAt: Date.now(),
        })
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    toast.success(`${picked.length} file${picked.length > 1 ? 's' : ''} uploaded`)
    setUploading(false)
    e.target.value = ''
    fetchFiles()
  }

  async function handleDelete(file: MdFile) {
    try {
      await remove(child(ref(rtdb, userPath), file.id))
      toast.success(`${file.name} deleted`)
      if (viewing?.id === file.id) setViewing(null)
      setFiles(prev => prev.filter(f => f.id !== file.id))
    } catch {
      toast.error(`Failed to delete ${file.name}`)
    }
  }

  async function handleEraseAll() {
    setErasing(true)
    try {
      await remove(ref(rtdb, userPath))
      toast.success('All files erased')
      setFiles([])
      setViewing(null)
    } catch {
      toast.error('Failed to erase all files')
    }
    setConfirmErase(false)
    setErasing(false)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Markdown Files</h1>
          <p className="text-zinc-400 text-sm mt-1">{files.length} file{files.length !== 1 ? 's' : ''} stored</p>
        </div>

        <div className="flex items-center gap-2">
          {files.length > 0 && (
            <button
              onClick={() => setConfirmErase(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Erase all
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload .md
          </button>
          <input ref={fileInputRef} type="file" accept=".md" multiple className="hidden" onChange={handleUpload} />
        </div>
      </div>

      {/* Confirm erase */}
      {confirmErase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <h2 className="text-zinc-100 font-semibold">Erase all files?</h2>
            </div>
            <p className="text-zinc-400 text-sm mb-6">
              This will permanently delete all {files.length} file{files.length !== 1 ? 's' : ''} from the database. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmErase(false)} className="px-4 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleEraseAll}
                disabled={erasing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
              >
                {erasing && <Loader2 className="w-4 h-4 animate-spin" />}
                Erase all
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-10 h-10 text-zinc-700 mb-3" />
          <p className="text-zinc-500 text-sm">No markdown files yet</p>
          <p className="text-zinc-600 text-xs mt-1">Upload a .md file to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {files.map(f => (
            <div
              key={f.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3"
            >
              <FileText className="w-5 h-5 text-zinc-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-zinc-200 text-sm font-medium truncate">{f.name}</p>
                <p className="text-zinc-600 text-xs mt-0.5">
                  {formatBytes(f.size)} · {formatDate(f.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setViewing(f)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-400 hover:bg-zinc-800 transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(f)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col w-full max-w-2xl max-h-[80vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
              <p className="text-zinc-300 text-sm font-medium truncate">{viewing.name}</p>
              <button onClick={() => setViewing(null)} className="p-1 rounded text-zinc-500 hover:text-zinc-200 transition-colors ml-2 shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto text-zinc-300 text-sm leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-zinc-100 [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-100 [&_h2]:mb-2 [&_h3]:font-semibold [&_h3]:text-zinc-200 [&_h3]:mb-1 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_code]:bg-zinc-800 [&_code]:px-1 [&_code]:rounded [&_code]:text-indigo-300 [&_code]:text-xs [&_pre]:bg-zinc-800 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-3 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-600 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-400 [&_blockquote]:italic [&_a]:text-indigo-400 [&_a]:underline [&_hr]:border-zinc-700 [&_hr]:my-4 [&_strong]:text-zinc-100 [&_strong]:font-semibold">
              <ReactMarkdown>{viewing.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
