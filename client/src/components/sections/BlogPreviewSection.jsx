import { Link } from 'react-router-dom'
import { BookOpen, Clock, ArrowRight, Sparkles } from 'lucide-react'

export default function BlogPreviewSection({ blogs = [] }) {
  if (!blogs || blogs.length === 0) return null

  const displayBlogs = blogs.slice(0, 3)

  return (
    <section className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00d4f5]/10 border border-[#00d4f5]/25 text-[0.68rem] font-bold uppercase tracking-widest text-[#00d4f5] mb-4">
            <BookOpen size={12} /> Tech Radar &amp; Insights
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-bb-white tracking-tight leading-tight">
            Latest From Our <br />
            <span className="bg-gradient-to-r from-[#00d4f5] via-[#38bdf8] to-[#a855f7] bg-clip-text text-transparent">
              Engineering Team
            </span>
          </h2>
        </div>

        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-[#00d4f5] px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#00d4f5]/30 transition-all self-start md:self-auto group"
        >
          <span>Explore All Articles</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 3-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayBlogs.map(b => (
          <Link
            key={b.id}
            to={`/blog/${b.slug}`}
            className="group flex flex-col justify-between bg-[#090918]/80 border border-white/[0.06] hover:border-white/[0.18] rounded-3xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#00d4f5] bg-[#00d4f5]/10 border border-[#00d4f5]/20 px-2.5 py-0.5 rounded-full">
                  {b.category || 'Engineering'}
                </span>
                <span className="text-[0.68rem] text-bb-muted flex items-center gap-1 font-mono">
                  <Clock size={11} /> {b.read_time || '5 min read'}
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
              <span className="text-xs font-semibold text-bb-muted group-hover:text-white transition-colors">
                By {b.author_name || 'CodeLifeAI'}
              </span>
              <div className="w-7 h-7 rounded-full bg-white/[0.04] group-hover:bg-[#00d4f5] text-bb-muted group-hover:text-black flex items-center justify-center transition-colors">
                <ArrowRight size={13} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
