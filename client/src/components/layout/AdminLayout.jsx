import { useState } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, Layers, Users, FileText,
  MessageSquare, Settings, LogOut, ExternalLink,
  FolderKanban, Quote, Workflow, Rocket, Sparkles, Inbox, Radio,
  Menu, X
} from 'lucide-react'

const navItems = [
  { to: '/admin',               label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/admin/live-products', label: 'Live Products', icon: Radio },
  { to: '/admin/services',      label: 'Services',      icon: Layers },
  { to: '/admin/projects',      label: 'Projects',      icon: FolderKanban },
  { to: '/admin/founders',      label: 'Founders',      icon: Users },
  { to: '/admin/testimonials',  label: 'Testimonials',  icon: Quote },
  { to: '/admin/process',       label: 'Our Process',   icon: Workflow },
  { to: '/admin/content',       label: 'Content',       icon: FileText },
  { to: '/admin/promotions',    label: 'Promotions',    icon: Rocket },
  { to: '/admin/early-access',  label: 'Early Access',  icon: Sparkles },
  { to: '/admin/enquiries',     label: 'Enquiries',     icon: Inbox },
  { to: '/admin/chatbot',       label: 'Chatbot KB',    icon: MessageSquare },
  { to: '/admin/settings',      label: 'Settings',      icon: Settings },
]

export default function AdminLayout() {
  const { clear, user } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const qc = useQueryClient()
  const navigate = useNavigate()

  async function handleLogout() {
    try { await adminApi.logout() } catch {}
    clear()
    qc.clear()
    navigate('/admin/login')
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bb-black font-jakarta text-bb-white">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#0c0c1e]/90 backdrop-blur-md sticky top-0 z-40">
        <Link to="/admin" className="flex items-center gap-2 no-underline">
          <img src="/logo.svg" alt="CodeLifeAI" width="408" height="110" className="h-6 w-auto" />
          <span className="text-[0.65rem] font-bold tracking-widest uppercase text-bb-accent px-2 py-0.5 rounded bg-bb-accent/10 border border-bb-accent/20">
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="View live portfolio"
            className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-bb-muted hover:text-bb-white transition-colors"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle navigation"
            className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-bb-white hover:bg-white/[0.1] transition-colors"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar (Desktop + Mobile Slide-over) */}
      <aside
        className={`fixed md:static top-0 bottom-0 left-0 z-50 w-64 flex-shrink-0 border-r border-white/[0.06] bg-[#090915] md:bg-transparent flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo (Desktop) */}
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <Link to="/admin" className="no-underline">
              <img src="/logo.svg" alt="CodeLifeAI" width="408" height="110" className="h-7 w-auto" />
            </Link>
            <p className="text-[0.68rem] text-bb-muted mt-2 tracking-widest uppercase">Admin Panel</p>
          </div>
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-bb-muted hover:text-white p-1"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Live Site Quick Link */}
        <div className="px-3 pt-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-bb-muted hover:text-bb-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all no-underline group"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              View Live Website
            </span>
            <ExternalLink size={12} className="text-white/40 group-hover:text-bb-accent transition-colors" />
          </a>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
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

        {/* User + Logout footer */}
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <div className="px-3 py-1.5 mb-1">
            <p className="text-xs font-semibold text-bb-white truncate">{user?.username || 'Admin'}</p>
            <p className="text-[0.68rem] text-bb-muted">Signed In · Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-bb-muted hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

