import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { X, ArrowUpRight, Check } from 'lucide-react'

/* ── Spring 3-D tilt ──────────────────────────── */
function useTilt(strength = 10) {
  const rawX  = useMotionValue(0)
  const rawY  = useMotionValue(0)
  const rotX  = useSpring(useTransform(rawY, [-1, 1], [ strength, -strength]), { stiffness: 280, damping: 24 })
  const rotY  = useSpring(useTransform(rawX, [-1, 1], [-strength,  strength]), { stiffness: 280, damping: 24 })
  const scale = useSpring(1, { stiffness: 280, damping: 24 })

  function onMouseMove(e) {
    const r = e.currentTarget.getBoundingClientRect()
    rawX.set(((e.clientX - r.left) / r.width  - 0.5) * 2)
    rawY.set(((e.clientY - r.top)  / r.height - 0.5) * 2)
    scale.set(1.026)
  }
  function onMouseLeave() { rawX.set(0); rawY.set(0); scale.set(1) }

  return { rotX, rotY, scale, onMouseMove, onMouseLeave }
}

/* ── Section ─────────────────────────────────── */
export default function ServicesSection({ services = [] }) {
  const [active, setActive] = useState(null)

  return (
    <section id="services" className="relative z-10 py-32 px-6 lg:px-14">
      <div className="max-w-[1280px] mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14"
        >
          <div>
            <p className="section-number mb-1">01 / Services</p>
            <div className="section-label">What We Do</div>
            <h2 className="font-extrabold tracking-tight leading-[1.04]" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
              Our <em className="font-fraunces font-light not-italic text-white/35">Services</em>
            </h2>
          </div>
          <p className="text-bb-muted text-sm leading-relaxed max-w-[280px] sm:text-right">
            We turn complex ideas into clean, scalable solutions. Click any service to learn more.
          </p>
        </motion.div>

        {/* Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 rounded-2xl overflow-hidden border border-white/[0.07]"
          style={{ gap: '1px', background: 'rgba(255,255,255,0.045)' }}
        >
          {services.map((svc, i) => (
            <motion.div
              key={svc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{ delay: i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <ServiceCard svc={svc} index={i} onClick={() => setActive(svc)} />
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {active && <ServiceModal svc={active} onClose={() => setActive(null)} />}
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ── Card ────────────────────────────────────── */
function ServiceCard({ svc, index, onClick }) {
  const { rotX, rotY, scale, onMouseMove, onMouseLeave } = useTilt(9)

  return (
    <motion.div
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX: rotX, rotateY: rotY, scale, transformStyle: 'preserve-3d', perspective: 900 }}
      className="group relative bg-[#0d0d1c] p-8 cursor-pointer overflow-hidden h-full flex flex-col min-h-[200px]"
    >
      {/* Hover gradient */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{ background: 'linear-gradient(150deg, rgba(0,212,245,0.055) 0%, rgba(124,58,237,0.03) 100%)' }} />
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-350 origin-left"
        style={{ background: 'linear-gradient(90deg, #00d4f5, #7c3aed)' }} />

      {/* Index number */}
      <span className="text-[0.67rem] font-extrabold tracking-[0.15em] text-white/[0.15] mb-3 block">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Icon */}
      <motion.div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 border border-bb-accent/14"
        style={{ background: 'rgba(0,212,245,0.08)', transformStyle: 'preserve-3d' }}
        whileHover={{ z: 18, scale: 1.07 }}
      >
        {svc.icon}
      </motion.div>

      <h3 className="text-[0.98rem] font-bold text-bb-white mb-2 tracking-[-0.01em]">{svc.title}</h3>
      <p className="text-[0.82rem] text-bb-muted leading-relaxed flex-1">{svc.short_desc}</p>

      {/* Arrow */}
      <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-bb-accent border border-bb-accent/20 bg-bb-accent/8
        opacity-0 translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300">
        <ArrowUpRight size={14} />
      </div>
    </motion.div>
  )
}

/* ── Modal ───────────────────────────────────── */
function ServiceModal({ svc, onClose }) {
  const features = svc.features ? JSON.parse(svc.features) : []
  const stack    = svc.stack    ? JSON.parse(svc.stack)    : []

  return (
    <motion.div
      key="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/82 backdrop-blur-2xl"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        key="panel"
        initial={{ opacity: 0, scale: 0.88, y: 36 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.88, y: 36 }}
        transition={{ type: 'spring', damping: 26, stiffness: 340 }}
        className="w-full max-w-[640px] max-h-[88vh] flex flex-col overflow-hidden rounded-2xl border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.65)]"
        style={{ background: '#0b0b1d' }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-white/[0.06] relative flex-shrink-0"
          style={{ background: 'linear-gradient(145deg, rgba(0,212,245,0.06) 0%, rgba(124,58,237,0.04) 100%)' }}>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(0,212,245,0.07) 0%, transparent 60%)', transform: 'translate(30%,-30%)' }} />

          <div className="flex items-start gap-4 relative">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border border-bb-accent/18 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(0,212,245,0.14), rgba(124,58,237,0.1))' }}>
              {svc.icon}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h2 className="text-[1.3rem] font-extrabold tracking-tight text-bb-white mb-1">{svc.title}</h2>
              <p className="text-bb-muted text-sm leading-relaxed">{svc.long_desc || svc.short_desc}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center text-bb-muted hover:text-bb-white hover:bg-white/[0.1] transition-all">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin space-y-6">
          {features.length > 0 && (
            <div>
              <p className="text-[0.67rem] font-bold tracking-[0.13em] uppercase text-bb-accent mb-3">What's Included</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {features.map((f, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.045 }}
                    className="flex items-start gap-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 hover:border-bb-accent/20 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-bb-accent/14 flex items-center justify-center text-bb-accent flex-shrink-0 mt-0.5">
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span className="text-[0.82rem] text-white/68 leading-snug">{f}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {stack.length > 0 && (
            <div>
              <p className="text-[0.67rem] font-bold tracking-[0.13em] uppercase text-bb-accent mb-3">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {stack.map((s, i) => (
                  <motion.span key={i}
                    initial={{ opacity: 0, scale: 0.78 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.038 }}
                    className="text-[0.76rem] font-medium text-white/55 bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 rounded-full hover:border-bb-accent/28 hover:text-white/78 transition-colors cursor-default">
                    {s}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 flex-wrap pt-1">
            <Link to="/contact" onClick={onClose} className="btn-primary text-sm py-2.5 px-5 gap-1.5">
              Start a Project <ArrowUpRight size={13} />
            </Link>
            <button onClick={onClose} className="btn-ghost text-sm py-2.5 px-5">
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
