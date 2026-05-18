import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { Pencil, Trash2, Plus, Star } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  name: '', role: '', avatar: '', bg: 'linear-gradient(135deg, #00d4f5, #0099bb)',
  rating: 5, quote: '', sort_order: 0,
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

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-testimonials'] })
  const createMut = useMutation({ mutationFn: adminApi.createTestimonial, onSuccess: () => { invalidate(); setModal(null); toast.success('Testimonial added!') } })
  const updateMut = useMutation({ mutationFn: ({ id, d }) => adminApi.updateTestimonial(id, d), onSuccess: () => { invalidate(); setModal(null); toast.success('Testimonial updated!') } })
  const deleteMut = useMutation({ mutationFn: adminApi.deleteTestimonial, onSuccess: () => { invalidate(); toast.success('Testimonial deleted') } })

  function openCreate() { setForm(EMPTY); setModal('create') }
  function openEdit(t) { setForm({ ...t }); setEditId(t.id); setModal('edit') }
  function handleSubmit(e) {
    e.preventDefault()
    const payload = { ...form, rating: Number(form.rating) || 5 }
    if (modal === 'create') createMut.mutate(payload)
    else updateMut.mutate({ id: editId, d: payload })
  }

  const busy = createMut.isPending || updateMut.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight">Testimonials</h1>
          <p className="text-bb-muted text-sm mt-1">Client reviews shown in the testimonials carousel.</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Add Testimonial</Button>
      </div>

      <Card>
        {isLoading ? (
          <CardBody><p className="text-bb-muted text-sm">Loading…</p></CardBody>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {items.map(t => (
              <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: t.bg }}>{t.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-bb-white">{t.name} <span className="text-bb-muted font-normal">· {t.role}</span></p>
                  <p className="text-xs text-bb-muted truncate">"{t.quote}"</p>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0 text-amber-400">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil size={14} /></Button>
                  <Button variant="danger" size="sm" onClick={() => { if (confirm('Delete this testimonial?')) deleteMut.mutate(t.id) }}><Trash2 size={14} /></Button>
                </div>
              </div>
            ))}
            {items.length === 0 && <CardBody><p className="text-bb-muted text-sm text-center py-4">No testimonials yet.</p></CardBody>}
          </div>
        )}
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Testimonial' : 'Edit Testimonial'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Ahmed Al-Rashid" />
            <Input label="Role / company" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="Founder, FinTrack" />
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
