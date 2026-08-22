import { useState, useMemo } from 'react'
import { Calculator, Sparkles, Check, ArrowRight, ShieldCheck, Zap, Clock, DollarSign } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PROJECT_TYPES = [
  { id: 'webapp', name: 'Full-Stack Web App / SaaS', baseWeeks: 4, baseCost: 3500, icon: '💻', desc: 'Custom SaaS platform, responsive dashboard, API & database.' },
  { id: 'ai_agent', name: 'AI Agent & LLM Workflow', baseWeeks: 3, baseCost: 3000, icon: '🧠', desc: 'Autonomous AI agents, RAG document knowledge base & tools.' },
  { id: 'mobile', name: 'Cross-Platform Mobile App', baseWeeks: 5, baseCost: 4000, icon: '📱', desc: 'Native-feel Flutter iOS & Android application with offline sync.' },
  { id: 'mvp', name: 'High-Velocity MVP Sprint', baseWeeks: 2, baseCost: 2200, icon: '⚡', desc: 'Fast turnaround proof-of-concept to validate and raise funding.' },
]

const ADD_ONS = [
  { id: 'ai', name: 'AI Reasoning & LLM Integration', weeks: 1, cost: 900, icon: '✨' },
  { id: 'auth_stripe', name: 'Auth & Stripe Billing / Subscriptions', weeks: 0.5, cost: 600, icon: '💳' },
  { id: 'realtime', name: 'Real-Time WebSockets / Live Streaming', weeks: 1, cost: 800, icon: '⚡' },
  { id: 'admin', name: 'Custom Admin Panel & CMS Dashboard', weeks: 1, cost: 700, icon: '📊' },
  { id: 'mobile_companion', name: 'Companion Mobile App (iOS + Android)', weeks: 2.5, cost: 2000, icon: '📲' },
  { id: 'devops', name: 'Enterprise Cloud (AWS/GCP) & CI/CD Cluster', weeks: 0.5, cost: 600, icon: '☁️' },
]

const SPEEDS = [
  { id: 'blitz', name: 'High-Velocity Blitz (Fastest)', multiplier: 1.25, timeFactor: 0.7, desc: 'Dedicated senior engineers with daily milestone syncs.' },
  { id: 'standard', name: 'Standard Agile Sprints', multiplier: 1.0, timeFactor: 1.0, desc: 'Weekly sprint demos with steady iteration.' },
]

export default function ProjectEstimator() {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState('webapp')
  const [selectedAddons, setSelectedAddons] = useState(['ai', 'admin'])
  const [selectedSpeed, setSelectedSpeed] = useState('standard')

  const toggleAddon = (id) => {
    setSelectedAddons(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const calculation = useMemo(() => {
    const typeObj = PROJECT_TYPES.find(t => t.id === selectedType) || PROJECT_TYPES[0]
    const speedObj = SPEEDS.find(s => s.id === selectedSpeed) || SPEEDS[1]

    let rawCost = typeObj.baseCost
    let rawWeeks = typeObj.baseWeeks

    selectedAddons.forEach(addonId => {
      const addon = ADD_ONS.find(a => a.id === addonId)
      if (addon) {
        rawCost += addon.cost
        rawWeeks += addon.weeks
      }
    })

    const finalCost = Math.round(rawCost * speedObj.multiplier)
    const finalWeeks = Math.max(2, Math.round(rawWeeks * speedObj.timeFactor))

    return {
      minCost: Math.round(finalCost * 0.9),
      maxCost: Math.round(finalCost * 1.15),
      minWeeks: finalWeeks,
      maxWeeks: finalWeeks + 2,
    }
  }, [selectedType, selectedAddons, selectedSpeed])

  function handleProceedToContact() {
    const typeObj = PROJECT_TYPES.find(t => t.id === selectedType)
    const addonNames = selectedAddons.map(id => ADD_ONS.find(a => a.id === id)?.name).filter(Boolean)
    const summary = `Project Type: ${typeObj?.name}\nAdd-ons: ${addonNames.join(', ') || 'None'}\nTimeline: ~${calculation.minWeeks}-${calculation.maxWeeks} Weeks\nEstimated Budget: $${calculation.minCost.toLocaleString()} - $${calculation.maxCost.toLocaleString()}`
    
    // Store in sessionStorage so Contact page / Contact footer can prefill
    try {
      sessionStorage.setItem('prefill_project_estimate', summary)
    } catch {}

    navigate('/contact')
  }

  return (
    <section className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/25 text-[0.68rem] font-bold uppercase tracking-widest text-[#a855f7] mb-4">
          <Calculator size={12} /> Interactive Project Planner
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-bb-white tracking-tight leading-tight">
          Estimate Your Project Cost <br />
          <span className="bg-gradient-to-r from-[#a855f7] via-[#00d4f5] to-[#38bdf8] bg-clip-text text-transparent">
            In Less Than 30 Seconds
          </span>
        </h2>
        <p className="text-bb-muted text-sm sm:text-base mt-4 leading-relaxed">
          Select your requirements below to calculate an instant estimated timeline and budget scope based on our high-velocity engineering metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Options Configurator (7 Cols) */}
        <div className="lg:col-span-7 space-y-8 bg-[#090916]/80 border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
          {/* Step 1: Project Type */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-[#00d4f5]/15 border border-[#00d4f5]/30 text-[0.68rem] font-bold text-[#00d4f5] flex items-center justify-center">1</span>
              <h3 className="text-sm font-bold text-bb-white uppercase tracking-wider">Select Project Foundation</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROJECT_TYPES.map(type => {
                const isSelected = selectedType === type.id
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`text-left p-4 rounded-2xl border transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#00d4f5]/10 border-[#00d4f5]/40 shadow-lg shadow-[#00d4f5]/10'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-lg">{type.icon}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#00d4f5] shadow-[0_0_8px_#00d4f5]" />}
                    </div>
                    <p className="text-sm font-bold text-bb-white">{type.name}</p>
                    <p className="text-xs text-bb-muted mt-1 leading-snug">{type.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: Add-on Capabilities */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-[#a855f7]/15 border border-[#a855f7]/30 text-[0.68rem] font-bold text-[#a855f7] flex items-center justify-center">2</span>
              <h3 className="text-sm font-bold text-bb-white uppercase tracking-wider">Choose Key Features &amp; Modules</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ADD_ONS.map(addon => {
                const isChecked = selectedAddons.includes(addon.id)
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`text-left flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                      isChecked
                        ? 'bg-[#a855f7]/10 border-[#a855f7]/35 text-white'
                        : 'bg-white/[0.02] border-white/[0.06] text-bb-muted hover:border-white/15 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isChecked ? 'bg-[#a855f7] text-white' : 'border border-white/20 bg-white/5'
                      }`}
                    >
                      {isChecked && <Check size={12} />}
                    </div>
                    <span className="text-xs font-semibold leading-tight">{addon.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 3: Speed & Delivery Cadence */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[0.68rem] font-bold text-emerald-400 flex items-center justify-center">3</span>
              <h3 className="text-sm font-bold text-bb-white uppercase tracking-wider">Delivery Velocity</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SPEEDS.map(s => {
                const isSelected = selectedSpeed === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSpeed(s.id)}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-white/[0.02] border-white/[0.06] text-bb-muted hover:border-white/15 hover:bg-white/[0.04]'
                    }`}
                  >
                    <p className="text-xs font-bold text-bb-white">{s.name}</p>
                    <p className="text-[0.72rem] text-bb-muted mt-1">{s.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Summary & Price Card (5 Cols) */}
        <div className="lg:col-span-5 sticky top-28 space-y-6">
          <div className="relative bg-gradient-to-b from-[#0e0e24] to-[#080816] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
            {/* Glowing ambient background */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#00d4f5]/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-[#a855f7]/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[#00d4f5]">
                    Estimated Investment
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-bb-white mt-1">
                    ${calculation.minCost.toLocaleString()} – ${calculation.maxCost.toLocaleString()}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#00d4f5]/10 border border-[#00d4f5]/25 flex items-center justify-center text-[#00d4f5]">
                  <DollarSign size={20} />
                </div>
              </div>

              {/* Timeline metric */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/[0.05] text-[#38bdf8]">
                    <Clock size={16} />
                  </div>
                  <div>
                    <span className="text-[0.68rem] text-bb-muted uppercase tracking-wider block">Estimated Timeline</span>
                    <span className="text-sm font-bold text-bb-white">
                      {calculation.minWeeks} – {calculation.maxWeeks} Weeks
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Agile Delivery
                </span>
              </div>

              {/* Guarantees List */}
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#00d4f5]" />
                  <span>100% Full Source Code &amp; IP Rights Transfer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#00d4f5]" />
                  <span>30-Day Post-Launch Bug Warranty Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#00d4f5]" />
                  <span>Weekly Working Software Demos &amp; Private Staging</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#00d4f5]" />
                  <span>Mutual NDA Signed Before Kickoff</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleProceedToContact}
                className="w-full group flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#00d4f5] to-[#38bdf8] hover:from-[#00b8e6] hover:to-[#0284c7] text-black font-extrabold text-sm shadow-xl shadow-[#00d4f5]/20 transition-all duration-300 hover:scale-[1.02]"
              >
                <span>Request Detailed Scope &amp; Proposal</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-center text-[0.7rem] text-bb-muted">
                No credit card required. Guaranteed response within 12 hours from our engineering founders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
