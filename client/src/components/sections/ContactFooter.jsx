import { useState } from 'react'
import { motion } from 'framer-motion'
import { publicApi } from '../../lib/api'
import toast from 'react-hot-toast'
import { Send, Mail, ArrowUpRight } from 'lucide-react'

/* ── Floating label input ─────────────────────── */
function FloatInput({ label, value, onChange, type = 'text', required, name }) {
  const [focused, setFocused] = useState(false)
  const lifted = focused || value.length > 0

  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        autoComplete={type === 'email' ? 'email' : 'off'}
        className="peer w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 pt-6 pb-2.5 text-[0.88rem] text-bb-white outline-none focus:border-bb-accent/40 transition-all duration-200"
      />
      <label
        className={`absolute left-4 pointer-events-none transition-all duration-200
          ${lifted ? 'top-[7px] text-[0.62rem] text-bb-accent' : 'top-1/2 -translate-y-1/2 text-[0.84rem] text-bb-muted'}`}
      >
        {label}
      </label>
    </div>
  )
}

function FloatTextarea({ label, value, onChange, rows, required }) {
  const [focused, setFocused] = useState(false)
  const lifted = focused || value.length > 0

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        rows={rows}
        className="peer w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 pt-6 pb-3 text-[0.88rem] text-bb-white outline-none focus:border-bb-accent/40 transition-all duration-200 resize-none"
      />
      <label
        className={`absolute left-4 pointer-events-none transition-all duration-200
          ${lifted ? 'top-[7px] text-[0.62rem] text-bb-accent' : 'top-4 text-[0.84rem] text-bb-muted'}`}
      >
        {label}
      </label>
    </div>
  )
}

/* ── Contact section ─────────────────────────── */
export function ContactSection({ content = {} }) {
  const [form,    setForm]    = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    try {
      await publicApi.sendContact(form)
      toast.success("Message sent! We'll get back to you shortly.")
      setForm({ name: '', email: '', message: '' })
    } catch {
      toast.error('Something went wrong. Please email us directly.')
    } finally {
      setSending(false)
    }
  }

  const socials = [
    { label: 'LinkedIn', url: content.social_linkedin },
    { label: 'GitHub',   url: content.social_github   },
    { label: 'Twitter',  url: content.social_twitter  },
    { label: 'WhatsApp', url: content.social_whatsapp },
  ].filter(s => s.url)

  return (
    <section id="contact" className="relative z-10 py-32 px-6 lg:px-14 overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(0,212,245,0.045) 0%, transparent 60%)' }} />

      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 items-start">

          {/* ── Left — copy ───────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="section-label inline-flex">Get In Touch</div>
            <h2
              className="font-extrabold tracking-tight leading-[1.04] mt-1 mb-5"
              style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3.4rem)' }}
            >
              Let's build<br />
              <em className="font-fraunces font-light not-italic text-white/35">something great.</em>
            </h2>
            <p className="text-bb-muted text-sm leading-relaxed mb-8 max-w-sm">
              {content.contact_subtitle || "Have a project in mind? We'd love to hear about it. Drop us a message and we'll be in touch within 24 hours."}
            </p>

            {/* Email link */}
            <a
              href={`mailto:${content.contact_email || 'hello@byteburst.io'}`}
              className="group flex items-center gap-3 text-sm text-bb-muted hover:text-bb-white transition-colors no-underline mb-8 w-fit"
            >
              <div className="w-9 h-9 rounded-xl bg-bb-accent/10 border border-bb-accent/18 flex items-center justify-center text-bb-accent group-hover:bg-bb-accent/16 transition-colors flex-shrink-0">
                <Mail size={14} />
              </div>
              <span>{content.contact_email || 'hello@byteburst.io'}</span>
            </a>

            {/* Social links */}
            {socials.length > 0 && (
              <div className="flex gap-2.5 flex-wrap">
                {socials.map(s => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-bb-muted border border-white/[0.07] px-4 py-2 rounded-full hover:text-bb-white hover:border-bb-accent/30 hover:bg-bb-accent/5 transition-all no-underline"
                  >
                    {s.label}
                    <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Right — form ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.12, duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="relative border border-white/[0.08] rounded-2xl p-8 overflow-hidden"
              style={{ background: 'linear-gradient(145deg, rgba(0,212,245,0.03) 0%, rgba(255,255,255,0.018) 100%)' }}
            >
              {/* Corner glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(0,212,245,0.08) 0%, transparent 65%)' }} />

              <h3 className="text-[1.05rem] font-bold text-bb-white mb-6 relative">Send us a message</h3>

              <form onSubmit={handleSubmit} className="space-y-4 relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FloatInput
                    label="Your name"
                    name="name"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                  <FloatInput
                    label="Email address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
                <FloatTextarea
                  label="Tell us about your project…"
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  rows={4}
                  required
                />

                <motion.button
                  type="submit"
                  disabled={sending}
                  whileHover={{ scale: sending ? 1 : 1.01, y: sending ? 0 : -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-bb-black py-3.5 rounded-xl disabled:opacity-50 transition-opacity"
                  style={{
                    background: 'linear-gradient(135deg, #00d4f5, #0099bb)',
                    boxShadow: '0 4px 24px rgba(0,212,245,0.22)',
                  }}
                >
                  {sending ? 'Sending…' : (
                    <>
                      Send Message
                      <Send size={14} />
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
  const services = ['Web Development', 'Mobile Apps', 'UI/UX Design', 'AI Integration', 'Cloud & DevOps']

  return (
    <footer className="relative z-10 border-t border-white/[0.05] px-6 lg:px-14 pt-20 pb-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/[0.05]">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 font-extrabold text-[1.05rem] tracking-tight text-bb-white mb-4">
              <div
                className="w-7 h-7 rounded-[8px] flex items-center justify-center text-xs font-black text-black flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #00d4f5, #7c3aed)' }}
              >⚡</div>
              ByteBurst
            </div>
            <p className="font-fraunces italic font-light text-[0.9rem] text-white/28 leading-relaxed max-w-[210px] mb-5">
              {content.footer_tagline || 'We build digital products that are fast, beautiful, and built to last.'}
            </p>
            <div className="flex gap-2">
              {[
                { label: 'in', url: content.social_linkedin },
                { label: 'gh', url: content.social_github   },
                { label: '𝕏',  url: content.social_twitter  },
              ].filter(s => s.url).map(s => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[0.75rem] font-bold text-bb-muted hover:text-bb-accent hover:border-bb-accent/22 hover:bg-bb-accent/6 transition-all no-underline"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[0.67rem] font-bold tracking-[0.12em] uppercase text-white/28 mb-5">Services</h4>
            <ul className="space-y-2.5 list-none p-0 m-0">
              {services.map(s => (
                <li key={s}>
                  <a href="#services" className="text-[0.84rem] text-bb-muted hover:text-bb-white transition-colors no-underline hover:translate-x-0.5 inline-block">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[0.67rem] font-bold tracking-[0.12em] uppercase text-white/28 mb-5">Company</h4>
            <ul className="space-y-2.5 list-none p-0 m-0">
              {[['About Us', '#founders'], ['Our Process', '#process'], ['Why ByteBurst', '#founders'], ['Careers', '#contact']].map(([l, h]) => (
                <li key={l}>
                  <a href={h} className="text-[0.84rem] text-bb-muted hover:text-bb-white transition-colors no-underline">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[0.67rem] font-bold tracking-[0.12em] uppercase text-white/28 mb-5">Contact</h4>
            <ul className="space-y-2.5 list-none p-0 m-0">
              <li>
                <a href={`mailto:${content.contact_email || 'hello@byteburst.io'}`}
                  className="text-[0.84rem] text-bb-muted hover:text-bb-white transition-colors no-underline">
                  {content.contact_email || 'hello@byteburst.io'}
                </a>
              </li>
              <li><a href="#contact" className="text-[0.84rem] text-bb-muted hover:text-bb-white transition-colors no-underline">Schedule a Call</a></li>
              <li><a href="#contact" className="text-[0.84rem] text-bb-muted hover:text-bb-white transition-colors no-underline">Project Brief</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between pt-8 flex-wrap gap-3">
          <span className="text-[0.77rem] text-bb-muted">© {new Date().getFullYear()} ByteBurst. All rights reserved.</span>
          <span className="text-[0.71rem] text-white/20 border border-white/[0.05] px-3 py-1 rounded-full tracking-wider">
            Crafted with precision ✦ Pakistan
          </span>
        </div>
      </div>
    </footer>
  )
}
