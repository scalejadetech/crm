'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Kanban, LayoutDashboard, Building2, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/contacts', label: 'Contacts', icon: Users },
  { href: '/dashboard/companies', label: 'Companies', icon: Building2 },
  { href: '/dashboard/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/dashboard/emails', label: 'Emails', icon: Mail },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900 border-t border-zinc-800 md:hidden">
      <div className="flex overflow-x-auto scrollbar-none">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-shrink-0 flex flex-col items-center justify-center py-3 px-5 gap-1 text-xs font-medium transition-colors',
                active ? 'text-indigo-400' : 'text-zinc-500'
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
