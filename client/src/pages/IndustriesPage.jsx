import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { publicApi } from '../lib/api'
import PageMeta from '../components/PageMeta'
import CTABanner from '../components/sections/CTABanner'
import ProjectEstimator from '../components/sections/ProjectEstimator'
import { INDUSTRY_ICON_MAP } from '../lib/industryIcons'
import {
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
} from 'lucide-react'

export default function IndustriesPage() {
  const { data: siteData } = useQuery({
    queryKey: ['site-data'],
    queryFn: () => publicApi.getSiteData().then(r => r.data),
  })

  const industries = siteData?.industries || []

  return (
    <div className="pt-28 sm:pt-36 pb-20">
      <PageMeta
        path="/industries"
        title="Industry Verticals & Domain Engineering — CodeLifeAI"
        description="High-compliance, enterprise-grade software engineering for FinTech, Healthcare, Logistics, E-Commerce, EdTech, Automotive, and Professional Services."
        keywords="fintech software, healthcare hipaa apps, logistics fleet software, ecommerce headless, automotive telemetry, enterprise software"
      />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-14 space-y-16 sm:space-y-20">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00cced]/10 border border-[#00cced]/30 text-xs font-mono font-bold uppercase tracking-widest text-[#00f0ff] shadow-[0_0_15px_rgba(0,204,237,0.15)]">
            <Sparkles size={13} className="text-[#00f0ff]" />
            <span>High-Compliance Enterprise Verticals</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Industry Verticals We <br />
            <span className="bg-gradient-to-r from-[#00f0ff] via-[#00cced] to-[#1cb1f3] bg-clip-text text-transparent">
              Engineer &amp; Scale
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Every industry has unique data privacy, transaction throughput, and regulatory requirements. We engineer tailored domain platforms with zero architectural compromise.
          </p>
        </motion.div>

        {/* ── 8-Card Grid Matching User's Screenshot ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {industries.map((ind, idx) => {
            const IconComp = INDUSTRY_ICON_MAP[ind.icon] || Building2
            return (
              <motion.div
                key={ind.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.08 }}
                transition={{ delay: idx * 0.04, duration: 0.45 }}
              >
                <Link
                  to={`/industries/${ind.slug || ind.id}`}
                  className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#091527] via-[#07101e] to-[#040812] border border-white/[0.09] hover:border-[#00f0ff] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between h-full group no-underline shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(0,204,237,0.22)] relative overflow-hidden"
                >
                  {/* Subtle top laser hover accent */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="space-y-3.5">
                    {/* Icon container */}
                    <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-[#00f0ff] flex-shrink-0 group-hover:bg-[#00cced]/20 group-hover:border-[#00f0ff] transition-all">
                      <IconComp size={22} />
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#00f0ff] transition-colors leading-snug">
                      {ind.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs sm:text-[0.80rem] text-slate-300 leading-relaxed font-normal">
                      {ind.short_desc}
                    </p>
                  </div>

                  {/* Explore Link CTA */}
                  <div className="pt-4 mt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-[#00cced] group-hover:text-white transition-colors">
                    <span>Explore {ind.title}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform text-[#00f0ff]" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* ── Footer Ribbon (Exactly as in screenshot) ── */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#040812]/90 border border-white/[0.09] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
            <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
            <span>Engineered for high-compliance industry verticals, strict data governance, and high throughput.</span>
          </div>

          <Link
            to="/contact?type=architecture"
            className="text-xs sm:text-sm font-bold text-[#00f0ff] hover:text-white flex items-center gap-1.5 transition-colors no-underline group whitespace-nowrap"
          >
            <span>Request Domain Architecture Call</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ── Project Estimator ── */}
        <ProjectEstimator />

        {/* ── Bottom Conversion Banner ── */}
        <CTABanner />

      </div>
    </div>
  )
}
