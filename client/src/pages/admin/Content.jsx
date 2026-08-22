import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { LayoutGrid, Eye, Check, Sparkles, SlidersHorizontal, Image as ImageIcon, Globe, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const SECTION_TOGGLES = [
  { key: 'section_trust_marquee', label: 'Trust & Engineering Metrics Ticker', desc: 'Marquee bar with live velocity and uptime metrics' },
  { key: 'section_services', label: 'Core Services Preview Grid', desc: 'High-level services summary with detail popup modals' },
  { key: 'section_promo_teaser', label: 'Active Promo & Product Launch Teaser', desc: 'Countdown and teaser for active product launches' },
  { key: 'section_blog_preview', label: 'Latest Engineering Insights (Blog Preview)', desc: '3 latest technical articles preview with direct reader links' },
  { key: 'section_testimonials', label: 'Client Reviews & Testimonials Carousel', desc: 'Verified client reviews and ratings' },
  { key: 'section_founders', label: 'Leadership & Founders Spotlight', desc: 'Featured leadership profiles' },
  { key: 'section_cta_banner', label: 'Bottom Conversion CTA Banner', desc: 'Consultation and project estimate conversion banner' },
]

export default function AdminContent() {
  const qc = useQueryClient()
  const { data: content = {} } = useQuery({
    queryKey: ['admin-content'],
    queryFn: () => adminApi.getContent().then(r => r.data)
  })
  const [form, setForm] = useState({})

  useEffect(() => { setForm(content) }, [content])

  const updateMut = useMutation({
    mutationFn: adminApi.updateContent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-content'] })
      qc.invalidateQueries({ queryKey: ['site-data'] })
      toast.success('Site branding, logo & content saved successfully!')
    }
  })

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))
  const toggleSection = (key) => {
    setForm(p => {
      const current = p[key] !== '0'
      return { ...p, [key]: current ? '0' : '1' }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight">Site Branding &amp; Content CMS</h1>
          <p className="text-bb-muted text-sm mt-1">
            Change your site logo, brand assets, homepage section toggles, headlines, and contact details.
          </p>
        </div>
        <Button
          onClick={() => updateMut.mutate(form)}
          loading={updateMut.isPending}
          size="lg"
        >
          Save All Changes
        </Button>
      </div>

      {/* 1. Brand Assets & Logo Manager */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-[#00d4f5]" />
            <h2 className="text-sm font-bold text-bb-white">Site Logo &amp; Brand Assets</h2>
          </div>
          <p className="text-xs text-bb-muted mt-0.5">
            Update your header logo and site branding across all public pages.
          </p>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Site Logo URL (Navbar & Footer)"
              value={form.site_logo_url || ''}
              onChange={set('site_logo_url')}
              placeholder="/logo.svg or https://.../logo.png"
            />
            <Input
              label="Site Favicon URL"
              value={form.site_favicon_url || ''}
              onChange={set('site_favicon_url')}
              placeholder="/favicon.ico or https://.../icon.png"
            />
          </div>

          {/* Logo Live Preview */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold text-slate-300">Active Logo Preview:</p>
              <p className="text-[0.7rem] text-slate-400">Rendered on dark navigation headers</p>
            </div>
            <div className="h-10 px-4 rounded-xl bg-[#06060f] border border-white/10 flex items-center justify-center">
              <img
                src={form.site_logo_url || '/logo.svg'}
                alt="Logo Preview"
                className="h-6 w-auto object-contain"
                onError={(e) => { e.target.src = '/logo.svg' }}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 2. Homepage Section Visibility Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-[#00d4f5]" />
            <h2 className="text-sm font-bold text-bb-white">Homepage Section Visibility Controls</h2>
          </div>
          <p className="text-xs text-bb-muted mt-0.5">
            Turn individual sections on or off to keep your Homepage exactly as concise or detailed as you want.
          </p>
        </CardHeader>
        <CardBody className="divide-y divide-white/[0.06] p-0">
          {SECTION_TOGGLES.map(sec => {
            const isEnabled = form[sec.key] !== '0'
            return (
              <div key={sec.key} className="flex items-center justify-between p-4 sm:p-5 hover:bg-white/[0.015] transition-colors">
                <div>
                  <p className="text-sm font-bold text-bb-white">{sec.label}</p>
                  <p className="text-xs text-bb-muted mt-0.5">{sec.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSection(sec.key)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 flex-shrink-0 ${
                    isEnabled ? 'bg-[#00d4f5]' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-black transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </CardBody>
      </Card>

      {/* 3. Hero Section */}
      <Card>
        <CardHeader><h2 className="text-sm font-bold text-bb-white">Hero Section</h2></CardHeader>
        <CardBody className="space-y-4">
          <Input label="Badge text" value={form.hero_badge || ''} onChange={set('hero_badge')} placeholder="We build what's next" />
          <Input label="Main title (large)" value={form.hero_title || ''} onChange={set('hero_title')} placeholder="We Create" />
          <Input label="Cycling words (comma-separated)" value={form.hero_cycling_words || ''} onChange={set('hero_cycling_words')} placeholder="Software., Products., Experiences." />
          <Textarea label="Subtitle paragraph" value={form.hero_subtitle || ''} onChange={set('hero_subtitle')} rows={2} placeholder="CodeLifeAI is a software studio…" />
          <Textarea label="Marquee items (comma-separated)" value={form.marquee_items || ''} onChange={set('marquee_items')} rows={2} placeholder="Web Development, Mobile Apps, AI Engineering, Cloud Infrastructure…" />
        </CardBody>
      </Card>

      {/* 4. Contact & Social */}
      <Card>
        <CardHeader><h2 className="text-sm font-bold text-bb-white">Contact &amp; Social Links</h2></CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Contact email" value={form.contact_email || ''} onChange={set('contact_email')} placeholder="contact@codelifeai.com" />
            <Input label="Contact phone" value={form.contact_phone || ''} onChange={set('contact_phone')} placeholder="+92 300 1234567" />
          </div>
          <Textarea label="Contact section subtitle" value={form.contact_subtitle || ''} onChange={set('contact_subtitle')} rows={2} placeholder="Have a project in mind?…" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="LinkedIn URL"     value={form.social_linkedin  || ''} onChange={set('social_linkedin')}  placeholder="https://linkedin.com/company/…" />
            <Input label="Facebook URL"     value={form.social_facebook  || ''} onChange={set('social_facebook')}  placeholder="https://facebook.com/…" />
            <Input label="Instagram URL"    value={form.social_instagram || ''} onChange={set('social_instagram')} placeholder="https://instagram.com/…" />
            <Input label="X / Twitter URL"  value={form.social_twitter   || ''} onChange={set('social_twitter')}   placeholder="https://x.com/…" />
            <Input label="GitHub URL"       value={form.social_github    || ''} onChange={set('social_github')}    placeholder="https://github.com/…" />
            <Input label="WhatsApp URL"     value={form.social_whatsapp  || ''} onChange={set('social_whatsapp')}  placeholder="https://wa.me/…" />
          </div>
        </CardBody>
      </Card>

      {/* 5. Footer */}
      <Card>
        <CardHeader><h2 className="text-sm font-bold text-bb-white">Footer</h2></CardHeader>
        <CardBody className="space-y-4">
          <Textarea label="Footer tagline (italic serif)" value={form.footer_tagline || ''} onChange={set('footer_tagline')} rows={2} placeholder="We build digital products that are fast, modern, and memorable." />
        </CardBody>
      </Card>

      <div className="flex justify-end pt-2">
        <Button onClick={() => updateMut.mutate(form)} loading={updateMut.isPending} size="lg">
          Save All Changes
        </Button>
      </div>
    </div>
  )
}
