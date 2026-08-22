import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { Pencil, Trash2, Plus, Star, Home } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  name: '',
  role: '',
  avatar: '',
  bg: 'linear-gradient(135deg, #00d4f5, #0099bb)',
  rating: 5,
  quote: '',
  show_on_home: 1,
  sort_order: 0,
}

export default function AdminTestimonials() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: () => adminApi.getTestimonials().then(r => r.data),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-testimonials'] })
    qc.invalidateQueries({ queryKey: ['site-data'] })
  }

  const createMut = useMutation({
    mutationFn: adminApi.createTestimonial,
    onSuccess: () => { invalidate(); setModal(null); toast.success('Testimonial added!') }
  })
  const updateMut = useMutation({
    mutationFn: ({ id, d }) => adminApi.updateTestimonial(id, d),
    onSuccess: () => { invalidate(); setModal(null); toast.success('Testimonial updated!') }
  })
  const deleteMut = useMutation({
    mutationFn: adminApi.deleteTestimonial,
    onSuccess: () => { invalidate(); toast.success('Testimonial deleted') }
  })
  const toggleHomeMut = useMutation({
    mutationFn: ({ id, show_on_home }) => adminApi.toggleTestimonialHome(id, show_on_home),
    onSuccess: (data) => {
      invalidate()
      toast.success(data.data?.show_on_home ? 'Testimonial shown on Homepage' : 'Testimonial hidden from Homepage')
    },
    onError: () => toast.error('Failed to update homepage status')
  })

  function openCreate() { setForm(EMPTY); setModal('create') }
  function openEdit(t) {
    setForm({
      ...t,
      show_on_home: t.show_on_home !== 0 ? 1 : 0
    })
    setEditId(t.id)
    setModal('edit')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      show_on_home: form.show_on_home ? 1 : 0,
      rating: Number(form.rating) || 5
    }
    if (modal === 'create') createMut.mutate(payload)
    else updateMut.mutate({ id: editId, d: payload })
  }

  const busy = createMut.isPending || updateMut.isPending
  const homeCount = items.filter(t => t.show_on_home !== 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight">Client Testimonials</h1>
          <p className="text-bb-muted text-sm mt-1">
            Manage reviews and toggle which client feedbacks appear on the Homepage carousel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-bb-muted">
            <strong className="text-[#00d4f5]">{homeCount}</strong> shown on Homepage
          </span>
          <Button onClick={openCreate}><Plus size={16} /> Add Testimonial</Button>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <CardBody><p className="text-bb-muted text-sm py-4">Loading testimonials…</p></CardBody>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {items.map(t => {
              const isHome = t.show_on_home !== 0
              return (
                <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: t.bg }}>{t.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-bb-white">{t.name} <span className="text-bb-muted font-normal">· {t.role}</span></p>
                      <button
                        type="button"
                        onClick={() => toggleHomeMut.mutate({ id: t.id, show_on_home: !isHome })}
                        className={`px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                          isHome
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                            : 'bg-white/[0.04] border border-white/[0.08] text-slate-500 hover:text-slate-300'
                        }`}
                        title={isHome ? 'Click to hide from Homepage' : 'Click to show on Homepage'}
                      >
                        <Home size={10} />
                        {isHome ? 'On Home' : 'Hidden from Home'}
                      </button>
                    </div>
                    <p className="text-xs text-bb-muted truncate mt-0.5">"{t.quote}"</p>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0 text-amber-400">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(t)} title="Edit"><Pencil size={14} /></Button>
                    <Button variant="danger" size="sm" onClick={() => { if (confirm('Delete this testimonial?')) deleteMut.mutate(t.id) }} title="Delete"><Trash2 size={14} /></Button>
                  </div>
                </div>
              )
            })}
            {items.length === 0 && <CardBody><p className="text-bb-muted text-sm text-center py-4">No testimonials yet.</p></CardBody>}
          </div>
        )}
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Testimonial' : 'Edit Testimonial'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Ahmed Al-Rashid" />
            <Input label="Role / company" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="Founder, FinTrack" />
          </div>

          {/* Homepage Visibility Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <div>
              <label className="text-xs font-bold text-bb-white block">
                Show on Homepage Carousel
              </label>
              <p className="text-[0.72rem] text-bb-muted">
                Display this review in the Homepage testimonials slider.
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

          <div className="grid grid-cols-3 gap-3">
            <Input label="Avatar initials" value={form.avatar} onChange={e => setForm(p => ({ ...p, avatar: e.target.value }))} placeholder="AR" />
            <Input label="Rating (1–5)" type="number" min={1} max={5} value={form.rating} onChange={e => setForm(p => ({ ...p, rating: e.target.value }))} />
            <Input label="Sort order" type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} />
          </div>
          <Input label="Avatar background (CSS gradient)" value={form.bg} onChange={e => setForm(p => ({ ...p, bg: e.target.value }))} placeholder="linear-gradient(135deg, #00d4f5, #0099bb)" />
          <Textarea label="Quote" value={form.quote} onChange={e => setForm(p => ({ ...p, quote: e.target.value }))} rows={4} required placeholder="What the client said about working with you…" />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" loading={busy}>{modal === 'create' ? 'Create' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
