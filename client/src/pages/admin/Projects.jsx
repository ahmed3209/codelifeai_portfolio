import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import ImageUploadInput from '../../components/ui/ImageUploadInput'
import IconPicker from '../../components/ui/IconPicker'
import { Pencil, Trash2, Plus, ExternalLink, Image as ImageIcon, Sparkles, FolderKanban } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  title: '',
  category: 'Web Application',
  tags: '["React", "Node.js"]',
  outcome: '',
  emoji: '🚀',
  accent: '#00d4f5',
  bg: 'linear-gradient(135deg, rgba(0,212,245,0.12) 0%, rgba(124,58,237,0.06) 100%)',
  image_url: '',
  description: '',
  live_url: '',
  sort_order: 0,
}

const CATEGORIES = [
  'All',
  'Web Application',
  'Mobile Apps',
  'AI & Machine Learning',
  'SaaS Platforms',
  'E-Commerce',
]

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
  const [selectedCategory, setSelectedCategory] = useState('All')

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => adminApi.getProjects().then(r => r.data),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-projects'] })
    qc.invalidateQueries({ queryKey: ['site-data'] })
  }

  const createMut = useMutation({
    mutationFn: adminApi.createProject,
    onSuccess: () => {
      invalidate()
      setModal(null)
      toast.success('Project added successfully!')
    }
  })

  const updateMut = useMutation({
    mutationFn: ({ id, d }) => adminApi.updateProject(id, d),
    onSuccess: () => {
      invalidate()
      setModal(null)
      toast.success('Project updated!')
    }
  })

  const deleteMut = useMutation({
    mutationFn: adminApi.deleteProject,
    onSuccess: () => {
      invalidate()
      toast.success('Project deleted')
    }
  })

  function openCreate() {
    setForm({
      ...EMPTY,
      category: selectedCategory !== 'All' ? selectedCategory : 'Web Application'
    })
    setEditId(null)
    setModal('create')
  }

  function openEdit(p) {
    setForm({
      title: p.title || '',
      category: p.category || 'Web Application',
      tags: typeof p.tags === 'string' ? p.tags : JSON.stringify(p.tags || []),
      outcome: p.outcome || '',
      emoji: p.emoji || '🚀',
      accent: p.accent || '#00d4f5',
      bg: p.bg || 'linear-gradient(135deg, rgba(0,212,245,0.12) 0%, rgba(124,58,237,0.06) 100%)',
      image_url: p.image_url || '',
      description: p.description || '',
      live_url: p.live_url || '',
      sort_order: p.sort_order || 0,
    })
    setEditId(p.id)
    setModal('edit')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Project title is required')
      return
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      category: form.category.trim() || 'Web Application',
      tags: parseTags(form.tags),
      outcome: form.outcome.trim(),
      live_url: (form.live_url || '').trim(),
      image_url: (form.image_url || '').trim(),
      description: (form.description || '').trim(),
      sort_order: Number(form.sort_order) || 0,
    }

    if (modal === 'create') createMut.mutate(payload)
    else updateMut.mutate({ id: editId, d: payload })
  }

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter(p => p.category === selectedCategory)

  const busy = createMut.isPending || updateMut.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight">Portfolio &amp; Case Studies</h1>
          <p className="text-bb-muted text-sm mt-1">
            Manage projects, screenshots, live links, and outcome metrics shown on the Work page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/work"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-bb-muted hover:text-[#00d4f5] px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] transition-colors"
          >
            View Live Portfolio <ExternalLink size={12} />
          </a>
          <Button onClick={openCreate}>
            <Plus size={16} /> Add Project
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => {
          const count = cat === 'All' ? projects.length : projects.filter(p => p.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#00d4f5] text-black font-bold shadow-md shadow-[#00d4f5]/20'
                  : 'bg-white/[0.04] text-bb-muted hover:text-bb-white hover:bg-white/[0.08]'
              }`}
            >
              {cat} ({count})
            </button>
          )
        })}
      </div>

      {/* Projects List */}
      <Card>
        {isLoading ? (
          <CardBody><p className="text-bb-muted text-sm py-4">Loading projects…</p></CardBody>
        ) : filteredProjects.length === 0 ? (
          <CardBody>
            <div className="text-center py-10">
              <FolderKanban size={32} className="text-bb-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-bb-white">No projects found</p>
              <p className="text-xs text-bb-muted mt-1">Click "Add Project" to showcase your work.</p>
            </div>
          </CardBody>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filteredProjects.map(p => (
              <div key={p.id} className="p-4 sm:p-5 hover:bg-white/[0.015] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Thumbnail Image or Emoji Icon */}
                    {p.image_url ? (
                      <div className="w-16 h-12 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex-shrink-0">
                        <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: p.bg || 'rgba(0,212,245,0.08)' }}
                      >
                        {p.emoji || '🚀'}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#00d4f5] bg-[#00d4f5]/10 border border-[#00d4f5]/20 px-2 py-0.5 rounded-full">
                          {p.category || 'Web Application'}
                        </span>
                        {p.outcome && (
                          <span className="text-[0.65rem] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                            {p.outcome}
                          </span>
                        )}
                        <span className="text-[0.65rem] text-bb-muted font-mono">Order: {p.sort_order}</span>
                      </div>

                      <h3 className="text-sm font-bold text-bb-white mt-1 leading-snug">
                        {p.title}
                      </h3>

                      {p.description && (
                        <p className="text-xs text-bb-muted mt-1 line-clamp-1">
                          {p.description}
                        </p>
                      )}

                      {p.live_url && (
                        <p className="text-[0.68rem] text-slate-500 font-mono mt-1">
                          Live: {p.live_url}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    {p.live_url && (
                      <a
                        href={p.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/[0.04] text-[#00d4f5] hover:bg-[#00d4f5]/15 transition-colors"
                        title="Open Live Website"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)} title="Edit Project">
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete project "${p.title}"?`)) deleteMut.mutate(p.id)
                      }}
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Add Portfolio Project' : 'Edit Project'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 items-start">
            <IconPicker
              label="Project Icon"
              value={form.emoji}
              onChange={(ic) => setForm(p => ({ ...p, emoji: ic }))}
            />
            <div className="space-y-1">
              <Input
                label="Project Title"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                required
                placeholder="e.g. FinTrack — Banking & Wealth Dashboard"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-bb-muted uppercase tracking-widest block">
                Category
              </label>
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full bg-[#0d0d1e] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-bb-white outline-none focus:border-bb-accent/40 transition-colors"
              >
                {CATEGORIES.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c} className="bg-[#0d0d1e] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Outcome / Metric Highlight"
              value={form.outcome}
              onChange={e => setForm(p => ({ ...p, outcome: e.target.value }))}
              placeholder="e.g. 10k+ Active Users, $2M+ Processed"
            />
          </div>

          <ImageUploadInput
            label="Project Screenshot / Mockup Image"
            value={form.image_url}
            onChange={(url) => setForm(p => ({ ...p, image_url: url }))}
            helperText="Browse a screenshot from your computer or paste an online URL."
          />

          <Input
            label="Live Website / Demo URL"
            value={form.live_url}
            onChange={e => setForm(p => ({ ...p, live_url: e.target.value }))}
            placeholder="https://example.com"
          />

          <Textarea
            label="Detailed Architecture & Project Description"
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={3}
            placeholder="Describe the problem solved, tech architecture, and key capabilities shipped…"
          />

          <Textarea
            label="Tech Stack Tags (comma-separated or JSON array)"
            value={form.tags}
            onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
            rows={2}
            placeholder="React, TypeScript, Node.js, PostgreSQL, TailwindCSS"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Accent Color (Hex)"
              value={form.accent}
              onChange={e => setForm(p => ({ ...p, accent: e.target.value }))}
              placeholder="#00d4f5"
            />
            <Input
              label="Sort Order"
              type="number"
              value={form.sort_order}
              onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              {modal === 'create' ? 'Create Project' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
