import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { publicApi } from '../../lib/api'
import { formatExternalUrl } from '../../lib/url'
import toast from 'react-hot-toast'
import {
  Send, Mail, ArrowUpRight, MapPin,
  Linkedin, Facebook, Instagram, Twitter, Phone,
  User, Building2, Globe, MessageSquare, ChevronDown, Check, Sparkles
} from 'lucide-react'

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'GLOBAL', name: 'Other International', flag: '🌍' },
]

const SERVICE_INTERESTS = [
  { id: 'web', label: 'Web Application Development', icon: '⚡', desc: 'React, Next.js, Node.js, TypeScript' },
  { id: 'mobile', label: 'Mobile App Engineering', icon: '📱', desc: 'Flutter, iOS, Android (120 FPS)' },
  { id: 'ai', label: 'Custom AI Agents & LLMs', icon: '🧠', desc: 'Autonomous workflows, RAG, OpenAI, Gemini' },
  { id: 'cloud', label: 'Cloud Architecture & DevOps', icon: '☁️', desc: 'Kubernetes, Docker, AWS, GCP, CI/CD' },
  { id: 'uiux', label: 'UI/UX Product Design', icon: '🎨', desc: 'Figma design systems & interactive prototypes' },
  { id: 'enterprise', label: 'Enterprise Systems & ERP', icon: '🛡️', desc: 'High-concurrency data pipelines & dashboards' },
  { id: 'mvp', label: 'Full Startup MVP Launch', icon: '🚀', desc: 'End-to-end design, build, and production deploy' },
]

const REFERRAL_SOURCES = [
  { id: 'google', label: 'Google Search', icon: '🔍' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'referral', label: 'Client Referral / Recommendation', icon: '🤝' },
  { id: 'ai', label: 'AI Assistant (ChatGPT / Gemini / Perplexity)', icon: '🤖' },
  { id: 'social', label: 'Social Media (Twitter/X, Instagram, GitHub)', icon: '📱' },
  { id: 'blog', label: 'Tech Blog / Engineering Article', icon: '📰' },
  { id: 'other', label: 'Other', icon: '⭐' },
]

/* ── Custom Styled Dropdown ─────────────────────── */
function CustomDropdown({ label, required, placeholder, value, onChange, options, icon: HeaderIcon }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedItem = options.find(o => (o.name || o.label || o) === value)

  return (
    <div className="space-y-1.5 relative" ref={ref}>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
        {HeaderIcon && <HeaderIcon size={13} className="text-[#00d4f5]" />}
        <span>{label}</span>
        {required && <span className="text-rose-500 font-bold">*</span>}
      </label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left text-sm transition-all border ${
          open
            ? 'bg-white/[0.07] border-[#00d4f5] shadow-[0_0_15px_rgba(0,212,245,0.15)] text-white'
            : value
              ? 'bg-white/[0.04] border-white/[0.1] text-white hover:border-white/20'
              : 'bg-white/[0.03] border-white/[0.07] text-slate-400 hover:border-white/15'
        }`}
      >
        <span className="truncate flex items-center gap-2">
          {selectedItem?.flag && <span className="text-base">{selectedItem.flag}</span>}
          {selectedItem?.icon && <span className="text-sm">{selectedItem.icon}</span>}
          <span className={value ? 'text-slate-100 font-medium' : 'text-slate-400'}>
            {selectedItem?.name || selectedItem?.label || value || placeholder}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180 text-[#00d4f5]' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-2xl bg-[#0d0d22] border border-white/[0.12] shadow-2xl p-1.5 space-y-1 backdrop-blur-xl scrollbar-thin"
          >
            {options.map((opt, idx) => {
              const optVal = opt.name || opt.label || opt
              const isSelected = optVal === value
              return (
                <div
                  key={idx}
                  onClick={() => {
                    onChange(optVal)
                    setOpen(false)
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                    isSelected
                      ? 'bg-[#00d4f5]/15 text-[#00d4f5] font-semibold border border-[#00d4f5]/30'
                      : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {opt.flag && <span className="text-base flex-shrink-0">{opt.flag}</span>}
                    {opt.icon && <span className="text-sm flex-shrink-0">{opt.icon}</span>}
                    <div className="truncate">
                      <div className="truncate font-medium">{opt.name || opt.label || opt}</div>
                      {opt.desc && <div className="text-[0.65rem] text-slate-400 truncate">{opt.desc}</div>}
                    </div>
                  </div>
                  {isSelected && <Check size={14} className="text-[#00d4f5] flex-shrink-0" />}
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Contact section ─────────────────────────── */
export function ContactSection({ content = {} }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    country: '',
    service_interest: '',
    referral_source: '',
    message: '',
  })
  const [sending, setSending] = useState(false)

  // Auto-fill message if user configured a project in the Estimator
  useEffect(() => {
    try {
      const prefill = sessionStorage.getItem('prefill_project_estimate')
      if (prefill) {
        setForm(p => ({
          ...p,
          message: `Hi CodeLifeAI Team,\n\nI would like to request a detailed proposal for the following project requirements:\n\n${prefill}\n\nPlease let me know your availability for a discovery call.`
        }))
        sessionStorage.removeItem('prefill_project_estimate')
      }
    } catch {}
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.first_name || !form.email || !form.message) {
      toast.error('Please fill in your name, email, and requirements.')
      return
    }

    setSending(true)
    try {
      await publicApi.sendContact({
        first_name: form.first_name,
        last_name: form.last_name,
        name: `${form.first_name} ${form.last_name}`.trim(),
        email: form.email,
        company: form.company,
        country: form.country,
        service_interest: form.service_interest,
        referral_source: form.referral_source,
        message: form.message,
      })
      toast.success("Thank you! Your inquiry has been sent to our engineering team.")
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        company: '',
        country: '',
        service_interest: '',
        referral_source: '',
        message: '',
      })
    } catch {
      toast.error('Something went wrong. Please email us directly at contact@codelifeai.com.')
    } finally {
      setSending(false)
    }
  }

  const socials = [
    { Icon: Linkedin,  href: content.social_linkedin,  label: 'LinkedIn'  },
    { Icon: Facebook,  href: content.social_facebook,  label: 'Facebook'  },
    { Icon: Instagram, href: content.social_instagram, label: 'Instagram' },
    { Icon: Twitter,   href: content.social_twitter,   label: 'X (Twitter)' },
    { Icon: Mail,      href: content.contact_email ? `mailto:${content.contact_email}` : '', label: 'Email' },
    { Icon: Phone,     href: content.contact_phone ? `tel:${String(content.contact_phone).replace(/\s+/g, '')}` : '', label: 'Phone' },
  ].filter(s => s.href)

  return (
    <section id="contact" className="relative z-10 py-20 sm:py-32 px-4 sm:px-6 lg:px-14 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(0,212,245,0.045) 0%, transparent 60%)' }}
      />

      <div className="max-w-[1180px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-10 sm:gap-16 items-start">

          {/* ── Left Column — Info & Value Proposition ───────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00d4f5]/10 border border-[#00d4f5]/25 text-[0.68rem] font-bold uppercase tracking-widest text-[#00d4f5] mb-3">
              <Sparkles size={12} /> Contact Engineering &amp; Sales
            </div>
            <h1
              className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.06] mt-1 mb-5 text-white"
            >
              Let's build<br />
              <span className="bg-gradient-to-r from-[#00d4f5] via-[#38bdf8] to-[#a855f7] bg-clip-text text-transparent font-fraunces italic font-light not-italic">
                something exceptional.
              </span>
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed mb-8 max-w-md">
              {content.contact_subtitle || "Have a product in mind or need an elite engineering team? Fill out the brief and our technical leads will respond within 12 hours with a comprehensive roadmap."}
            </p>

            {/* Direct Email card */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] mb-8 max-w-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00d4f5]/10 border border-[#00d4f5]/20 flex items-center justify-center text-[#00d4f5] flex-shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[0.68rem] uppercase tracking-wider font-bold text-slate-400">Direct Inquiries</p>
                  <a href={`mailto:${content.contact_email || 'contact@codelifeai.com'}`} className="text-sm font-semibold text-white hover:text-[#00d4f5] transition-colors">
                    {content.contact_email || 'contact@codelifeai.com'}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-white/[0.05]">
                <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center text-[#a855f7] flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[0.68rem] uppercase tracking-wider font-bold text-slate-400">Client Scope &amp; Availability</p>
                  <p className="text-xs text-slate-300 font-medium">Worldwide (USA, EMEA, APAC)</p>
                </div>
              </div>
            </div>

            {/* Social links */}
            {socials.length > 0 && (
              <div className="space-y-2">
                <p className="text-[0.68rem] uppercase tracking-wider font-bold text-slate-400">Follow Our Work</p>
                <div className="flex flex-wrap gap-2">
                  {socials.map(({ Icon, href, label }) => {
                    const isExternal = href.startsWith('http')
                    return (
                      <a
                        key={label}
                        href={href}
                        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        aria-label={label}
                        title={label}
                        className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-slate-400 hover:text-[#00d4f5] hover:border-[#00d4f5]/30 hover:bg-[#00d4f5]/[0.06] transition-all no-underline"
                      >
                        <Icon size={16} />
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* ── Right Column — High-Tech "Contact Sales" Form ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="rounded-3xl p-6 sm:p-9 bg-[#09091b]/90 border border-white/[0.1] shadow-2xl backdrop-blur-xl">

              <div className="mb-7 pb-4 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Contact Sales</h2>
                  <p className="text-xs text-slate-400 mt-1">Tell us about your team and project requirements</p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[0.68rem] font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Avg response &lt; 12h
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <User size={13} className="text-[#00d4f5]" />
                      <span>First Name</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your first name"
                      value={form.first_name}
                      onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#00d4f5] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:bg-white/[0.06] focus:shadow-[0_0_15px_rgba(0,212,245,0.15)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <User size={13} className="text-[#00d4f5]" />
                      <span>Last name</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your last name"
                      value={form.last_name}
                      onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#00d4f5] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:bg-white/[0.06] focus:shadow-[0_0_15px_rgba(0,212,245,0.15)]"
                    />
                  </div>
                </div>

                {/* Work Email & Company Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <Mail size={13} className="text-[#00d4f5]" />
                      <span>Work email address</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Enter your work email address"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#00d4f5] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:bg-white/[0.06] focus:shadow-[0_0_15px_rgba(0,212,245,0.15)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <Building2 size={13} className="text-[#00d4f5]" />
                      <span>Company name</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your company name"
                      value={form.company}
                      onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#00d4f5] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:bg-white/[0.06] focus:shadow-[0_0_15px_rgba(0,212,245,0.15)]"
                    />
                  </div>
                </div>

                {/* Country Dropdown */}
                <CustomDropdown
                  label="Country"
                  required
                  placeholder="Select a country"
                  value={form.country}
                  onChange={v => setForm(p => ({ ...p, country: v }))}
                  options={COUNTRIES}
                  icon={Globe}
                />

                {/* How can we help / Requirements */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <MessageSquare size={13} className="text-[#00d4f5]" />
                    <span>How can we help?</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="What are your requirements? (e.g. Scope, key features, target timeline, budget estimate)"
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#00d4f5] rounded-xl p-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:bg-white/[0.06] focus:shadow-[0_0_15px_rgba(0,212,245,0.15)] resize-none"
                  />
                </div>

                {/* Product/Service Interest */}
                <CustomDropdown
                  label="Product / Service Interest"
                  required
                  placeholder="Please Select"
                  value={form.service_interest}
                  onChange={v => setForm(p => ({ ...p, service_interest: v }))}
                  options={SERVICE_INTERESTS}
                  icon={Sparkles}
                />

                {/* How did you hear about us? */}
                <CustomDropdown
                  label="How did you hear about us?"
                  required
                  placeholder="Please Select"
                  value={form.referral_source}
                  onChange={v => setForm(p => ({ ...p, referral_source: v }))}
                  options={REFERRAL_SOURCES}
                  icon={ArrowUpRight}
                />

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={sending}
                  whileHover={{ scale: sending ? 1 : 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2.5 text-sm font-bold text-black py-4 rounded-xl disabled:opacity-50 transition-all cursor-pointer mt-3 shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, #00d4f5, #00b8e6)',
                    boxShadow: '0 8px 30px rgba(0,212,245,0.25)',
                  }}
                >
                  {sending ? (
                    <span className="flex items-center gap-2 font-bold">
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Submitting Inquiry…
                    </span>
                  ) : (
                    <>
                      <span>Submit Inquiry &amp; Contact Sales</span>
                      <Send size={15} />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ──────────────────────────────────── */
export function Footer({ content = {} }) {
  const customServices = content.footer_services
    ? content.footer_services.split(',').map(s => s.trim()).filter(Boolean)
    : null

  const services = customServices || [
    'Web Development',
    'Mobile Apps',
    'AI & Custom Agents',
    'Cloud & DevOps',
    'UI/UX Architecture'
  ]

  const logoUrl = content.site_logo_url || '/logo.svg'
  const email = content.contact_email || 'contact@codelifeai.com'
  const phone = content.contact_phone || '+923168435767'
  const address = content.footer_address || 'Karachi, Pakistan · Global Remote Delivery'
  const tagline = content.footer_tagline || 'We build digital products that are fast, modern, and built to scale.'
  const about = content.footer_about || 'Next-generation software engineering studio creating high-velocity web applications, fluid mobile apps, and autonomous AI agents for ambitious teams worldwide.'
  
  const currentYear = new Date().getFullYear()
  const copyright = (content.footer_copyright || '© {year} CodeLifeAI. All rights reserved.').replace('{year}', currentYear)

  const socialIcons = [
    { Icon: Linkedin,  href: formatExternalUrl(content.social_linkedin),  label: 'LinkedIn'  },
    { Icon: Facebook,  href: formatExternalUrl(content.social_facebook),  label: 'Facebook'  },
    { Icon: Instagram, href: formatExternalUrl(content.social_instagram), label: 'Instagram' },
    { Icon: Twitter,   href: formatExternalUrl(content.social_twitter),   label: 'X (Twitter)' },
    { Icon: Globe,     href: formatExternalUrl(content.social_github),    label: 'GitHub'    },
    { Icon: Phone,     href: content.social_whatsapp ? `https://wa.me/${String(content.social_whatsapp).replace(/\D/g, '')}` : '', label: 'WhatsApp' },
    { Icon: Mail,      href: email ? `mailto:${email}` : '', label: 'Email' },
    { Icon: Phone,     href: phone ? `tel:${String(phone).replace(/\s+/g, '')}` : '', label: 'Phone' },
  ].filter(s => s.href)

  return (
    <footer
      className="relative z-10 border-t border-[#00cced]/20 px-4 sm:px-6 lg:px-14 pt-14 sm:pt-20 pb-8 sm:pb-10"
      style={{ background: 'linear-gradient(180deg, rgba(6,11,20,0.85) 0%, rgba(4,8,16,0.98) 100%)' }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 pb-10 sm:pb-16 border-b border-white/[0.07]">

          {/* Brand & Mission */}
          <div className="space-y-4">
            <Link to="/" className="inline-block no-underline">
              <img
                src={logoUrl}
                alt="CodeLifeAI"
                width="408"
                height="110"
                className="h-8 w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,204,237,0.25)]"
                onError={(e) => { e.target.src = '/logo.svg' }}
              />
            </Link>
            <p className="font-fraunces italic font-light text-[0.88rem] text-slate-300/80 leading-relaxed max-w-[280px]">
              "{tagline}"
            </p>
            <p className="text-[0.8rem] text-slate-400 leading-relaxed max-w-[280px]">
              {about}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {socialIcons.map(({ Icon, href, label }) => {
                const isExternal = href.startsWith('http')
                return (
                  <a
                    key={label}
                    href={href}
                    {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    aria-label={label}
                    title={label}
                    className="w-9 h-9 rounded-xl bg-white/[0.04] border border-[#00cced]/25 flex items-center justify-center text-slate-300 hover:text-[#00f0ff] hover:border-[#00f0ff]/60 hover:bg-[#00cced]/10 hover:shadow-[0_0_12px_rgba(0,240,255,0.25)] transition-all no-underline"
                  >
                    <Icon size={14} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[0.72rem] font-bold tracking-[0.14em] uppercase text-[#00f0ff] mb-5">
              Services
            </h4>
            <ul className="space-y-2.5 list-none p-0 m-0">
              {services.map(s => (
                <li key={s}>
                  <Link to="/services" className="text-[0.86rem] text-slate-300 hover:text-[#00f0ff] transition-colors no-underline hover:translate-x-1 inline-block">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[0.72rem] font-bold tracking-[0.14em] uppercase text-[#00f0ff] mb-5">
              Company
            </h4>
            <ul className="space-y-2.5 list-none p-0 m-0">
              {[
                ['About Our Team', '/team'],
                ['Engineering Process', '/process'],
                ['Portfolio & Projects', '/work'],
                ['Technical Blog', '/blog'],
                ['Contact & Consultation', '/contact']
              ].map(([l, h]) => (
                <li key={l}>
                  <Link to={h} className="text-[0.86rem] text-slate-300 hover:text-[#00f0ff] transition-colors no-underline hover:translate-x-1 inline-block">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-[0.72rem] font-bold tracking-[0.14em] uppercase text-[#00f0ff] mb-5">
              Direct Contact
            </h4>
            <ul className="space-y-3 list-none p-0 m-0">
              <li>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 text-[0.86rem] text-slate-300 hover:text-[#00f0ff] transition-colors no-underline"
                >
                  <Mail size={14} className="text-[#00cced] flex-shrink-0" />
                  <span className="truncate">{email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${String(phone).replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-2 text-[0.86rem] text-slate-300 hover:text-[#00f0ff] transition-colors no-underline"
                >
                  <Phone size={14} className="text-[#00cced] flex-shrink-0" />
                  <span>{phone}</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-[0.84rem] text-slate-400 mt-2">
                  <MapPin size={15} className="text-[#00cced] flex-shrink-0 mt-0.5" />
                  <span>{address}</span>
                </div>
              </li>
              <li className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-black bg-gradient-to-r from-[#00f0ff] to-[#00cced] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all no-underline"
                >
                  <span>Request a Free Quote</span>
                  <ArrowUpRight size={13} />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between pt-8 flex-wrap gap-4">
          <span className="text-[0.78rem] text-slate-400">{copyright}</span>
          <span className="inline-flex items-center gap-1.5 text-[0.74rem] text-slate-400 border border-[#00cced]/20 bg-[#00cced]/[0.03] px-3.5 py-1.5 rounded-full tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
            <MapPin size={11} className="text-[#00f0ff]" /> {address}
          </span>
        </div>
      </div>
    </footer>
  )
}
