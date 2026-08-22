import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown, Search, Sparkles, MessageCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const DEFAULT_FAQS = [
  { id: 1, question: 'What is the typical timeline to build and launch an MVP with CodeLifeAI?', answer: 'Most MVP projects take 4 to 8 weeks from kickoff to production launch. We operate on high-velocity 1-week sprints with working software delivered at every milestone so you can test progress in real time.', category: 'Process & Timeline' },
  { id: 2, question: 'Do I retain 100% full intellectual property (IP) and code ownership?', answer: 'Yes, absolutely. You retain 100% ownership of all source code, architecture, designs, databases, and intellectual property from day one upon milestone completion.', category: 'Legal & Ownership' },
  { id: 3, question: 'How do you handle project confidentiality and NDAs?', answer: 'We execute mutual Non-Disclosure Agreements (NDAs) before reviewing any proprietary assets or starting architecture planning. Your business concepts and technical data remain strictly confidential.', category: 'Security & NDA' },
  { id: 4, question: 'What technologies and frameworks does CodeLifeAI specialize in?', answer: 'Our core stack includes React, Next.js, TypeScript on frontend; Node.js, Express, Python, Go on backend; Flutter and React Native for mobile; PostgreSQL, MongoDB, Redis, LibSQL for databases; and AWS, GCP, Cloudflare, Docker for cloud infrastructure.', category: 'Technology' },
  { id: 5, question: 'Do you offer post-launch maintenance, bug warranty, and scale support?', answer: 'Yes. Every project includes a 30-day post-launch warranty with dedicated monitoring. We also provide ongoing sprint retainers and SLA maintenance packages for continuous scaling.', category: 'Support & Warranty' },
  { id: 6, question: 'How do we communicate and track sprint progress during development?', answer: 'We provide a dedicated communication channel (Slack / WhatsApp / Discord), weekly live video demos, and private staging links where you test working builds in real time.', category: 'Communication' },
]

export default function FAQSection({ faqs = [] }) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [openId, setOpenId] = useState(null)

  const items = (faqs && faqs.length > 0) ? faqs : DEFAULT_FAQS

  const categories = useMemo(() => {
    const set = new Set(items.map(f => f.category || 'General'))
    return ['All', ...Array.from(set)]
  }, [items])

  const filtered = useMemo(() => {
    return items.filter(f => {
      const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory
      const q = search.toLowerCase().trim()
      const matchesSearch = !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [items, selectedCategory, search])

  const toggle = (id) => {
    setOpenId(prev => prev === id ? null : id)
  }

  return (
    <section id="faq" className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00d4f5]/10 border border-[#00d4f5]/25 text-[0.68rem] font-bold uppercase tracking-widest text-[#00d4f5] mb-4">
          <HelpCircle size={12} /> Clear Answers
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-bb-white tracking-tight leading-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-bb-muted text-sm sm:text-base mt-4 leading-relaxed">
          Everything you need to know about our engineering process, IP transfer, security protocols, and timelines.
        </p>

        {/* Live Search Bar */}
        <div className="mt-8 relative max-w-xl mx-auto">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-bb-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions (e.g. IP ownership, timeline, NDA, tech stack)…"
            className="w-full bg-[#0d0d1e]/90 border border-white/[0.1] rounded-2xl pl-11 pr-4 py-3.5 text-sm text-bb-white placeholder:text-bb-muted outline-none focus:border-[#00d4f5]/50 transition-all shadow-xl shadow-black/40"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-bb-muted hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 2 && (
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#00d4f5] text-black font-bold shadow-md shadow-[#00d4f5]/20'
                    : 'bg-white/[0.03] border border-white/[0.06] text-bb-muted hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      )}

      {/* Accordion List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8">
            <p className="text-sm font-semibold text-bb-white">No matching questions found</p>
            <p className="text-xs text-bb-muted mt-1">Try searching with different keywords or ask our AI chatbot below.</p>
          </div>
        ) : (
          filtered.map(f => {
            const isOpen = openId === f.id
            return (
              <div
                key={f.id}
                className="bg-[#090918]/80 border border-white/[0.07] hover:border-white/[0.16] rounded-2xl transition-all duration-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(f.id)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 select-none group"
                >
                  <div className="flex items-center gap-3">
                    {f.category && (
                      <span className="hidden sm:inline-block text-[0.62rem] font-bold uppercase tracking-wider text-[#00d4f5] bg-[#00d4f5]/10 border border-[#00d4f5]/20 px-2 py-0.5 rounded-full flex-shrink-0">
                        {f.category}
                      </span>
                    )}
                    <span className="text-sm sm:text-base font-bold text-bb-white group-hover:text-[#00d4f5] transition-colors leading-snug">
                      {f.question}
                    </span>
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0 text-bb-muted group-hover:text-white transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[#00d4f5]/15 text-[#00d4f5] border-[#00d4f5]/30' : ''}`}>
                    <ChevronDown size={15} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.04]">
                        {f.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })
        )}
      </div>

      {/* Bottom Help Box */}
      <div className="mt-12 bg-gradient-to-r from-[#0d0d24] via-[#090918] to-[#0d0d24] border border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00d4f5]/10 border border-[#00d4f5]/25 flex items-center justify-center text-[#00d4f5] flex-shrink-0">
            <MessageCircle size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-bb-white">Have a specific question not listed here?</h4>
            <p className="text-xs text-bb-muted mt-0.5">Our senior engineers are ready to discuss your architecture needs.</p>
          </div>
        </div>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white text-xs font-bold transition-all whitespace-nowrap"
        >
          <span>Ask Us Directly</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  )
}
