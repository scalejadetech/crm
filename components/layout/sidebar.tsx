'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Users, Tag, Kanban, LayoutDashboard, LogOut, Building2, HardDrive, FileCode2, ChevronLeft, ChevronRight, Settings, Sun, Moon, FileText, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { toast } from 'sonner'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/contacts', label: 'Contacts', icon: Users },
  { href: '/dashboard/companies', label: 'Companies', icon: Building2 },
  { href: '/dashboard/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/dashboard/tags', label: 'Tags', icon: Tag },
  { href: '/dashboard/emails', label: 'Emails', icon: Mail },
  { href: '/dashboard/templates', label: 'Templates', icon: FileCode2 },
  { href: '/dashboard/md', label: 'Markdown', icon: FileText },
  { href: '/dashboard/storage', label: 'Storage', icon: HardDrive },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    router.push('/auth/login')
  }

  return (
    <aside className={cn(
      'flex flex-col bg-zinc-900 border-r border-zinc-800 h-full transition-all duration-300',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo + collapse toggle */}
      <div className="flex items-center h-16 border-b border-zinc-800 px-3 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-zinc-100 text-lg ml-2.5 flex-1 truncate">CRM</span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={cn(
            'p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors shrink-0',
            collapsed ? 'mx-auto' : 'ml-auto'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center rounded-lg text-sm font-medium transition-colors',
                collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
                active
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && label}
            </Link>
          )
        })}
      </nav>

      {/* User + sign out */}
      <div className="px-2 py-4 border-t border-zinc-800 space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-semibold text-white shrink-0">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-zinc-400 truncate">{user?.email}</span>
          </div>
        )}
        <button
          onClick={toggleTheme}
          title={collapsed ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : undefined}
          className={cn(
            'flex items-center w-full rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors',
            collapsed ? 'justify-center px-2 py-2.5' : 'gap-2 px-3 py-2'
          )}
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4 shrink-0" />
            : <Moon className="w-4 h-4 shrink-0" />}
          {!collapsed && (theme === 'dark' ? 'Light mode' : 'Dark mode')}
        </button>
        <button
          onClick={handleSignOut}
          title={collapsed ? 'Sign out' : undefined}
          className={cn(
            'flex items-center w-full rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors',
            collapsed ? 'justify-center px-2 py-2.5' : 'gap-2 px-3 py-2'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </aside>
  )
}
