import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { Pencil, Trash2, Plus, Clock, CheckCircle2, MessageSquare, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  number: '01',
  title: '',
  timeline: 'Week 1',
  icon: '🔍',
  description: '',
  summary: '',
  deliverables: '[]',
  tools: '[]',
  client_checkpoint: '',
  sort_order: 1,
}

export default function AdminProcess() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)

  const { data: steps = [], isLoading } = useQuery({
    queryKey: ['admin-process'],
    queryFn: () => adminApi.getProcess().then(r => r.data),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-process'] })
    qc.invalidateQueries({ queryKey: ['site-data'] })
  }

  const createMut = useMutation({
    mutationFn: adminApi.createStep,
    onSuccess: () => { invalidate(); setModal(null); toast.success('Process step created!') },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, d }) => adminApi.updateStep(id, d),
    onSuccess: () => { invalidate(); setModal(null); toast.success('Process step updated!') },
  })
  const deleteMut = useMutation({
    mutationFn: adminApi.deleteStep,
    onSuccess: () => { invalidate(); toast.success('Process step deleted') },
  })

  function openCreate() {
    setForm({
      ...EMPTY,
      number: String(steps.length + 1).padStart(2, '0'),
      sort_order: steps.length + 1,
    })
    setModal('create')
  }

  function openEdit(s) {
    let delivStr = ''
    try {
      const parsed = typeof s.deliverables === 'string' ? JSON.parse(s.deliverables) : s.deliverables
      delivStr = Array.isArray(parsed) ? parsed.join('\n') : String(s.deliverables || '')
    } catch {
      delivStr = String(s.deliverables || '')
    }

    let toolsStr = ''
    try {
      const parsed = typeof s.tools === 'string' ? JSON.parse(s.tools) : s.tools
      toolsStr = Array.isArray(parsed) ? parsed.join(', ') : String(s.tools || '')
    } catch {
      toolsStr = String(s.tools || '')
    }

    setForm({
      ...s,
      deliverables: delivStr,
      tools: toolsStr,
      summary: s.summary || s.description || '',
    })
    setEditId(s.id)
    setModal('edit')
  }

  function handleSubmit(e) {
    e.preventDefault()

    const deliverablesArr = form.deliverables
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)

    const toolsArr = form.tools
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const payload = {
      ...form,
      summary: (form.summary || form.description || '').trim(),
      description: (form.description || form.summary || '').trim(),
      deliverables: JSON.stringify(deliverablesArr),
      tools: JSON.stringify(toolsArr),
    }

    if (modal === 'create') createMut.mutate(payload)
    else updateMut.mutate({ id: editId, d: payload })
  }

  const busy = createMut.isPending || updateMut.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight">Engineering Delivery Protocol</h1>
          <p className="text-bb-muted text-sm mt-1">
            Manage the interactive 5-stage sprint workflow, timelines, deliverables checklist, and client checkpoints.
          </p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Add Process Stage</Button>
      </div>

      <Card>
        {isLoading ? (
          <CardBody><p className="text-bb-muted text-sm py-4">Loading process stages…</p></CardBody>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {steps.map(s => {
              let delivCount = 0
              try {
                const parsed = JSON.parse(s.deliverables)
                delivCount = Array.isArray(parsed) ? parsed.length : 0
              } catch {}

              return (
                <div key={s.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[#00d4f5] text-xs font-mono font-extrabold flex-shrink-0 bg-[#00d4f5]/10 border border-[#00d4f5]/20 shadow-sm">
                    {s.number || '01'}
                  </div>

                  <div className="text-xl flex-shrink-0">{s.icon || '⚙️'}</div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <p className="text-sm font-bold text-bb-white">{s.title}</p>
                      {s.timeline && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-white/[0.05] border border-white/[0.08] text-slate-300">
                          <Clock size={10} className="text-[#00d4f5]" />
                          {s.timeline}
                        </span>
                      )}
                      {delivCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <CheckCircle2 size={10} />
                          {delivCount} Deliverables
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-bb-muted truncate">{s.summary || s.description}</p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(s)} title="Edit"><Pencil size={14} /></Button>
                    <Button variant="danger" size="sm" onClick={() => { if (confirm('Delete this stage?')) deleteMut.mutate(s.id) }} title="Delete">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              )
            })}
            {steps.length === 0 && (
              <CardBody><p className="text-bb-muted text-sm text-center py-4">No process stages yet.</p></CardBody>
            )}
          </div>
        )}
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Process Stage' : 'Edit Process Stage'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-4 gap-3">
            <Input label="Number" value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} placeholder="01" required />
            <Input label="Timeline Badge" value={form.timeline} onChange={e => setForm(p => ({ ...p, timeline: e.target.value }))} placeholder="e.g. Week 1–2" required />
            <Input label="Icon (emoji)" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} className="text-xl text-center" placeholder="🔍" />
            <Input label="Sort Order" type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} />
          </div>

          <Input label="Stage Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="e.g. Discovery & System Architecture" />

          <Textarea label="Stage Summary / Mission" value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value, description: e.target.value }))} rows={2} required placeholder="Brief breakdown of what happens in this stage…" />

          <Textarea
            label="Deliverables (one per line)"
            value={form.deliverables}
            onChange={e => setForm(p => ({ ...p, deliverables: e.target.value }))}
            rows={4}
            placeholder={"Product Requirements Document (PRD)\nDatabase ERD & Schema\nAPI Contracts & Swagger\nSprint Milestone Roadmap"}
          />

          <Input
            label="Tools & Tech Stack (comma-separated)"
            value={form.tools}
            onChange={e => setForm(p => ({ ...p, tools: e.target.value }))}
            placeholder="Figma Jam, PostgreSQL, Swagger, GitHub Actions"
          />

          <Input
            label="Client Collaboration Checkpoint"
            value={form.client_checkpoint}
            onChange={e => setForm(p => ({ ...p, client_checkpoint: e.target.value }))}
            placeholder="e.g. Architecture Review & Kickoff Call (Full Scope Alignment)"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" loading={busy}>{modal === 'create' ? 'Create Stage' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
