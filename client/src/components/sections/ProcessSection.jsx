import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Palette, Code2, Rocket, ShieldCheck,
  CheckCircle2, ArrowRight, Sparkles, Clock, Lock,
  Zap, MessageSquare, Award, FileCode2, Cpu, Terminal
} from 'lucide-react'

const PROCESS_STAGES = [
  {
    id: '01',
    phase: 'Phase 01',
    title: 'Discovery & System Architecture',
    timeline: 'Week 1',
    icon: Search,
    color: '#00d4f5',
    summary: 'Deep architectural dive into your business logic, technical constraints, data schemas, and scalability targets.',
    deliverables: [
      'Product Requirements Document (PRD)',
      'Database Entity Relationship Diagram (ERD)',
      'API Architecture & Third-Party Integration Map',
      'Sprint Roadmap & Milestone Cost Breakdown',
    ],
    tools: ['Figma Jam', 'PostgreSQL / Prisma', 'Swagger / OpenAPI', 'Notion'],
    clientCheckpoint: 'Architecture Review & Kickoff Call (Full Scope Alignment)',
  },
  {
    id: '02',
    phase: 'Phase 02',
    title: 'UI/UX & Interactive Prototyping',
    timeline: 'Week 1 – 2',
    icon: Palette,
    color: '#a855f7',
    summary: 'Translating concepts into high-fidelity, high-conversion user interfaces with responsive design systems.',
    deliverables: [
      'Complete Clickable Figma Prototype',
      'Atomic Design System & Component Library',
      'Mobile Responsive Breakpoints (iOS/Android/Web)',
      'Micro-Interactions & Animation Specs',
    ],
    tools: ['Figma', 'Tailwind Design Tokens', 'Framer', 'Lottie'],
    clientCheckpoint: 'Interactive Prototype Walkthrough & Visual Signoff',
  },
  {
    id: '03',
    phase: 'Phase 03',
    title: 'Agile Build & Weekly Sprints',
    timeline: 'Week 2 – 6',
    icon: Code2,
    color: '#38bdf8',
    summary: 'High-velocity test-driven development in 1-week sprints with working software deployed to private staging.',
    deliverables: [
      'Clean Modular TypeScript / Flutter / Python Code',
      'Live Staging Sandbox with Test Data',
      'Automated CI/CD Pipeline & Unit Testing Suite',
      'Weekly Async Video Demo & Progress Loom',
    ],
    tools: ['React / Next.js', 'Flutter / Dart', 'Node / FastAPI', 'GitHub Actions'],
    clientCheckpoint: 'Weekly Live Sandbox Testing & Iterative Feedback',
  },
  {
    id: '04',
    phase: 'Phase 04',
    title: 'Production Deploy & Hardening',
    timeline: 'Launch Week',
    icon: Rocket,
    color: '#10b981',
    summary: 'Zero-downtime production deployment, performance audits, security hardening, and DNS cutover.',
    deliverables: [
      'Production Kubernetes / AWS / GCP Cluster',
      'SSL Encryption, Cloudflare WAF & Edge CDN',
      'Sub-Second Page Load Optimization',
      'Automated Database Backup Snapshots',
    ],
    tools: ['AWS / GCP', 'Docker / Kubernetes', 'Cloudflare', 'PostgreSQL'],
    clientCheckpoint: 'Production Go-Live & Domain Launch Cutover',
  },
  {
    id: '05',
    phase: 'Phase 05',
    title: 'Observability, Scale & Warranty',
    timeline: 'Post-Launch',
    icon: ShieldCheck,
    color: '#f59e0b',
    summary: 'Continuous 24/7 APM monitoring, 30-day bug warranty, and sprint retainers for feature scaling.',
    deliverables: [
      '30-Day Complete Post-Launch Bug Warranty',
      'Prometheus & Grafana Real-Time APM Dashboards',
      '100% IP & Clean Repository Handover',
      'Dedicated Sprint Scaling Support Option',
    ],
    tools: ['Prometheus', 'Grafana', 'Sentry', 'GitHub Enterprise'],
    clientCheckpoint: 'Handover Certification & Growth Roadmap Meeting',
  },
]

const COMPARISON_ROWS = [
  {
    metric: 'Time to Working MVP',
    codelife: '3 – 6 Weeks (Fast, production-ready)',
    agency: '4 – 9 Months (Slow waterfall process)',
  },
  {
    metric: 'Engineering Talent',
    codelife: '100% Senior Hands-On Engineers',
    agency: 'Outsourced to junior developers',
  },
  {
    metric: 'Code & IP Ownership',
    codelife: '100% Full Ownership from Day 1',
    agency: 'Locked into proprietary agency platforms',
  },
  {
    metric: 'Progress Visibility',
    codelife: 'Weekly working builds + Live staging URL',
    agency: 'Monthly text status reports',
  },
  {
    metric: 'Communication Channel',
    codelife: 'Direct dedicated Slack / WhatsApp channel',
    agency: 'Slow email ticketing queue',
  },
  {
    metric: 'Architecture Quality',
    codelife: 'Modern, modular, cloud-native scale',
    agency: 'Legacy monolithic spaghetti code',
  },
]

export default function ProcessSection() {
  const [activeTab, setActiveTab] = useState(0)
  const currentStage = PROCESS_STAGES[activeTab]

  return (
    <section id="process" className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-14 overflow-hidden">
      <div className="max-w-[1240px] mx-auto space-y-20 sm:space-y-28">

        {/* ── 1. Header ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00d4f5]/10 border border-[#00d4f5]/25 text-[0.68rem] font-bold uppercase tracking-widest text-[#00d4f5] mb-4">
            <Sparkles size={12} /> High-Velocity Engineering Protocol
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-5">
            How We Take Your Vision From <br />
            <span className="bg-gradient-to-r from-[#00d4f5] via-[#38bdf8] to-[#a855f7] bg-clip-text text-transparent">
              Zero to Production Scale
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            No bloated meetings, no excuses. A streamlined, sprint-driven engineering process built for high-growth startups and visionary founders.
          </p>
        </motion.div>

        {/* ── 2. Interactive Stage Switcher & Deep Dive ───────── */}
        <div className="space-y-8">
          {/* Stage Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {PROCESS_STAGES.map((s, idx) => {
              const Icon = s.icon
              const isSelected = idx === activeTab
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`p-4 rounded-2xl text-left transition-all border relative overflow-hidden flex flex-col justify-between min-h-[110px] ${
                    isSelected
                      ? 'bg-[#00d4f5]/10 border-[#00d4f5] shadow-[0_0_25px_rgba(0,212,245,0.2)]'
                      : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-slate-400">
                      {s.id} · {s.timeline}
                    </span>
                    <Icon size={16} className={isSelected ? 'text-[#00d4f5]' : 'text-slate-500'} />
                  </div>
                  <p className={`text-xs font-bold mt-3 leading-snug ${isSelected ? 'text-white font-extrabold' : 'text-slate-300'}`}>
                    {s.title}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Active Stage Detailed Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28 }}
              className="rounded-3xl p-6 sm:p-10 bg-[#09091d]/90 border border-white/[0.12] shadow-2xl backdrop-blur-xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-[#00d4f5]/15 border border-[#00d4f5]/30 text-xs font-mono font-bold text-[#00d4f5]">
                      {currentStage.phase} · {currentStage.timeline}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                      <Clock size={13} /> High-Velocity Sprint
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {currentStage.title}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                    {currentStage.summary}
                  </p>

                  {/* Deliverables Checklist */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#00d4f5] flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Tangible Deliverables You Receive:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentStage.deliverables.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                        >
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle2 size={11} strokeWidth={3} />
                          </div>
                          <span className="text-xs text-slate-200 font-medium leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side Info Box */}
                <div className="space-y-5 p-6 rounded-2xl bg-white/[0.025] border border-white/[0.08]">
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Tools &amp; Stack in this Phase:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currentStage.tools.map((tool, i) => (
                        <span
                          key={i}
                          className="text-xs font-medium px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-200"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06]">
                    <p className="text-[0.68rem] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-[#00d4f5]" /> Client Collaboration Checkpoint:
                    </p>
                    <p className="text-xs text-slate-200 font-semibold bg-[#00d4f5]/10 p-3 rounded-xl border border-[#00d4f5]/20">
                      {currentStage.clientCheckpoint}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/contact"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00d4f5] hover:bg-[#00b8e6] text-black font-bold text-xs transition-colors"
                    >
                      <span>Start Your Sprint With Us</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── 3. CodeLifeAI vs Traditional Agency ──────────────── */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Why High-Growth Startups Choose <br />
              <span className="text-[#00d4f5]">CodeLifeAI</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              How our agile studio approach beats traditional slow agency bureaucracy.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border border-white/[0.1] bg-[#090918]/80 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.03]">
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Dimension</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#00d4f5] bg-[#00d4f5]/5">CodeLifeAI Studio</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Traditional Agency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-xs sm:text-sm">
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-semibold text-white">{row.metric}</td>
                      <td className="py-4 px-6 text-emerald-400 font-bold bg-[#00d4f5]/[0.02]">
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> {row.codelife}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400">{row.agency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── 4. Guarantees & SLAs ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#00d4f5]/15 text-[#00d4f5] flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h4 className="text-sm font-bold text-white">100% IP &amp; Code Ownership</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              You own all intellectual property, source code, and design assets unconditionally from day one.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#a855f7]/15 text-[#a855f7] flex items-center justify-center">
              <Zap size={20} />
            </div>
            <h4 className="text-sm font-bold text-white">99.9% Uptime Architecture</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Engineered with auto-scaling Kubernetes clusters, Cloudflare protection, and zero-downtime CI/CD.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Award size={20} />
            </div>
            <h4 className="text-sm font-bold text-white">30-Day Bug Warranty</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every production deployment includes full 30-day post-launch warranty and zero-cost issue resolution.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Lock size={20} />
            </div>
            <h4 className="text-sm font-bold text-white">Enterprise NDA Security</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mutual NDA signed before roadmap scoping. Your confidential IP and business model stay 100% safe.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
