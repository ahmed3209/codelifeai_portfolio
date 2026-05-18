import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function ZyraTeaser({ content = {} }) {
  if (content.zyra_enabled !== 'true') return null

  const name = content.zyra_name || 'ZYRA AI'

  return (
    <section className="relative z-10 px-6 lg:px-14 py-12">
      <div className="max-w-[1180px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl border border-white/[0.09] overflow-hidden px-8 py-10 sm:px-12 sm:py-12"
          style={{ background: 'linear-gradient(135deg, rgba(0,212,245,0.09) 0%, rgba(6,6,15,0.6) 45%, rgba(124,58,237,0.1) 100%)' }}
        >
          {/* glow accents */}
          <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(0,212,245,0.16) 0%, transparent 65%)' }} />
          <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.16) 0%, transparent 65%)' }} />
          <div className="absolute top-0 left-1/4 right-1/4 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,245,0.6), rgba(124,58,237,0.6), transparent)' }} />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-7">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-bb-accent/25 text-[0.66rem] font-bold tracking-[0.2em] uppercase text-bb-accent mb-4"
                style={{ background: 'rgba(0,212,245,0.06)' }}>
                <Sparkles size={12} /> New Product · Coming Soon
              </div>
              <h2 className="font-extrabold tracking-tight leading-[1.05] text-bb-white"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                {name} <em className="font-fraunces font-light not-italic text-gradient">is almost here.</em>
              </h2>
              <p className="text-bb-muted text-sm sm:text-[0.95rem] leading-relaxed max-w-[520px] mt-3">
                An all-in-one AI assistant — chat, create, analyze, and automate in one place.
                Everything ChatGPT and Claude do, unified into a single tool.
              </p>
            </div>

            <Link to="/launch"
              className="btn-primary text-sm sm:text-base px-7 py-3.5 flex-shrink-0 self-start lg:self-center no-underline group">
              See the countdown
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
