import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { publicApi } from '../lib/api'
import PageMeta from '../components/PageMeta'
import { getServiceImage } from '../components/sections/ServicesSection'
import CTABanner from '../components/sections/CTABanner'
import {
  ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2,
  Sparkles, Layers, Cpu, ShieldCheck, Zap, Code2, Globe, Clock, MessageSquare,
  CornerDownRight, FolderTree
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

export default function ServiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Fetch site data
  const { data: siteData, isLoading } = useQuery({
    queryKey: ['site-data'],
    queryFn: () => publicApi.getSiteData().then(r => r.data),
  })

  const allServices = siteData?.services || []

  // Find matching service by id or slug
  const service = allServices.find(s => {
    if (String(s.id) === String(id)) return true
    if (s.slug && s.slug.toLowerCase() === String(id).toLowerCase()) return true
    const slugFromTitle = (s.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    return slugFromTitle === String(id).toLowerCase()
  }) || allServices[0] || {}

  const isHeadService = !service.parent_id
  const parentService = !isHeadService ? allServices.find(s => s.id === service.parent_id) : null
  const childServices = isHeadService ? allServices.filter(s => s.parent_id === service.id) : []
  const siblingServices = !isHeadService
    ? allServices.filter(s => s.parent_id === service.parent_id && s.id !== service.id)
    : []

  const imageUrl = getServiceImage(service)
  const features = parseJsonArray(service.features)
  const stack = parseJsonArray(service.stack)

  // Other head services for general related recommendations
  const relatedHeads = allServices.filter(s => !s.parent_id && s.id !== service.id && s.id !== service.parent_id).slice(0, 3)

  return (
    <div className="relative min-h-screen pt-28 sm:pt-36 pb-20">
      <PageMeta
        path={`/services/${id}`}
        title={`${service.title || 'Service'} — CodeLifeAI`}
        description={service.short_desc || 'Production-grade software engineering, mobile development, and custom AI agent engineering.'}
        keywords={`${service.title}, software engineering, web development, cloud services, custom AI`}
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

        {/* ── Breadcrumb & Back Navigation ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-white/[0.08] pb-6">
          <Link
            to={parentService ? `/services/${parentService.slug || parentService.id}` : "/services"}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-[#00f0ff] transition-colors group no-underline"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-[#00cced]" />
            <span>{parentService ? `Back to ${parentService.title}` : 'Back to All Services'}</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 flex-wrap">
            <Link to="/" className="hover:text-white transition-colors no-underline">Home</Link>
            <span>/</span>
            <Link to="/services" className="hover:text-white transition-colors no-underline">Services</Link>
            {parentService && (
              <>
                <span>/</span>
                <Link
                  to={`/services/${parentService.slug || parentService.id}`}
                  className="hover:text-[#00f0ff] transition-colors no-underline font-semibold"
                >
                  {parentService.title}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-[#00f0ff] font-semibold truncate max-w-[180px] sm:max-w-none">{service.title}</span>
          </div>
        </div>

        {/* ── Hero Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00cced]/10 border border-[#00cced]/30 text-xs font-bold uppercase tracking-widest text-[#00f0ff] shadow-[0_0_15px_rgba(0,204,237,0.2)]">
              <Sparkles size={13} className="text-[#00f0ff]" />
              <span>
                {isHeadService
                  ? 'Core Engineering Domain'
                  : `Specialized Capability · Part of ${parentService?.title || 'Core Domain'}`}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.2rem] font-black text-white tracking-tight leading-[1.08]">
              {service.title}
            </h1>

            {/* Short Subtitle */}
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
              {service.short_desc}
            </p>

            {/* CTA Action Buttons */}
            <div className="flex items-center gap-4 flex-wrap pt-2">
              <Link
                to={`/contact?service=${encodeURIComponent(service.title)}`}
                className="btn-primary py-3.5 px-7 text-sm shadow-[0_8px_30px_rgba(0,204,237,0.45)] no-underline"
              >
                <span>Request a Quote for {service.title}</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/contact"
                className="btn-ghost py-3.5 px-6 text-sm no-underline"
              >
                <span>Schedule Architecture Call</span>
              </Link>
            </div>
          </div>

          {/* Right Visual Cover Showcase */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-[#00cced]/35 bg-gradient-to-b from-[#0a182d] to-[#050c18] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.6)] group overflow-hidden">
              <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-black">
                <img
                  src={imageUrl}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060c18] via-transparent to-black/30 pointer-events-none" />

                {/* Cyber Watermark */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#060c18]/80 backdrop-blur-md border border-white/10 text-[0.68rem] text-slate-300 font-mono">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    SENIOR ARCHITECTS
                  </span>
                  <span className="text-[#00f0ff]">100% IP OWNERSHIP</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── IF HEAD SERVICE: Show Specialized Sub-Services Grid! ── */}
        {isHeadService && childServices.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#00f0ff] mb-1.5">
                  <FolderTree size={14} className="text-[#00f0ff]" />
                  <span>Specialized Offerings</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Capabilities &amp; Sub-Services in {service.title}
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
                {childServices.length} Specialized Sub-Services
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {childServices.map((child, idx) => (
                <Link
                  key={child.id || idx}
                  to={`/services/${child.slug || child.id}`}
                  className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#091527] to-[#050c18] border border-white/[0.10] hover:border-[#00f0ff] transition-all hover:-translate-y-1 block no-underline group shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#00cced]/10 border border-[#00cced]/25 flex items-center justify-center text-[#00f0ff] group-hover:bg-[#00cced]/20 transition-colors">
                      <span className="text-xs font-mono font-bold">0{idx + 1}</span>
                    </div>
                    <ArrowRight size={15} className="text-[#00cced] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-[#00f0ff] transition-colors leading-snug">
                    {child.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mt-2 font-normal">
                    {child.short_desc}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-[#00cced] group-hover:text-white transition-colors">
                    <span>Explore Sub-Service</span>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Detailed Overview Section (long_desc) ── */}
        <div className="rounded-3xl border border-[#00cced]/25 bg-gradient-to-b from-[#091527]/90 to-[#060b14]/95 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <Code2 size={22} className="text-[#00f0ff]" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Detailed Engineering Overview &amp; Capabilities
            </h2>
          </div>

          <div className="text-slate-200 text-sm sm:text-base leading-relaxed space-y-4">
            {(service.long_desc || service.short_desc || 'We deliver world-class engineering solutions tailored to high-growth companies.')
              .split('\n\n')
              .map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
          </div>
        </div>

        {/* ── Key Deliverables & Features Grid ── */}
        {features.length > 0 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#00f0ff] mb-2 font-mono">
                <CheckCircle2 size={13} className="text-emerald-400" /> Deliverables &amp; Technical Capabilities
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                What You Receive With This Service
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
                    Designed, implemented, and thoroughly tested following enterprise best practices and code standards.
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
                  <span>Production Technology Stack</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tools, libraries, and frameworks our engineers use to deliver this capability.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full bg-emerald-500/10">
                MODERN LTS STACK
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

        {/* ── IF CHILD SERVICE: Sibling Sub-Services Switcher! ── */}
        {!isHeadService && siblingServices.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-white/[0.08]">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#00f0ff]">
                  Related Capabilities
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                  Other {parentService?.title} Sub-Services
                </h3>
              </div>
              {parentService && (
                <Link
                  to={`/services/${parentService.slug || parentService.id}`}
                  className="text-xs text-[#00f0ff] font-semibold hover:underline"
                >
                  View All {parentService.title} →
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {siblingServices.slice(0, 6).map(sib => (
                <Link
                  key={sib.id}
                  to={`/services/${sib.slug || sib.id}`}
                  className="p-5 rounded-2xl bg-gradient-to-b from-[#0a182d] to-[#060c18] border border-[#00cced]/25 hover:border-[#00f0ff] transition-all hover:-translate-y-1 block no-underline group shadow-lg"
                >
                  <h4 className="text-base font-bold text-white group-hover:text-[#00f0ff] transition-colors truncate">
                    {sib.title}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mt-1 font-normal">
                    {sib.short_desc}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#00cced] mt-3 group-hover:translate-x-1 transition-transform">
                    View Details →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Related Head Domains ── */}
        {relatedHeads.length > 0 && isHeadService && (
          <div className="space-y-6 pt-6 border-t border-white/[0.08]">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Explore Other Core Domains
              </h3>
              <Link to="/services" className="text-xs text-[#00f0ff] font-semibold hover:underline">
                View All Services →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedHeads.map(rel => (
                <Link
                  key={rel.id}
                  to={`/services/${rel.slug || rel.id}`}
                  className="p-5 rounded-2xl bg-gradient-to-b from-[#0a182d] to-[#060c18] border border-[#00cced]/25 hover:border-[#00f0ff] transition-all hover:-translate-y-1 block no-underline group shadow-lg"
                >
                  <h4 className="text-base font-bold text-white group-hover:text-[#00f0ff] transition-colors truncate">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mt-1 font-normal">
                    {rel.short_desc}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#00cced] mt-3 group-hover:translate-x-1 transition-transform">
                    View Domain →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Bottom Conversion Banner ── */}
        <CTABanner />

      </div>
    </div>
  )
}
