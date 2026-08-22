import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../lib/api'
import PageMeta from '../components/PageMeta'
import {
  ArrowLeft, Clock, Calendar, Share2, Linkedin, Twitter,
  Check, ArrowRight, BookOpen, Sparkles, User
} from 'lucide-react'
import toast from 'react-hot-toast'
import CTABanner from '../components/sections/CTABanner'

/**
 * Clean markdown-like formatter for code blocks, headers, bold, and lists
 */
function FormattedContent({ content }) {
  if (!content) return null

  // Split into lines/paragraphs
  const sections = content.split('\n\n')

  return (
    <div className="space-y-6 text-slate-200 text-sm sm:text-base leading-relaxed">
      {sections.map((sec, idx) => {
        const trimmed = sec.trim()

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-xl sm:text-2xl font-bold text-bb-white pt-4 pb-1 border-b border-white/[0.06]">
              {trimmed.replace('### ', '')}
            </h3>
          )
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-2xl sm:text-3xl font-extrabold text-bb-white pt-6 pb-2">
              {trimmed.replace('## ', '')}
            </h2>
          )
        }

        // Code block
        if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
          const lines = trimmed.split('\n')
          const lang = lines[0].replace('```', '').trim()
          const code = lines.slice(1, -1).join('\n')
          return (
            <div key={idx} className="my-6 rounded-2xl bg-[#060614] border border-white/[0.1] overflow-hidden">
              {lang && (
                <div className="px-4 py-2 bg-white/[0.03] border-b border-white/[0.06] text-[0.68rem] font-mono text-[#00d4f5] uppercase tracking-wider">
                  {lang}
                </div>
              )}
              <pre className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono text-[#38bdf8] leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          )
        }

        // Unordered lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split('\n').filter(l => l.startsWith('- ') || l.startsWith('* '))
          return (
            <ul key={idx} className="space-y-2.5 my-4 pl-2">
              {items.map((it, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00d4f5] mt-2 flex-shrink-0" />
                  <span>{it.replace(/^[-*]\s+/, '')}</span>
                </li>
              ))}
            </ul>
          )
        }

        // Standard Paragraph with inline bold parsing
        return (
          <p key={idx} className="text-slate-300">
            {trimmed}
          </p>
        )
      })}
    </div>
  )
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [copied, setCopied] = useState(false)

  const { data: blog, isLoading, isError } = useQuery({
    queryKey: ['public-blog', slug],
    queryFn: () => publicApi.getBlogBySlug(slug).then(r => r.data),
  })

  // Scroll progress listener
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      if (total > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / total) * 100)))
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('Article link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  function shareTwitter() {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`Read "${blog?.title}" on CodeLifeAI:`)
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank')
  }

  function shareLinkedIn() {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="pt-36 pb-20 text-center text-bb-muted text-sm min-h-screen">
        Loading article…
      </div>
    )
  }

  if (isError || !blog) {
    return (
      <div className="pt-36 pb-20 max-w-xl mx-auto px-4 text-center min-h-screen">
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08]">
          <h1 className="text-2xl font-bold text-bb-white">Article Not Found</h1>
          <p className="text-sm text-bb-muted mt-2">
            The article you are looking for might have been moved or deleted.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-[#00d4f5] text-black font-bold text-xs"
          >
            <ArrowLeft size={14} /> Back to All Articles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageMeta
        path={`/blog/${blog.slug}`}
        title={`${blog.title} — CodeLifeAI Blog`}
        description={blog.excerpt}
        keywords={`${blog.category}, codelifeai blog, engineering, ${blog.title}`}
      />

      {/* Sticky Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/[0.05] z-50">
        <div
          className="h-full bg-gradient-to-r from-[#00d4f5] to-[#a855f7] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <article className="pt-28 sm:pt-36 pb-20 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-semibold text-bb-muted hover:text-[#00d4f5] transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to Tech Blog
        </Link>

        {/* Article Meta Header */}
        <div className="space-y-4 border-b border-white/[0.08] pb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#00d4f5] bg-[#00d4f5]/10 border border-[#00d4f5]/20 px-3 py-1 rounded-full">
              {blog.category}
            </span>
            <span className="text-xs text-bb-muted flex items-center gap-1 font-mono">
              <Clock size={13} /> {blog.read_time}
            </span>
            {blog.published_at && (
              <span className="text-xs text-bb-muted flex items-center gap-1 font-mono">
                <Calendar size={13} /> {new Date(blog.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-bb-white tracking-tight leading-tight">
            {blog.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-medium">
            {blog.excerpt}
          </p>

          {/* Author & Share Bar */}
          <div className="flex items-center justify-between gap-4 pt-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00d4f5]/20 to-[#a855f7]/20 border border-white/10 text-white flex items-center justify-center font-bold text-xs font-mono">
                CL
              </div>
              <div>
                <p className="text-xs font-bold text-bb-white">{blog.author_name}</p>
                <p className="text-[0.68rem] text-bb-muted">{blog.author_role}</p>
              </div>
            </div>

            {/* Social Share */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={shareTwitter}
                title="Share on X / Twitter"
                className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-bb-muted hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <Twitter size={14} />
              </button>
              <button
                type="button"
                onClick={shareLinkedIn}
                title="Share on LinkedIn"
                className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-bb-muted hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <Linkedin size={14} />
              </button>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy Link"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-bb-muted hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Formatted Content Body */}
        <div className="pt-10">
          <FormattedContent content={blog.content} />
        </div>

        {/* Related Articles */}
        {blog.related && blog.related.length > 0 && (
          <div className="mt-20 pt-12 border-t border-white/[0.08]">
            <h3 className="text-xl font-bold text-bb-white mb-6 flex items-center gap-2">
              <Sparkles size={18} className="text-[#00d4f5]" /> Related Engineering Insights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {blog.related.map(rel => (
                <Link
                  key={rel.id}
                  to={`/blog/${rel.slug}`}
                  className="group bg-[#090918]/70 border border-white/[0.06] hover:border-white/[0.18] rounded-2xl p-5 transition-all hover:-translate-y-1"
                >
                  <span className="text-[0.62rem] font-bold uppercase text-[#00d4f5]">
                    {rel.category}
                  </span>
                  <h4 className="text-sm font-bold text-bb-white mt-1.5 group-hover:text-[#00d4f5] transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-bb-muted mt-1.5 line-clamp-2">
                    {rel.excerpt}
                  </p>
                  <div className="flex items-center gap-1 text-[0.7rem] text-bb-muted group-hover:text-white mt-3 font-semibold">
                    <span>Read post</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <CTABanner />
    </>
  )
}
