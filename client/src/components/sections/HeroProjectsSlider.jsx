import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ExternalLink, ArrowUpRight, ChevronLeft, ChevronRight,
  Sparkles, CheckCircle2, Layers, Globe, Shield, Cpu, Activity
} from 'lucide-react'

// Fallback high-impact software studio projects
const FALLBACK_PROJECTS = [
  {
    id: 'p1',
    name: 'Alarmify',
    category: 'AI Web Application',
    tagline: 'AI-powered smart sleep partner & intelligent adaptive wake-up system.',
    url: 'https://alarmify.app',
    icon: '⏰',
    badge: 'LIVE WEB APP',
    metrics: '99.9% Uptime · 4.9★ Rating',
    tech: ['Next.js 15', 'TailwindCSS', 'Web Audio API', 'FastAPI'],
    accent: '#00f0ff',
  },
  {
    id: 'p2',
    name: 'Screen Snap',
    category: 'Productivity & AI',
    tagline: 'Instant screen capture, intelligent AI annotations & cloud collaboration engine.',
    url: 'https://screensnap.codelifeai.com/',
    icon: '📸',
    badge: 'PRODUCTION LIVE',
    metrics: '< 40ms Latency · Real-time Sync',
    tech: ['React', 'Electron', 'Node.js', 'AWS S3'],
    accent: '#00cced',
  },
  {
    id: 'p3',
    name: 'ZYRA AI Studio',
    category: 'Autonomous AI Agents',
    tagline: 'All-in-one AI operating system for automated code, multimodal analysis & workflows.',
    url: 'https://zyra-ai.com',
    icon: '⚡',
    badge: 'v2.6 ACTIVE',
    metrics: 'Autonomous Tooling · Multi-Agent',
    tech: ['Python', 'Gemini 2.0', 'Redis', 'Docker'],
    accent: '#38bdf8',
  },
  {
    id: 'p4',
    name: 'Authenticator Vault',
    category: 'Cybersecurity & Crypto',
    tagline: 'Zero-knowledge TOTP/HOTP cryptographic vault with end-to-end encrypted backup.',
    url: 'https://auth.codelifeai.com/',
    icon: '🔐',
    badge: 'ENTERPRISE READY',
    metrics: 'AES-256-GCM · Offline First',
    tech: ['TypeScript', 'Web Crypto API', 'SQLite', 'PWA'],
    accent: '#10b981',
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

export default function HeroProjectsSlider({ liveProducts = [], projects = [] }) {
  // Combine db products & fallbacks
  const combined = []

  if (Array.isArray(liveProducts) && liveProducts.length > 0) {
    liveProducts.forEach(p => {
      combined.push({
        id: `lp-${p.id}`,
        name: p.name,
        category: 'Live Production App',
        tagline: p.tagline || 'Engineered and scaled by CodeLifeAI for high throughput.',
        url: p.url,
        icon: p.icon || '🚀',
        badge: p.badge || 'LIVE NOW',
        metrics: 'Production Verified · 24/7 Monitored',
        tech: ['Full-Stack', 'Cloud Edge', 'Production Ready'],
        accent: '#00f0ff',
      })
    })
  }

  // Also append featured projects from portfolio if available
  if (Array.isArray(projects) && projects.length > 0) {
    projects.slice(0, 4).forEach(p => {
      let parsedTags = []
      try {
        parsedTags = Array.isArray(p.tags) ? p.tags : JSON.parse(p.tags || '[]')
      } catch {
        parsedTags = typeof p.tags === 'string' ? p.tags.split(',') : []
      }

      combined.push({
        id: `proj-${p.id}`,
        name: p.title,
        category: p.category || 'Featured Engineering Case',
        tagline: p.outcome || 'High-performance digital platform crafted with modern architecture.',
        url: p.live_url || '#',
        icon: p.emoji || '⚡',
        badge: 'FEATURED CASE',
        metrics: 'Shipped On-Time · Client Verified',
        tech: parsedTags.slice(0, 4),
        accent: p.accent || '#00cced',
      })
    })
  }

  // Fallback if empty
  const items = combined.length > 0 ? combined : FALLBACK_PROJECTS

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  const AUTOPLAY_TIME = 6000 // 6 seconds per slide

  // Auto-play timer with smooth progress bar
  useEffect(() => {
    if (isPaused) return

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

  function handleNext() {
    setDirection(1)
    setProgress(0)
    setCurrentIndex(i => (i + 1) % items.length)
  }

  function handlePrev() {
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
      x: dir > 0 ? 30 : -30,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
    exit: (dir) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.3, ease: 'easeIn' },
    }),
  }

  return (
    <div
      className="relative w-full max-w-[560px] mx-auto group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Luminous Glow Ambient Backdrop */}
      <div
        className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#00f0ff]/25 via-[#00cced]/25 to-[#1cb1f3]/25 blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ animation: 'pulseGlow 4s ease-in-out infinite' }}
      />

      {/* Main Glassmorphic Showcase Box */}
      <div className="relative rounded-3xl border border-[#00cced]/30 bg-gradient-to-b from-[#0a1526]/95 via-[#081220]/95 to-[#050c17]/98 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden">
        
        {/* Top Progress Track */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white/[0.08]">
          <div
            className="h-full bg-gradient-to-r from-[#00f0ff] via-[#00cced] to-[#38bdf8] transition-all duration-75"
            style={{ width: `${progress}%`, boxShadow: '0 0 10px #00f0ff' }}
          />
        </div>

        {/* Header Telemetry Row */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            </span>
            <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-emerald-400 font-mono">
              PROJECTS SHOWCASE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#00cced]/10 border border-[#00cced]/30 text-[0.65rem] font-bold text-[#00f0ff] tracking-wide">
              {current.badge}
            </span>
            <span className="text-[0.68rem] font-mono text-slate-400">
              0{currentIndex + 1} / 0{items.length}
            </span>
          </div>
        </div>

        {/* Animated Slide Body */}
        <div className="min-h-[220px] sm:min-h-[210px] flex flex-col justify-between">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current.id || currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              {/* App Icon + Title + Category */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00cced]/20 to-[#1cb1f3]/10 border border-[#00cced]/35 flex items-center justify-center text-3xl shadow-[0_8px_20px_rgba(0,204,237,0.2)] flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  {current.icon}
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
                  <p className="text-xs text-[#38bdf8] font-medium tracking-wide mt-0.5">
                    {current.category}
                  </p>
                </div>
              </div>

              {/* Tagline / Value Proposition */}
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                {current.tagline}
              </p>

              {/* Tech Stack Pills */}
              {Array.isArray(current.tech) && current.tech.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {current.tech.map((t, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 text-[0.68rem] font-mono font-medium px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#00f0ff]" />
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Verification & Metrics */}
              <div className="flex items-center gap-2 pt-2 text-[0.72rem] text-slate-400 font-mono">
                <Activity size={13} className="text-emerald-400" />
                <span>{current.metrics}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Controls & Navigation Footer */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center justify-between gap-4 flex-wrap">
          
          {/* Main Action Link Button */}
          {hasLiveUrl ? (
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f0ff] via-[#00cced] to-[#1cb1f3] hover:brightness-110 text-[#040810] font-bold text-xs shadow-[0_4px_24px_rgba(0,204,237,0.4)] transition-all duration-300 no-underline cursor-pointer group/cta"
            >
              <Sparkles size={13} className="text-[#040810]" />
              <span>Open Live Website</span>
              <ArrowUpRight size={15} className="group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 transition-transform" />
            </a>
          ) : (
            <span className="text-xs text-slate-400 font-medium">Production Deployed</span>
          )}

          {/* Slider Controls: Dots + Next/Prev Buttons */}
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
                className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-[#00cced]/20 border border-white/[0.1] hover:border-[#00cced]/40 text-slate-300 hover:text-white flex items-center justify-center transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next project"
                className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-[#00cced]/20 border border-white/[0.1] hover:border-[#00cced]/40 text-slate-300 hover:text-white flex items-center justify-center transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
