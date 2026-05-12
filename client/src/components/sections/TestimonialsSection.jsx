import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const TESTIMONIALS = [
  {
    id: 1,
    name:    'Ahmed Al-Rashid',
    role:    'Founder, FinTrack',
    avatar:  'AR',
    bg:      'linear-gradient(135deg, #00d4f5, #0099bb)',
    rating:  5,
    quote:   "ByteBurst delivered our banking dashboard in record time — clean code, beautiful UI, and zero post-launch issues. They didn't just build what we asked; they made it better than we imagined.",
  },
  {
    id: 2,
    name:    'Sarah Mitchell',
    role:    'CTO, ShopEase Inc.',
    avatar:  'SM',
    bg:      'linear-gradient(135deg, #a855f7, #7c3aed)',
    rating:  5,
    quote:   "Working with ByteBurst felt like having a senior in-house engineering team. Communication was seamless, timelines were respected, and the final product drove a 40% increase in our conversion rate.",
  },
  {
    id: 3,
    name:    'Dr. Iman Yousuf',
    role:    'CEO, MedSync Health',
    avatar:  'IY',
    bg:      'linear-gradient(135deg, #22c55e, #16a34a)',
    rating:  5,
    quote:   "Our medical app needed to be both beautiful and HIPAA-compliant. ByteBurst nailed it. The Flutter development was exceptional — users literally rate us 4.9 stars on the Play Store.",
  },
  {
    id: 4,
    name:    'James Thornton',
    role:    'Head of Product, LogiFlow',
    avatar:  'JT',
    bg:      'linear-gradient(135deg, #f59e0b, #d97706)',
    rating:  5,
    quote:   "We cut operational costs by 35% after ByteBurst rebuilt our supply chain platform. The Python data pipelines they built process 2 million records daily without a single failure. Remarkable work.",
  },
]

function Stars({ count = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function TestimonialsSection() {
  const [active, setActive] = useState(0)
  const [dir,    setDir]    = useState(1)
  const total = TESTIMONIALS.length

  function go(next) {
    setDir(next > active ? 1 : -1)
    setActive(next)
  }
  function prev() { go((active - 1 + total) % total) }
  function next() { go((active + 1) % total) }

  useEffect(() => {
    const t = setInterval(() => { setDir(1); setActive(v => (v + 1) % total) }, 6000)
    return () => clearInterval(t)
  }, [total])

  const variants = {
    enter:  (d) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
    exit:   (d) => ({ opacity: 0, x: d > 0 ? -60 : 60, transition: { duration: 0.3 } }),
  }

  const t = TESTIMONIALS[active]

  return (
    <section className="relative z-10 py-32 px-6 lg:px-14 border-y border-white/[0.05] overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.006)' }}>
      {/* Background radial */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 55%)' }} />
      </div>

      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="section-number mb-1 text-center block">04 / Testimonials</p>
          <div className="section-label inline-flex">Client Stories</div>
          <h2 className="font-extrabold tracking-tight mt-1" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
            What Clients <em className="font-fraunces font-light not-italic text-white/35">Say</em>
          </h2>

          {/* Overall rating */}
          <div className="flex items-center justify-center gap-2.5 mt-4">
            <Stars count={5} />
            <span className="text-[0.85rem] font-bold text-amber-400">4.9</span>
            <span className="text-[0.78rem] text-bb-muted">· {TESTIMONIALS.length} verified reviews</span>
          </div>
        </motion.div>

        {/* Testimonial card */}
        <div className="relative max-w-[780px] mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] min-h-[260px] flex items-center"
            style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)' }}>
            {/* Quote mark */}
            <div className="absolute top-6 left-8 text-[5rem] leading-none font-serif text-white/[0.04] select-none pointer-events-none">
              "
            </div>

            <AnimatePresence custom={dir} mode="wait">
              <motion.div
                key={active}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full px-10 py-10"
              >
                <Stars count={t.rating} />
                <blockquote className="text-[1.02rem] text-white/82 leading-[1.78] my-5 font-light">
                  "{t.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: t.bg }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-[0.9rem] font-bold text-bb-white leading-tight">{t.name}</p>
                    <p className="text-[0.74rem] text-bb-muted">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nav arrows */}
          <div className="flex items-center justify-between mt-6">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => go(i)}
                  className={`transition-all duration-300 rounded-full ${i === active ? 'w-6 h-1.5 bg-bb-accent' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
            {/* Buttons */}
            <div className="flex items-center gap-2">
              <button onClick={prev}
                className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-bb-muted hover:text-bb-white hover:border-white/[0.16] transition-all">
                <ChevronLeft size={16} />
              </button>
              <button onClick={next}
                className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-bb-muted hover:text-bb-white hover:border-white/[0.16] transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Avatars row */}
        <div className="flex items-center justify-center gap-3 mt-10">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.button
              key={i}
              onClick={() => go(i)}
              whileHover={{ scale: 1.12 }}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white transition-all duration-300 border-2
                ${i === active ? 'border-bb-accent scale-110' : 'border-transparent opacity-50 hover:opacity-80'}`}
              style={{ background: testimonial.bg }}
            >
              {testimonial.avatar}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
