import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import { Layers, Users, MessageSquare, Mail, ExternalLink } from 'lucide-react'

export default function AdminDashboard() {
  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminApi.getStats().then(r => r.data) })

  const tiles = [
    { label: 'Services',      value: stats?.services  ?? '—', icon: Layers,        color: 'text-bb-accent' },
    { label: 'Founders',      value: stats?.founders  ?? '—', icon: Users,         color: 'text-purple-400' },
    { label: 'KB Documents',  value: stats?.kb_docs   ?? '—', icon: MessageSquare, color: 'text-green-400' },
    { label: 'Enquiries',     value: stats?.contacts  ?? '—', icon: Mail,          color: 'text-yellow-400' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-bb-white tracking-tight">Dashboard</h1>
        <p className="text-bb-muted text-sm mt-1">Welcome back. Here's your site overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map(t => (
          <Card key={t.label}>
            <CardBody className="flex items-center gap-4">
              <div className={`p-2 rounded-lg bg-white/[0.04] ${t.color}`}>
                <t.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-bb-white">{t.value}</p>
                <p className="text-xs text-bb-muted">{t.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Quick links */}
      <Card>
        <CardBody>
          <h2 className="text-sm font-bold text-bb-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { to: '/admin/services', label: 'Manage Services',  desc: 'Add, edit, or remove services' },
              { to: '/admin/founders', label: 'Update Team',       desc: 'Edit founder profiles & photos' },
              { to: '/admin/content',  label: 'Edit Content',      desc: 'Hero text, CTAs, social links' },
              { to: '/admin/chatbot',  label: 'Chatbot KB',        desc: 'Upload knowledge base docs' },
              { to: '/admin/settings', label: 'Settings',          desc: 'API keys, password, config' },
              { to: '/',               label: 'View Live Site',     desc: 'Open the public portfolio', external: true },
            ].map(item => (
              <a key={item.to} href={item.to} target={item.external ? '_blank' : undefined} rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.03] transition-all no-underline group">
                <div>
                  <p className="text-sm font-semibold text-bb-white group-hover:text-bb-accent transition-colors">{item.label}</p>
                  <p className="text-xs text-bb-muted mt-0.5">{item.desc}</p>
                </div>
                {item.external && <ExternalLink size={14} className="text-bb-muted ml-auto mt-0.5 flex-shrink-0" />}
              </a>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
