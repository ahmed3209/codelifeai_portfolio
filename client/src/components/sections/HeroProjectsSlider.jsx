import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, ArrowUpRight, ChevronLeft, ChevronRight, Activity, Globe
} from 'lucide-react'

// Fallback high-impact software studio projects ONLY if database has no active products
const FALLBACK_PRODUCTS = [
  {
    id: 'f1',
    name: 'Screen Snap',
    tagline: 'Instant screen recording, smart annotations & AI capture workflow.',
    url: 'https://screensnap.codelifeai.com/',
    icon: '📸',
    badge: 'LIVE NOW',
    cta_label: 'Open Live Website',
  },
  {
    id: 'f2',
    name: 'ZYRA AI',
    tagline: 'One AI for everything — chat, create, analyze & automate workflows.',
    url: 'https://zyra-ai.com',
    icon: '⚡',
    badge: 'v2.4 LIVE',
    cta_label: 'Open Live Website',
  },
  {
    id: 'f3',
    name: 'Alarmify',
    tagline: 'AI sleep partner and smart wake-up alarm system.',
    url: 'https://alarmify.app',
    icon: '⏰',
    badge: 'WEB APP',
    cta_label: 'Open Live Website',
  },
]

function normalizeUrl(url) {
  if (!url) return '#'
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed
  }
  return `https://${trimmed}`
}

export default function HeroProjectsSlider({ liveProducts = [] }) {
  // Use active products directly from Admin Panel / CMS
  const activeProducts = Array.isArray(liveProducts)
    ? liveProducts.filter(p => p.is_active === 1 || p.is_active === true || p.is_active === '1')
    : []

  const items = activeProducts.length > 0 ? activeProducts : FALLBACK_PRODUCTS

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  const AUTOPLAY_TIME = 5500 // 5.5 seconds per slide

  // Keep index within bounds
  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0)
    }
  }, [items.length, currentIndex])

  // Auto-play timer with smooth progress bar
  useEffect(() => {
    if (items.length <= 1 || isPaused) return

    setProgress(0)
    const interval = 50 // 50ms ticks
    const step = (interval / AUTOPLAY_TIME) * 100

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setDirection(1)
          setCurrentIndex(curr => (curr + 1) % items.length)
          return 0
        }
        return prev + step
      })
    }, interval)

    return () => clearInterval(timer)
  }, [currentIndex, isPaused, items.length])

  function handleNext(e) {
    if (e) e.stopPropagation()
    setDirection(1)
    setProgress(0)
    setCurrentIndex(i => (i + 1) % items.length)
  }

  function handlePrev(e) {
    if (e) e.stopPropagation()
    setDirection(-1)
    setProgress(0)
    setCurrentIndex(i => (i - 1 + items.length) % items.length)
  }

  function goToSlide(idx) {
    setDirection(idx > currentIndex ? 1 : -1)
    setProgress(0)
    setCurrentIndex(idx)
  }

  const current = items[currentIndex] || items[0]
  const targetUrl = normalizeUrl(current.url)
  const hasLiveUrl = current.url && current.url !== '#'

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 25 : -25,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
    exit: (dir) => ({
      x: dir > 0 ? -25 : 25,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.25, ease: 'easeIn' },
    }),
  }

  return (
    <div
      className="relative w-full max-w-[540px] mx-auto group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Luminous Glow Ambient Backdrop */}
      <div
        className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#00f0ff]/20 via-[#00cced]/25 to-[#1cb1f3]/20 blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ animation: 'pulseGlow 4s ease-in-out infinite' }}
      />

      {/* Main Glassmorphic Showcase Box */}
      <div className="relative rounded-3xl border border-[#00cced]/30 bg-gradient-to-b from-[#091527]/95 via-[#07111f]/95 to-[#040914]/98 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden">
        
        {/* Top Progress Track */}
        {items.length > 1 && (
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white/[0.08]">
            <div
              className="h-full bg-gradient-to-r from-[#00f0ff] via-[#00cced] to-[#38bdf8] transition-all duration-75"
              style={{ width: `${progress}%`, boxShadow: '0 0 10px #00f0ff' }}
            />
          </div>
        )}

        {/* Header Telemetry Row */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            </span>
            <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-emerald-400 font-mono">
              PROJECT IS LIVE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#00cced]/15 border border-[#00cced]/35 text-[0.65rem] font-bold text-[#00f0ff] tracking-wide">
              {current.badge || 'LIVE NOW'}
            </span>
            {items.length > 1 && (
              <span className="text-[0.68rem] font-mono text-slate-400">
                0{currentIndex + 1} / 0{items.length}
              </span>
            )}
          </div>
        </div>

        {/* Animated Slide Body */}
        <div className="min-h-[140px] flex flex-col justify-center">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current.id || currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-3"
            >
              {/* App Icon + Title */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00cced]/20 to-[#1cb1f3]/10 border border-[#00cced]/35 flex items-center justify-center text-2xl shadow-[0_8px_20px_rgba(0,204,237,0.2)] flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  {current.icon || '✨'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                      {current.name}
                    </h3>
                    <span className="text-[0.62rem] font-bold text-[#00f0ff] bg-[#00cced]/15 px-2 py-0.5 rounded-full border border-[#00cced]/30">
                      Live App
                    </span>
                  </div>
                  {current.category && (
                    <p className="text-xs text-[#38bdf8] font-medium tracking-wide mt-0.5">
                      {current.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Dynamic Tagline from Admin Panel (Only shown if set) */}
              {current.tagline && current.tagline.trim() !== '' && (
                <p className="text-sm text-slate-300 leading-relaxed font-normal pt-1">
                  {current.tagline}
                </p>
              )}

              {/* Dynamic Tech Tags (Only if set from data) */}
              {Array.isArray(current.tags) && current.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {current.tags.map((t, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 text-[0.68rem] font-mono font-medium px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#00f0ff]" />
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Dynamic Metrics (Only if set from data) */}
              {current.metrics && (
                <div className="flex items-center gap-2 pt-1 text-[0.72rem] text-slate-400 font-mono">
                  <Activity size={13} className="text-emerald-400" />
                  <span>{current.metrics}</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Controls & Navigation Footer */}
        <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-4 flex-wrap">
          
          {/* Main Action Link Button (Uses dynamic cta_label from Admin Panel) */}
          {hasLiveUrl ? (
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f0ff] via-[#00cced] to-[#1cb1f3] hover:brightness-110 text-[#040810] font-bold text-xs shadow-[0_4px_24px_rgba(0,204,237,0.4)] transition-all duration-300 no-underline cursor-pointer group/cta"
            >
              <Sparkles size={13} className="text-[#040810]" />
              <span>{current.cta_label || 'Open Live Website'}</span>
              <ArrowUpRight size={15} className="group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 transition-transform" />
            </a>
          ) : (
            <span className="text-xs text-slate-400 font-medium">Production Deployed</span>
          )}

          {/* Slider Controls: Dots + Next/Prev Buttons */}
          {items.length > 1 && (
            <div className="flex items-center gap-3">
              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'w-6 bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]'
                        : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              {/* Arrows */}
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={handlePrev}
                  aria-label="Previous project"
                  className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-[#00cced]/20 border border-white/[0.1] hover:border-[#00cced]/40 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Next project"
                  className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-[#00cced]/20 border border-white/[0.1] hover:border-[#00cced]/40 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sub-bar: Online & Ready */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-[0.68rem] text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            Online &amp; Ready
          </span>
          <span className="text-[#00f0ff]/80 font-mono text-[0.66rem]">
            CODELIFE//STUDIO
          </span>
        </div>

      </div>
    </div>
  )
}
