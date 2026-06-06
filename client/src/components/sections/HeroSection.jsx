import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Star } from 'lucide-react'

const WORDS = ['Software.', 'Products.', 'Experiences.', 'The Future.', 'What Matters.']

const STATS = [
  { value: '50+',  label: 'Projects Shipped'                  },
  { value: '100%', label: 'On-time Delivery'                  },
  { value: '5.0',  label: 'Client Satisfaction', showStar: true },
  { value: '2x',   label: 'Faster Delivery'                   },
]

const TECH_STACK = [
  { label: 'React',      color: '#61DAFB' },
  { label: 'Next.js',    color: '#ffffff' },
  { label: 'Node.js',    color: '#84CC16' },
  { label: 'TypeScript', color: '#3B82F6' },
  { label: 'Flutter',    color: '#38BDF8' },
  { label: 'Python',     color: '#F59E0B' },
  { label: 'AWS',        color: '#F97316' },
  { label: 'PostgreSQL', color: '#A78BFA' },
]

const FU = (delay = 0, y = 24) => ({
  initial:    { opacity: 0, y },
  animate:    { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
})

export default function HeroSection({ content = {} }) {
  const [wordIndex,   setWordIndex]   = useState(0)
  const [charIndex,   setCharIndex]   = useState(0)
  const [deleting,    setDeleting]    = useState(false)
  const [displayText, setDisplayText] = useState('')

  const cyclingWords = content.hero_cycling_words
    ? content.hero_cycling_words.split(',').map(w => w.trim()).filter(Boolean)
    : WORDS

  useEffect(() => {
    const word = cyclingWords[wordIndex]
    let t
    if (!deleting) {
      t = charIndex < word.length
        ? setTimeout(() => { setDisplayText(word.slice(0, charIndex + 1)); setCharIndex(c => c + 1) }, 86)
        : setTimeout(() => setDeleting(true), 2400)
    } else {
      t = charIndex > 0
        ? setTimeout(() => { setDisplayText(word.slice(0, charIndex - 1)); setCharIndex(c => c - 1) }, 42)
        : (() => { setDeleting(false); setWordIndex(i => (i + 1) % cyclingWords.length) })()
    }
    return () => clearTimeout(t)
  }, [charIndex, deleting, wordIndex, cyclingWords])

  const marqueeItems = content.marquee_items
    ? content.marquee_items.split(',').map(s => s.trim())
    : ['Web Development', 'Mobile Apps', 'UI/UX Design', 'AI Integration', 'Cloud & DevOps', 'Tech Consulting']
  const marqueeDouble = [...marqueeItems, ...marqueeItems]

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-28 overflow-hidden">

      {/* ── Ambient orbs ──────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full" style={{
          width: '700px', height: '700px',
          top: '5%', left: '-8%',
          background: 'radial-gradient(circle, rgba(0,212,245,1) 0%, transparent 65%)',
          filter: 'blur(100px)', animation: 'orbPulse 9s ease-in-out infinite',
        }} />
        <div className="absolute rounded-full" style={{
          width: '600px', height: '600px',
          bottom: '0%', right: '-5%',
          background: 'radial-gradient(circle, rgba(124,58,237,1) 0%, transparent 65%)',
          filter: 'blur(100px)', animation: 'orbPulse 11s ease-in-out 3s infinite',
        }} />
      </div>

      {/* ── Content ───────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-[980px] mx-auto">

        {/* Section tag */}
        <motion.div {...FU(0)} className="flex items-center gap-3 mb-7">
          <div className="section-label">
            <Zap size={11} fill="currentColor" />
            {content.hero_badge || "We build what's next"}
          </div>
        </motion.div>

        {/* Big headline */}
        <motion.h1
          {...FU(0.06)}
          className="font-extrabold tracking-[-0.045em] leading-[0.88] mb-2 text-bb-white"
          style={{ fontSize: 'clamp(2.9rem, 9.5vw, 9rem)' }}
        >
          {content.hero_title || 'We Create'}
        </motion.h1>

        {/* Animated typewriter word */}
        <motion.div
          {...FU(0.12)}
          className="font-fraunces italic font-light leading-[0.9] tracking-[-0.03em] mb-8 min-h-[1.05em]"
          style={{ fontSize: 'clamp(2.9rem, 9.5vw, 9rem)' }}
        >
          <span className="text-gradient">{displayText}</span>
          <span className="inline-block w-[3px] h-[0.82em] bg-bb-accent ml-2 align-middle rounded-sm cursor-blink" />
        </motion.div>

        {/* Subtitle */}
        <motion.p {...FU(0.2)} className="text-bb-muted text-[1.05rem] leading-[1.75] max-w-[560px] mb-10">
          {content.hero_subtitle || 'CodeLifeAI is a software startup crafting elegant digital products — from sleek web apps to powerful mobile experiences.'}
        </motion.p>

        {/* CTAs */}
        <motion.div {...FU(0.28)} className="flex gap-4 justify-center flex-wrap mb-16">
          <Link to="/contact" className="btn-primary text-sm">
            Start a Project
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>→</motion.span>
          </Link>
          <Link to="/work" className="btn-ghost text-sm">View Our Work</Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.7 }}
          className="w-full max-w-[700px] grid grid-cols-2 sm:grid-cols-4 rounded-2xl overflow-hidden border border-white/[0.07]"
          style={{ background: 'rgba(255,255,255,0.025)' }}
        >
          {STATS.map((s, i) => (
            <div key={i} className="flex flex-col items-center justify-center py-5 px-3 border-r border-white/[0.06] last:border-r-0 [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(n+3)]:border-b-0 border-b border-white/[0.06]">
              <span className="inline-flex items-center gap-1 text-[1.65rem] font-extrabold leading-none text-gradient mb-1">
                {s.value}
                {s.showStar && <Star size={18} fill="currentColor" strokeWidth={0} className="text-amber-400" />}
              </span>
              <span className="text-[0.63rem] font-semibold text-bb-muted uppercase tracking-wider text-center">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Tech ticker strip ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="absolute bottom-12 left-0 right-0 overflow-hidden pointer-events-none"
      >
        <p className="text-center text-[0.62rem] font-bold uppercase tracking-[0.2em] text-white/18 mb-4">
          Powered by modern tech
        </p>
        <div className="flex whitespace-nowrap" style={{ animation: 'tickerMove 20s linear infinite' }}>
          {[...TECH_STACK, ...TECH_STACK, ...TECH_STACK].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2 mx-6 text-[0.75rem] font-semibold"
              style={{ color: t.color, opacity: 0.6 }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: t.color }} />
              {t.label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* ── Scroll indicator ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
      >
        <div className="w-[18px] h-7 rounded-full border border-white/[0.14] flex items-start justify-center pt-1.5">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-[6px] rounded-full bg-bb-accent"
          />
        </div>
      </motion.div>
    </section>
  )
}
