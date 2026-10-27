import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../lib/api'
import PageMeta from '../components/PageMeta'
import CTABanner from '../components/sections/CTABanner'
import { INDUSTRY_ICON_MAP } from '../lib/industryIcons'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  ShieldCheck,
  AlertCircle,
  Building2,
} from 'lucide-react'

function parseJsonArray(val) {
  if (Array.isArray(val)) return val
  try {
    const parsed = JSON.parse(val)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return typeof val === 'string' ? val.split('\n').map(s => s.trim()).filter(Boolean) : []
  }
}

export default function IndustryDetailPage() {
  const { id } = useParams()

  // Fetch site data for all industries
  const { data: siteData, isLoading: siteLoading } = useQuery({
    queryKey: ['site-data'],
    queryFn: () => publicApi.getSiteData().then(r => r.data),
  })

  const allIndustries = siteData?.industries || []

  // Direct fetch fallback by slug or id
  const { data: directIndustry, isLoading: directLoading } = useQuery({
    queryKey: ['industry-detail', id],
    queryFn: () => publicApi.getIndustryById(id).then(r => r.data).catch(() => null),
    enabled: !!id,
  })

  // Match from siteData or from direct fetch
  const industry = allIndustries.find(ind => {
    if (String(ind.id) === String(id)) return true
    if (ind.slug && ind.slug.toLowerCase() === String(id).toLowerCase()) return true
    const slugFromTitle = (ind.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    return slugFromTitle === String(id).toLowerCase()
  }) || directIndustry || null

  const isLoading = (siteLoading || directLoading) && !industry

  if (isLoading) {
    return (
      <div className="min-h-screen pt-36 pb-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#00cced]/10 border border-[#00cced]/40 flex items-center justify-center text-[#00f0ff] animate-pulse">
          <Building2 size={24} className="animate-spin" />
        </div>
        <p className="text-slate-400 font-mono text-xs tracking-wider uppercase">Loading Industry Architecture...</p>
      </div>
    )
  }

  if (!industry) {
    return (
      <div className="min-h-screen pt-36 pb-20 max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#00cced]/10 border border-[#00cced]/30 flex items-center justify-center text-[#00f0ff] mx-auto">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">Industry Vertical Not Found</h1>
          <p className="text-slate-400 text-sm">
            We couldn't locate this specific vertical. Explore our complete directory of high-compliance industry solutions.
          </p>
        </div>
        <div>
          <Link to="/industries" className="btn-primary py-3 px-6 text-sm inline-flex items-center gap-2 no-underline">
            <ArrowLeft size={16} />
            <span>Browse All Industry Verticals</span>
          </Link>
        </div>
      </div>
    )
  }

  const IconComp = INDUSTRY_ICON_MAP[industry.icon] || Building2
  const challenges = parseJsonArray(industry.challenges)
  const solutions = parseJsonArray(industry.solutions)
  const features = parseJsonArray(industry.features)
  const stack = parseJsonArray(industry.stack)
  const metrics = parseJsonArray(industry.metrics)

  // Other industries for recommendations
  const otherIndustries = allIndustries.filter(ind => ind.id !== industry.id).slice(0, 4)

  return (
    <div className="relative min-h-screen pt-28 sm:pt-36 pb-20">
      <PageMeta
        path={`/industries/${id}`}
        title={`${industry.title || 'Industry Vertical'} — CodeLifeAI`}
        description={industry.short_desc || 'Production software engineering, architecture, and compliant digital infrastructure for enterprise verticals.'}
        keywords={`${industry.title}, enterprise software, industry digital transformation, compliance, cloud architecture`}
      />

      {/* Top Ambient Glow Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden contain-paint z-0">
        <div
          className="w-[600px] h-[600px] rounded-full mx-auto"
          style={{
            background: 'radial-gradient(circle, rgba(0,204,237,0.14) 0%, rgba(0,240,255,0.03) 50%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-14 space-y-12 sm:space-y-16">

        {/* ── Breadcrumb & Navigation ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-white/[0.08] pb-6">
          <Link
            to="/industries"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-[#00f0ff] transition-colors group no-underline"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-[#00cced]" />
            <span>Back to All Industry Verticals</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 flex-wrap">
            <Link to="/" className="hover:text-white transition-colors no-underline">Home</Link>
            <span>/</span>
            <Link to="/industries" className="hover:text-white transition-colors no-underline">Industries</Link>
            <span>/</span>
            <span className="text-[#00f0ff] font-semibold">{industry.title}</span>
          </div>
        </div>

        {/* ── Hero Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00cced]/10 border border-[#00cced]/30 text-xs font-mono font-bold uppercase tracking-widest text-[#00f0ff] shadow-[0_0_15px_rgba(0,204,237,0.2)]">
              <IconComp size={14} className="text-[#00f0ff]" />
              <span>{industry.badge || 'ENTERPRISE DOMAIN VERTICAL'}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.2rem] font-black text-white tracking-tight leading-[1.08]">
              {industry.title}
            </h1>

            {/* Short Subtitle */}
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
              {industry.short_desc}
            </p>

            {/* Prominent CTAs */}
            <div className="flex items-center gap-4 flex-wrap pt-2">
              <Link
                to={`/contact?industry=${encodeURIComponent(industry.title)}&type=architecture`}
                className="btn-primary py-3.5 px-7 text-sm shadow-[0_8px_30px_rgba(0,204,237,0.45)] no-underline flex items-center gap-2"
              >
                <span>Schedule {industry.title} Architecture Call</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                to={`/contact?industry=${encodeURIComponent(industry.title)}`}
                className="btn-ghost py-3.5 px-6 text-sm no-underline flex items-center gap-2"
              >
                <span>Request Project Proposal</span>
              </Link>
            </div>

            {/* Key Metrics / Benchmarks */}
            {metrics.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/[0.08]">
                {metrics.map((m, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                    <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#1cb1f3] font-mono">
                      {m.value}
                    </div>
                    <div className="text-[0.72rem] text-slate-300 font-medium uppercase tracking-wider mt-0.5">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Visual Cover Showcase */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-[#00cced]/35 bg-gradient-to-b from-[#0a182d] to-[#050c18] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.6)] group overflow-hidden">
              <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-black">
                <img
                  src={industry.image_url || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1200&auto=format&fit=crop'}
                  alt={industry.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060c18] via-transparent to-black/30 pointer-events-none" />

                {/* Cyber Watermark */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#060c18]/85 backdrop-blur-md border border-white/10 text-[0.68rem] text-slate-300 font-mono">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    SOC2 &amp; COMPLIANCE READY
                  </span>
                  <span className="text-[#00f0ff]">PRINCIPAL ARCHITECTS</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Detailed Engineering Overview (long_desc) ── */}
        <div className="rounded-3xl border border-[#00cced]/25 bg-gradient-to-b from-[#091527]/90 to-[#060b14]/95 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} className="text-[#00f0ff]" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Domain Engineering &amp; Architecture Standards
            </h2>
          </div>

          <div className="text-slate-200 text-sm sm:text-base leading-relaxed space-y-4">
            {(industry.long_desc || industry.short_desc || 'We engineer high-availability digital solutions tailored to high-compliance industry verticals.')
              .split('\n\n')
              .map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
          </div>
        </div>

        {/* ── Industry Challenges vs Our Engineering Solutions ── */}
        {challenges.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#00f0ff] mb-1.5">
                  <Sparkles size={14} className="text-[#00f0ff]" />
                  <span>Problem &amp; Solution Blueprint</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Addressing {industry.title} Bottlenecks
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
                Proven Engineering Frameworks
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {challenges.map((chal, idx) => {
                const sol = solutions[idx] || 'Custom engineered high-concurrency microservices with automated failover and 99.99% uptime.'
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-gradient-to-b from-[#0a182d] to-[#060c18] border border-white/[0.09] hover:border-[#00cced]/60 transition-all p-6 shadow-xl flex flex-col justify-between space-y-5 group"
                  >
                    {/* Challenge Block */}
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 text-[0.72rem] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-md">
                        <AlertCircle size={12} />
                        <span>INDUSTRY BOTTLENECK</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                        {chal}
                      </p>
                    </div>

                    {/* Arrow Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[#00cced]/40 to-transparent" />

                    {/* Solution Block */}
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 text-[0.72rem] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-md">
                        <CheckCircle2 size={12} />
                        <span>OUR ENGINEERING SOLUTION</span>
                      </div>
                      <p className="text-xs sm:text-sm text-white leading-relaxed font-medium">
                        {sol}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Specialized Capabilities & Key Deliverables ── */}
        {features.length > 0 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#00f0ff] mb-2 font-mono">
                <CheckCircle2 size={13} className="text-emerald-400" /> Deliverables &amp; Technical Capabilities
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                What You Receive in {industry.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feat, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-gradient-to-b from-[#091629]/95 to-[#060d19]/95 border border-[#00cced]/25 hover:border-[#00cced]/60 transition-all duration-300 space-y-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#00cced]/10 border border-[#00cced]/30 flex items-center justify-center text-[#00f0ff] group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={18} className="text-[#00f0ff]" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#00f0ff] transition-colors leading-snug">
                    {feat}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    Delivered with source code ownership, CI/CD automated testing, and comprehensive technical documentation.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Production Technology Stack ── */}
        {stack.length > 0 && (
          <div className="rounded-3xl border border-white/[0.08] bg-[#07111f]/80 backdrop-blur-xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Layers size={18} className="text-[#00cced]" />
                  <span>Recommended Enterprise Stack for {industry.title}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Validated production libraries and cloud infrastructure frameworks suited for this domain.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full bg-emerald-500/10">
                AUDITED &amp; SCALABLE
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {stack.map((t, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-[#00cced]/30 text-xs font-mono font-semibold text-slate-100 hover:border-[#00f0ff] hover:bg-[#00cced]/10 transition-all"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Explore Other Industry Verticals ── */}
        {otherIndustries.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-white/[0.08]">
            <div className="flex items-center justify-between">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Explore Other Industry Verticals
              </h3>
              <Link to="/industries" className="text-xs text-[#00f0ff] font-semibold hover:underline">
                View All Verticals →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {otherIndustries.map(other => {
                const OtherIcon = INDUSTRY_ICON_MAP[other.icon] || Building2
                return (
                  <Link
                    key={other.id}
                    to={`/industries/${other.slug || other.id}`}
                    className="p-5 rounded-2xl bg-gradient-to-b from-[#0a182d] to-[#060c18] border border-[#00cced]/25 hover:border-[#00f0ff] transition-all hover:-translate-y-1 block no-underline group shadow-lg"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#00cced]/10 border border-[#00cced]/25 flex items-center justify-center text-[#00f0ff] mb-3 group-hover:bg-[#00cced]/20 transition-colors">
                      <OtherIcon size={18} />
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#00f0ff] transition-colors leading-snug">
                      {other.title}
                    </h4>
                    <p className="text-[0.72rem] text-slate-300 line-clamp-2 leading-relaxed mt-1 font-normal">
                      {other.short_desc}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#00cced] mt-3 group-hover:translate-x-1 transition-transform">
                      Explore Vertical →
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Global Bottom CTABanner ── */}
        <CTABanner />

      </div>
    </div>
  )
}
