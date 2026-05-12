import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { Pencil, Trash2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { name: '', role: '', bio: '', initials: '', photo_url: '', avatar_bg: 'linear-gradient(135deg,#7c3aed,#00d4f5)', tags: '[]' }

export default function AdminFounders() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState(EMPTY)
  const [editId, setEditId] = useState(null)

  const { data: founders = [] } = useQuery({
    queryKey: ['admin-founders'],
    queryFn: () => adminApi.getFounders().then(r => r.data)
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-founders'] })
  const createMut  = useMutation({ mutationFn: adminApi.createFounder, onSuccess: () => { invalidate(); setModal(null); toast.success('Founder added!') } })
  const updateMut  = useMutation({ mutationFn: ({ id, d }) => adminApi.updateFounder(id, d), onSuccess: () => { invalidate(); setModal(null); toast.success('Founder updated!') } })
  const deleteMut  = useMutation({ mutationFn: adminApi.deleteFounder, onSuccess: () => { invalidate(); toast.success('Founder removed') } })

  function openCreate() { setForm(EMPTY); setModal('create') }
  function openEdit(f) {
    setForm({ ...f, tags: typeof f.tags === 'string' ? f.tags : JSON.stringify(f.tags) })
    setEditId(f.id); setModal('edit')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      tags: (() => {
        try { return JSON.stringify(JSON.parse(form.tags)) }
        catch { return JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)) }
      })()
    }
    if (modal === 'create') createMut.mutate(payload)
    else updateMut.mutate({ id: editId, d: payload })
  }

  const busy = createMut.isPending || updateMut.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight">Founders</h1>
          <p className="text-bb-muted text-sm mt-1">Manage team profiles on the portfolio.</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Add Founder</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {founders.map(f => (
          <Card key={f.id} className="relative overflow-hidden">
            <CardBody className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/[0.07]"
                style={{ background: f.avatar_bg }}>
                {f.photo_url
                  ? <img src={f.photo_url} alt={f.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center font-bold text-white text-lg">{f.initials || f.name[0]}</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-bb-white">{f.name}</p>
                <p className="text-[0.72rem] font-semibold uppercase tracking-wider text-bb-accent mb-1">{f.role}</p>
                <p className="text-xs text-bb-muted line-clamp-2">{f.bio}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Button variant="ghost" size="sm" onClick={() => openEdit(f)}><Pencil size={13} /></Button>
                <Button variant="danger" size="sm" onClick={() => { if (confirm('Remove founder?')) deleteMut.mutate(f.id) }}><Trash2 size={13} /></Button>
              </div>
            </CardBody>
          </Card>
        ))}
        {founders.length === 0 && (
          <Card className="col-span-2"><CardBody><p className="text-bb-muted text-sm text-center py-4">No founders yet.</p></CardBody></Card>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Founder' : 'Edit Founder'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required placeholder="Muhammad Ahmed" />
            <Input label="Role / Title" value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))} required placeholder="Co-Founder & CEO" />
          </div>
          <Textarea label="Biography" value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} rows={4} required placeholder="A brief bio about this person…" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Initials (fallback avatar)" value={form.initials} onChange={e => setForm(p => ({...p, initials: e.target.value}))} placeholder="MA" maxLength={3} />
            <Input label="Photo URL (optional)" value={form.photo_url} onChange={e => setForm(p => ({...p, photo_url: e.target.value}))} placeholder="https://…" />
          </div>
          <Input label="Avatar Gradient CSS (optional)" value={form.avatar_bg} onChange={e => setForm(p => ({...p, avatar_bg: e.target.value}))} placeholder="linear-gradient(135deg,#7c3aed,#00d4f5)" />
          <Textarea label="Skill Tags (comma-separated)" value={form.tags} onChange={e => setForm(p => ({...p, tags: e.target.value}))} rows={2} placeholder="Product Strategy, Full-Stack Dev, Startup Growth" />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" loading={busy}>{modal === 'create' ? 'Add Founder' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
