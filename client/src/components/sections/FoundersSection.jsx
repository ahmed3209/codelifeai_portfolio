import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { ExternalLink, Github, Linkedin } from 'lucide-react'

function useTilt(strength = 9) {
  const rawX  = useMotionValue(0)
  const rawY  = useMotionValue(0)
  const rotX  = useSpring(useTransform(rawY, [-1, 1], [ strength, -strength]), { stiffness: 220, damping: 22 })
  const rotY  = useSpring(useTransform(rawX, [-1, 1], [-strength,  strength]), { stiffness: 220, damping: 22 })
  const scale = useSpring(1, { stiffness: 220, damping: 22 })
  function onMouseMove(e) {
    const r = e.currentTarget.getBoundingClientRect()
    rawX.set(((e.clientX - r.left) / r.width  - 0.5) * 2)
    rawY.set(((e.clientY - r.top)  / r.height - 0.5) * 2)
    scale.set(1.018)
  }
  function onMouseLeave() { rawX.set(0); rawY.set(0); scale.set(1) }
  return { rotX, rotY, scale, onMouseMove, onMouseLeave }
}

export default function FoundersSection({ founders = [] }) {
  return (
    <section
      id="founders"
      className="relative z-10 py-32 px-6 lg:px-14 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, transparent, rgba(124,58,237,0.03), transparent)' }}
    >
      {/* Bg radial */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-[900px] h-[900px] rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 58%)' }} />
      </div>

      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <p className="section-number mb-1 block">03 / Team</p>
          <div className="section-label inline-flex">The People</div>
          <h2 className="font-extrabold tracking-tight mt-1" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
            Meet the <em className="font-fraunces font-light not-italic text-white/35">Founders</em>
          </h2>
          <p className="text-bb-muted text-sm mt-3 max-w-sm mx-auto leading-relaxed">
            Two builders on a mission to ship software that actually matters.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[900px] mx-auto">
          {founders.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ delay: i * 0.14, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
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
  const tags = founder.tags ? JSON.parse(founder.tags) : []
  const { rotX, rotY, scale, onMouseMove, onMouseLeave } = useTilt(8)

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX: rotX, rotateY: rotY, scale, transformStyle: 'preserve-3d', perspective: 1000 }}
      className="group card-base p-8"
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left"
        style={{ background: 'linear-gradient(90deg, #00d4f5, #7c3aed)' }} />
      {/* Ambient glow */}
      <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,212,245,0.07) 0%, transparent 65%)' }} />

      {/* Avatar + info */}
      <div className="flex items-start gap-4 mb-5">
        <div className="relative flex-shrink-0">
          <div
            className="w-[72px] h-[72px] rounded-2xl overflow-hidden border border-white/[0.1]"
            style={{ background: founder.avatar_bg || 'linear-gradient(135deg, #7c3aed, #00d4f5)' }}
          >
            {founder.photo_url
              ? <img src={founder.photo_url} alt={founder.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center font-extrabold text-xl text-white">
                  {founder.initials || founder.name.split(' ').map(n => n[0]).join('')}
                </div>
            }
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-bb-card" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[1.08rem] font-extrabold tracking-tight text-bb-white">{founder.name}</p>
          <p className="text-[0.71rem] font-bold tracking-[0.09em] uppercase text-bb-accent mt-0.5">{founder.role}</p>
          {founder.location && (
            <p className="text-[0.7rem] text-bb-muted mt-0.5">📍 {founder.location}</p>
          )}
        </div>

        {/* Social icons */}
        <div className="flex gap-1.5 flex-shrink-0">
          {founder.linkedin_url && (
            <a href={founder.linkedin_url} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-bb-muted hover:text-bb-accent hover:border-bb-accent/30 transition-all">
              <Linkedin size={12} />
            </a>
          )}
          {founder.github_url && (
            <a href={founder.github_url} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-bb-muted hover:text-bb-white hover:border-white/[0.2] transition-all">
              <Github size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Bio */}
      <p className="text-[0.84rem] text-bb-muted leading-[1.78] mb-5">{founder.bio}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, i) => (
          <span key={i}
            className="text-[0.69rem] font-semibold text-white/40 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full hover:text-white/65 hover:border-white/[0.11] transition-colors cursor-default">
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
