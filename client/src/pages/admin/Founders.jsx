import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, resolveApiUrl } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { Pencil, Trash2, Plus, Upload, X as XIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  name: '', role: '', bio: '', initials: '',
  photo_url: '', avatar_bg: 'linear-gradient(135deg,#7c3aed,#00d4f5)',
  tags: '[]', linkedin_url: '',
}

export default function AdminFounders() {
  const qc = useQueryClient()
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [busy, setBusy]     = useState(false)

  // Photo upload state — kept separate from `form` because the file isn't
  // serializable and the upload happens in a second API call.
  const [photoFile, setPhotoFile]       = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')   // object URL
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

  // Clean up the object URL when the picked file changes or the modal closes
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
    setForm(EMPTY)
    setEditId(null)
    resetPhotoState()
    setModal('create')
  }
  function openEdit(f) {
    setForm({ ...f, tags: typeof f.tags === 'string' ? f.tags : JSON.stringify(f.tags) })
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
      tags: (() => {
        try { return JSON.stringify(JSON.parse(form.tags)) }
        catch { return JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)) }
      })(),
    }

    try {
      // Step 1 — save the founder record (creates or updates the row + ID).
      let savedId = editId
      if (modal === 'create') {
        const { data } = await adminApi.createFounder(payload)
        savedId = data.id
      } else {
        await adminApi.updateFounder(savedId, payload)
      }

      // Step 2 — apply photo changes against the now-known ID.
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

  // Decide what to show as the modal's avatar preview:
  // picked file > "remove" pressed > existing photo_url > initials fallback.
  const previewSrc = photoPreview
    || (photoRemoved ? '' : resolveApiUrl(form.photo_url))

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
                  ? <img src={resolveApiUrl(f.photo_url)} alt={f.name} className="w-full h-full object-cover" />
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

      <Modal open={!!modal} onClose={closeModal} title={modal === 'create' ? 'Add Founder' : 'Edit Founder'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Photo upload ───────────────────────────────────── */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div
              className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border border-white/[0.08]"
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
              <p className="text-xs font-semibold uppercase tracking-widest text-bb-muted mb-1">Photo</p>
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
                JPEG, PNG, WebP or GIF · max 1 MB. Or paste an external URL below.
              </p>
              {photoFile && (
                <p className="text-[0.68rem] text-bb-accent mt-0.5 truncate" title={photoFile.name}>
                  Selected: {photoFile.name} ({Math.round(photoFile.size / 1024)} KB)
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required placeholder="Muhammad Ahmed" />
            <Input label="Role / Title" value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))} required placeholder="Co-Founder & CEO" />
          </div>
          <Textarea label="Biography" value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} rows={4} required placeholder="A brief bio about this person…" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Initials (fallback avatar)" value={form.initials} onChange={e => setForm(p => ({...p, initials: e.target.value}))} placeholder="MA" maxLength={3} />
            <Input
              label="Photo URL (optional, external)"
              value={form.photo_url}
              onChange={e => { setForm(p => ({...p, photo_url: e.target.value})); setPhotoRemoved(false) }}
              placeholder="https://… or upload above"
            />
          </div>
          <Input label="Avatar Gradient CSS (optional)" value={form.avatar_bg} onChange={e => setForm(p => ({...p, avatar_bg: e.target.value}))} placeholder="linear-gradient(135deg,#7c3aed,#00d4f5)" />
          <Input label="LinkedIn URL (optional)" value={form.linkedin_url} onChange={e => setForm(p => ({...p, linkedin_url: e.target.value}))} placeholder="https://linkedin.com/in/username" />
          <Textarea label="Skill Tags (comma-separated)" value={form.tags} onChange={e => setForm(p => ({...p, tags: e.target.value}))} rows={2} placeholder="Product Strategy, Full-Stack Dev, Startup Growth" />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={busy}>{modal === 'create' ? 'Add Founder' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
