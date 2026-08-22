import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowUpRight, Check, Sparkles, Code2, Smartphone, Bot, Cloud, Palette, Server } from 'lucide-react'

const DEFAULT_SERVICE_IMAGES = {
  'Web Application Development': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
  'Mobile App Engineering': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200&auto=format&fit=crop',
  'Custom AI Agents & Automation': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
  'Cloud Architecture & DevOps': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
  'UI/UX Product Design': 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1200&auto=format&fit=crop',
  'Enterprise Software Systems': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
}

function parseJsonArray(val) {
  if (Array.isArray(val)) return val
  try {
    const parsed = JSON.parse(val)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : []
  }
}

export default function ServicesSection({ services = [] }) {
  const [active, setActive] = useState(null)

  return (
    <section id="services" className="relative z-10 py-20 sm:py-32 px-4 sm:px-6 lg:px-14">
      <div className="max-w-[1280px] mx-auto">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00d4f5]/10 border border-[#00d4f5]/25 text-[0.68rem] font-bold uppercase tracking-widest text-[#00d4f5] mb-3">
              <Sparkles size={12} /> Engineering Capabilities
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-bb-white tracking-tight leading-tight">
              Specialized Services We <br />
              <span className="bg-gradient-to-r from-[#00d4f5] via-[#38bdf8] to-[#a855f7] bg-clip-text text-transparent">
                Design, Build &amp; Scale
              </span>
            </h2>
          </div>
          <p className="text-bb-muted text-sm leading-relaxed max-w-[320px] sm:text-right">
            From zero-to-one startup MVPs to high-concurrency enterprise distributed systems.
          </p>
        </motion.div>

        {/* Services Grid with Visual Assets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc, i) => (
            <motion.div
              key={svc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{ delay: i * 0.05, duration: 0.45 }}
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

function ServiceCard({ svc, index, onClick }) {
  const imageUrl = svc.image_url || DEFAULT_SERVICE_IMAGES[svc.title] || DEFAULT_SERVICE_IMAGES['Web Application Development']
  const stack = parseJsonArray(svc.stack)

  return (
    <div
      onClick={onClick}
      className="group relative bg-[#090918]/80 border border-white/[0.08] hover:border-[#00d4f5]/40 rounded-3xl overflow-hidden h-full flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/70"
    >
      {/* Visual Asset Banner */}
      <div className="relative h-44 sm:h-48 overflow-hidden bg-black/40">
        <img
          src={imageUrl}
          alt={svc.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090918] via-[#090918]/40 to-transparent pointer-events-none" />

        {/* Floating Icon Badge */}
        <div className="absolute top-3.5 left-3.5 w-11 h-11 rounded-2xl bg-black/70 border border-white/15 backdrop-blur-md flex items-center justify-center text-xl shadow-lg">
          {svc.icon || '⚡'}
        </div>

        {/* Number Badge */}
        <div className="absolute top-3.5 right-3.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-[0.65rem] font-mono font-bold text-white/50">
          0{index + 1}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-bb-white group-hover:text-[#00d4f5] transition-colors leading-snug flex items-center justify-between">
            <span>{svc.title}</span>
            <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 text-[#00d4f5] transition-opacity flex-shrink-0" />
          </h3>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed line-clamp-2">
            {svc.short_desc}
          </p>
        </div>

        {/* Tech Stack Chips */}
        {stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.05]">
            {stack.slice(0, 3).map((s, idx) => (
              <span
                key={idx}
                className="text-[0.68rem] font-medium px-2.5 py-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-300"
              >
                {s}
              </span>
            ))}
            {stack.length > 3 && (
              <span className="text-[0.65rem] font-mono text-bb-muted px-1 py-0.5">
                +{stack.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ServiceModal({ svc, onClose }) {
  const imageUrl = svc.image_url || DEFAULT_SERVICE_IMAGES[svc.title] || DEFAULT_SERVICE_IMAGES['Web Application Development']
  const features = parseJsonArray(svc.features)
  const stack = parseJsonArray(svc.stack)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-[620px] max-h-[88vh] flex flex-col overflow-hidden rounded-3xl border border-white/[0.12] shadow-2xl bg-[#0c0c1e]"
      >
        {/* Modal Banner Graphic */}
        <div className="relative h-48 sm:h-56 overflow-hidden flex-shrink-0 bg-black">
          <img src={imageUrl} alt={svc.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c1e] via-[#0c0c1e]/50 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:scale-105 transition-all shadow-lg backdrop-blur-md"
          >
            <X size={14} />
          </button>

          {/* Service Title */}
          <div className="absolute bottom-4 left-6 right-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black/80 border border-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-xl flex-shrink-0">
              {svc.icon || '⚡'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-bb-white">{svc.title}</h2>
              <p className="text-xs text-[#00d4f5] font-semibold">Specialized Capability</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5">
          <p className="text-sm text-slate-200 leading-relaxed">
            {svc.long_desc || svc.short_desc}
          </p>

          {features.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#00d4f5] mb-3">
                Key Deliverables &amp; Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 bg-white/[0.025] border border-white/[0.06] rounded-xl p-3"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#00d4f5]/15 flex items-center justify-center text-[#00d4f5] flex-shrink-0 mt-0.5">
                      <Check size={10} strokeWidth={3} />
                    </div>
                    <span className="text-xs text-slate-200 leading-snug">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stack.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-bb-muted mb-2.5">
                Technologies Used
              </h4>
              <div className="flex flex-wrap gap-2">
                {stack.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium text-slate-200 bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-xl"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-bb-muted hover:text-white transition-colors"
            >
              Close
            </button>
            <Link
              to="/contact"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#00d4f5] hover:bg-[#00b8e6] text-black font-bold text-xs transition-colors"
            >
              <span>Scope Your Project</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
