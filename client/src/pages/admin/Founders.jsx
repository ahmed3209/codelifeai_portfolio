import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, resolveApiUrl } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { Pencil, Trash2, Plus, Upload, X as XIcon, Home, Check, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  name: '',
  role: '',
  bio: '',
  initials: '',
  photo_url: '',
  avatar_bg: 'linear-gradient(135deg,#7c3aed,#00d4f5)',
  tags: '[]',
  linkedin_url: '',
  show_on_home: 1,
  sort_order: 1,
}

export default function AdminFounders() {
  const qc = useQueryClient()
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [busy, setBusy]     = useState(false)

  // Photo upload state
  const [photoFile, setPhotoFile]       = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoRemoved, setPhotoRemoved] = useState(false)
  const fileInputRef = useRef(null)

  const { data: founders = [] } = useQuery({
    queryKey: ['admin-founders'],
    queryFn: () => adminApi.getFounders().then(r => r.data),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-founders'] })
    qc.invalidateQueries({ queryKey: ['site-data'] })
  }

  const deleteMut = useMutation({
    mutationFn: adminApi.deleteFounder,
    onSuccess: () => { invalidate(); toast.success('Founder removed') },
  })

  const toggleHomeMut = useMutation({
    mutationFn: ({ id, show_on_home }) => adminApi.toggleFounderHome(id, show_on_home),
    onSuccess: (data) => {
      invalidate()
      toast.success(data.data?.show_on_home ? 'Featured on Homepage!' : 'Removed from Homepage (visible on Team page)')
    },
    onError: () => toast.error('Failed to update homepage status')
  })

  useEffect(() => {
    return () => { if (photoPreview) URL.revokeObjectURL(photoPreview) }
  }, [photoPreview])

  function resetPhotoState() {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(null)
    setPhotoPreview('')
    setPhotoRemoved(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function openCreate() {
    setForm({
      ...EMPTY,
      sort_order: founders.length + 1,
    })
    setEditId(null)
    resetPhotoState()
    setModal('create')
  }

  function openEdit(f) {
    setForm({
      ...f,
      tags: typeof f.tags === 'string' ? f.tags : JSON.stringify(f.tags || []),
      show_on_home: f.show_on_home !== 0 ? 1 : 0,
      sort_order: f.sort_order || 0,
    })
    setEditId(f.id)
    resetPhotoState()
    setModal('edit')
  }

  function closeModal() {
    resetPhotoState()
    setModal(null)
  }

  function onPickFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!/^image\//i.test(file.type)) { toast.error('Please choose an image file'); return }
    if (file.size > 1024 * 1024)       { toast.error('Image is too large (max 1 MB)'); return }
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setPhotoRemoved(false)
  }

  function onRemovePhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(null)
    setPhotoPreview('')
    setPhotoRemoved(true)
    setForm(p => ({ ...p, photo_url: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (busy) return
    setBusy(true)

    const payload = {
      ...form,
      show_on_home: form.show_on_home ? 1 : 0,
      sort_order: Number(form.sort_order) || 0,
      tags: (() => {
        try { return JSON.stringify(JSON.parse(form.tags)) }
        catch { return JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)) }
      })(),
    }

    try {
      let savedId = editId
      if (modal === 'create') {
        const { data } = await adminApi.createFounder(payload)
        savedId = data.id
      } else {
        await adminApi.updateFounder(savedId, payload)
      }

      if (photoFile) {
        await adminApi.uploadFounderPhoto(savedId, photoFile)
      } else if (photoRemoved && modal === 'edit') {
        await adminApi.deleteFounderPhoto(savedId)
      }

      invalidate()
      closeModal()
      toast.success(modal === 'create' ? 'Founder added!' : 'Founder updated!')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  const previewSrc = photoPreview || (photoRemoved ? '' : resolveApiUrl(form.photo_url))
  const homeCount = founders.filter(f => f.show_on_home !== 0).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight">Leadership &amp; Team</h1>
          <p className="text-bb-muted text-sm mt-1">
            Manage founders and engineers. Control who appears on the Homepage vs full Team page, and set display sort order.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-bb-muted">
            <strong className="text-[#00d4f5]">{homeCount}</strong> featured on Homepage
          </span>
          <Button onClick={openCreate}><Plus size={16} /> Add Member</Button>
        </div>
      </div>

      {/* Founders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {founders.map(f => {
          const isHome = f.show_on_home !== 0
          return (
            <Card key={f.id} className="relative overflow-hidden">
              <CardBody className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-white/[0.1] shadow-lg"
                  style={{ background: f.avatar_bg }}
                >
                  {f.photo_url ? (
                    <img src={resolveApiUrl(f.photo_url)} alt={f.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-white text-lg">
                      {f.initials || f.name[0]}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-[0.62rem] font-mono font-bold text-[#00d4f5]">
                      #{f.sort_order || 1}
                    </span>
                    <p className="text-sm font-bold text-bb-white">{f.name}</p>
                    <button
                      type="button"
                      onClick={() => toggleHomeMut.mutate({ id: f.id, show_on_home: !isHome })}
                      className={`px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                        isHome
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                          : 'bg-white/[0.04] border border-white/[0.08] text-slate-500 hover:text-slate-300'
                      }`}
                      title={isHome ? 'Click to hide from Homepage' : 'Click to show on Homepage'}
                    >
                      <Home size={10} />
                      {isHome ? 'On Home' : 'Team Page Only'}
                    </button>
                  </div>

                  <p className="text-[0.72rem] font-semibold uppercase tracking-wider text-bb-accent mb-1">{f.role}</p>
                  <p className="text-xs text-bb-muted line-clamp-2">{f.bio}</p>
                </div>

                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(f)} title="Edit">
                    <Pencil size={13} />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => { if (confirm(`Remove ${f.name}?`)) deleteMut.mutate(f.id) }}
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </CardBody>
            </Card>
          )
        })}
        {founders.length === 0 && (
          <Card className="col-span-2">
            <CardBody><p className="text-bb-muted text-sm text-center py-4">No team members yet.</p></CardBody>
          </Card>
        )}
      </div>

      {/* Modal */}
      <Modal open={!!modal} onClose={closeModal} title={modal === 'create' ? 'Add Member' : 'Edit Member'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">

          {/* Photo upload */}
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div
              className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-white/[0.08]"
              style={{ background: form.avatar_bg }}
            >
              {previewSrc ? (
                <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-white text-lg">
                  {form.initials || form.name?.[0] || '?'}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-bb-muted mb-1">Profile Photo</p>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={onPickFile}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={13} /> {photoFile ? 'Change file' : 'Choose file'}
                </Button>
                {(form.photo_url || photoFile) && !photoRemoved && (
                  <Button type="button" variant="ghost" size="sm" onClick={onRemovePhoto}>
                    <XIcon size={13} /> Remove
                  </Button>
                )}
              </div>
              <p className="text-[0.68rem] text-bb-muted mt-1.5">
                JPEG, PNG, WebP · max 1 MB. Or paste an external URL below.
              </p>
            </div>
          </div>

          {/* Homepage Visibility Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <div>
              <label className="text-xs font-bold text-bb-white block">
                Show in Homepage Spotlight
              </label>
              <p className="text-[0.72rem] text-bb-muted">
                Turn on to display this member on the clean Homepage founders section.
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required placeholder="Muhammad Ahmed" />
            <Input label="Role / Title" value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))} required placeholder="Co-Founder & CEO" />
          </div>

          <Textarea label="Biography" value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} rows={3} required placeholder="A brief bio about this leader/engineer…" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Initials (fallback avatar)" value={form.initials} onChange={e => setForm(p => ({...p, initials: e.target.value}))} placeholder="MA" maxLength={3} />
            <Input
              label="Photo URL (optional external)"
              value={form.photo_url}
              onChange={e => { setForm(p => ({...p, photo_url: e.target.value})); setPhotoRemoved(false) }}
              placeholder="https://… or upload above"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="LinkedIn URL (optional)" value={form.linkedin_url} onChange={e => setForm(p => ({...p, linkedin_url: e.target.value}))} placeholder="https://linkedin.com/in/username" />
            <Input label="Sort Order" type="number" value={form.sort_order} onChange={e => setForm(p => ({...p, sort_order: Number(e.target.value)}))} placeholder="1" />
            <Input label="Avatar Gradient CSS (optional)" value={form.avatar_bg} onChange={e => setForm(p => ({...p, avatar_bg: e.target.value}))} placeholder="linear-gradient(135deg,#7c3aed,#00d4f5)" />
          </div>

          <Textarea label="Skill Tags (comma-separated)" value={form.tags} onChange={e => setForm(p => ({...p, tags: e.target.value}))} rows={2} placeholder="Product Strategy, Full-Stack Dev, System Architecture" />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={busy}>{modal === 'create' ? 'Add Member' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
