import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass,
  Layers,
  Rocket,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

// The exact 5 delivery points from the user's screenshots
const DELIVERY_STEPS = [
  {
    step: '01',
    phase: 'PHASE 01 · DISCOVERY & RESEARCH',
    title: 'Strategy & Market Research',
    desc: 'Before we touch a single campaign or write a line of code, we dig deep. We research your industry, map your competitors, identify your keyword opportunities, and define exactly what success looks like for your business.',
    icon: Compass,
    highlights: [
      'Deep Competitor & Industry Mapping',
      'Target Audience & ICP Profiling',
      'High-Impact Keyword Opportunities',
      'Clear KPI & Success Metric Definitions',
    ],
    metric: '100% Scope Alignment',
    metricLabel: 'Before Sprint 01 Begins',
  },
  {
    step: '02',
    phase: 'PHASE 02 · ARCHITECTURE & STRATEGY',
    title: 'Custom Growth Roadmap',
    desc: "We don't use templates. Based on our research, we build a custom plan that connects your marketing, software, and AI strategy into one unified growth roadmap with clear KPIs you can track.",
    icon: Layers,
    highlights: [
      'Bespoke Architecture Without Templates',
      'Unified Marketing, Tech & AI Plan',
      'Granular Milestone Cost Breakdown',
      'Measurable Weekly KPI Targets',
    ],
    metric: 'Zero Generic Templates',
    metricLabel: '100% Custom Tailored Strategy',
  },
  {
    step: '03',
    phase: 'PHASE 03 · EXECUTION & SHIP',
    title: 'Build & Launch',
    desc: "Our team executes whether that's launching ad campaigns, developing your platform, or deploying AI automation. Everything is tested before it goes live.",
    icon: Rocket,
    highlights: [
      'High-Velocity Agile Sprint Execution',
      'Clean Production TypeScript & Python Code',
      'Automated CI/CD & Rigorous Testing',
      'Zero-Downtime Live Production Launch',
    ],
    metric: '100% Tested & Verified',
    metricLabel: 'Pre-Flight QA & Verification',
  },
  {
    step: '04',
    phase: 'PHASE 04 · TELEMETRY & OPTIMIZATION',
    title: 'Track & Optimize',
    desc: "We watch the numbers daily. What's working gets scaled. What isn't gets fixed fast. You get transparent reporting, so you always know where your money is going.",
    icon: BarChart3,
    highlights: [
      'Daily Performance & Telemetry Tracking',
      'Rapid Issue Hotpatching & Remediation',
      'Sub-Second Performance Tuning',
      'Transparent Financial & Milestone Reports',
    ],
    metric: 'Daily Monitoring',
    metricLabel: 'Real-Time Telemetry & Insights',
  },
  {
    step: '05',
    phase: 'PHASE 05 · COMPOUNDING GROWTH',
    title: 'Scale & Compound',
    desc: 'As results come in, we double down on what\'s working. Our AI systems continuously improve campaign performance, and your growth compounds over time, not just spikes and stops.',
    icon: TrendingUp,
    highlights: [
      'Continuous AI Model Tuning & Retraining',
      'Double Down on High-Yield Channels',
      'High-Throughput Infrastructure Scaling',
      'Sustainable Long-Term Growth Loops',
    ],
    metric: 'Compounding ROI',
    metricLabel: 'Continuous Long-Term Value',
  },
]

export default function DeliveryProcessSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef(null)

  const currentStep = DELIVERY_STEPS[currentIndex]

  // Smooth automatic step progression (every 4.8 seconds)
  useEffect(() => {
    if (isPaused) return

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % DELIVERY_STEPS.length)
    }, 4800)

    return () => clearInterval(timerRef.current)
  }, [currentIndex, isPaused])

  const CurrentIcon = currentStep.icon

  return (
    <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 lg:px-14 overflow-hidden">
      
      {/* Background Ambient Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none overflow-hidden contain-paint z-0">
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,204,237,0.12) 0%, rgba(0,240,255,0.02) 50%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />
      </div>

      <div className="max-w-[1240px] mx-auto relative z-10 space-y-10 sm:space-y-12">

        {/* ── Section Header (Exact title from Screenshot 1) ── */}
        <div className="flex flex-col items-center text-center space-y-3.5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00cced]/10 border border-[#00cced]/35 text-xs font-bold uppercase tracking-widest text-[#00f0ff] shadow-[0_0_15px_rgba(0,204,237,0.2)]">
            <Sparkles size={13} className="text-[#00f0ff]" />
            <span>The CodeLifeAI Delivery Framework</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-[3.2rem] font-black text-white tracking-tight leading-[1.12]">
            Here's Exactly How We Deliver{' '}
            <span className="bg-gradient-to-r from-[#00f0ff] via-[#00cced] to-[#1cb1f3] bg-clip-text text-transparent">
              Results!
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            No black boxes, no mystery. This is our process transparent, proven, and built around your specific business goals.
          </p>

          {/* Glowing central accent bar (matching screenshot 1) */}
          <div className="w-24 h-[2.5px] rounded-full bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent shadow-[0_0_12px_#00f0ff] mt-2" />
        </div>

        {/* ── High-Tech 5-Phase Pipeline Indicator (Natural Lifecycle Flow) ── */}
        <div
          className="space-y-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Connecting Lifecycle Roadmap */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
            {DELIVERY_STEPS.map((step, idx) => {
              const isActive = idx === currentIndex
              return (
                <button
                  key={step.step}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative p-3.5 rounded-2xl text-left transition-all duration-300 border flex flex-col justify-between cursor-pointer overflow-hidden group ${
                    isActive
                      ? 'bg-[#0a1c36] border-[#00f0ff] shadow-[0_10px_25px_rgba(0,204,237,0.3)]'
                      : 'bg-[#071324]/80 border-white/[0.08] hover:border-[#00cced]/40 hover:bg-[#09182f]'
                  }`}
                >
                  {/* Active Laser Line on Top */}
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" />
                  )}

                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-xs font-mono font-black ${isActive ? 'text-[#00f0ff]' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      PHASE {step.step}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
                    )}
                  </div>

                  <p className={`text-[0.80rem] font-bold truncate ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                    {step.title}
                  </p>

                  {/* Automated smooth progress line under active step */}
                  {isActive && !isPaused && (
                    <motion.div
                      key={`progress-${idx}`}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 4.8, ease: 'linear' }}
                      className="absolute bottom-0 left-0 h-[2.5px] bg-gradient-to-r from-[#00cced] to-[#00f0ff]"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Main Dynamic Stage Showcase Card ── */}
          <div
            className="relative rounded-3xl overflow-hidden border border-[#00cced]/40 shadow-[0_30px_90px_rgba(0,0,0,0.98),0_0_40px_rgba(0,204,237,0.20)]"
            style={{
              backgroundColor: '#071224',
              background: 'linear-gradient(180deg, #09172d 0%, #050d1a 100%)',
            }}
          >
            {/* Top Accent Laser Line */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent z-20" />

            <div className="p-6 sm:p-10 lg:p-12 relative min-h-[380px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.step}
                  initial={{ opacity: 0, x: 40, scale: 0.99 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -40, scale: 0.99 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  {/* Left: Step Info & Description */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Step Header with Large Glowing Number */}
                    <div className="flex items-center gap-4 sm:gap-5">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#00cced]/25 to-[#00f0ff]/10 border-2 border-[#00f0ff] flex items-center justify-center text-3xl sm:text-4xl font-black font-mono text-[#00f0ff] shadow-[0_0_25px_rgba(0,240,255,0.4)] flex-shrink-0">
                        {currentStep.step}
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-[#00f0ff] uppercase tracking-wider block mb-1">
                          {currentStep.phase}
                        </span>
                        <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                          {currentStep.title}
                        </h3>
                      </div>
                    </div>

                    {/* Main Paragraph Description (Exact from screenshot) */}
                    <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-normal">
                      {currentStep.desc}
                    </p>

                    {/* Key Deliverables Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {currentStep.highlights.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]"
                        >
                          <div className="w-5 h-5 rounded-full bg-[#00cced]/20 flex items-center justify-center text-[#00f0ff] flex-shrink-0">
                            <CheckCircle2 size={13} />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-slate-200">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Right: Telemetry / Metric Callout Card */}
                  <div className="lg:col-span-4">
                    <div className="rounded-2xl p-6 bg-gradient-to-b from-[#0e213d] to-[#081324] border border-[#00cced]/35 shadow-xl space-y-5 text-center sm:text-left">
                      <div className="w-12 h-12 rounded-2xl bg-[#00cced]/20 border border-[#00cced]/40 flex items-center justify-center text-[#00f0ff] mx-auto sm:mx-0 shadow-[0_0_15px_rgba(0,204,237,0.3)]">
                        <CurrentIcon size={24} />
                      </div>

                      <div>
                        <span className="text-[0.68rem] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                          CODELIFEAI GUARANTEE
                        </span>
                        <h4 className="text-2xl font-black text-white tracking-tight">
                          {currentStep.metric}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1">
                          {currentStep.metricLabel}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/[0.08]">
                        <Link
                          to="/contact"
                          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#00cced] hover:bg-[#00f0ff] text-black font-bold text-xs transition-colors shadow-md no-underline"
                        >
                          <span>Start Step {currentStep.step} With Us</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>

                </motion.div>
              </AnimatePresence>

              {/* Bottom Natural Ribbon (No manual slider arrows or slider labels) */}
              <div className="pt-6 border-t border-white/[0.10] flex items-center justify-between flex-wrap gap-4 mt-8 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#00f0ff] flex-shrink-0" />
                  <span>Continuous End-to-End Delivery · Zero Black Boxes · 100% IP Ownership</span>
                </div>
                <Link
                  to="/contact"
                  className="font-bold text-[#00f0ff] hover:text-white flex items-center gap-1.5 transition-colors no-underline"
                >
                  <span>Scope Your Project Architecture</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
