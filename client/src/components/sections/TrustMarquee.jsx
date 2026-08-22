import { Shield, Zap, Lock, Cpu, Rocket, Award, CheckCircle2, Flame } from 'lucide-react'

const BADGES = [
  { icon: Zap, label: '< 50ms Edge API Response Times', accent: '#00d4f5' },
  { icon: Shield, label: '100% Client Code & IP Ownership', accent: '#a855f7' },
  { icon: Lock, label: 'Strict Mutual NDA & Data Privacy', accent: '#22c55e' },
  { icon: Rocket, label: '99.9% Production Uptime Guarantee', accent: '#00d4f5' },
  { icon: Cpu, label: 'Production-Grade AI Agents & LLMs', accent: '#38bdf8' },
  { icon: Flame, label: 'High-Velocity 1-Week Agile Sprints', accent: '#f59e0b' },
  { icon: Award, label: '30-Day Post-Launch Bug Warranty', accent: '#ec4899' },
  { icon: CheckCircle2, label: 'SOC2 & HIPAA Compliant Architecture', accent: '#10b981' },
]

export default function TrustMarquee() {
  return (
    <section className="relative z-10 py-6 overflow-hidden border-y border-white/[0.06] bg-[#050512]/60 backdrop-blur-md">
      <div className="flex items-center gap-6 animate-marquee whitespace-nowrap will-change-transform">
        {[...BADGES, ...BADGES].map((b, i) => {
          const Icon = b.icon
          return (
            <div
              key={i}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.025] border border-white/[0.06] hover:border-white/20 transition-colors"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${b.accent}15`, color: b.accent }}
              >
                <Icon size={12} />
              </div>
              <span className="text-xs font-semibold text-slate-200 tracking-tight">
                {b.label}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
