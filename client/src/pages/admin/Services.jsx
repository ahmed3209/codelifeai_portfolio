import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import ImageUploadInput from '../../components/ui/ImageUploadInput'
import IconPicker from '../../components/ui/IconPicker'
import { Pencil, Trash2, Plus, GripVertical, Home, Check, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  title: '',
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
  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState(EMPTY)
  const [editId, setEditId] = useState(null)

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => adminApi.getServices().then(r => r.data)
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-services'] })
    qc.invalidateQueries({ queryKey: ['site-data'] })
  }

  const createMut = useMutation({
    mutationFn: adminApi.createService,
    onSuccess: () => { invalidate(); setModal(null); toast.success('Service created!') }
  })
  const updateMut = useMutation({
    mutationFn: ({ id, d }) => adminApi.updateService(id, d),
    onSuccess: () => { invalidate(); setModal(null); toast.success('Service updated!') }
  })
  const deleteMut = useMutation({
    mutationFn: adminApi.deleteService,
    onSuccess: () => { invalidate(); toast.success('Service deleted') }
  })
  const toggleHomeMut = useMutation({
    mutationFn: ({ id, show_on_home }) => adminApi.toggleServiceHome(id, show_on_home),
    onSuccess: (data) => {
      invalidate()
      toast.success(data.data?.show_on_home ? 'Service shown on Homepage' : 'Service hidden from Homepage (shown on Services page)')
    },
    onError: () => toast.error('Failed to toggle homepage visibility')
  })

  function openCreate() { setForm(EMPTY); setModal('create') }
  function openEdit(svc) {
    setForm({
      ...svc,
      features: typeof svc.features === 'string' ? svc.features : JSON.stringify(svc.features),
      stack: typeof svc.stack === 'string' ? svc.stack : JSON.stringify(svc.stack),
      image_url: svc.image_url || '',
      show_on_home: svc.show_on_home !== 0 ? 1 : 0,
    })
    setEditId(svc.id)
    setModal('edit')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      image_url: (form.image_url || '').trim(),
      show_on_home: form.show_on_home ? 1 : 0,
      features: parseJsonField(form.features),
      stack: parseJsonField(form.stack),
    }
    if (modal === 'create') createMut.mutate(payload)
    else updateMut.mutate({ id: editId, d: payload })
  }

  function parseJsonField(val) {
    try {
      const parsed = JSON.parse(val)
      return JSON.stringify(parsed)
    } catch {
      return JSON.stringify(val.split('\n').map(s => s.trim()).filter(Boolean))
    }
  }

  const busy = createMut.isPending || updateMut.isPending
  const homeCount = services.filter(s => s.show_on_home !== 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight">Services &amp; Capabilities</h1>
          <p className="text-bb-muted text-sm mt-1">
            Manage services, visual preview assets, and selectively choose which cards appear on the Homepage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-bb-muted">
            <strong className="text-[#00d4f5]">{homeCount}</strong> shown on Homepage
          </span>
          <Button onClick={openCreate}><Plus size={16} /> Add Service</Button>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <CardBody><p className="text-bb-muted text-sm py-4">Loading services…</p></CardBody>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {services.map(svc => {
              const isHome = svc.show_on_home !== 0
              return (
                <div key={svc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  {svc.image_url ? (
                    <div className="w-12 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                      <img src={svc.image_url} alt={svc.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: 'rgba(0,212,245,0.08)', border: '1px solid rgba(0,212,245,0.12)' }}>
                      {svc.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-bb-white">{svc.title}</p>
                      <button
                        type="button"
                        onClick={() => toggleHomeMut.mutate({ id: svc.id, show_on_home: !isHome })}
                        className={`px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                          isHome
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                            : 'bg-white/[0.04] border border-white/[0.08] text-slate-500 hover:text-slate-300'
                        }`}
                        title={isHome ? 'Click to hide from Homepage' : 'Click to show on Homepage'}
                      >
                        <Home size={10} />
                        {isHome ? 'On Home' : 'Services Page Only'}
                      </button>
                    </div>
                    <p className="text-xs text-bb-muted truncate mt-0.5">{svc.short_desc}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(svc)} title="Edit"><Pencil size={14} /></Button>
                    <Button variant="danger" size="sm" onClick={() => { if (confirm('Delete this service?')) deleteMut.mutate(svc.id) }} title="Delete">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              )
            })}
            {services.length === 0 && (
              <CardBody><p className="text-bb-muted text-sm text-center py-4">No services yet. Add your first one!</p></CardBody>
            )}
          </div>
        )}
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Service' : 'Edit Service'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 items-start">
            <IconPicker
              label="Service Icon"
              value={form.icon}
              onChange={(ic) => setForm(p => ({ ...p, icon: ic }))}
            />
            <div className="space-y-1">
              <Input
                label="Service Title"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                required
                placeholder="e.g. Web Application Development"
              />
            </div>
          </div>

          {/* Homepage Visibility Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <div>
              <label className="text-xs font-bold text-bb-white block">
                Show on Homepage
              </label>
              <p className="text-[0.72rem] text-bb-muted">
                Display this service in the clean Core Services preview grid on the Homepage.
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
            label="Service Mockup / Visual Image"
            value={form.image_url}
            onChange={(url) => setForm(p => ({ ...p, image_url: url }))}
            helperText="Browse an image from your computer or paste an online URL."
          />

          <Textarea label="Short Description (card preview)" value={form.short_desc} onChange={e => setForm(p => ({...p, short_desc: e.target.value}))} rows={2} required placeholder="Brief description shown on the service card…" />
          <Textarea label="Long Description (popup detail)" value={form.long_desc} onChange={e => setForm(p => ({...p, long_desc: e.target.value}))} rows={3} placeholder="Detailed description shown in the modal popup…" />
          <Textarea label="Features (one per line, or JSON array)" value={form.features} onChange={e => setForm(p => ({...p, features: e.target.value}))} rows={4}
            placeholder={"Custom full-stack applications\nREST & GraphQL APIs\nAuthentication & security"} />
          <Textarea label="Tech Stack (comma-separated or JSON array)" value={form.stack} onChange={e => setForm(p => ({...p, stack: e.target.value}))} rows={2}
            placeholder={"React, Next.js, Node.js, TypeScript, PostgreSQL"} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" loading={busy}>{modal === 'create' ? 'Create Service' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
