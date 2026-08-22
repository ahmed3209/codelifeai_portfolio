import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import ImageUploadInput from '../../components/ui/ImageUploadInput'
import {
  Plus, Pencil, Trash2, BookOpen, ExternalLink,
  Eye, CheckCircle2, Clock, Sparkles, Image as ImageIcon,
  Tag, User, Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_BLOG = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image: '',
  category: 'AI & Machine Learning',
  author_name: 'CodeLifeAI Engineering',
  author_role: 'Core Team',
  read_time: '5 min read',
  is_published: 1,
  sort_order: 0,
}

const CATEGORIES = [
  'AI & Machine Learning',
  'Architecture',
  'Mobile Engineering',
  'Cloud & DevOps',
  'Product Strategy',
  'Engineering',
]

export default function AdminBlogs() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [form, setForm] = useState(EMPTY_BLOG)
  const [editId, setEditId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: () => adminApi.getBlogs().then(r => r.data),
  })

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['admin-blogs'] })
    qc.invalidateQueries({ queryKey: ['site-data'] })
  }

  const createMut = useMutation({
    mutationFn: adminApi.createBlog,
    onSuccess: () => {
      invalidate()
      setModal(null)
      toast.success('Article created successfully!')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create article')
  })

  const updateMut = useMutation({
    mutationFn: ({ id, d }) => adminApi.updateBlog(id, d),
    onSuccess: () => {
      invalidate()
      setModal(null)
      toast.success('Article updated!')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update article')
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, is_published }) => adminApi.toggleBlog(id, is_published),
    onSuccess: (data) => {
      invalidate()
      toast.success(`Article ${data.data?.is_published ? 'published' : 'moved to drafts'}`)
    },
    onError: () => toast.error('Failed to change status')
  })

  const deleteMut = useMutation({
    mutationFn: adminApi.deleteBlog,
    onSuccess: () => {
      invalidate()
      toast.success('Article deleted')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete article')
  })

  function openCreate() {
    setForm({
      ...EMPTY_BLOG,
      category: selectedCategory !== 'All' ? selectedCategory : 'AI & Machine Learning',
    })
    setEditId(null)
    setModal('create')
  }

  function openEdit(b) {
    setForm({
      title: b.title || '',
      slug: b.slug || '',
      excerpt: b.excerpt || '',
      content: b.content || '',
      cover_image: b.cover_image || '',
      category: b.category || 'Engineering',
      author_name: b.author_name || 'CodeLifeAI Engineering',
      author_role: b.author_role || 'Core Team',
      read_time: b.read_time || '5 min read',
      is_published: b.is_published ? 1 : 0,
      sort_order: b.sort_order || 0,
    })
    setEditId(b.id)
    setModal('edit')
  }

  function handleTitleChange(e) {
    const title = e.target.value
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    setForm(p => ({
      ...p,
      title,
      slug: modal === 'create' ? slug : p.slug,
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required')
      return
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt.trim() || form.title.trim(),
      content: form.content.trim(),
      category: form.category.trim() || 'Engineering',
      sort_order: Number(form.sort_order) || 0,
      is_published: Number(form.is_published) || 1,
    }

    if (modal === 'create') createMut.mutate(payload)
    else updateMut.mutate({ id: editId, d: payload })
  }

  const filteredBlogs = selectedCategory === 'All'
    ? blogs
    : blogs.filter(b => b.category === selectedCategory)

  const busy = createMut.isPending || updateMut.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight">Articles &amp; Engineering Blog CMS</h1>
          <p className="text-bb-muted text-sm mt-1">
            Write, publish, and manage engineering insights and company updates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-bb-muted hover:text-[#00d4f5] px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] transition-colors"
          >
            View Live Blog <ExternalLink size={12} />
          </a>
          <Button onClick={openCreate}>
            <Plus size={16} /> New Article
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
          All Articles ({blogs.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = blogs.filter(b => b.category === cat).length
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

      {/* Articles List */}
      <Card>
        {isLoading ? (
          <CardBody><p className="text-bb-muted text-sm py-4">Loading articles…</p></CardBody>
        ) : filteredBlogs.length === 0 ? (
          <CardBody>
            <div className="text-center py-10">
              <BookOpen size={32} className="text-bb-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-bb-white">No articles found</p>
              <p className="text-xs text-bb-muted mt-1">
                {selectedCategory === 'All'
                  ? 'No articles have been created yet. Click "New Article" to write your first post.'
                  : `No articles in "${selectedCategory}".`}
              </p>
            </div>
          </CardBody>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filteredBlogs.map(b => (
              <div key={b.id} className="p-4 sm:p-5 hover:bg-white/[0.015] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#00d4f5] flex-shrink-0 mt-0.5">
                      <BookOpen size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#00d4f5] bg-[#00d4f5]/10 border border-[#00d4f5]/20 px-2 py-0.5 rounded-full">
                          {b.category || 'Engineering'}
                        </span>
                        <span className={`text-[0.65rem] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          b.is_published
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {b.is_published ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-[0.68rem] text-bb-muted flex items-center gap-1 font-mono">
                          <Clock size={11} /> {b.read_time}
                        </span>
                        {b.views > 0 && (
                          <span className="text-[0.68rem] text-bb-muted flex items-center gap-1 font-mono">
                            <Eye size={11} /> {b.views} views
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-bb-white mt-1 leading-snug">
                        {b.title}
                      </h3>
                      <p className="text-xs text-bb-muted mt-1 line-clamp-1">
                        {b.excerpt}
                      </p>
                      <p className="text-[0.68rem] text-slate-500 font-mono mt-1">
                        /blog/{b.slug} · By {b.author_name} ({b.author_role})
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status Toggle */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleMut.mutate({ id: b.id, is_published: !b.is_published })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        b.is_published
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-white/[0.04] border-white/[0.08] text-bb-muted hover:text-white'
                      }`}
                    >
                      {b.is_published ? 'Unpublish' : 'Publish'}
                    </button>

                    <a
                      href={`/blog/${b.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-bb-muted hover:text-white transition-colors"
                      title="View article"
                    >
                      <ExternalLink size={14} />
                    </a>

                    <Button variant="ghost" size="sm" onClick={() => openEdit(b)} title="Edit Article">
                      <Pencil size={14} />
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete article "${b.title}"?`)) {
                          deleteMut.mutate(b.id)
                        }
                      }}
                      title="Delete Article"
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
        title={modal === 'create' ? 'Write New Article' : 'Edit Article'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">
          <Input
            label="Article Title"
            value={form.title}
            onChange={handleTitleChange}
            required
            placeholder="e.g. Building Production-Grade AI Agents with Gemini 2.0"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="URL Slug (/blog/...)"
              value={form.slug}
              onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
              required
              placeholder="e.g. building-production-ai-agents"
            />

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
          </div>

          <Textarea
            label="Short Excerpt / Teaser"
            value={form.excerpt}
            onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
            rows={2}
            placeholder="A compelling 1-2 sentence summary displayed on the blog feed and search previews…"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Author Name"
              value={form.author_name}
              onChange={e => setForm(p => ({ ...p, author_name: e.target.value }))}
              placeholder="CodeLifeAI Engineering"
            />
            <Input
              label="Author Role"
              value={form.author_role}
              onChange={e => setForm(p => ({ ...p, author_role: e.target.value }))}
              placeholder="AI Architecture Lead"
            />
            <Input
              label="Estimated Read Time"
              value={form.read_time}
              onChange={e => setForm(p => ({ ...p, read_time: e.target.value }))}
              placeholder="5 min read"
            />
          </div>

          <ImageUploadInput
            label="Cover Image (Optional)"
            value={form.cover_image}
            onChange={(url) => setForm(p => ({ ...p, cover_image: url }))}
            helperText="Upload a cover photo from your computer or paste an online URL."
          />

          <Textarea
            label="Full Article Content (Supports Markdown & Code Snippets)"
            value={form.content}
            onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
            required
            rows={10}
            placeholder="Write your article content using Markdown format (### Headers, - Lists, ```code blocks```)…"
          />

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!form.is_published}
                onChange={e => setForm(p => ({ ...p, is_published: e.target.checked ? 1 : 0 }))}
                className="w-4 h-4 rounded text-[#00d4f5] bg-white/[0.06] border-white/20 focus:ring-0"
              />
              <span className="text-xs font-semibold text-bb-white">Publish Immediately</span>
            </label>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={busy}>
                {modal === 'create' ? 'Publish Article' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
