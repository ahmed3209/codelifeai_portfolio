import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Star, ArrowRight } from 'lucide-react'
import HeroProjectsSlider from './HeroProjectsSlider'

const WORDS = ['Software.', 'Products.', 'Experiences.', 'The Future.', 'What Matters.']

const STATS = [
  { value: '50+',  label: 'Projects Shipped'                  },
  { value: '100%', label: 'On-time Delivery'                  },
  { value: '5.0',  label: 'Client Satisfaction', showStar: true },
  { value: '2x',   label: 'Faster Delivery'                   },
]

const TECH_STACK = [
  { label: 'React',      color: '#00cced' },
  { label: 'Next.js',    color: '#ffffff' },
  { label: 'Node.js',    color: '#22c55e' },
  { label: 'TypeScript', color: '#38bdf8' },
  { label: 'Flutter',    color: '#00f0ff' },
  { label: 'Python',     color: '#f59e0b' },
  { label: 'AWS',        color: '#fb923c' },
  { label: 'PostgreSQL', color: '#818cf8' },
]

const FU = (delay = 0, y = 20) => ({
  initial:    { opacity: 0, y },
  animate:    { opacity: 1, y: 0 },
  transition: { delay, duration: 0.65, ease: [0.16, 1, 0.3, 1] },
})

export default function HeroSection({ content = {}, promo = null, liveProducts = [], projects = [] }) {
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
        ? setTimeout(() => { setDisplayText(word.slice(0, charIndex + 1)); setCharIndex(c => c + 1) }, 85)
        : setTimeout(() => setDeleting(true), 2400)
    } else {
      t = charIndex > 0
        ? setTimeout(() => { setDisplayText(word.slice(0, charIndex - 1)); setCharIndex(c => c - 1) }, 40)
        : (() => { setDeleting(false); setWordIndex(i => (i + 1) % cyclingWords.length) })()
    }
    return () => clearTimeout(t)
  }, [charIndex, deleting, wordIndex, cyclingWords])

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center px-4 sm:px-6 lg:px-12 pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden">
      
      {/* ── High-Tech Luminous Ambient Aura (Teal / Cyan Brand Colors) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden contain-paint">
        <div
          className="absolute rounded-full"
          style={{
            width: '720px', height: '720px',
            top: '-10%', left: '-5%',
            background: 'radial-gradient(circle, rgba(0,204,237,0.12) 0%, rgba(0,204,237,0.03) 45%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '680px', height: '680px',
            top: '20%', right: '-8%',
            background: 'radial-gradient(circle, rgba(28,177,243,0.1) 0%, rgba(0,240,255,0.025) 45%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* ── Main Content Grid: Left Column Copy, Right Column Smooth Interactive Projects Slider ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        
        {/* Left Column: Headline, Typewriter, Subtitle, CTAs, Stats */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          
          {/* Section Label Badge */}
          <motion.div {...FU(0)} className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="section-label">
              <Zap size={12} className="text-[#00f0ff] fill-[#00f0ff]" />
              {content.hero_badge || "We build what's next"}
            </div>
          </motion.div>

          {/* Big Headline */}
          <motion.h1
            {...FU(0.08)}
            className="font-black tracking-[-0.04em] leading-[0.98] sm:leading-[0.94] mb-3 text-white text-4xl sm:text-6xl lg:text-[4.6rem] xl:text-[5.2rem]"
          >
            {content.hero_title || 'We Create'}
            <span className="block mt-1 sm:mt-2 text-gradient min-h-[1.15em]">
              {displayText}
              <span className="inline-block w-[3.5px] h-[0.78em] bg-[#00f0ff] ml-2 align-middle rounded-sm cursor-blink shadow-[0_0_12px_#00f0ff]" />
            </span>
          </motion.h1>

          {/* Subtitle with High-Contrast Readability */}
          <motion.p
            {...FU(0.18)}
            className="text-slate-300 text-[1rem] sm:text-[1.12rem] leading-[1.75] max-w-xl mb-8 sm:mb-9 font-normal"
          >
            {content.hero_subtitle || 'CodeLifeAI is a software studio crafting next-generation digital products — from scalable web apps and mobile experiences to custom autonomous AI agents.'}
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div {...FU(0.26)} className="flex gap-4 items-center justify-center lg:justify-start flex-wrap mb-10 sm:mb-12 w-full sm:w-auto">
            <Link to="/contact" className="btn-primary text-sm shadow-[0_6px_28px_rgba(0,204,237,0.45)]">
              <span>Start a Project</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/work" className="btn-ghost text-sm">
              <span>View Our Work</span>
            </Link>
          </motion.div>

          {/* Trust Metrics Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.7 }}
            className="w-full max-w-[620px] grid grid-cols-2 sm:grid-cols-4 rounded-2xl overflow-hidden border border-[#00cced]/20 bg-[#081322]/75 backdrop-blur-xl shadow-xl shadow-black/40"
          >
            {STATS.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center py-4 px-3 border-r border-[#00cced]/15 last:border-r-0 [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(n+3)]:border-b-0 border-b border-[#00cced]/15"
              >
                <span className="inline-flex items-center gap-1 text-[1.5rem] font-extrabold leading-none text-gradient mb-1">
                  {s.value}
                  {s.showStar && <Star size={16} fill="currentColor" strokeWidth={0} className="text-amber-400" />}
                </span>
                <span className="text-[0.65rem] font-semibold text-slate-300 uppercase tracking-wider text-center">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Column: Smooth Interactive Projects Slider */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex flex-col items-center justify-center relative w-full"
        >
          <HeroProjectsSlider liveProducts={liveProducts} projects={projects} />
        </motion.div>
      </div>

      {/* ── Modern Tech Stack Ticker Strip ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="w-full max-w-7xl mx-auto mt-14 sm:mt-18 pt-6 border-t border-white/[0.07]"
      >
        <p className="text-center text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-400 mb-4">
          Engineered with modern production technologies
        </p>
        <div className="overflow-hidden relative py-1">
          <div className="flex whitespace-nowrap" style={{ animation: 'tickerMove 22s linear infinite' }}>
            {[...TECH_STACK, ...TECH_STACK, ...TECH_STACK].map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 mx-6 text-[0.78rem] font-semibold px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] hover:border-[#00cced]/40 transition-colors"
                style={{ color: t.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: t.color }} />
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

    </section>
  )
}
