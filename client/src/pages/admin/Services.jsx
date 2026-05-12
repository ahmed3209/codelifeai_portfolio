import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { Pencil, Trash2, Plus, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { title: '', icon: '⚡', short_desc: '', long_desc: '', features: '[]', stack: '[]', sort_order: 0 }

export default function AdminServices() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)  // null | 'create' | 'edit'
  const [form, setForm]   = useState(EMPTY)
  const [editId, setEditId] = useState(null)

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => adminApi.getServices().then(r => r.data)
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-services'] })

  const createMut = useMutation({ mutationFn: adminApi.createService, onSuccess: () => { invalidate(); setModal(null); toast.success('Service created!') } })
  const updateMut = useMutation({ mutationFn: ({ id, d }) => adminApi.updateService(id, d), onSuccess: () => { invalidate(); setModal(null); toast.success('Service updated!') } })
  const deleteMut = useMutation({ mutationFn: adminApi.deleteService, onSuccess: () => { invalidate(); toast.success('Service deleted') } })

  function openCreate() { setForm(EMPTY); setModal('create') }
  function openEdit(svc) {
    setForm({ ...svc,
      features: typeof svc.features === 'string' ? svc.features : JSON.stringify(svc.features),
      stack: typeof svc.stack === 'string' ? svc.stack : JSON.stringify(svc.stack),
    })
    setEditId(svc.id); setModal('edit')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
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
      // treat as comma-separated
      return JSON.stringify(val.split('\n').map(s => s.trim()).filter(Boolean))
    }
  }

  const busy = createMut.isPending || updateMut.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight">Services</h1>
          <p className="text-bb-muted text-sm mt-1">Manage the services displayed on your portfolio.</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Add Service</Button>
      </div>

      <Card>
        {isLoading ? (
          <CardBody><p className="text-bb-muted text-sm">Loading…</p></CardBody>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {services.map(svc => (
              <div key={svc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <GripVertical size={16} className="text-white/20 flex-shrink-0" />
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: 'rgba(0,212,245,0.08)', border: '1px solid rgba(0,212,245,0.12)' }}>
                  {svc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-bb-white">{svc.title}</p>
                  <p className="text-xs text-bb-muted truncate">{svc.short_desc}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(svc)}><Pencil size={14} /></Button>
                  <Button variant="danger" size="sm" onClick={() => { if (confirm('Delete this service?')) deleteMut.mutate(svc.id) }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
            {services.length === 0 && (
              <CardBody><p className="text-bb-muted text-sm text-center py-4">No services yet. Add your first one!</p></CardBody>
            )}
          </div>
        )}
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Service' : 'Edit Service'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-5 gap-3">
            <Input label="Icon (emoji)" value={form.icon} onChange={e => setForm(p => ({...p, icon: e.target.value}))} className="col-span-1 text-2xl text-center" />
            <div className="col-span-4">
              <Input label="Title" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required placeholder="e.g. Web Development" />
            </div>
          </div>
          <Textarea label="Short Description (card preview)" value={form.short_desc} onChange={e => setForm(p => ({...p, short_desc: e.target.value}))} rows={2} required placeholder="Brief description shown on the service card…" />
          <Textarea label="Long Description (popup detail)" value={form.long_desc} onChange={e => setForm(p => ({...p, long_desc: e.target.value}))} rows={3} placeholder="Detailed description shown in the modal popup…" />
          <Textarea label="Features (one per line, or JSON array)" value={form.features} onChange={e => setForm(p => ({...p, features: e.target.value}))} rows={5}
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
