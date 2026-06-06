import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { Pencil, Trash2, Plus, Rocket, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  name: '',
  slug: '',
  tagline: '',
  launch_local: '',
  cta_label: 'Request Early Access',
  sort_order: 0,
}

function isoToLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function localInputToIso(local) {
  if (!local) return ''
  const d = new Date(local)
  return isNaN(d.getTime()) ? '' : d.toISOString()
}

function formatLaunchLabel(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export default function AdminPromotions() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)

  const { data: promos = [], isLoading } = useQuery({
    queryKey: ['admin-promos'],
    queryFn: () => adminApi.getPromos().then(r => r.data),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-promos'] })
    qc.invalidateQueries({ queryKey: ['site-data'] })
  }

  const createMut = useMutation({
    mutationFn: adminApi.createPromo,
    onSuccess: () => { invalidate(); setModal(null); toast.success('Promotion added!') },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, d }) => adminApi.updatePromo(id, d),
    onSuccess: () => { invalidate(); setModal(null); toast.success('Promotion updated!') },
  })
  const deleteMut = useMutation({
    mutationFn: adminApi.deletePromo,
    onSuccess: () => { invalidate(); toast.success('Promotion deleted') },
  })
  const activateMut = useMutation({
    mutationFn: ({ id, active }) => adminApi.activatePromo(id, active),
    onSuccess: (_, vars) => {
      invalidate()
      toast.success(vars.active ? 'Now active on the site' : 'Promotion deactivated')
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
      slug: p.slug || '',
      tagline: p.tagline || '',
      launch_local: isoToLocalInput(p.launch_at),
      cta_label: p.cta_label || 'Request Early Access',
      sort_order: p.sort_order || 0,
    })
    setEditId(p.id)
    setModal('edit')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      tagline: form.tagline,
      launch_at: localInputToIso(form.launch_local),
      cta_label: form.cta_label.trim() || 'Request Early Access',
      sort_order: Number(form.sort_order) || 0,
    }
    if (modal === 'create') createMut.mutate(payload)
    else updateMut.mutate({ id: editId, d: payload })
  }

  const busy = createMut.isPending || updateMut.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight">Promotions</h1>
          <p className="text-bb-muted text-sm mt-1">
            Product launches and promotional banners. Only one promotion can be active — it powers the homepage
            teaser and the <code className="text-bb-accent">/launch</code> countdown page.
          </p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Add Promotion</Button>
      </div>

      <Card>
        {isLoading ? (
          <CardBody><p className="text-bb-muted text-sm">Loading…</p></CardBody>
        ) : promos.length === 0 ? (
          <CardBody><p className="text-bb-muted text-sm text-center py-4">No promotions yet. Add your first one!</p></CardBody>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {promos.map(p => {
              const isActive = p.is_active === 1 || p.is_active === true
              return (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-bb-accent/15 border border-bb-accent/30' : 'bg-white/[0.04] border border-white/[0.06]'}`}>
                    <Rocket size={16} className={isActive ? 'text-bb-accent' : 'text-bb-muted'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-bb-white truncate">{p.name}</p>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bb-accent/10 border border-bb-accent/25 text-[0.62rem] font-bold uppercase tracking-wider text-bb-accent">
                          <CheckCircle2 size={10} /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-bb-muted truncate">
                      /launch/{p.slug} · Launches {formatLaunchLabel(p.launch_at)}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {isActive ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => activateMut.mutate({ id: p.id, active: false })}
                        loading={activateMut.isPending && activateMut.variables?.id === p.id}
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => activateMut.mutate({ id: p.id, active: true })}
                        loading={activateMut.isPending && activateMut.variables?.id === p.id}
                      >
                        Set Active
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil size={14} /></Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => { if (confirm(`Delete "${p.name}"? This cannot be undone.`)) deleteMut.mutate(p.id) }}
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

      <Card>
        <CardBody>
          <p className="text-xs text-bb-muted leading-relaxed">
            <strong className="text-bb-white">How it works:</strong> the active promotion's name, tagline and date
            drive the homepage teaser banner and the public countdown at <code className="text-bb-accent">/launch</code>.
            Each promotion also gets its own permalink at <code className="text-bb-accent">/launch/&lt;slug&gt;</code>.
            Early-access requests collected from any promo land in the <strong className="text-bb-white">Early Access</strong> tab.
          </p>
        </CardBody>
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Add Promotion' : 'Edit Promotion'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Product name"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              required
              placeholder="ZYRA AI"
            />
            <Input
              label="Slug (URL — auto if left blank)"
              value={form.slug}
              onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
              placeholder="zyra-ai"
            />
          </div>

          <Textarea
            label="Tagline / description"
            value={form.tagline}
            onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))}
            rows={3}
            placeholder="One AI for everything — chat, create, analyze, automate."
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-bb-muted uppercase tracking-widest">
              Launch date &amp; time
            </label>
            <input
              type="datetime-local"
              value={form.launch_local}
              onChange={e => setForm(p => ({ ...p, launch_local: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-bb-white outline-none focus:border-bb-accent/40 transition-colors [color-scheme:dark]"
            />
            <p className="text-[0.7rem] text-bb-muted">Set in your local time. Counts down to this exact moment for every visitor.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="CTA button label"
              value={form.cta_label}
              onChange={e => setForm(p => ({ ...p, cta_label: e.target.value }))}
              placeholder="Request Early Access"
            />
            <Input
              label="Sort order"
              type="number"
              value={form.sort_order}
              onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" loading={busy}>
              {modal === 'create' ? 'Create Promotion' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
