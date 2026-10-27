import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Zap, Lock, Target, LifeBuoy } from 'lucide-react'

const TRUST_ITEMS = [
  { Icon: Zap,      text: 'Ship in weeks, not months' },
  { Icon: Lock,     text: 'NDA & IP protection'        },
  { Icon: Target,   text: 'Fixed-scope pricing'         },
  { Icon: LifeBuoy, text: 'Post-launch support'         },
]

export default function CTABanner() {
  return (
    <section className="relative z-10 py-16 sm:py-28 px-4 sm:px-6 lg:px-14 overflow-hidden">
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden border border-[#00cced]/25 px-6 py-12 sm:px-10 sm:py-16 text-center shadow-2xl shadow-black/50 backdrop-blur-xl"
          style={{
            background: 'linear-gradient(145deg, rgba(0,204,237,0.1) 0%, rgba(9,21,39,0.95) 45%, rgba(28,177,243,0.1) 100%)',
          }}
        >
          {/* Orb left */}
          <div className="absolute top-1/2 -left-16 w-64 h-64 rounded-full -translate-y-1/2 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(0,204,237,0.18) 0%, transparent 65%)' }} />
          {/* Orb right */}
          <div className="absolute top-1/2 -right-16 w-64 h-64 rounded-full -translate-y-1/2 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(28,177,243,0.16) 0%, transparent 65%)' }} />
          {/* Top border glow */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1.5px]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.8), rgba(0,204,237,0.8), transparent)' }} />

          {/* Content */}
          <div className="relative z-10">
            <div className="section-label inline-flex mb-6">Let's Work Together</div>

            <h2
              className="font-extrabold tracking-tight leading-[1.04] mb-5 text-white"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}
            >
              Ready to build something<br />
              <span className="text-gradient">extraordinary?</span>
            </h2>

            <p className="text-slate-300 text-[1.01rem] leading-relaxed max-w-md mx-auto mb-10">
              Tell us about your project. We'll respond within 24 hours with a free consultation and a tailored proposal.
            </p>

            {/* Trust items */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-10">
              {TRUST_ITEMS.map(({ Icon, text }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="flex items-center gap-2 text-[0.8rem] text-white/55"
                >
                  <Icon size={15} className="text-bb-accent" />
                  {text}
                </motion.div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/contact" className="btn-primary text-sm gap-2">
                <Zap size={14} />
                Start Your Project
              </Link>
              <a href="mailto:hello@codelifeai.com" className="btn-ghost text-sm gap-1.5">
                Email Us Directly
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
