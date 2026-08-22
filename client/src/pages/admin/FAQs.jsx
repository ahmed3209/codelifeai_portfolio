import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { Plus, Pencil, Trash2, HelpCircle, ChevronDown, Sparkles, ExternalLink, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_FAQ = {
  question: '',
  answer: '',
  category: 'General',
  sort_order: 0,
}

const CATEGORIES = [
  'General',
  'Process & Timeline',
  'Legal & Ownership',
  'Security & NDA',
  'Technology',
  'Support & Warranty',
  'Communication',
]

export default function AdminFAQs() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [form, setForm] = useState(EMPTY_FAQ)
  const [editId, setEditId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedId, setExpandedId] = useState(null)

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: () => adminApi.getFaqs().then(r => r.data),
  })

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['admin-faqs'] })
    qc.invalidateQueries({ queryKey: ['site-data'] })
  }

  const createMut = useMutation({
    mutationFn: adminApi.createFaq,
    onSuccess: () => {
      invalidate()
      setModal(null)
      toast.success('FAQ created successfully!')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create FAQ')
  })

  const updateMut = useMutation({
    mutationFn: ({ id, d }) => adminApi.updateFaq(id, d),
    onSuccess: () => {
      invalidate()
      setModal(null)
      toast.success('FAQ updated successfully!')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update FAQ')
  })

  const deleteMut = useMutation({
    mutationFn: adminApi.deleteFaq,
    onSuccess: () => {
      invalidate()
      toast.success('FAQ deleted')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete FAQ')
  })

  function openCreate() {
    setForm({ ...EMPTY_FAQ, category: selectedCategory !== 'All' ? selectedCategory : 'General' })
    setEditId(null)
    setModal('create')
  }

  function openEdit(f) {
    setForm({
      question: f.question || '',
      answer: f.answer || '',
      category: f.category || 'General',
      sort_order: f.sort_order || 0,
    })
    setEditId(f.id)
    setModal('edit')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Question and answer are required')
      return
    }

    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      category: form.category.trim() || 'General',
      sort_order: Number(form.sort_order) || 0,
    }

    if (modal === 'create') createMut.mutate(payload)
    else updateMut.mutate({ id: editId, d: payload })
  }

  const filteredFaqs = selectedCategory === 'All'
    ? faqs
    : faqs.filter(f => f.category === selectedCategory)

  const busy = createMut.isPending || updateMut.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight">Website FAQs Manager</h1>
          <p className="text-bb-muted text-sm mt-1">
            Manage frequently asked questions displayed on your website's interactive FAQ section.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/#faq"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-bb-muted hover:text-[#00d4f5] px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] transition-colors"
          >
            Preview on Site <ExternalLink size={12} />
          </a>
          <Button onClick={openCreate}>
            <Plus size={16} /> Add New FAQ
          </Button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'All'
              ? 'bg-[#00d4f5] text-black font-bold shadow-md shadow-[#00d4f5]/20'
              : 'bg-white/[0.04] text-bb-muted hover:text-bb-white hover:bg-white/[0.08]'
          }`}
        >
          All Categories ({faqs.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = faqs.filter(f => f.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#00d4f5] text-black font-bold shadow-md shadow-[#00d4f5]/20'
                  : 'bg-white/[0.04] text-bb-muted hover:text-bb-white hover:bg-white/[0.08]'
              }`}
            >
              {cat} {count > 0 && <span className="opacity-70 text-[0.68rem] ml-1">({count})</span>}
            </button>
          )
        })}
      </div>

      {/* FAQs List */}
      <Card>
        {isLoading ? (
          <CardBody><p className="text-bb-muted text-sm py-4">Loading FAQs…</p></CardBody>
        ) : filteredFaqs.length === 0 ? (
          <CardBody>
            <div className="text-center py-10">
              <HelpCircle size={32} className="text-bb-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-bb-white">No FAQs found</p>
              <p className="text-xs text-bb-muted mt-1">
                {selectedCategory === 'All'
                  ? 'No FAQs have been added yet. Click "Add New FAQ" to create your first one.'
                  : `No FAQs in the "${selectedCategory}" category.`}
              </p>
            </div>
          </CardBody>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filteredFaqs.map(f => {
              const isExpanded = expandedId === f.id
              return (
                <div key={f.id} className="p-4 sm:p-5 hover:bg-white/[0.015] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : f.id)}
                      className="flex-1 text-left flex items-start gap-3 group select-none min-w-0"
                    >
                      <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#00d4f5] flex-shrink-0 mt-0.5 group-hover:border-[#00d4f5]/30 transition-colors">
                        <HelpCircle size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#00d4f5] bg-[#00d4f5]/10 border border-[#00d4f5]/20 px-2 py-0.5 rounded-full">
                            {f.category || 'General'}
                          </span>
                          <span className="text-[0.65rem] text-bb-muted font-mono">
                            Order: {f.sort_order}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-bb-white mt-1 group-hover:text-[#00d4f5] transition-colors">
                          {f.question}
                        </h3>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-bb-muted flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180 text-bb-white' : ''}`}
                      />
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(f)} title="Edit FAQ">
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Delete FAQ: "${f.question}"?`)) {
                            deleteMut.mutate(f.id)
                          }
                        }}
                        title="Delete FAQ"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* Expandable Answer */}
                  {isExpanded && (
                    <div className="mt-3.5 pt-3 border-t border-white/[0.06] pl-10 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {f.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Add Frequently Asked Question' : 'Edit FAQ'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Question"
            value={form.question}
            onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
            required
            placeholder="e.g. What is the typical timeline for an MVP?"
          />

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
                {CATEGORIES.map(c => (
                  <option key={c} value={c} className="bg-[#0d0d1e] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Sort Order (Lower appears first)"
              type="number"
              value={form.sort_order}
              onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
              placeholder="0"
            />
          </div>

          <Textarea
            label="Detailed Answer"
            value={form.answer}
            onChange={e => setForm(p => ({ ...p, answer: e.target.value }))}
            required
            rows={6}
            placeholder="Provide a clear, helpful, and transparent answer for your prospective clients…"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              {modal === 'create' ? 'Create FAQ' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
