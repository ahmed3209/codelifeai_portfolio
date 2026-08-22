import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

/**
 * Homepage promotional banner / slider for active product launches & promos.
 * Automatically cycles if multiple promotions are active.
 */
export default function PromoTeaser({ promo = null, promos = [] }) {
  // Consolidate list of active promos
  const activeList = Array.isArray(promos) && promos.length > 0
    ? promos.filter(p => p.is_active === 1 || p.is_active === true)
    : (promo ? [promo] : [])

  if (activeList.length === 0) return null

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isPaused, setIsPaused] = useState(false)

  // Keep index within bounds
  useEffect(() => {
    if (currentIndex >= activeList.length) {
      setCurrentIndex(0)
    }
  }, [activeList.length, currentIndex])

  // Auto-play slider every 5.5 seconds when not hovered
  useEffect(() => {
    if (activeList.length <= 1 || isPaused) return

    const timer = setInterval(() => {
      setDirection(1)
      setCurrentIndex(prev => (prev + 1) % activeList.length)
    }, 5500)

    return () => clearInterval(timer)
  }, [activeList.length, isPaused])

  function handleNext(e) {
    if (e) e.stopPropagation()
    setDirection(1)
    setCurrentIndex(prev => (prev + 1) % activeList.length)
  }

  function handlePrev(e) {
    if (e) e.stopPropagation()
    setDirection(-1)
    setCurrentIndex(prev => (prev - 1 + activeList.length) % activeList.length)
  }

  const currentPromo = activeList[currentIndex] || activeList[0]
  const name = currentPromo.name || 'Coming Soon'
  const tagline = currentPromo.tagline || ''
  const slug = currentPromo.slug || ''
  const badge = currentPromo.badge || 'Coming Soon'

  const hasLiveUrl = currentPromo.live_url && currentPromo.live_url.trim().length > 0
  const ctaHref = hasLiveUrl
    ? (currentPromo.live_url.startsWith('http') || currentPromo.live_url.startsWith('/') ? currentPromo.live_url : `https://${currentPromo.live_url}`)
    : (slug ? `/launch/${slug}` : '/launch')
  const isExternal = ctaHref.startsWith('http')

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
    exit: (dir) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeIn' },
    }),
  }

  return (
    <section
      className="relative z-10 px-4 sm:px-6 lg:px-14 py-8 sm:py-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1180px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl border border-white/[0.09] overflow-hidden px-6 py-8 sm:px-12 sm:py-12 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(0,212,245,0.09) 0%, rgba(6,6,15,0.7) 45%, rgba(124,58,237,0.1) 100%)' }}
        >
          {/* Ambient glow accents */}
          <div
            className="absolute -top-20 -left-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(0,212,245,0.16) 0%, transparent 65%)' }}
          />
          <div
            className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.16) 0%, transparent 65%)' }}
          />
          <div
            className="absolute top-0 left-1/4 right-1/4 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,245,0.6), rgba(124,58,237,0.6), transparent)' }}
          />

          {/* Top header row with Badge & Next/Prev Controls */}
          <div className="relative flex items-center justify-between gap-4 mb-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-bb-accent/25 text-[0.66rem] font-bold tracking-[0.2em] uppercase text-bb-accent"
              style={{ background: 'rgba(0,212,245,0.06)' }}
            >
              <Sparkles size={12} /> {badge}
            </div>

            {/* Slider navigation controls if multiple promos */}
            {activeList.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  aria-label="Previous promo"
                  className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-white/70 hover:text-white flex items-center justify-center transition-colors border border-white/[0.08]"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Next promo"
                  className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-white/70 hover:text-white flex items-center justify-center transition-colors border border-white/[0.08]"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Animated Slide Content */}
          <div className="relative min-h-[140px] flex items-center">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={currentPromo.id || currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-7"
              >
                <div>
                  <h2
                    className="font-extrabold tracking-tight leading-[1.05] text-bb-white"
                    style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
                  >
                    {name} <em className="font-fraunces font-light not-italic text-gradient">is almost here.</em>
                  </h2>
                  {tagline && (
                    <p className="text-bb-muted text-sm sm:text-[0.95rem] leading-relaxed max-w-[580px] mt-3">
                      {tagline}
                    </p>
                  )}
                </div>

                {isExternal ? (
                  <a
                    href={ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm sm:text-base px-7 py-3.5 flex-shrink-0 self-start lg:self-center no-underline group cursor-pointer"
                  >
                    <span>{hasLiveUrl ? 'Open Product Website' : 'See the countdown'}</span>
                    <ExternalLink size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                  </a>
                ) : (
                  <Link
                    to={ctaHref}
                    className="btn-primary text-sm sm:text-base px-7 py-3.5 flex-shrink-0 self-start lg:self-center no-underline group cursor-pointer"
                  >
                    <span>See the countdown</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom indicator dots if multiple promos */}
          {activeList.length > 1 && (
            <div className="relative mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-center gap-2">
              {activeList.map((p, idx) => (
                <button
                  key={p.id || idx}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1)
                    setCurrentIndex(idx)
                  }}
                  aria-label={`Go to promo ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-6 bg-bb-accent shadow-[0_0_8px_rgba(0,212,245,0.6)]'
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
