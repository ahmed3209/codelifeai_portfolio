import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { Pencil, Trash2, Plus, Radio, ExternalLink, CheckCircle2, Eye, EyeOff, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  name: '',
  tagline: '',
  url: '',
  icon: '✨',
  badge: 'LIVE NOW',
  cta_label: 'Open Live Website',
  is_active: 1,
  sort_order: 0,
}

// Clean and normalize URLs to always have https:// if missing
function normalizeUrl(url) {
  if (!url) return ''
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed
  }
  return `https://${trimmed}`
}

export default function AdminLiveProducts() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-live-products'],
    queryFn: () => adminApi.getLiveProducts().then(r => r.data),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-live-products'] })
    qc.invalidateQueries({ queryKey: ['site-data'] })
    qc.invalidateQueries({ queryKey: ['live-products'] })
  }

  const createMut = useMutation({
    mutationFn: adminApi.createLiveProduct,
    onSuccess: () => { invalidate(); setModal(null); toast.success('Live product added!') },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to add product'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, d }) => adminApi.updateLiveProduct(id, d),
    onSuccess: () => { invalidate(); setModal(null); toast.success('Live product updated!') },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update product'),
  })

  const deleteMut = useMutation({
    mutationFn: adminApi.deleteLiveProduct,
    onSuccess: () => { invalidate(); toast.success('Live product deleted') },
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }) => adminApi.toggleLiveProduct(id, is_active),
    onSuccess: (_, vars) => {
      invalidate()
      toast.success(vars.is_active ? 'Product is now LIVE in slider' : 'Product removed from slider')
    },
  })

  function openCreate() {
    setForm(EMPTY)
    setEditId(null)
    setModal('create')
  }

  function openEdit(p) {
    setForm({
      name: p.name || '',
      tagline: p.tagline || '',
      url: p.url || '',
      icon: p.icon || '✨',
      badge: p.badge || 'LIVE NOW',
      cta_label: p.cta_label || 'Open Live Website',
      is_active: p.is_active !== 0 ? 1 : 0,
      sort_order: p.sort_order || 0,
    })
    setEditId(p.id)
    setModal('edit')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Product name is required'); return }
    if (!form.url.trim()) { toast.error('Live website URL is required'); return }

    const payload = {
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      url: normalizeUrl(form.url),
      icon: form.icon.trim() || '✨',
      badge: form.badge.trim() || 'LIVE NOW',
      cta_label: form.cta_label.trim() || 'Open Live Website',
      is_active: Number(form.is_active) ? 1 : 0,
      sort_order: Number(form.sort_order) || 0,
    }

    if (modal === 'create') createMut.mutate(payload)
    else updateMut.mutate({ id: editId, d: payload })
  }

  const busy = createMut.isPending || updateMut.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight flex items-center gap-2.5">
            <Radio className="text-emerald-400 animate-pulse" size={24} />
            Live Products &amp; Web Apps
          </h1>
          <p className="text-bb-muted text-sm mt-1">
            Manage live apps showcased in the top-right animated slider on your homepage. Clicking any product opens its live website.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Live Product
        </Button>
      </div>

      {/* Product List */}
      <Card>
        {isLoading ? (
          <CardBody><p className="text-bb-muted text-sm">Loading live products…</p></CardBody>
        ) : products.length === 0 ? (
          <CardBody>
            <div className="text-center py-8">
              <Radio className="mx-auto text-bb-muted mb-2 opacity-50" size={32} />
              <p className="text-bb-white font-medium text-sm">No live products added yet</p>
              <p className="text-bb-muted text-xs mt-1">Add products to show them in the animated top-right live slider.</p>
              <Button onClick={openCreate} className="mt-4" size="sm">
                <Plus size={14} /> Add First Product
              </Button>
            </div>
          </CardBody>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {products.map((p) => {
              const isActive = p.is_active === 1 || p.is_active === true
              return (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  {/* Emoji / Icon */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00d4f5]/15 to-[#7c3aed]/15 border border-white/[0.08] flex items-center justify-center text-xl flex-shrink-0 shadow-inner">
                    {p.icon || '✨'}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-bb-white truncate">{p.name}</p>
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[0.62rem] font-bold uppercase tracking-wider text-emerald-400">
                          <CheckCircle2 size={10} /> Active in Slider
                        </span>
                      ) : (
                        <span className="text-[0.62rem] font-bold text-white/40 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                      {p.badge && (
                        <span className="text-[0.62rem] font-bold text-[#00d4f5] bg-[#00d4f5]/10 border border-[#00d4f5]/20 px-2 py-0.5 rounded-full">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-bb-muted truncate mt-0.5">
                      {p.tagline || 'No description provided'}
                    </p>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[0.72rem] text-[#00d4f5] hover:underline mt-1 font-mono"
                    >
                      {p.url}
                      <ExternalLink size={11} />
                    </a>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant={isActive ? "ghost" : "outline"}
                      size="sm"
                      onClick={() => toggleMut.mutate({ id: p.id, is_active: !isActive })}
                      loading={toggleMut.isPending && toggleMut.variables?.id === p.id}
                      title={isActive ? "Hide from slider" : "Show in slider"}
                    >
                      {isActive ? <EyeOff size={14} className="text-amber-400" /> : <Eye size={14} />}
                      {isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)} title="Edit product">
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete "${p.name}"? This cannot be undone.`)) {
                          deleteMut.mutate(p.id)
                        }
                      }}
                      title="Delete product"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Info Card */}
      <Card>
        <CardBody>
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="text-bb-accent mt-0.5 flex-shrink-0" />
            <div className="text-xs text-bb-muted leading-relaxed">
              <strong className="text-bb-white">How the Live Slider Works:</strong> All products marked with
              <strong className="text-emerald-400"> "Active in Slider"</strong> will automatically rotate inside the animated top-right widget below your homepage header every 5 seconds.
              When a visitor clicks the <strong className="text-[#00d4f5]">"Open Live Website ↗"</strong> button on any slide, it opens that product's live URL in a new browser tab.
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Add Live Product' : 'Edit Live Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-5 gap-3">
            <Input
              label="Icon / Emoji"
              value={form.icon}
              onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
              placeholder="📸"
              className="col-span-1 text-xl text-center"
            />
            <div className="col-span-4">
              <Input
                label="Product Name"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required
                placeholder="e.g. Screen Snap"
              />
            </div>
          </div>

          <Input
            label="Live Website URL (Click opens this web link)"
            value={form.url}
            onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
            required
            placeholder="e.g. https://screensnap.app or screensnap.app"
          />

          <Textarea
            label="Tagline / Description"
            value={form.tagline}
            onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))}
            rows={2}
            placeholder="e.g. Instant screen recording, smart annotations & AI capture workflow."
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Status Badge"
              value={form.badge}
              onChange={e => setForm(p => ({ ...p, badge: e.target.value }))}
              placeholder="e.g. LIVE NOW, v2.0, NEW"
            />
            <Input
              label="Button Text"
              value={form.cta_label}
              onChange={e => setForm(p => ({ ...p, cta_label: e.target.value }))}
              placeholder="e.g. Open Live Website"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Sort Order"
              type="number"
              value={form.sort_order}
              onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-bb-muted uppercase tracking-widest">
                Status
              </label>
              <div className="flex items-center h-[42px]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Number(form.is_active) === 1}
                    onChange={e => setForm(p => ({ ...p, is_active: e.target.checked ? 1 : 0 }))}
                    className="w-4 h-4 rounded border-white/[0.1] text-bb-accent focus:ring-0 bg-white/[0.05]"
                  />
                  <span className="text-sm font-medium text-bb-white">Active in Live Slider</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" loading={busy}>
              {modal === 'create' ? 'Add Product' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
