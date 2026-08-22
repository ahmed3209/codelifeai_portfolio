import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Sparkles, ExternalLink, CheckCircle2, Layers } from 'lucide-react'

const CATEGORIES = [
  'All',
  'Web Application',
  'Mobile Apps',
  'AI & Machine Learning',
  'SaaS Platforms',
  'E-Commerce',
]

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
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [activeProjectModal, setActiveProjectModal] = useState(null)

  if (!projects.length) return null

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projects
    return projects.filter(p => p.category === selectedCategory)
  }, [projects, selectedCategory])

  return (
    <section id="work" className="relative z-10 py-20 sm:py-32 px-4 sm:px-6 lg:px-14">
      <div className="max-w-[1280px] mx-auto">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00d4f5]/10 border border-[#00d4f5]/25 text-[0.68rem] font-bold uppercase tracking-widest text-[#00d4f5] mb-3">
              <Layers size={12} /> Portfolio &amp; Case Studies
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-bb-white tracking-tight leading-tight">
              Selected Products We've <br />
              <span className="bg-gradient-to-r from-[#00d4f5] via-[#38bdf8] to-[#a855f7] bg-clip-text text-transparent">
                Engineered &amp; Shipped
              </span>
            </h2>
          </div>
          <p className="text-bb-muted text-sm leading-relaxed max-w-[340px] sm:text-right">
            Battle-tested digital applications built for speed, scale, and high conversion across web, mobile, and AI.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {CATEGORIES.map(cat => {
            const count = cat === 'All' ? projects.length : projects.filter(p => p.category === cat).length
            if (cat !== 'All' && count === 0) return null
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#00d4f5] text-black font-bold shadow-md shadow-[#00d4f5]/20'
                    : 'bg-white/[0.03] border border-white/[0.06] text-bb-muted hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <ProjectCard project={p} onOpenDetail={() => setActiveProjectModal(p)} />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex items-center justify-center mt-14"
        >
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-[#00d4f5] border border-white/[0.12] text-white hover:text-black font-bold text-xs sm:text-sm transition-all duration-300 shadow-xl group"
          >
            <span>Have a project in mind? Let's build together</span>
            <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {activeProjectModal && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setActiveProjectModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0c0c1e] border border-white/[0.12] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6"
            >
              {/* Modal Cover Image */}
              {activeProjectModal.image_url && (
                <div className="h-56 sm:h-64 rounded-2xl overflow-hidden bg-black/50 border border-white/10 relative">
                  <img
                    src={activeProjectModal.image_url}
                    alt={activeProjectModal.title}
                    className="w-full h-full object-cover"
                  />
                  {activeProjectModal.outcome && (
                    <div className="absolute bottom-3 right-3 text-xs font-bold font-mono px-3 py-1 rounded-full bg-black/70 border border-white/20 text-emerald-400 backdrop-blur-md">
                      {activeProjectModal.outcome}
                    </div>
                  )}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#00d4f5] bg-[#00d4f5]/10 border border-[#00d4f5]/20 px-3 py-0.5 rounded-full">
                    {activeProjectModal.category}
                  </span>
                  {activeProjectModal.outcome && !activeProjectModal.image_url && (
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {activeProjectModal.outcome}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-bb-white">
                  {activeProjectModal.title}
                </h3>
              </div>

              {activeProjectModal.description && (
                <div className="text-sm text-slate-300 leading-relaxed border-t border-white/[0.06] pt-4">
                  {activeProjectModal.description}
                </div>
              )}

              {/* Tech Stack */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-bb-muted mb-2.5">
                  Technologies Used
                </h4>
                <div className="flex flex-wrap gap-2">
                  {parseTags(activeProjectModal.tags).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setActiveProjectModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-bb-muted hover:text-white transition-colors"
                >
                  Close
                </button>
                {activeProjectModal.live_url && (
                  <a
                    href={activeProjectModal.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00d4f5] hover:bg-[#00b8e6] text-black font-bold text-xs transition-colors"
                  >
                    <span>Visit Live Website</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}

function ProjectCard({ project: p, onOpenDetail }) {
  const tags = parseTags(p.tags)
  const isExternal = p.live_url && p.live_url.startsWith('http')

  return (
    <div
      onClick={onOpenDetail}
      className="group relative bg-[#090918]/80 border border-white/[0.07] hover:border-white/[0.2] rounded-3xl overflow-hidden h-full flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60"
    >
      {/* Visual area: Real image or geometric fallback */}
      <div className="relative h-48 sm:h-52 bg-black/40 overflow-hidden">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center relative overflow-hidden"
            style={{ background: p.bg || 'rgba(0,212,245,0.08)' }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            />
            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
              {p.emoji || '🚀'}
            </span>
          </div>
        )}

        {/* Gradient dark overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090918] via-transparent to-black/40 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 text-[0.67rem] font-bold text-white bg-black/60 backdrop-blur-md border border-white/[0.12] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
          {p.category}
        </div>

        {/* Outcome badge */}
        {p.outcome && (
          <div className="absolute bottom-3.5 right-3.5 text-[0.68rem] font-bold px-2.5 py-1 rounded-full bg-black/75 border border-white/[0.12] text-emerald-400 font-mono backdrop-blur-md">
            {p.outcome}
          </div>
        )}

        {/* Live link quick badge on hover */}
        {p.live_url && (
          <a
            href={p.live_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-[#00d4f5] text-black text-[0.68rem] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-105"
            title="Open Live Website"
          >
            <span>Live Demo</span>
            <ExternalLink size={11} />
          </a>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-bb-white group-hover:text-[#00d4f5] transition-colors leading-snug flex items-start justify-between gap-2">
            <span>{p.title}</span>
            <ArrowUpRight size={15} className="opacity-0 group-hover:opacity-100 text-[#00d4f5] flex-shrink-0 transition-opacity" />
          </h3>

          {p.description && (
            <p className="text-xs text-slate-300 mt-2 leading-relaxed line-clamp-2">
              {p.description}
            </p>
          )}
        </div>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.04]">
          {tags.slice(0, 4).map((tag, i) => (
            <span
              key={i}
              className="text-[0.68rem] font-medium px-2.5 py-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-300"
            >
              {tag}
            </span>
          ))}
          {tags.length > 4 && (
            <span className="text-[0.65rem] font-mono text-bb-muted px-1 py-0.5">
              +{tags.length - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
