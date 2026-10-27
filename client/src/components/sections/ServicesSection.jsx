import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowRight, Sparkles } from 'lucide-react'

export const DEFAULT_SERVICE_IMAGES = {
  web: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
  mobile: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200&auto=format&fit=crop',
  ui: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1200&auto=format&fit=crop',
  ai: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
  cloud: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
  consulting: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
  enterprise: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop',
}

export function getServiceImage(svc) {
  if (svc?.image_url && svc.image_url.trim()) return svc.image_url
  const title = (svc?.title || '').toLowerCase()
  if (title.includes('web')) return DEFAULT_SERVICE_IMAGES.web
  if (title.includes('mobile') || title.includes('app') || title.includes('flutter') || title.includes('native')) return DEFAULT_SERVICE_IMAGES.mobile
  if (title.includes('ui') || title.includes('ux') || title.includes('design') || title.includes('product')) return DEFAULT_SERVICE_IMAGES.ui
  if (title.includes('ai') || title.includes('agent') || title.includes('intelligence') || title.includes('machine') || title.includes('llm')) return DEFAULT_SERVICE_IMAGES.ai
  if (title.includes('cloud') || title.includes('devops') || title.includes('kubernetes') || title.includes('aws')) return DEFAULT_SERVICE_IMAGES.cloud
  if (title.includes('consult') || title.includes('strategy') || title.includes('audit')) return DEFAULT_SERVICE_IMAGES.consulting
  if (title.includes('enterprise') || title.includes('system') || title.includes('erp')) return DEFAULT_SERVICE_IMAGES.enterprise
  return DEFAULT_SERVICE_IMAGES.web
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
  // Only display Head Services (parent_id is null) on the main overview grids
  const displayServices = services.filter(s => !s.parent_id && (s.show_on_home !== 0 || !s.show_on_home))
  const list = displayServices.length > 0 ? displayServices : services

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
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00cced]/10 border border-[#00cced]/30 text-[0.68rem] font-bold uppercase tracking-widest text-[#00f0ff] mb-3 shadow-[0_0_15px_rgba(0,204,237,0.15)]">
              <Sparkles size={12} className="text-[#00f0ff]" /> Engineering Capabilities
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Specialized Services We <br />
              <span className="bg-gradient-to-r from-[#00f0ff] via-[#00cced] to-[#1cb1f3] bg-clip-text text-transparent">
                Design, Build &amp; Scale
              </span>
            </h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed max-w-[320px] sm:text-right">
            From zero-to-one startup MVPs to high-concurrency enterprise distributed systems.
          </p>
        </motion.div>

        {/* Services Grid with Visual Assets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {list.map((svc, i) => (
            <motion.div
              key={svc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{ delay: i * 0.05, duration: 0.45 }}
              className="h-full"
            >
              <ServiceCard svc={svc} index={i} allServices={services} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceCard({ svc, index, allServices = [] }) {
  const imageUrl = getServiceImage(svc)
  const stack = parseJsonArray(svc.stack)
  const childCount = allServices.filter(s => s.parent_id === svc.id).length

  return (
    <Link
      to={`/services/${svc.slug || svc.id}`}
      className="group relative bg-gradient-to-b from-[#0d1c33] via-[#091629] to-[#050c18] border border-[#00cced]/35 hover:border-[#00f0ff] rounded-3xl overflow-hidden h-full flex flex-col no-underline transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,204,237,0.25)]"
    >
      {/* Top Accent Laser Line on Hover */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20" />

      {/* Visual Asset Banner */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-[#060c18]">
        <img
          src={imageUrl}
          alt={svc.title}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 brightness-95 group-hover:brightness-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1c33] via-[#0d1c33]/30 to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          {childCount > 0 ? (
            <span className="px-2.5 py-1 rounded-full bg-[#00cced]/20 border border-[#00cced]/50 text-[0.68rem] font-mono font-bold text-[#00f0ff] backdrop-blur-md">
              {childCount} Sub-Services
            </span>
          ) : <span />}
          <div className="px-3 py-1 rounded-full bg-black/80 border border-[#00cced]/35 text-[0.7rem] font-mono font-bold text-[#00f0ff] shadow-md">
            0{index + 1}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#00f0ff] transition-colors leading-snug tracking-tight flex items-center justify-between">
            <span>{svc.title}</span>
            <ArrowUpRight size={18} className="text-[#00cced] group-hover:text-[#00f0ff] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
          </h3>
          <p className="text-sm text-slate-100 leading-relaxed font-normal line-clamp-3">
            {svc.short_desc}
          </p>
        </div>

        {/* Tech Stack Chips */}
        <div className="space-y-3 pt-3 border-t border-white/[0.08]">
          {stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {stack.slice(0, 3).map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 text-[0.72rem] font-mono font-semibold px-2.5 py-1 rounded-lg bg-[#00cced]/10 border border-[#00cced]/35 text-slate-100 group-hover:border-[#00f0ff]/60 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
                  {s}
                </span>
              ))}
              {stack.length > 3 && (
                <span className="text-[0.7rem] font-mono font-bold text-[#00f0ff] px-2 py-1 rounded-lg bg-[#00cced]/10 border border-[#00cced]/25">
                  +{stack.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Action Callout */}
          <div className="flex items-center justify-between text-xs font-bold text-[#00f0ff] group-hover:text-white transition-colors pt-2 border-t border-white/[0.05]">
            <span>{childCount > 0 ? `Explore Overview & ${childCount} Capabilities` : 'Explore Detailed Service Page'}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform text-[#00f0ff]" />
          </div>
        </div>
      </div>
    </Link>
  )
}

