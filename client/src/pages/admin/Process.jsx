import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { Pencil, Trash2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { number: '', title: '', icon: '', description: '', sort_order: 0 }

export default function AdminProcess() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)

  const { data: steps = [], isLoading } = useQuery({
    queryKey: ['admin-process'],
    queryFn: () => adminApi.getProcess().then(r => r.data),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-process'] })
  const createMut = useMutation({ mutationFn: adminApi.createStep, onSuccess: () => { invalidate(); setModal(null); toast.success('Step added!') } })
  const updateMut = useMutation({ mutationFn: ({ id, d }) => adminApi.updateStep(id, d), onSuccess: () => { invalidate(); setModal(null); toast.success('Step updated!') } })
  const deleteMut = useMutation({ mutationFn: adminApi.deleteStep, onSuccess: () => { invalidate(); toast.success('Step deleted') } })

  function openCreate() { setForm(EMPTY); setModal('create') }
  function openEdit(s) { setForm({ ...s }); setEditId(s.id); setModal('edit') }
  function handleSubmit(e) {
    e.preventDefault()
    if (modal === 'create') createMut.mutate(form)
    else updateMut.mutate({ id: editId, d: form })
  }

  const busy = createMut.isPending || updateMut.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight">Our Process</h1>
          <p className="text-bb-muted text-sm mt-1">The step-by-step workflow shown in the "How We Work" section.</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Add Step</Button>
      </div>

      <Card>
        {isLoading ? (
          <CardBody><p className="text-bb-muted text-sm">Loading…</p></CardBody>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {steps.map(s => (
              <div key={s.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-bb-accent text-xs font-extrabold flex-shrink-0" style={{ background: 'rgba(0,212,245,0.08)' }}>{s.number}</div>
                <div className="text-lg flex-shrink-0">{s.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-bb-white">{s.title}</p>
                  <p className="text-xs text-bb-muted truncate">{s.description}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil size={14} /></Button>
                  <Button variant="danger" size="sm" onClick={() => { if (confirm('Delete this step?')) deleteMut.mutate(s.id) }}><Trash2 size={14} /></Button>
                </div>
              </div>
            ))}
            {steps.length === 0 && <CardBody><p className="text-bb-muted text-sm text-center py-4">No steps yet.</p></CardBody>}
          </div>
        )}
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Step' : 'Edit Step'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Input label="Number" value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} placeholder="01" />
            <Input label="Icon (emoji)" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} className="text-xl text-center" placeholder="🔍" />
            <Input label="Sort order" type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} />
          </div>
          <Input label="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Discovery" />
          <Textarea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} required placeholder="What happens in this step…" />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" loading={busy}>{modal === 'create' ? 'Create' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
