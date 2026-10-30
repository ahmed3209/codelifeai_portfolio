import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { ArrowUpRight, Github, Linkedin, MapPin, Sparkles } from 'lucide-react'
import { resolveApiUrl } from '../../lib/api'
import { formatExternalUrl } from '../../lib/url'

function useTilt(strength = 6) {
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const rotX = useSpring(useTransform(rawY, [-1, 1], [strength, -strength]), { stiffness: 220, damping: 22 })
  const rotY = useSpring(useTransform(rawX, [-1, 1], [-strength, strength]), { stiffness: 220, damping: 22 })
  const scale = useSpring(1, { stiffness: 220, damping: 22 })
  function onMouseMove(e) {
    const r = e.currentTarget.getBoundingClientRect()
    rawX.set(((e.clientX - r.left) / r.width - 0.5) * 2)
    rawY.set(((e.clientY - r.top) / r.height - 0.5) * 2)
    scale.set(1.012)
  }
  function onMouseLeave() { rawX.set(0); rawY.set(0); scale.set(1) }
  return { rotX, rotY, scale, onMouseMove, onMouseLeave }
}

export default function FoundersSection({ founders = [] }) {
  return (
    <section
      id="founders"
      className="relative z-10 py-20 sm:py-32 px-4 sm:px-6 lg:px-12 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, transparent, rgba(0,204,237,0.03), transparent)' }}
    >
      {/* Bg radial illumination */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 w-[900px] h-[900px] rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, rgba(0,204,237,0.06) 0%, transparent 60%)' }}
        />
      </div>

      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="section-number mb-1 block">03 / Leadership</p>
          <div className="section-label inline-flex">The Executive Team</div>
          <h2 className="font-extrabold tracking-tight mt-1 text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
            Meet the <span className="text-gradient">Founders</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 max-w-lg mx-auto leading-relaxed">
            Hands-on technical founders engineering next-generation web platforms, mobile apps, and autonomous AI systems.
          </p>
        </motion.div>

        {/* Editorial Split Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {founders.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <FounderCard founder={f} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FounderCard({ founder }) {
  const tags = founder.tags ? (typeof founder.tags === 'string' ? JSON.parse(founder.tags) : founder.tags) : []
  const { rotX, rotY, scale, onMouseMove, onMouseLeave } = useTilt(5)

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX: rotX, rotateY: rotY, scale, transformStyle: 'preserve-3d', perspective: 1000 }}
      className="group relative rounded-2xl p-5 sm:p-6 lg:p-7 bg-[#091527]/95 border border-[#00cced]/25 hover:border-[#00cced]/55 shadow-xl shadow-black/50 transition-all duration-300 h-full flex flex-col justify-between overflow-hidden"
    >
      {/* Top Animated Accent Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
        style={{ background: 'linear-gradient(90deg, #00f0ff, #1cb1f3, #00cced)' }}
      />

      {/* Ambient hover glow */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,204,237,0.14) 0%, transparent 65%)' }}
      />

      {/* Main Split Layout: Left Portrait + Right Details */}
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-stretch flex-1">
        
        {/* Left Column: Prominent Vertical Portrait */}
        <div className="w-full sm:w-[190px] md:w-[210px] h-72 sm:h-auto rounded-2xl overflow-hidden relative flex-shrink-0 border border-[#00cced]/30 shadow-lg shadow-black/50 bg-[#060b14] group/pic">
          {founder.photo_url ? (
            <img
              src={resolveApiUrl(founder.photo_url)}
              alt={founder.name}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/pic:scale-105"
            />
          ) : (
            <div
              className="w-full h-full min-h-[240px] flex flex-col items-center justify-center p-4 relative"
              style={{ background: founder.avatar_bg || 'linear-gradient(135deg, #091527, #0e2744)' }}
            >
              <div className="w-20 h-20 rounded-2xl border-2 border-[#00cced]/40 flex items-center justify-center font-extrabold text-2xl text-[#00f0ff] shadow-lg shadow-cyan-950/50 mb-2">
                {founder.initials || founder.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="text-[11px] font-mono tracking-wider text-cyan-300/80">CodeLifeAI</span>
            </div>
          )}

          {/* Active Status Badge on Portrait */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[0.68rem] font-semibold text-emerald-400 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Lead</span>
          </div>

          {/* Bottom portrait subtle tag */}
          <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md border border-white/10 text-center sm:block hidden pointer-events-none">
            <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-300">
              {founder.name.split(' ')[0]} · Leadership
            </span>
          </div>
        </div>

        {/* Right Column: Bio & Info */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            {/* Header: Name, Role & Social Actions */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <h3 className="text-xl sm:text-[1.35rem] font-extrabold tracking-tight text-white">
                  {founder.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold tracking-wider uppercase bg-[#00cced]/15 border border-[#00cced]/30 text-[#00f0ff]">
                    {founder.role}
                  </span>
                  {founder.location && (
                    <span className="inline-flex items-center gap-1 text-[0.7rem] text-slate-400">
                      <MapPin size={10} className="text-cyan-400" /> {founder.location}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons: LinkedIn & GitHub */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {founder.linkedin_url && (
                  <a
                    href={formatExternalUrl(founder.linkedin_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0077b5]/20 hover:bg-[#0077b5] border border-[#0077b5]/40 hover:border-[#0077b5] text-cyan-300 hover:text-white text-xs font-semibold transition-all group/btn shadow-sm"
                    title="Connect on LinkedIn"
                  >
                    <Linkedin size={13} className="fill-current" />
                    <span>Connect</span>
                    <ArrowUpRight size={12} className="opacity-70 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </a>
                )}
                {founder.github_url && (
                  <a
                    href={formatExternalUrl(founder.github_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all flex-shrink-0"
                    title="GitHub Profile"
                  >
                    <Github size={13} />
                  </a>
                )}
              </div>
            </div>

            {/* Founder Bio */}
            <p className="text-[0.84rem] text-slate-300 leading-[1.75] mt-3">
              {founder.bio}
            </p>
          </div>

          {/* Core Expertise Tags */}
          <div className="mt-4 pt-3.5 border-t border-slate-800/80">
            <p className="text-[0.68rem] uppercase font-bold tracking-wider text-slate-400 mb-2">
              Core Expertise
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[0.69rem] font-semibold text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:border-[#00cced]/40 hover:text-[#00f0ff] px-2.5 py-1 rounded-full transition-colors cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  )
}
