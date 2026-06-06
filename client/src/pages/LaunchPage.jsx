import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../lib/api'
import { Sparkles, ArrowLeft, X, Send, CheckCircle2, Rocket } from 'lucide-react'
import toast from 'react-hot-toast'
import PageMeta from '../components/PageMeta'

function getRemaining(target) {
  const diff = new Date(target).getTime() - Date.now()
  if (isNaN(diff) || diff <= 0) return { done: true, d: 0, h: 0, m: 0, s: 0 }
  return {
    done: false,
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
  }
}

function FlipUnit({ value, label }) {
  const padded = String(value).padStart(2, '0')
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-[72px] sm:w-[104px] h-[84px] sm:h-[116px] rounded-2xl border border-white/[0.09] flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, rgba(0,212,245,0.07) 0%, rgba(124,58,237,0.05) 100%)' }}
      >
        <div className="absolute top-1/2 left-0 right-0 h-px bg-black/40" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={padded}
            initial={{ y: -18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 18, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="text-[2.4rem] sm:text-[3.4rem] font-extrabold text-bb-white tabular-nums tracking-tight"
          >
            {padded}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-3 text-[0.62rem] sm:text-[0.7rem] font-bold tracking-[0.22em] uppercase text-bb-muted">
        {label}
      </span>
    </div>
  )
}

function EarlyAccessModal({ open, onClose, toolName }) {
  const [form, setForm] = useState({ name: '', email: '', reason: '' })
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (open) { setForm({ name: '', email: '', reason: '' }); setDone(false) }
  }, [open])

  async function submit(e) {
    e.preventDefault()
    setSending(true)
    try {
      await publicApi.requestEarlyAccess(form)
      setDone(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="w-full max-w-[460px] rounded-2xl border border-white/[0.1] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.65)]"
            style={{ background: '#0b0b1d' }}
          >
            <div className="px-7 pt-7 pb-5 border-b border-white/[0.06] relative"
              style={{ background: 'linear-gradient(145deg, rgba(0,212,245,0.07), rgba(124,58,237,0.05))' }}>
              <button onClick={onClose}
                className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center text-bb-muted hover:text-bb-white hover:bg-white/[0.1] transition-all">
                <X size={14} />
              </button>
              <h2 className="text-[1.25rem] font-extrabold tracking-tight text-bb-white">
                {done ? "You're on the list" : `Get early access to ${toolName}`}
              </h2>
              <p className="text-bb-muted text-[0.85rem] mt-1 leading-relaxed pr-8">
                {done
                  ? "We'll reach out to your email when early access opens. Thanks for your interest!"
                  : 'Tell us a little about why you want in — we prioritise early testers who give great feedback.'}
              </p>
            </div>

            {done ? (
              <div className="p-7 flex flex-col items-center text-center gap-4">
                <CheckCircle2 size={48} className="text-bb-accent" />
                <button onClick={onClose} className="btn-primary text-sm">Done</button>
              </div>
            ) : (
              <form onSubmit={submit} className="p-7 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-bb-muted uppercase tracking-widest">Name</label>
                  <input
                    value={form.name} required
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your full name"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-bb-white placeholder:text-bb-muted outline-none focus:border-bb-accent/40 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-bb-muted uppercase tracking-widest">Email</label>
                  <input
                    type="email" value={form.email} required
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-bb-white placeholder:text-bb-muted outline-none focus:border-bb-accent/40 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-bb-muted uppercase tracking-widest">Why do you want early access?</label>
                  <textarea
                    value={form.reason} required rows={4}
                    onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                    placeholder="What would you use it for? What problem are you hoping it solves?"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-bb-white placeholder:text-bb-muted outline-none focus:border-bb-accent/40 transition-colors resize-none"
                  />
                </div>
                <button type="submit" disabled={sending}
                  className="w-full btn-primary text-sm justify-center disabled:opacity-50">
                  {sending ? 'Submitting…' : <>Request Early Access <Send size={14} /></>}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function EmptyState({ message }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden bg-bb-black font-jakarta">
      <PageMeta
        title={message}
        description="No upcoming product launches at the moment. Head back to the homepage to see what we're building."
      />
      <Link to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-[0.8rem] text-bb-muted hover:text-bb-white transition-colors no-underline">
        <ArrowLeft size={15} /> Back to CodeLifeAI
      </Link>
      <div className="text-center max-w-md">
        <Sparkles size={36} className="text-bb-muted mx-auto mb-5 opacity-50" />
        <h1 className="text-2xl font-bold text-bb-white tracking-tight mb-2">{message}</h1>
        <p className="text-bb-muted text-sm leading-relaxed">
          Check back soon — or head to the homepage to see what we're building.
        </p>
        <Link to="/" className="btn-primary text-sm mt-6 inline-flex">Go to homepage</Link>
      </div>
    </div>
  )
}

export default function LaunchPage() {
  const { slug } = useParams()

  // When :slug is in the URL, fetch that specific promo. Otherwise use the active one from site-data.
  const slugQuery = useQuery({
    queryKey: ['promo', slug],
    queryFn: () => publicApi.getPromoBySlug(slug).then(r => r.data),
    enabled: !!slug,
    retry: false,
  })

  const siteDataQuery = useQuery({
    queryKey: ['site-data'],
    queryFn: () => publicApi.getSiteData().then(r => r.data),
    enabled: !slug,
  })

  const promo = slug ? slugQuery.data : (siteDataQuery.data?.activePromo || null)
  const isLoading = slug ? slugQuery.isLoading : siteDataQuery.isLoading
  const isError = slug ? slugQuery.isError : false

  const [now, setNow] = useState(Date.now())
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const launchAt = promo?.launch_at || ''
  const t = useMemo(() => getRemaining(launchAt), [launchAt, now])

  const launchDateLabel = useMemo(() => {
    const d = new Date(launchAt)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  }, [launchAt])

  if (isLoading) {
    return <div className="min-h-screen bg-bb-black" />
  }
  if (isError || (slug && !promo)) {
    return <EmptyState message="Promotion not found" />
  }
  if (!promo) {
    return <EmptyState message="No active launch right now" />
  }

  const toolName = promo.name || 'Coming Soon'
  const tagline  = promo.tagline || ''
  const ctaLabel = promo.cta_label || 'Request Early Access'

  const metaDescription = tagline
    || `${toolName} is coming soon. Request early access from CodeLifeAI and be among the first to try it.`

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden bg-bb-black font-jakarta">
      <PageMeta
        title={`${toolName} — Coming Soon`}
        description={metaDescription}
        keywords={`${toolName.toLowerCase()}, ${toolName.toLowerCase()} launch, ${toolName.toLowerCase()} early access, coming soon, product launch, codelifeai`}
      />
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full" style={{
          width: 680, height: 680, top: '-12%', left: '-8%',
          background: 'radial-gradient(circle, rgba(0,212,245,0.9) 0%, transparent 65%)',
          filter: 'blur(120px)', opacity: 0.5, animation: 'orbPulse 10s ease-in-out infinite',
        }} />
        <div className="absolute rounded-full" style={{
          width: 620, height: 620, bottom: '-10%', right: '-6%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.9) 0%, transparent 65%)',
          filter: 'blur(120px)', opacity: 0.5, animation: 'orbPulse 12s ease-in-out 3s infinite',
        }} />
      </div>

      <Link to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-[0.8rem] text-bb-muted hover:text-bb-white transition-colors no-underline">
        <ArrowLeft size={15} /> Back to CodeLifeAI
      </Link>

      <div className="relative z-10 flex flex-col items-center text-center max-w-[860px] w-full">
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-bb-accent/25 text-[0.72rem] font-bold tracking-[0.18em] uppercase text-bb-accent mb-7"
          style={{ background: 'rgba(0,212,245,0.06)' }}
        >
          <Sparkles size={13} /> Coming Soon
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.06 }}
          className="font-extrabold tracking-[-0.04em] leading-[0.95] text-bb-white"
          style={{ fontSize: 'clamp(3rem, 9vw, 7rem)' }}
        >
          {toolName}
        </motion.h1>

        {tagline && (
          <motion.p
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14 }}
            className="text-bb-muted text-[1.02rem] leading-[1.7] max-w-[600px] mt-6 mb-12"
          >
            {tagline}
          </motion.p>
        )}

        {t.done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 text-2xl font-bold text-gradient mb-10"
          >
            <Rocket size={26} /> We've launched! Stay tuned for access details.
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="flex items-start gap-3 sm:gap-5 mb-12"
          >
            <FlipUnit value={t.d} label="Days" />
            <span className="text-[2.4rem] sm:text-[3.4rem] font-bold text-white/15 leading-[84px] sm:leading-[116px]">:</span>
            <FlipUnit value={t.h} label="Hours" />
            <span className="text-[2.4rem] sm:text-[3.4rem] font-bold text-white/15 leading-[84px] sm:leading-[116px]">:</span>
            <FlipUnit value={t.m} label="Minutes" />
            <span className="text-[2.4rem] sm:text-[3.4rem] font-bold text-white/15 leading-[84px] sm:leading-[116px]">:</span>
            <FlipUnit value={t.s} label="Seconds" />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <button onClick={() => setModalOpen(true)} className="btn-primary text-base px-8 py-4">
            <Sparkles size={16} /> {ctaLabel}
          </button>
          {launchDateLabel && (
            <p className="text-[0.78rem] text-bb-muted">
              Launching <span className="text-bb-white font-semibold">{launchDateLabel}</span>
            </p>
          )}
        </motion.div>
      </div>

      <EarlyAccessModal open={modalOpen} onClose={() => setModalOpen(false)} toolName={toolName} />
    </div>
  )
}
