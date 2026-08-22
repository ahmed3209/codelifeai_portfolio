import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import {
  Layers, Users, MessageSquare, Mail, ExternalLink,
  FolderKanban, Quote, Sparkles, Eye, Activity, Bot,
  Radio, Rocket, RefreshCw, Clock, Globe, ArrowUpRight,
  TrendingUp, Compass
} from 'lucide-react'

function formatTimeAgo(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z')
  if (isNaN(date.getTime())) return dateString
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diffSec < 15) return 'Just now'
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function parseDeviceFromUa(ua) {
  if (!ua) return 'Desktop'
  if (/mobile|iphone|ipod|android.*mobile/i.test(ua)) return 'Mobile'
  if (/tablet|ipad|android/i.test(ua)) return 'Tablet'
  if (/macintosh/i.test(ua)) return 'Mac'
  if (/windows/i.test(ua)) return 'Windows'
  if (/linux/i.test(ua)) return 'Linux'
  return 'Desktop'
}

export default function AdminDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true)

  const { data: stats, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then(r => r.data),
    refetchInterval: autoRefresh ? 5000 : false,
  })

  const liveVisitors = stats?.visitors_live ?? 0
  const active24h = stats?.visitors_24h ?? 0
  const totalVisitors = stats?.visitors_total ?? 0
  const totalPageviews = stats?.pageviews_total ?? 0
  const pageviews24h = stats?.pageviews_24h ?? 0

  const primaryStats = [
    {
      label: 'Live Online Now (5m)',
      value: liveVisitors,
      icon: Eye,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      badge: 'Real-time',
      pulse: liveVisitors > 0,
    },
    {
      label: 'Active Visitors (24h)',
      value: active24h,
      icon: Activity,
      color: 'text-[#00d4f5]',
      bg: 'bg-[#00d4f5]/10 border-[#00d4f5]/20',
      badge: 'Past 24 Hours',
    },
    {
      label: 'Total Unique Visitors',
      value: totalVisitors,
      icon: Globe,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      badge: 'All-time Unique',
    },
    {
      label: 'Total Pageviews',
      value: totalPageviews,
      subValue: pageviews24h > 0 ? `+${pageviews24h} today` : undefined,
      icon: TrendingUp,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      badge: 'Pageviews Tracked',
    },
  ]

  const entityStats = [
    { label: 'Live Products',       value: stats?.live_products      ?? 0, icon: Radio,          to: '/admin/live-products', color: 'text-emerald-400' },
    { label: 'Services Offered',    value: stats?.services           ?? 0, icon: Layers,         to: '/admin/services',      color: 'text-bb-accent' },
    { label: 'Projects Built',      value: stats?.projects           ?? 0, icon: FolderKanban,   to: '/admin/projects',      color: 'text-sky-400' },
    { label: 'Client Testimonials', value: stats?.testimonials       ?? 0, icon: Quote,          to: '/admin/testimonials',  color: 'text-pink-400' },
    { label: 'Team Founders',       value: stats?.founders           ?? 0, icon: Users,          to: '/admin/founders',      color: 'text-purple-400' },
    { label: 'Promos & Launches',   value: stats?.promos             ?? 0, icon: Rocket,         to: '/admin/promotions',    color: 'text-amber-400' },
    { label: 'Client Enquiries',    value: stats?.contacts           ?? 0, icon: Mail,           to: '/admin/enquiries',     color: 'text-yellow-400' },
    { label: 'Early Access Leads',  value: stats?.early_access       ?? 0, icon: Sparkles,       to: '/admin/early-access',  color: 'text-bb-accent' },
    { label: 'Chatbot KB Docs',     value: stats?.kb_docs            ?? 0, icon: MessageSquare,  to: '/admin/chatbot',       color: 'text-green-400' },
    { label: 'Chat Conversations',  value: stats?.chat_conversations ?? 0, icon: Bot,            to: '/admin/chatbot',       color: 'text-indigo-400' },
  ]

  const quickActions = [
    { to: '/admin/live-products', label: 'Live Products Slider', desc: 'Top-right animated showcase cards', icon: Radio },
    { to: '/admin/services',      label: 'Manage Services',      desc: 'Add, edit, or reorder services',   icon: Layers },
    { to: '/admin/projects',      label: 'Manage Projects',      desc: 'Edit "What We\'ve Built" work',    icon: FolderKanban },
    { to: '/admin/testimonials',  label: 'Testimonials',         desc: 'Client reviews carousel',          icon: Quote },
    { to: '/admin/process',       label: 'Our Process',          desc: 'Edit the 4-step workflow',         icon: Compass },
    { to: '/admin/promotions',    label: 'Promos & Launches',    desc: 'Launch countdowns & teasers',      icon: Rocket },
    { to: '/admin/early-access',  label: 'Early Access Leads',   desc: 'ZYRA AI early access requests',    icon: Sparkles },
    { to: '/admin/enquiries',     label: 'Enquiries Inbox',      desc: 'Client contact submissions',       icon: Mail },
    { to: '/admin/content',       label: 'Site Content',         desc: 'Hero text, CTAs, social links',    icon: Globe },
    { to: '/admin/chatbot',       label: 'Chatbot Knowledge',    desc: 'AI context & FAQ documents',       icon: MessageSquare },
    { to: '/admin/settings',      label: 'Settings & Gemini',    desc: 'API keys, password, model',        icon: Activity },
    { to: '/',                    label: 'View Live Site ↗',     desc: 'Open public website in new tab',   icon: ExternalLink, external: true },
  ]

  const recentActivity = stats?.recent_activity || []
  const topPages = stats?.top_pages || []

  return (
    <div className="space-y-8">
      {/* Header with live status and refresh controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-bb-white tracking-tight flex items-center gap-3">
            Dashboard
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Analytics Active
            </span>
          </h1>
          <p className="text-bb-muted text-sm mt-1">
            Real-time traffic and performance overview for CodeLifeAI.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <label className="flex items-center gap-2 cursor-pointer select-none bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] px-3 py-2 rounded-xl text-xs text-bb-muted hover:text-bb-white transition-colors">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-white/[0.1] border-white/[0.2] text-bb-accent focus:ring-0"
            />
            <span>Auto-refresh (5s)</span>
          </label>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            loading={isFetching && !isLoading}
            title="Refresh analytics data"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Primary Real-Time Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryStats.map((s) => (
          <Card key={s.label} className="relative overflow-hidden group hover:border-white/[0.15] transition-all">
            <CardBody className="flex flex-col justify-between p-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[0.68rem] font-bold tracking-wider uppercase text-bb-muted">
                  {s.label}
                </span>
                <div className={`p-2 rounded-xl ${s.bg} ${s.color}`}>
                  <s.icon size={18} className={s.pulse ? 'animate-pulse' : ''} />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-bb-white tracking-tight">
                  {isLoading ? '—' : s.value}
                </span>
                {s.subValue && (
                  <span className="text-xs font-semibold text-emerald-400">
                    {s.subValue}
                  </span>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-[0.68rem] text-bb-muted">
                <span>{s.badge}</span>
                {s.pulse && (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live
                  </span>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Real-Time Live Activity & Top Pages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Stream */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-bb-accent" />
              <h2 className="text-sm font-bold text-bb-white">Real-Time Visitor Activity Stream</h2>
            </div>
            <span className="text-[0.68rem] text-bb-muted">Latest Pageviews</span>
          </CardHeader>
          <div className="divide-y divide-white/[0.05]">
            {recentActivity.length === 0 ? (
              <CardBody>
                <div className="py-8 text-center text-bb-muted text-sm">
                  <Activity size={28} className="mx-auto mb-2 opacity-30 text-bb-accent" />
                  <p className="text-bb-white font-medium">Waiting for visitor traffic</p>
                  <p className="text-xs mt-1">Live page views and navigation events will appear here in real time.</p>
                </div>
              </CardBody>
            ) : (
              recentActivity.map((act) => (
                <div key={act.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/[0.02] transition-colors text-xs">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-2 h-2 rounded-full bg-[#00d4f5]/60 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-bb-white truncate">
                          {act.path || '/'}
                        </span>
                        <span className="text-[0.65rem] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-bb-muted">
                          {parseDeviceFromUa(act.user_agent)}
                        </span>
                      </div>
                      {act.referrer && (
                        <p className="text-[0.68rem] text-bb-muted truncate mt-0.5">
                          From: {act.referrer}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[0.7rem] text-bb-muted whitespace-nowrap ml-3 font-mono">
                    {formatTimeAgo(act.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top Visited Pages */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-purple-400" />
              <h2 className="text-sm font-bold text-bb-white">Top Visited Pages</h2>
            </div>
          </CardHeader>
          <div className="divide-y divide-white/[0.05]">
            {topPages.length === 0 ? (
              <CardBody>
                <p className="text-xs text-bb-muted text-center py-6">No page views recorded yet.</p>
              </CardBody>
            ) : (
              topPages.map((pg, idx) => (
                <div key={pg.path || idx} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] text-xs">
                  <span className="font-mono text-bb-white truncate pr-2">
                    {pg.path}
                  </span>
                  <span className="text-xs font-bold text-bb-accent bg-bb-accent/10 border border-bb-accent/20 px-2 py-0.5 rounded-full flex-shrink-0">
                    {pg.count} view{pg.count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Portfolio Content Statistics */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-bb-muted mb-3">
          Site Content &amp; Entity Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {entityStats.map((e) => (
            <Link
              key={e.label}
              to={e.to}
              className="card-base p-4 flex flex-col justify-between hover:border-white/[0.15] transition-all no-underline group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg bg-white/[0.04] ${e.color} group-hover:scale-110 transition-transform`}>
                  <e.icon size={16} />
                </div>
                <ArrowUpRight size={13} className="text-white/20 group-hover:text-bb-white transition-colors" />
              </div>
              <div>
                <p className="text-2xl font-bold text-bb-white">{isLoading ? '—' : e.value}</p>
                <p className="text-[0.7rem] text-bb-muted group-hover:text-bb-white transition-colors mt-0.5 truncate">
                  {e.label}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions (SPA Links) */}
      <Card>
        <CardBody className="p-6">
          <h2 className="text-sm font-bold text-bb-white mb-4">Quick Management Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickActions.map((item) => {
              if (item.external) {
                return (
                  <a
                    key={item.to}
                    href={item.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3.5 p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.03] transition-all no-underline group"
                  >
                    <div className="p-2 rounded-lg bg-white/[0.04] text-emerald-400 group-hover:bg-emerald-400/15 transition-colors flex-shrink-0">
                      <item.icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-bb-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                        {item.label}
                      </p>
                      <p className="text-xs text-bb-muted mt-0.5">{item.desc}</p>
                    </div>
                  </a>
                )
              }

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-start gap-3.5 p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.03] transition-all no-underline group"
                >
                  <div className="p-2 rounded-lg bg-white/[0.04] text-bb-accent group-hover:bg-bb-accent/15 transition-colors flex-shrink-0">
                    <item.icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-bb-white group-hover:text-bb-accent transition-colors">
                      {item.label}
                    </p>
                    <p className="text-xs text-bb-muted mt-0.5">{item.desc}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

