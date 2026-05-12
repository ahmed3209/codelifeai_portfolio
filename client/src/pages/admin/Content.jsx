import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import toast from 'react-hot-toast'

export default function AdminContent() {
  const qc = useQueryClient()
  const { data: content = {} } = useQuery({ queryKey: ['admin-content'], queryFn: () => adminApi.getContent().then(r => r.data) })
  const [form, setForm] = useState({})

  useEffect(() => { setForm(content) }, [content])

  const updateMut = useMutation({
    mutationFn: adminApi.updateContent,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-content'] }); toast.success('Content saved!') }
  })

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-bb-white tracking-tight">Site Content</h1>
        <p className="text-bb-muted text-sm mt-1">Edit all text content across the public portfolio.</p>
      </div>

      {/* Hero */}
      <Card>
        <CardHeader><h2 className="text-sm font-bold text-bb-white">Hero Section</h2></CardHeader>
        <CardBody className="space-y-4">
          <Input label="Badge text" value={form.hero_badge || ''} onChange={set('hero_badge')} placeholder="We build what's next" />
          <Input label="Main title (large)" value={form.hero_title || ''} onChange={set('hero_title')} placeholder="We Create" />
          <Input label="Cycling words (comma-separated)" value={form.hero_cycling_words || ''} onChange={set('hero_cycling_words')} placeholder="Software., Products., Experiences." />
          <Textarea label="Subtitle paragraph" value={form.hero_subtitle || ''} onChange={set('hero_subtitle')} rows={2} placeholder="CodeLifeAI is a software startup…" />
          <Textarea label="Marquee items (comma-separated)" value={form.marquee_items || ''} onChange={set('marquee_items')} rows={2} placeholder="Web Development, Mobile Apps, UI/UX Design…" />
        </CardBody>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader><h2 className="text-sm font-bold text-bb-white">Contact & Social</h2></CardHeader>
        <CardBody className="space-y-4">
          <Input label="Contact email" value={form.contact_email || ''} onChange={set('contact_email')} placeholder="hello@codelifeai.com" />
          <Textarea label="Contact section subtitle" value={form.contact_subtitle || ''} onChange={set('contact_subtitle')} rows={2} placeholder="Have a project in mind?…" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="LinkedIn URL" value={form.social_linkedin || ''} onChange={set('social_linkedin')} placeholder="https://linkedin.com/…" />
            <Input label="GitHub URL" value={form.social_github || ''} onChange={set('social_github')} placeholder="https://github.com/…" />
            <Input label="Twitter / X URL" value={form.social_twitter || ''} onChange={set('social_twitter')} placeholder="https://x.com/…" />
            <Input label="WhatsApp URL" value={form.social_whatsapp || ''} onChange={set('social_whatsapp')} placeholder="https://wa.me/…" />
          </div>
        </CardBody>
      </Card>

      {/* Footer */}
      <Card>
        <CardHeader><h2 className="text-sm font-bold text-bb-white">Footer</h2></CardHeader>
        <CardBody className="space-y-4">
          <Textarea label="Footer tagline (italic serif)" value={form.footer_tagline || ''} onChange={set('footer_tagline')} rows={2} placeholder="We build digital products that are fast…" />
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => updateMut.mutate(form)} loading={updateMut.isPending} size="lg">
          Save All Changes
        </Button>
      </div>
    </div>
  )
}
