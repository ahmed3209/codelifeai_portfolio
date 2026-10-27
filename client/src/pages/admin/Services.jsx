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
  Layers,
  ChevronDown,
  ChevronRight,
  FolderTree,
  List,
  Search,
  Sparkles,
  CornerDownRight,
  ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_SERVICE = {
  title: '',
  slug: '',
  parent_id: null,
  icon: '⚡',
  short_desc: '',
  long_desc: '',
  features: '[]',
  stack: '[]',
  image_url: '',
  show_on_home: 1,
  sort_order: 0,
}

export default function AdminServices() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null) // 'create-head' | 'create-child' | 'edit'
  const [form, setForm] = useState(EMPTY_SERVICE)
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [expandedHeads, setExpandedHeads] = useState({})
  const [activeTab, setActiveTab] = useState('hierarchy') // 'hierarchy' | 'flat'

  const { data: rawServices = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => adminApi.getServices().then(r => r.data),
  })

  const services = Array.isArray(rawServices) ? rawServices : []

  // Separate Head Services vs Child Services
  const { headServices, childServicesMap, allChildren } = useMemo(() => {
    const heads = []
    const childrenMap = {}
    const allC = []

    services.forEach(svc => {
      if (!svc || typeof svc !== 'object') return
      if (!svc.parent_id) {
        heads.push(svc)
        if (!childrenMap[svc.id]) childrenMap[svc.id] = []
      } else {
        allC.push(svc)
        if (!childrenMap[svc.parent_id]) childrenMap[svc.parent_id] = []
        childrenMap[svc.parent_id].push(svc)
      }
    })

    return { headServices: heads, childServicesMap: childrenMap, allChildren: allC }
  }, [services])

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-services'] })
    qc.invalidateQueries({ queryKey: ['site-data'] })
  }

  const createMut = useMutation({
    mutationFn: adminApi.createService,
    onSuccess: () => {
      invalidate()
      setModal(null)
      toast.success('Service created successfully!')
    },
    onError: (err) => toast.error(err.message || 'Failed to create service'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, d }) => adminApi.updateService(id, d),
    onSuccess: () => {
      invalidate()
      setModal(null)
      toast.success('Service updated successfully!')
    },
    onError: (err) => toast.error(err.message || 'Failed to update service'),
  })

  const deleteMut = useMutation({
    mutationFn: adminApi.deleteService,
    onSuccess: () => {
      invalidate()
      toast.success('Service deleted successfully!')
    },
    onError: (err) => toast.error(err.message || 'Failed to delete service'),
  })

  const toggleHomeMut = useMutation({
    mutationFn: ({ id, show_on_home }) => adminApi.toggleServiceHome(id, show_on_home),
    onSuccess: (data) => {
      invalidate()
      toast.success(data.data?.show_on_home ? 'Shown on Homepage' : 'Hidden from Homepage')
    },
    onError: () => toast.error('Failed to toggle homepage visibility'),
  })

  // Open Create Head Service Modal
  function openCreateHead() {
    setForm({
      ...EMPTY_SERVICE,
      parent_id: null,
      show_on_home: 1,
      sort_order: headServices.length + 1,
    })
    setEditId(null)
    setModal('create-head')
  }

  // Open Create Child Service Modal (optionally preselecting parent)
  function openCreateChild(parentId = null) {
    const selectedParent = parentId || (headServices[0]?.id || null)
    setForm({
      ...EMPTY_SERVICE,
      parent_id: selectedParent,
      show_on_home: 0,
      sort_order: (childServicesMap[selectedParent]?.length || 0) + 1,
    })
    setEditId(null)
    setModal('create-child')
  }

  // Open Edit Service Modal
  function openEdit(svc) {
    setForm({
      ...svc,
      parent_id: svc.parent_id || null,
      slug: svc.slug || (svc.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      features: typeof svc.features === 'string' ? svc.features : JSON.stringify(svc.features || []),
      stack: typeof svc.stack === 'string' ? svc.stack : JSON.stringify(svc.stack || []),
      image_url: svc.image_url || '',
      show_on_home: svc.show_on_home !== 0 ? 1 : 0,
    })
    setEditId(svc.id)
    setModal('edit')
  }

  function handleTitleChange(title) {
    const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    setForm(p => ({
      ...p,
      title,
      slug: p.slug && p.slug !== autoSlug && modal === 'edit' ? p.slug : autoSlug,
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      parent_id: form.parent_id ? parseInt(form.parent_id, 10) : null,
      image_url: (form.image_url || '').trim(),
      show_on_home: form.show_on_home ? 1 : 0,
      features: parseJsonField(form.features),
      stack: parseJsonField(form.stack),
    }

    if (modal === 'create-head' || modal === 'create-child') {
      createMut.mutate(payload)
    } else {
      updateMut.mutate({ id: editId, d: payload })
    }
  }

  function parseJsonField(val) {
    if (!val) return '[]'
    try {
      const parsed = JSON.parse(val)
      return JSON.stringify(parsed)
    } catch {
      return JSON.stringify(val.split('\n').map(s => s.trim()).filter(Boolean))
    }
  }

  function toggleAccordion(headId) {
    setExpandedHeads(prev => ({ ...prev, [headId]: !prev[headId] }))
  }

  const busy = createMut.isPending || updateMut.isPending

  // Filtered lists for search
  const filteredHeads = headServices.filter(h => {
    if (!search) return true
    const q = search.toLowerCase()
    const matchesHead = h.title.toLowerCase().includes(q) || (h.short_desc || '').toLowerCase().includes(q)
    const matchesChild = (childServicesMap[h.id] || []).some(c => c.title.toLowerCase().includes(q))
    return matchesHead || matchesChild
  })

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight flex items-center gap-2.5">
            <FolderTree size={26} className="text-[#00d4f5]" />
            <span>Services &amp; Capabilities</span>
          </h1>
          <p className="text-bb-muted text-sm mt-1">
            Manage Head Services (Core Domains) and Child Services (Sub-Capabilities). Changes reflect instantly on the public website and dropdowns.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" onClick={openCreateHead}>
            <Plus size={15} /> Add Head Service
          </Button>
          <Button onClick={() => openCreateChild()}>
            <Plus size={15} /> Add Sub-Service
          </Button>
        </div>
      </div>

      {/* ── Metrics Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00d4f5]/15 border border-[#00d4f5]/30 flex items-center justify-center text-[#00d4f5] font-bold">
            {headServices.length}
          </div>
          <div>
            <p className="text-xs text-bb-muted uppercase tracking-wider font-mono">Head Domains</p>
            <p className="text-base font-bold text-white">Main Categories</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
            {allChildren.length}
          </div>
          <div>
            <p className="text-xs text-bb-muted uppercase tracking-wider font-mono">Sub-Services</p>
            <p className="text-base font-bold text-white">Child Offerings</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            {headServices.filter(h => h.show_on_home !== 0).length}
          </div>
          <div>
            <p className="text-xs text-bb-muted uppercase tracking-wider font-mono">On Homepage</p>
            <p className="text-base font-bold text-white">Featured Cards</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
            {services.length}
          </div>
          <div>
            <p className="text-xs text-bb-muted uppercase tracking-wider font-mono">Total Services</p>
            <p className="text-base font-bold text-white">Database Records</p>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search head domains or sub-services…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.10] text-sm text-white focus:outline-none focus:border-[#00d4f5]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <button
            type="button"
            onClick={() => setActiveTab('hierarchy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'hierarchy' ? 'bg-[#00d4f5] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderTree size={13} />
            <span>Domain Hierarchy</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('flat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'flat' ? 'bg-[#00d4f5] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List size={13} />
            <span>All Services Table</span>
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      {isLoading ? (
        <Card><CardBody><p className="text-bb-muted text-sm py-8 text-center">Loading services hierarchy…</p></CardBody></Card>
      ) : activeTab === 'hierarchy' ? (
        /* ════════════════════════════════════════════════════════════
            HIERARCHICAL VIEW: Head Services with Child Sub-Services
        ════════════════════════════════════════════════════════════ */
        <div className="space-y-4">
          {filteredHeads.map(head => {
            const children = childServicesMap[head.id] || []
            const isExpanded = expandedHeads[head.id] !== false // Expanded by default
            const isHome = head.show_on_home !== 0

            return (
              <div
                key={head.id}
                className="rounded-2xl border border-white/[0.10] bg-[#081120] overflow-hidden shadow-lg transition-all"
              >
                {/* ── Head Service Bar ── */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap bg-white/[0.02] border-b border-white/[0.06]">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(head.id)}
                      className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                      title={isExpanded ? 'Collapse sub-services' : 'Expand sub-services'}
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {head.image_url ? (
                      <div className="w-12 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                        <img src={head.image_url} alt={head.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#00d4f5]/15 border border-[#00d4f5]/30 flex items-center justify-center text-[#00f0ff] font-bold text-lg flex-shrink-0">
                        {head.icon || '⚡'}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                          {head.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-mono font-bold bg-[#00d4f5]/10 border border-[#00d4f5]/30 text-[#00f0ff]">
                          HEAD SERVICE
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-mono bg-white/[0.05] border border-white/[0.08] text-slate-300">
                          {children.length} Sub-Services
                        </span>
                      </div>
                      <p className="text-xs text-bb-muted truncate mt-0.5 max-w-xl">
                        {head.short_desc}
                      </p>
                    </div>
                  </div>

                  {/* Head Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleHomeMut.mutate({ id: head.id, show_on_home: !isHome })}
                      className={`px-2.5 py-1 rounded-xl text-[0.68rem] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                        isHome
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                          : 'bg-white/[0.04] border border-white/[0.08] text-slate-500 hover:text-slate-300'
                      }`}
                      title={isHome ? 'Click to hide from Homepage' : 'Click to show on Homepage'}
                    >
                      <Home size={11} />
                      {isHome ? 'On Home' : 'Hidden'}
                    </button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCreateChild(head.id)}
                      title="Add child sub-service under this head domain"
                    >
                      <Plus size={13} />
                      <span className="hidden sm:inline">Add Sub-Service</span>
                    </Button>

                    <a
                      href={`/services/${head.slug || head.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#00f0ff] hover:bg-white/[0.04] transition-colors"
                      title="View Live Head Service Page"
                    >
                      <ExternalLink size={14} />
                    </a>

                    <Button variant="ghost" size="sm" onClick={() => openEdit(head)} title="Edit Head Service">
                      <Pencil size={14} />
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete "${head.title}" and all its ${children.length} sub-services?`)) {
                          deleteMut.mutate(head.id)
                        }
                      }}
                      title="Delete Head Service"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {/* ── Sub-Services Indented List ── */}
                {isExpanded && (
                  <div className="p-3 sm:p-4 bg-black/20 divide-y divide-white/[0.04]">
                    {children.map(child => (
                      <div
                        key={child.id}
                        className="py-2.5 px-3 sm:px-4 rounded-xl hover:bg-white/[0.03] transition-colors flex items-center justify-between gap-4 flex-wrap"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pl-2 sm:pl-4">
                          <CornerDownRight size={15} className="text-[#00d4f5]/60 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-slate-100 hover:text-[#00f0ff] transition-colors">
                                {child.title}
                              </h4>
                              <span className="text-[0.62rem] font-mono text-slate-500">
                                /{child.slug || child.id}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5 max-w-lg">
                              {child.short_desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <a
                            href={`/services/${child.slug || child.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#00f0ff] hover:bg-white/[0.04] transition-colors"
                            title="View Live Sub-Service Page"
                          >
                            <ExternalLink size={13} />
                          </a>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(child)} title="Edit Sub-Service">
                            <Pencil size={13} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Delete sub-service "${child.title}"?`)) {
                                deleteMut.mutate(child.id)
                              }
                            }}
                            title="Delete Sub-Service"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {children.length === 0 && (
                      <div className="py-6 text-center">
                        <p className="text-xs text-slate-400">
                          No sub-services in this domain yet.
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCreateChild(head.id)}
                          className="mt-2 text-xs text-[#00d4f5]"
                        >
                          <Plus size={12} /> Add First Sub-Service
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {filteredHeads.length === 0 && (
            <Card>
              <CardBody>
                <p className="text-bb-muted text-sm text-center py-8">
                  No matching services found. Click "Add Head Service" to start!
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      ) : (
        /* ════════════════════════════════════════════════════════════
            FLAT VIEW: All Services Table
        ════════════════════════════════════════════════════════════ */
        <Card>
          <div className="divide-y divide-white/[0.06]">
            {services.map(svc => {
              const isHead = !svc.parent_id
              const parentHead = isHead ? null : headServices.find(h => h.id === svc.parent_id)

              return (
                <div key={svc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#00d4f5]/10 border border-[#00d4f5]/20 text-[#00d4f5] text-sm">
                    {svc.icon || '⚡'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-bb-white">{svc.title}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[0.60rem] font-mono font-bold ${
                          isHead
                            ? 'bg-[#00d4f5]/15 border border-[#00d4f5]/30 text-[#00f0ff]'
                            : 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
                        }`}
                      >
                        {isHead ? 'HEAD SERVICE' : `SUB OF: ${parentHead?.title || 'Unknown'}`}
                      </span>
                    </div>
                    <p className="text-xs text-bb-muted truncate mt-0.5">{svc.short_desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <a
                      href={`/services/${svc.slug || svc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#00f0ff] hover:bg-white/[0.04] transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(svc)}><Pencil size={14} /></Button>
                    <Button variant="danger" size="sm" onClick={() => { if (confirm('Delete this service?')) deleteMut.mutate(svc.id) }}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* ── CREATE / EDIT MODAL ── */}
      {modal && (
        <Modal
          open={!!modal}
          onClose={() => setModal(null)}
          title={
            modal === 'create-head'
              ? 'Add Head Service (Domain Category)'
              : modal === 'create-child'
              ? 'Add Sub-Service (Child Capability)'
              : form.parent_id
              ? 'Edit Sub-Service'
              : 'Edit Head Service'
          }
          size="lg"
        >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">
          {/* Service Hierarchy Type Selector */}
          <div className="p-3.5 rounded-2xl border border-white/[0.10] bg-white/[0.02] space-y-2.5">
            <label className="text-xs font-bold text-bb-white block uppercase tracking-wider font-mono">
              Service Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  !form.parent_id
                    ? 'bg-[#00d4f5]/15 border-[#00d4f5] text-white font-bold'
                    : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  name="service_type"
                  checked={!form.parent_id}
                  onChange={() => setForm(p => ({ ...p, parent_id: null, show_on_home: 1 }))}
                  className="hidden"
                />
                <span className="w-2.5 h-2.5 rounded-full border border-current flex items-center justify-center">
                  {!form.parent_id && <span className="w-1.5 h-1.5 rounded-full bg-[#00d4f5]" />}
                </span>
                <span className="text-xs">Head Service (Main Domain)</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  !!form.parent_id
                    ? 'bg-purple-500/15 border-purple-500 text-white font-bold'
                    : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  name="service_type"
                  checked={!!form.parent_id}
                  onChange={() => setForm(p => ({ ...p, parent_id: headServices[0]?.id || null, show_on_home: 0 }))}
                  className="hidden"
                />
                <span className="w-2.5 h-2.5 rounded-full border border-current flex items-center justify-center">
                  {!!form.parent_id && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                </span>
                <span className="text-xs">Sub-Service (Child Capability)</span>
              </label>
            </div>

            {/* Parent Head Service Dropdown (shown only when child) */}
            {form.parent_id !== null && (
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Belongs Under Head Domain:
                </label>
                <select
                  value={form.parent_id || ''}
                  onChange={e => setForm(p => ({ ...p, parent_id: parseInt(e.target.value, 10) }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#091526] border border-white/[0.12] text-sm text-white focus:outline-none focus:border-[#00d4f5]"
                  required
                >
                  {headServices.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <Input
                label="Service Title"
                value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                required
                placeholder="e.g. AI Agent Development"
              />
            </div>
            <div className="sm:col-span-4">
              <Input
                label="URL Slug"
                value={form.slug}
                onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                placeholder="e.g. ai-agent-development"
                helperText="Clean link path"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <Input
                label="Icon (Emoji or text)"
                value={form.icon}
                onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                placeholder="⚡ or 🤖"
              />
            </div>
            <div className="sm:col-span-8">
              <Input
                label="Sort Order"
                type="number"
                value={form.sort_order}
                onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value, 10) || 0 }))}
                helperText="Lower numbers appear first"
              />
            </div>
          </div>

          {/* Homepage Visibility Toggle (Relevant for Head Services) */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <div>
              <label className="text-xs font-bold text-bb-white block">
                Show on Homepage Grid
              </label>
              <p className="text-[0.72rem] text-bb-muted">
                Display this service in the Core Services preview cards on the Homepage.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, show_on_home: p.show_on_home ? 0 : 1 }))}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 flex-shrink-0 ${
                form.show_on_home ? 'bg-[#00d4f5]' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  form.show_on_home ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <ImageUploadInput
            label="Service Hero Mockup / Visual Image"
            value={form.image_url}
            onChange={(url) => setForm(p => ({ ...p, image_url: url }))}
            helperText="Browse an image from your computer or paste an online URL."
          />

          <Textarea
            label="Short Description (Shown on Mega Menu & Overview Cards)"
            value={form.short_desc}
            onChange={e => setForm(p => ({ ...p, short_desc: e.target.value }))}
            rows={2}
            required
            placeholder="Brief high-impact summary shown on dropdowns and cards…"
          />

          <Textarea
            label="Full Detailed Overview (Shown on Dedicated Service Page)"
            value={form.long_desc}
            onChange={e => setForm(p => ({ ...p, long_desc: e.target.value }))}
            rows={5}
            placeholder="Comprehensive description, strategic approach, and engineering breakdown displayed on the dedicated service page (/services/:id)…"
          />

          <Textarea
            label="Key Deliverables & Features (One per line)"
            value={form.features}
            onChange={e => setForm(p => ({ ...p, features: e.target.value }))}
            rows={4}
            placeholder={"Autonomous Multi-Agent Task Orchestration\nEnterprise Vector RAG over Private Documents\nSub-50ms Inference Microservices"}
          />

          <Textarea
            label="Production Tech Stack (Comma-separated or JSON)"
            value={form.stack}
            onChange={e => setForm(p => ({ ...p, stack: e.target.value }))}
            rows={2}
            placeholder={"Python, LangChain, OpenAI, FastAPI, PostgreSQL, Pinecone"}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" loading={busy}>{modal?.startsWith('create') ? 'Create Service' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>
      )}
    </div>
  )
}
