import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, Layers, Users, FileText,
  MessageSquare, Settings, LogOut, Zap,
  FolderKanban, Quote, Workflow, Rocket, Sparkles, Inbox
} from 'lucide-react'

const navItems = [
  { to: '/admin',              label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/admin/services',     label: 'Services',     icon: Layers },
  { to: '/admin/projects',     label: 'Projects',     icon: FolderKanban },
  { to: '/admin/founders',     label: 'Founders',     icon: Users },
  { to: '/admin/testimonials', label: 'Testimonials', icon: Quote },
  { to: '/admin/process',      label: 'Our Process',  icon: Workflow },
  { to: '/admin/content',      label: 'Content',      icon: FileText },
  { to: '/admin/promotions',   label: 'Promotions',   icon: Rocket },
  { to: '/admin/early-access', label: 'Early Access', icon: Sparkles },
  { to: '/admin/enquiries',    label: 'Enquiries',    icon: Inbox },
  { to: '/admin/chatbot',      label: 'Chatbot KB',   icon: MessageSquare },
  { to: '/admin/settings',     label: 'Settings',     icon: Settings },
]

export default function AdminLayout() {
  const { clear, user } = useAuthStore()
  const qc = useQueryClient()
  const navigate = useNavigate()

  async function handleLogout() {
    // Tell the server to clear the HttpOnly cookie. Ignore network errors —
    // we're logging out either way.
    try { await adminApi.logout() } catch {}
    clear()
    qc.clear()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-bb-black font-jakarta">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-white/[0.06] flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <img src="/logo.svg" alt="CodeLifeAI" width="408" height="110" className="h-7 w-auto" />
          <p className="text-[0.7rem] text-bb-muted mt-2 tracking-widest uppercase">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-bb-accent/10 text-bb-accent border border-bb-accent/20'
                    : 'text-bb-muted hover:text-bb-white hover:bg-white/[0.04]'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-semibold text-bb-white truncate">{user?.username || 'Admin'}</p>
            <p className="text-[0.68rem] text-bb-muted">Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-bb-muted hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
