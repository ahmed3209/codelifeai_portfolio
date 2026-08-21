import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'

// Default fallback live products if none loaded from database
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: 'Screen Snap',
    tagline: 'Instant screen recording, smart annotations & AI capture workflow.',
    url: 'https://screensnap.codelifeai.com/',
    icon: '📸',
    badge: 'LIVE NOW',
    cta_label: 'Open Live Website',
    is_active: 1,
  },
  {
    id: 2,
    name: 'ZYRA AI',
    tagline: 'One AI for everything — chat, create, analyze & automate workflows.',
    url: 'https://zyra-ai.com',
    icon: '⚡',
    badge: 'v2.4 LIVE',
    cta_label: 'Open Live Website',
    is_active: 1,
  },
  {
    id: 3,
    name: 'Alarmify',
    tagline: 'AI sleep partner and smart wake-up alarm system.',
    url: 'https://alarmify.app',
    icon: '⏰',
    badge: 'WEB APP',
    cta_label: 'Open Live Website',
    is_active: 1,
  }
]

// Normalizes any string to a safe full web URL
function normalizeUrl(url) {
  if (!url) return '#'
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed
  }
  return `https://${trimmed}`
}

/**
 * Top-Right Animated "Product is LIVE" Slider Widget
 * Features:
 * - Live radar pulse beacon
 * - Auto-playing carousel slider across multiple admin-added live products
 * - Interactive Next/Prev controls and indicator dots
 * - Pause on hover
 * - Direct external click to open live website in a new tab
 */
export default function LiveProductWidget({ liveProducts = [], promo = null }) {
  // Use active products from DB, or fallback to default products
  const dbActive = Array.isArray(liveProducts) ? liveProducts.filter(p => p.is_active === 1 || p.is_active === true) : []
  
  const products = dbActive.length > 0
    ? dbActive
    : (promo && promo.live_url
        ? [{
            id: promo.id || 'promo',
            name: promo.name || 'Screen Snap',
            tagline: promo.tagline || 'Instant screen recording, smart annotations & AI capture workflow.',
            url: promo.live_url,
            icon: '📸',
            badge: promo.badge || 'LIVE NOW',
            cta_label: promo.cta_label || 'Open Live Website',
          }, ...DEFAULT_PRODUCTS.slice(1)]
        : DEFAULT_PRODUCTS)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1) // 1: next, -1: prev
  const [isPaused, setIsPaused] = useState(false)

  // Keep index within bounds if products list changes
  useEffect(() => {
    if (currentIndex >= products.length) {
      setCurrentIndex(0)
    }
  }, [products.length, currentIndex])

  // Auto-play slider every 4.5 seconds when not hovered
  useEffect(() => {
    if (products.length <= 1 || isPaused) return

    const timer = setInterval(() => {
      setDirection(1)
      setCurrentIndex(prev => (prev + 1) % products.length)
    }, 4500)

    return () => clearInterval(timer)
  }, [products.length, isPaused])

  function handleNext(e) {
    if (e) e.stopPropagation()
    setDirection(1)
    setCurrentIndex(prev => (prev + 1) % products.length)
  }

  function handlePrev(e) {
    if (e) e.stopPropagation()
    setDirection(-1)
    setCurrentIndex(prev => (prev - 1 + products.length) % products.length)
  }

  const currentProduct = products[currentIndex] || products[0]
  const targetUrl = normalizeUrl(currentProduct.url)
  const isExternal = targetUrl.startsWith('http')

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
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
    exit: (dir) => ({
      x: dir > 0 ? -25 : 25,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.25, ease: 'easeIn' },
    }),
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full md:w-auto md:absolute md:top-24 lg:top-28 md:right-6 lg:right-12 z-30 mb-8 md:mb-0 flex justify-center md:justify-end pointer-events-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative group">
        {/* Ambient glow underneath */}
        <div
          className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#00d4f5]/35 via-[#7c3aed]/35 to-[#00d4f5]/35 blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{ animation: 'gradientShift 6s linear infinite', backgroundSize: '200% 200%' }}
        />

        {/* Floating card container */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-full max-w-[340px] sm:max-w-[360px] rounded-2xl border border-white/[0.12] bg-[#0c0c1e]/90 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:border-[#00d4f5]/40 text-left overflow-hidden"
        >
          {/* Header Row: Live Radar Beacon + Live Pill + Prev/Next Controls */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              {/* Radar pulse */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              </span>

              <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-emerald-400 flex items-center gap-1">
                PRODUCT IS LIVE
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[0.65rem] font-semibold text-white/50 px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08]">
                {currentProduct.badge || 'LIVE NOW'}
              </span>

              {/* Slider arrow controls if more than 1 product */}
              {products.length > 1 && (
                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous live product"
                    className="w-5 h-5 rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-white/60 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft size={12} />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next live product"
                    className="w-5 h-5 rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-white/60 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Animated Product Slide Area */}
          <div className="min-h-[90px] flex flex-col justify-center">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={currentProduct.id || currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4f5]/20 to-[#7c3aed]/20 border border-white/[0.12] flex items-center justify-center text-base shadow-inner flex-shrink-0">
                    {currentProduct.icon || '✨'}
                  </div>
                  <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
                    {currentProduct.name}
                    <span className="text-[0.62rem] font-semibold text-[#00d4f5] bg-[#00d4f5]/10 px-1.5 py-0.5 rounded border border-[#00d4f5]/20">
                      Live App
                    </span>
                  </h4>
                </div>

                <p className="text-[0.76rem] text-white/70 leading-relaxed line-clamp-2 mt-1 font-normal">
                  {currentProduct.tagline || 'Experience our latest live production release built for modern workflows.'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action Button: Direct Click to Open Live Website */}
          <div className="mt-3.5">
            <a
              href={targetUrl}
              target={isExternal ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00d4f5] to-[#00a8d6] hover:from-[#00e5ff] hover:to-[#00bfe6] text-[#06060f] font-bold text-xs shadow-[0_4px_20px_rgba(0,212,245,0.3)] hover:shadow-[0_6px_28px_rgba(0,212,245,0.5)] transition-all duration-300 group/btn no-underline cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#06060f]" />
                {currentProduct.cta_label || 'Open Live Website'}
              </span>
              <ArrowUpRight size={15} className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </a>
          </div>

          {/* Footer: Status Indicator + Slider Progress Dots */}
          <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[0.62rem] text-white/40">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#10b981]" />
              Online & Ready
            </span>

            {/* Slider Dots */}
            {products.length > 1 ? (
              <div className="flex items-center gap-1.5">
                {products.map((p, idx) => (
                  <button
                    key={p.id || idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      setDirection(idx > currentIndex ? 1 : -1)
                      setCurrentIndex(idx)
                    }}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'w-4 bg-[#00d4f5]'
                        : 'w-1.5 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            ) : (
              <span className="text-white/40">Instant Access →</span>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
