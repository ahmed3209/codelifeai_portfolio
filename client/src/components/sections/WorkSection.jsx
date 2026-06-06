import { Link } from 'react-router-dom'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

function parseTags(tags) {
  if (Array.isArray(tags)) return tags
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return typeof tags === 'string' ? tags.split(',').map(s => s.trim()).filter(Boolean) : []
  }
}

export default function WorkSection({ projects = [] }) {
  if (!projects.length) return null

  return (
    <section id="work" className="relative z-10 py-32 px-6 lg:px-14">
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
            <p className="section-number mb-1">02 / Work</p>
            <div className="section-label">Recent Projects</div>
            <h2 className="font-extrabold tracking-tight leading-[1.04]" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
              What We've <em className="font-fraunces font-light not-italic text-white/35">Built</em>
            </h2>
          </div>
          <p className="text-bb-muted text-sm leading-relaxed max-w-[280px] sm:text-right">
            A selection of real products we've designed, built, and shipped for clients worldwide.
          </p>
        </motion.div>

        {/* Project grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{ delay: i * 0.075, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProjectCard project={p} />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center justify-center mt-12"
        >
          <Link to="/contact" className="btn-ghost text-sm gap-2">
            Start your project
            <ArrowUpRight size={15} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function ProjectCard({ project: p }) {
  const tags = parseTags(p.tags)
  return (
    <div className="group card-base p-0 cursor-default overflow-hidden h-full flex flex-col">
      {/* Visual area */}
      <div
        className="relative h-48 flex items-center justify-center overflow-hidden"
        style={{ background: p.bg }}
      >
        {/* Grid pattern */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
        {/* Big emoji / icon */}
        <motion.div
          className="relative z-10 text-6xl"
          whileHover={{ scale: 1.12, rotate: 5 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          {p.emoji}
        </motion.div>
        {/* Outcome badge */}
        <div className="absolute bottom-3 right-3 text-[0.68rem] font-bold px-2.5 py-1 rounded-full border border-white/[0.1]"
          style={{ background: 'rgba(0,0,0,0.45)', color: p.accent }}>
          {p.outcome}
        </div>
        {/* Category badge */}
        <div className="absolute top-3 left-3 text-[0.67rem] font-semibold text-white/50 bg-black/40 border border-white/[0.08] px-2.5 py-1 rounded-full">
          {p.category}
        </div>
        {/* Arrow */}
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center
          opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
          <ArrowUpRight size={12} className="text-white/70" />
        </div>
        {/* Hover gradient sweep */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          style={{ background: `linear-gradient(135deg, ${p.accent}0d 0%, transparent 60%)` }} />
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-[0.97rem] font-bold text-bb-white mb-3 leading-snug">{p.title}</h3>
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {tags.map((tag, i) => (
            <span key={i}
              className="text-[0.69rem] font-semibold px-2.5 py-1 rounded-full border border-white/[0.07] transition-colors"
              style={{ color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.03)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-[2px] w-0 group-hover:w-full transition-all duration-500 origin-left"
        style={{ background: `linear-gradient(90deg, ${p.accent}, transparent)` }} />
    </div>
  )
}
