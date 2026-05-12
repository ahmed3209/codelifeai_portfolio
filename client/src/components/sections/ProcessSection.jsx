import { motion } from 'framer-motion'

const DEFAULT_STEPS = [
  { number: '01', title: 'Discovery',  icon: '🔍', desc: 'Deep dive into your goals, users, and constraints. We ask hard questions to define the right problem before writing a single line of code.' },
  { number: '02', title: 'Design',     icon: '✏️', desc: 'Wireframes, prototypes, and a full design system. We validate ideas visually before committing to production.' },
  { number: '03', title: 'Build',      icon: '⚙️', desc: 'Agile sprints with real deliverables every week. You see live progress — not just status updates and promises.' },
  { number: '04', title: 'Launch',     icon: '🚀', desc: 'CI/CD deployment, performance monitoring, and dedicated post-launch support. We stay involved until you\'re fully in flight.' },
]

export default function ProcessSection({ content = {} }) {
  const steps = content.process_steps ? JSON.parse(content.process_steps) : DEFAULT_STEPS

  return (
    <section id="process" className="relative z-10 py-32 px-6 lg:px-14 border-y border-white/[0.05]"
      style={{ background: 'rgba(255,255,255,0.006)' }}>
      <div className="max-w-[1100px] mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <p className="section-number mb-1 block">05 / Process</p>
          <div className="section-label inline-flex">How We Work</div>
          <h2 className="font-extrabold tracking-tight mt-1" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
            Our <em className="font-fraunces font-light not-italic text-white/35">Process</em>
          </h2>
          <p className="text-bb-muted text-sm mt-3 max-w-[300px] mx-auto leading-relaxed">
            A transparent workflow from first call to final launch.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Desktop connector */}
          <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-px"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              className="absolute inset-0 h-full rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.5, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: 'linear-gradient(90deg, #00d4f5, #7c3aed)', transformOrigin: 'left', opacity: 0.42 }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ delay: 0.2 + i * 0.14, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col items-center text-center relative z-10"
              >
                {/* Step circle */}
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  transition={{ type: 'spring', damping: 14, stiffness: 280 }}
                  className="relative w-14 h-14 rounded-full bg-bb-card border border-white/[0.07] flex items-center justify-center mx-auto mb-5 cursor-default"
                >
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{ boxShadow: '0 0 0 1px rgba(0,212,245,0.38), 0 0 26px rgba(0,212,245,0.22)' }} />
                  <span className="text-[0.74rem] font-extrabold tracking-wider text-bb-accent relative z-10">
                    {step.number || String(i + 1).padStart(2, '0')}
                  </span>
                </motion.div>

                {step.icon && (
                  <div className="text-xl mb-2.5 transition-transform duration-300 group-hover:-translate-y-1">
                    {step.icon}
                  </div>
                )}
                <h3 className="text-[0.95rem] font-bold text-bb-white mb-2.5">{step.title}</h3>
                <p className="text-[0.8rem] text-bb-muted leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
