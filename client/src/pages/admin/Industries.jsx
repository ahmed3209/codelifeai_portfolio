import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import ImageUploadInput from '../../components/ui/ImageUploadInput'
import {
  Pencil,
  Trash2,
  Plus,
  Home,
  Check,
  ExternalLink,
  Building2,
  Search,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { INDUSTRY_ICON_MAP } from '../../lib/industryIcons'

const EMPTY_INDUSTRY = {
  title: '',
  slug: '',
  icon: 'Building2',
  badge: 'ENTERPRISE VERTICAL',
  short_desc: '',
  long_desc: '',
  challenges: '[]',
  solutions: '[]',
  features: '[]',
  stack: '[]',
  metrics: '[]',
  image_url: '',
  show_on_home: 1,
  sort_order: 0,
}

function parseJsonOrLines(val) {
  if (Array.isArray(val)) return val
  try {
    const p = JSON.parse(val)
    if (Array.isArray(p)) return p
  } catch {}
  if (typeof val === 'string') {
    return val.split('\n').map(s => s.trim()).filter(Boolean)
  }
  return []
}

function stringifyLines(arr) {
  if (!arr) return ''
  if (Array.isArray(arr)) return arr.join('\n')
  try {
    const p = JSON.parse(arr)
    if (Array.isArray(p)) return p.join('\n')
  } catch {}
  return String(arr)
}

function stringifyComma(arr) {
  if (!arr) return ''
  if (Array.isArray(arr)) return arr.join(', ')
  try {
    const p = JSON.parse(arr)
    if (Array.isArray(p)) return p.join(', ')
  } catch {}
  return String(arr)
}

export default function AdminIndustries() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null) // 'create' | 'edit'
  const [form, setForm] = useState(EMPTY_INDUSTRY)
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')

  // Query industries from backend
  const { data: industries = [], isLoading } = useQuery({
    queryKey: ['admin-industries'],
    queryFn: () => adminApi.getIndustries().then(r => r.data),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-industries'] })
    qc.invalidateQueries({ queryKey: ['site-data'] })
  }

  const createMut = useMutation({
    mutationFn: adminApi.createIndustry,
    onSuccess: () => {
      invalidate()
      setModal(null)
      toast.success('Industry vertical created successfully!')
    },
    onError: (err) => toast.error(err.message || 'Failed to create industry'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, d }) => adminApi.updateIndustry(id, d),
    onSuccess: () => {
      invalidate()
      setModal(null)
      toast.success('Industry updated successfully!')
    },
    onError: (err) => toast.error(err.message || 'Failed to update industry'),
  })

  const deleteMut = useMutation({
    mutationFn: adminApi.deleteIndustry,
    onSuccess: () => {
      invalidate()
      toast.success('Industry deleted successfully!')
    },
    onError: (err) => toast.error(err.message || 'Failed to delete industry'),
  })

  const toggleHomeMut = useMutation({
    mutationFn: ({ id, show_on_home }) => adminApi.toggleIndustryHome(id, show_on_home),
    onSuccess: (data) => {
      invalidate()
      toast.success(data.data?.show_on_home ? 'Shown on Home & Navigation' : 'Hidden from Navigation')
    },
    onError: () => toast.error('Failed to toggle visibility'),
  })

  const seedMut = useMutation({
    mutationFn: adminApi.seedIndustries,
    onSuccess: (data) => {
      invalidate()
      toast.success(data?.data?.message || 'Default industry verticals loaded successfully!')
    },
    onError: (err) => toast.error(err.message || 'Failed to load default industries'),
  })

  // Open Create Modal
  function openCreate() {
    setForm({
      ...EMPTY_INDUSTRY,
      challenges: '',
      solutions: '',
      features: '',
      stack: '',
      metrics: '',
      show_on_home: 1,
      sort_order: industries.length + 1,
    })
    setEditId(null)
    setModal('create')
  }

  // Open Edit Modal
  function openEdit(ind) {
    setForm({
      ...ind,
      slug: ind.slug || (ind.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      challenges: stringifyLines(ind.challenges),
      solutions: stringifyLines(ind.solutions),
      features: stringifyLines(ind.features),
      stack: stringifyComma(ind.stack),
      metrics: typeof ind.metrics === 'string' ? ind.metrics : JSON.stringify(ind.metrics || []),
      image_url: ind.image_url || '',
      show_on_home: ind.show_on_home !== 0 ? 1 : 0,
    })
    setEditId(ind.id)
    setModal('edit')
  }

  function handleTitleChange(title) {
    const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    setForm(prev => ({
      ...prev,
      title,
      slug: prev.slug === '' || prev.slug === (prev.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') ? autoSlug : prev.slug,
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')

    const cleanSlug = (form.slug || form.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    // Parse array fields
    const challengesArr = form.challenges.split('\n').map(s => s.trim()).filter(Boolean)
    const solutionsArr = form.solutions.split('\n').map(s => s.trim()).filter(Boolean)
    const featuresArr = form.features.split('\n').map(s => s.trim()).filter(Boolean)
    const stackArr = form.stack.split(',').map(s => s.trim()).filter(Boolean)

    let metricsArr = []
    try {
      metricsArr = JSON.parse(form.metrics)
    } catch {
      metricsArr = form.metrics ? [{ label: 'Performance', value: form.metrics }] : []
    }

    const payload = {
      title: form.title.trim(),
      slug: cleanSlug,
      icon: form.icon || 'Building2',
      badge: form.badge || 'ENTERPRISE VERTICAL',
      short_desc: form.short_desc || '',
      long_desc: form.long_desc || '',
      challenges: JSON.stringify(challengesArr),
      solutions: JSON.stringify(solutionsArr),
      features: JSON.stringify(featuresArr),
      stack: JSON.stringify(stackArr),
      metrics: JSON.stringify(metricsArr),
      image_url: form.image_url || '',
      show_on_home: form.show_on_home ? 1 : 0,
      sort_order: Number(form.sort_order) || 0,
    }

    if (modal === 'create') {
      createMut.mutate(payload)
    } else {
      updateMut.mutate({ id: editId, d: payload })
    }
  }

  function handleDelete(ind) {
    if (confirm(`Are you sure you want to delete the "${ind.title}" industry vertical?`)) {
      deleteMut.mutate(ind.id)
    }
  }

  // Filtered list
  const filtered = useMemo(() => {
    if (!search.trim()) return industries
    const q = search.toLowerCase()
    return industries.filter(ind =>
      (ind.title || '').toLowerCase().includes(q) ||
      (ind.slug || '').toLowerCase().includes(q) ||
      (ind.badge || '').toLowerCase().includes(q) ||
      (ind.short_desc || '').toLowerCase().includes(q)
    )
  }, [industries, search])

  const visibleCount = industries.filter(ind => ind.show_on_home !== 0).length

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00cced]/10 border border-[#00cced]/30 text-xs font-mono font-bold uppercase tracking-wider text-[#00f0ff] mb-2">
            <Building2 size={13} className="text-[#00f0ff]" />
            <span>Vertical Domain Management</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Industry Verticals</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage industry solutions, challenges, deliverables, tech stacks, and dedicated high-converting landing pages.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={() => seedMut.mutate()}
            disabled={seedMut.isPending}
            className="btn-secondary flex items-center gap-2 py-3 px-4 text-xs font-mono border-white/20 hover:border-[#00cced]/60"
            title="Seed or restore 8 default industry verticals"
          >
            <Sparkles size={14} className={seedMut.isPending ? 'animate-spin text-[#00f0ff]' : 'text-[#00f0ff]'} />
            <span>{seedMut.isPending ? 'Loading Verticals...' : 'Load 8 Default Verticals'}</span>
          </Button>
          <Button
            onClick={openCreate}
            className="btn-primary flex items-center gap-2 py-3 px-5 text-sm shadow-[0_0_20px_rgba(0,204,237,0.3)]"
          >
            <Plus size={16} />
            <span>Add New Industry</span>
          </Button>
        </div>
      </div>

      {/* ── Quick KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">TOTAL VERTICALS</div>
            <div className="text-2xl font-black text-white mt-1">{industries.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#00cced]/10 border border-[#00cced]/30 flex items-center justify-center text-[#00f0ff]">
            <Building2 size={20} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">VISIBLE IN NAV / HOME</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{visibleCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Check size={20} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">PUBLIC HUB</div>
            <a
              href="/industries"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-bold text-[#00f0ff] hover:underline flex items-center gap-1.5 mt-1"
            >
              <span>View Public /industries</span>
              <ExternalLink size={13} />
            </a>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Sparkles size={20} />
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search industries by name, slug, badge, or description..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00cced]"
        />
      </div>

      {/* ── Industry Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filtered.map((ind, idx) => {
          const IconComp = INDUSTRY_ICON_MAP[ind.icon] || Building2
          const challenges = parseJsonOrLines(ind.challenges)
          const solutions = parseJsonOrLines(ind.solutions)
          const features = parseJsonOrLines(ind.features)
          const stack = parseJsonOrLines(ind.stack)

          return (
            <div
              key={ind.id}
              className="rounded-2xl bg-gradient-to-b from-[#091526] to-[#050b14] border border-white/[0.09] hover:border-[#00cced]/60 transition-all p-6 shadow-xl space-y-4 group"
            >
              {/* Header row: Icon, Title, Badge, Actions */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#00cced]/15 border border-[#00cced]/35 flex items-center justify-center text-[#00f0ff] flex-shrink-0 group-hover:bg-[#00cced]/25 transition-colors">
                    <IconComp size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white group-hover:text-[#00f0ff] transition-colors">
                        {ind.title}
                      </h3>
                      {ind.badge && (
                        <span className="text-[0.65rem] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00cced]/10 border border-[#00cced]/30 text-[#00f0ff]">
                          {ind.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-slate-400">/{ind.slug}</span>
                      <a
                        href={`/industries/${ind.slug || ind.id}`}
                        target="_blank"
                        rel="noreferrer"
                        title="View Public Page"
                        className="text-slate-400 hover:text-[#00f0ff] transition-colors"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Edit, Delete, Toggle Home */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleHomeMut.mutate({ id: ind.id, show_on_home: ind.show_on_home === 0 ? 1 : 0 })}
                    title={ind.show_on_home !== 0 ? 'Visible on Navbar & Home' : 'Hidden from Navbar'}
                    className={`p-2 rounded-lg border text-xs transition-colors ${
                      ind.show_on_home !== 0
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/[0.03] border-white/[0.08] text-slate-500 hover:text-white'
                    }`}
                  >
                    <Home size={14} />
                  </button>
                  <button
                    onClick={() => openEdit(ind)}
                    title="Edit Industry"
                    className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.09] text-slate-300 hover:text-[#00f0ff] hover:bg-[#00cced]/10 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(ind)}
                    title="Delete Industry"
                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Short Description */}
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {ind.short_desc}
              </p>

              {/* Counts & Tags */}
              <div className="flex items-center gap-3 text-[0.72rem] font-mono text-slate-400 border-t border-white/[0.06] pt-3 flex-wrap">
                <span className="text-slate-300">
                  <strong className="text-white">{challenges.length}</strong> Challenges
                </span>
                <span>•</span>
                <span className="text-slate-300">
                  <strong className="text-white">{solutions.length}</strong> Solutions
                </span>
                <span>•</span>
                <span className="text-slate-300">
                  <strong className="text-white">{features.length}</strong> Deliverables
                </span>
              </div>

              {/* Tech stack badges */}
              {stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {stack.slice(0, 5).map((t, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded text-[0.68rem] font-mono bg-white/[0.04] border border-white/[0.08] text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                  {stack.length > 5 && (
                    <span className="text-[0.65rem] font-mono text-[#00f0ff] px-1.5 py-0.5">
                      +{stack.length - 5}
                    </span>
                  )}
                </div>
              )}

              {/* Footer link */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[0.70rem]">Sort Order: {ind.sort_order}</span>
                <a
                  href={`/industries/${ind.slug || ind.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#00f0ff] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Preview Page</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Empty State: When no industries exist ── */}
      {industries.length === 0 && !isLoading && (
        <div className="text-center py-16 px-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#00cced]/10 border border-[#00cced]/30 flex items-center justify-center text-[#00f0ff] mx-auto">
            <Building2 size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">No Industry Verticals Found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Your industries table is currently empty. Click below to instantly load all 8 enterprise verticals (E-Commerce, Healthcare, EdTech, Logistics, Mobility, Fintech, Travel, and Professional Services).
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
            <Button
              onClick={() => seedMut.mutate()}
              disabled={seedMut.isPending}
              className="btn-primary flex items-center gap-2 py-3 px-6 text-sm"
            >
              <Sparkles size={16} />
              <span>{seedMut.isPending ? 'Loading Verticals...' : 'Load 8 Default Verticals Now'}</span>
            </Button>
            <Button
              onClick={openCreate}
              className="btn-secondary flex items-center gap-2 py-3 px-5 text-sm"
            >
              <Plus size={16} />
              <span>Create Custom Vertical</span>
            </Button>
          </div>
        </div>
      )}

      {/* ── Empty State: When search has no matches ── */}
      {industries.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 px-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
          <p className="text-slate-400 text-sm">
            No industry verticals matched your search: <span className="text-white font-semibold">"{search}"</span>
          </p>
        </div>
      )}

      {/* ── CREATE / EDIT MODAL ── */}
      {modal && (
        <Modal
          open={!!modal}
          onClose={() => setModal(null)}
          title={modal === 'create' ? 'Create Industry Vertical' : `Edit: ${form.title}`}
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Industry Title *
                </label>
                <Input
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="e.g. Healthcare & Life Sciences"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  URL Slug
                </label>
                <Input
                  value={form.slug}
                  onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                  placeholder="e.g. healthcare-life-sciences"
                />
              </div>
            </div>

            {/* Icon, Badge, Sort Order */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Icon
                </label>
                <select
                  value={form.icon}
                  onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#00cced]"
                >
                  {Object.keys(INDUSTRY_ICON_MAP).map(k => (
                    <option key={k} value={k} className="bg-[#091526] text-white">
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Badge
                </label>
                <Input
                  value={form.badge}
                  onChange={e => setForm(p => ({ ...p, badge: e.target.value }))}
                  placeholder="e.g. HIPAA COMPLIANT"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Sort Order
                </label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value, 10) || 0 }))}
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Short Description (Cards &amp; Mega Menu)
              </label>
              <Textarea
                rows={2}
                value={form.short_desc}
                onChange={e => setForm(p => ({ ...p, short_desc: e.target.value }))}
                placeholder="High-conversion headless commerce, unified checkout & sub-second catalog search."
              />
            </div>

            {/* Long Description */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Detailed Engineering Overview (Landing Page)
              </label>
              <Textarea
                rows={4}
                value={form.long_desc}
                onChange={e => setForm(p => ({ ...p, long_desc: e.target.value }))}
                placeholder="Detailed breakdown of how we engineer solutions for this industry domain..."
              />
            </div>

            {/* Challenges & Solutions (2 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Industry Challenges (1 per line)
                </label>
                <Textarea
                  rows={4}
                  value={form.challenges}
                  onChange={e => setForm(p => ({ ...p, challenges: e.target.value }))}
                  placeholder="Strict regulatory compliance penalties&#10;Slow legacy database architectures&#10;Disjointed third-party APIs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Our Engineering Solutions (1 per line)
                </label>
                <Textarea
                  rows={4}
                  value={form.solutions}
                  onChange={e => setForm(p => ({ ...p, solutions: e.target.value }))}
                  placeholder="SOC2 & HIPAA audited cloud pipelines&#10;Low-latency microservices architectures&#10;Bi-directional real-time API gateways"
                />
              </div>
            </div>

            {/* Features / Deliverables & Stack */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Specialized Deliverables (1 per line)
                </label>
                <Textarea
                  rows={4}
                  value={form.features}
                  onChange={e => setForm(p => ({ ...p, features: e.target.value }))}
                  placeholder="HIPAA-Compliant Patient Portals&#10;HL7 / FHIR EMR Connectors&#10;Medical IoT Telemetry Pipelines"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Tech Stack (Comma-separated)
                </label>
                <Textarea
                  rows={4}
                  value={form.stack}
                  onChange={e => setForm(p => ({ ...p, stack: e.target.value }))}
                  placeholder="React, Node.js, Python, PostgreSQL, Redis, Docker, AWS"
                />
              </div>
            </div>

            {/* Key Metrics & Image URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Key Metrics (JSON Array)
                </label>
                <Input
                  value={form.metrics}
                  onChange={e => setForm(p => ({ ...p, metrics: e.target.value }))}
                  placeholder='[{"label":"Compliance Standard","value":"100% HIPAA"}]'
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Cover Image URL
                </label>
                <Input
                  value={form.image_url}
                  onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>
            </div>

            {/* Show on Home & Nav Switch */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <input
                type="checkbox"
                id="show_on_home"
                checked={form.show_on_home === 1}
                onChange={e => setForm(p => ({ ...p, show_on_home: e.target.checked ? 1 : 0 }))}
                className="w-4 h-4 rounded text-[#00f0ff] focus:ring-[#00f0ff] bg-black/50 border-white/20"
              />
              <label htmlFor="show_on_home" className="text-sm font-semibold text-white cursor-pointer">
                Display in Navbar Dropdown &amp; Homepage Industry Sections
              </label>
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModal(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-primary py-2.5 px-6 text-sm"
                disabled={createMut.isPending || updateMut.isPending}
              >
                {modal === 'create' ? 'Create Industry Vertical' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  )
}
