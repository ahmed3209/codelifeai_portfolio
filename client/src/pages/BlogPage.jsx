import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { publicApi } from '../lib/api'
import PageMeta from '../components/PageMeta'
import { Search, BookOpen, Clock, ArrowRight, Sparkles, User, Tag } from 'lucide-react'
import CTABanner from '../components/sections/CTABanner'

const CATEGORIES = [
  'All',
  'AI & Machine Learning',
  'Architecture',
  'Mobile Engineering',
  'Cloud & DevOps',
]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['public-blogs', selectedCategory],
    queryFn: () => publicApi.getBlogs({ category: selectedCategory }).then(r => r.data),
  })

  const filteredBlogs = useMemo(() => {
    if (!search.trim()) return blogs
    const q = search.toLowerCase()
    return blogs.filter(b =>
      b.title?.toLowerCase().includes(q) ||
      b.excerpt?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q)
    )
  }, [blogs, search])

  const featured = filteredBlogs[0]
  const restBlogs = filteredBlogs.slice(1)

  return (
    <div className="pt-24 sm:pt-32 pb-16">
      <PageMeta
        path="/blog"
        title="Engineering Insights &amp; Tech Blog"
        description="Deep dives into AI agents, cloud architecture, high-concurrency microservices, mobile engineering, and product scalability by CodeLifeAI."
        keywords="codelifeai blog, engineering blog, tech articles, ai agents tutorial, system design, scalable software architecture, nextjs 15, flutter 3 performance"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-14">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00d4f5]/10 border border-[#00d4f5]/25 text-[0.68rem] font-bold uppercase tracking-widest text-[#00d4f5] mb-4">
            <BookOpen size={12} /> Insights &amp; Engineering
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-bb-white tracking-tight leading-tight">
            CodeLifeAI <span className="bg-gradient-to-r from-[#00d4f5] via-[#38bdf8] to-[#a855f7] bg-clip-text text-transparent">Tech Radar &amp; Blog</span>
          </h1>
          <p className="text-bb-muted text-sm sm:text-base mt-4 leading-relaxed">
            Practical architectural blueprints, performance breakdowns, and hard-earned engineering lessons from our core team.
          </p>

          {/* Search bar */}
          <div className="mt-8 relative max-w-xl mx-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-bb-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search topics (e.g. AI Agents, Flutter, Architecture, CI/CD)…"
              className="w-full bg-[#0d0d1e]/90 border border-white/[0.1] rounded-2xl pl-11 pr-4 py-3.5 text-sm text-bb-white placeholder:text-bb-muted outline-none focus:border-[#00d4f5]/50 transition-all shadow-xl shadow-black/40"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-12 scrollbar-none">
          {CATEGORIES.map(cat => {
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
                {cat}
              </button>
            )
          })}
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="text-center py-20 text-bb-muted text-sm">
            Loading articles…
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 max-w-xl mx-auto">
            <p className="text-base font-bold text-bb-white">No articles found</p>
            <p className="text-xs text-bb-muted mt-1">Try another search query or category.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Post (Hero card) */}
            {featured && (
              <Link
                to={`/blog/${featured.slug}`}
                className="group block relative bg-gradient-to-b from-[#0e0e24] to-[#080816] border border-white/[0.1] hover:border-[#00d4f5]/40 rounded-3xl p-6 sm:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00d4f5]/10 overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="space-y-4 max-w-3xl">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#00d4f5] bg-[#00d4f5]/10 border border-[#00d4f5]/20 px-3 py-1 rounded-full">
                        Featured · {featured.category}
                      </span>
                      <span className="text-xs text-bb-muted flex items-center gap-1 font-mono">
                        <Clock size={12} /> {featured.read_time}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-extrabold text-bb-white group-hover:text-[#00d4f5] transition-colors leading-tight">
                      {featured.title}
                    </h2>

                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                      {featured.excerpt}
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-8 h-8 rounded-full bg-[#00d4f5]/20 border border-[#00d4f5]/40 text-[#00d4f5] flex items-center justify-center text-xs font-bold font-mono">
                        CL
                      </div>
                      <div>
                        <p className="text-xs font-bold text-bb-white">{featured.author_name}</p>
                        <p className="text-[0.68rem] text-bb-muted">{featured.author_role}</p>
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.06] group-hover:bg-[#00d4f5] text-white group-hover:text-black text-xs font-bold transition-all flex-shrink-0">
                    <span>Read Article</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            )}

            {/* Grid of Other Articles */}
            {restBlogs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restBlogs.map(b => (
                  <Link
                    key={b.id}
                    to={`/blog/${b.slug}`}
                    className="group flex flex-col justify-between bg-[#090918]/80 border border-white/[0.06] hover:border-white/[0.18] rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#00d4f5] bg-[#00d4f5]/10 border border-[#00d4f5]/20 px-2.5 py-0.5 rounded-full">
                          {b.category}
                        </span>
                        <span className="text-[0.68rem] text-bb-muted flex items-center gap-1 font-mono">
                          <Clock size={11} /> {b.read_time}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-bb-white group-hover:text-[#00d4f5] transition-colors leading-snug">
                        {b.title}
                      </h3>

                      <p className="text-xs text-slate-300 mt-2.5 leading-relaxed line-clamp-3">
                        {b.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-5 mt-5 border-t border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/[0.08] text-white flex items-center justify-center text-[0.62rem] font-bold">
                          CL
                        </div>
                        <span className="text-xs font-semibold text-bb-muted group-hover:text-white transition-colors">
                          {b.author_name}
                        </span>
                      </div>
                      <ArrowRight size={14} className="text-bb-muted group-hover:text-[#00d4f5] group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <CTABanner />
    </div>
  )
}
