import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { Pencil, Trash2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  title: '', category: '', tags: '[]', outcome: '', emoji: '🚀',
  accent: '#00d4f5', bg: 'linear-gradient(135deg, rgba(0,212,245,0.1) 0%, rgba(124,58,237,0.06) 100%)',
  sort_order: 0,
}

function parseTags(val) {
  try {
    const p = JSON.parse(val)
    return JSON.stringify(Array.isArray(p) ? p : [])
  } catch {
    return JSON.stringify(String(val).split(',').map(s => s.trim()).filter(Boolean))
  }
}

export default function AdminProjects() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => adminApi.getProjects().then(r => r.data),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-projects'] })
  const createMut = useMutation({ mutationFn: adminApi.createProject, onSuccess: () => { invalidate(); setModal(null); toast.success('Project added!') } })
  const updateMut = useMutation({ mutationFn: ({ id, d }) => adminApi.updateProject(id, d), onSuccess: () => { invalidate(); setModal(null); toast.success('Project updated!') } })
  const deleteMut = useMutation({ mutationFn: adminApi.deleteProject, onSuccess: () => { invalidate(); toast.success('Project deleted') } })

  function openCreate() { setForm(EMPTY); setModal('create') }
  function openEdit(p) {
    setForm({ ...p, tags: typeof p.tags === 'string' ? p.tags : JSON.stringify(p.tags) })
    setEditId(p.id); setModal('edit')
  }
  function handleSubmit(e) {
    e.preventDefault()
    const payload = { ...form, tags: parseTags(form.tags) }
    if (modal === 'create') createMut.mutate(payload)
    else updateMut.mutate({ id: editId, d: payload })
  }

  const busy = createMut.isPending || updateMut.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight">Projects</h1>
          <p className="text-bb-muted text-sm mt-1">Manage the "What We've Built" section.</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Add Project</Button>
      </div>

      <Card>
        {isLoading ? (
          <CardBody><p className="text-bb-muted text-sm">Loading…</p></CardBody>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {projects.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: p.bg || 'rgba(0,212,245,0.08)' }}>{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-bb-white truncate">{p.title}</p>
                  <p className="text-xs text-bb-muted truncate">{p.category} · {p.outcome}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil size={14} /></Button>
                  <Button variant="danger" size="sm" onClick={() => { if (confirm('Delete this project?')) deleteMut.mutate(p.id) }}><Trash2 size={14} /></Button>
                </div>
              </div>
            ))}
            {projects.length === 0 && <CardBody><p className="text-bb-muted text-sm text-center py-4">No projects yet. Add your first one!</p></CardBody>}
          </div>
        )}
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Project' : 'Edit Project'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-5 gap-3">
            <Input label="Emoji" value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))} className="col-span-1 text-2xl text-center" />
            <div className="col-span-4">
              <Input label="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="e.g. FinTrack — Banking Dashboard" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Web Application" />
            <Input label="Outcome / metric" value={form.outcome} onChange={e => setForm(p => ({ ...p, outcome: e.target.value }))} placeholder="10k+ active users" />
          </div>
          <Textarea label="Tags (comma-separated or JSON array)" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} rows={2} placeholder="React, Node.js, PostgreSQL" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Accent color (hex)" value={form.accent} onChange={e => setForm(p => ({ ...p, accent: e.target.value }))} placeholder="#00d4f5" />
            <Input label="Sort order" type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} />
          </div>
          <Textarea label="Card background (CSS gradient)" value={form.bg} onChange={e => setForm(p => ({ ...p, bg: e.target.value }))} rows={2}
            placeholder="linear-gradient(135deg, rgba(0,212,245,0.1) 0%, rgba(124,58,237,0.06) 100%)" />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" loading={busy}>{modal === 'create' ? 'Create Project' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
