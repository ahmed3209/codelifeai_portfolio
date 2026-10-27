import { Link } from 'react-router-dom'
import { Phone, Mail, Sparkles, ArrowRight } from 'lucide-react'

export default function TopHeaderBar({ content = {}, scrolled = false }) {
  // Allow admin to toggle top bar visibility (default enabled)
  if (content.header_topbar_enabled === '0') return null

  const phone = content.header_phone || '+923168435767'
  const email = content.header_email || 'contact@codelifeai.com'
  const announcement = content.header_announcement || '⚡ Open for Q1/Q2 Projects · High-Velocity Delivery'
  const ctaText = content.header_cta_text || 'Request a Quote'
  const ctaLink = content.header_cta_link || '/contact'

  const cleanPhone = String(phone).replace(/\s+/g, '')

  return (
    <div
      className={`w-full transition-all duration-300 border-b border-[#00cced]/20 text-[0.73rem] sm:text-[0.76rem] font-medium select-none
        ${scrolled
          ? 'bg-[#040810]/95 backdrop-blur-xl py-1 sm:py-1.5'
          : 'bg-[#060b14]/90 backdrop-blur-md py-1.5 sm:py-2'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-14 flex items-center justify-between gap-3">
        
        {/* Left: Contact Info (Phone & Email) */}
        <div className="flex items-center gap-4 sm:gap-6 text-slate-300">
          {/* Phone */}
          <a
            href={`tel:${cleanPhone}`}
            className="inline-flex items-center gap-1.5 hover:text-[#00f0ff] transition-colors group no-underline text-slate-300"
            title="Call Us"
          >
            <Phone size={12} className="text-[#00f0ff] group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className="font-semibold tracking-wide text-slate-200 group-hover:text-white">{phone}</span>
          </a>

          <span className="hidden sm:inline text-white/20">|</span>

          {/* Email */}
          <a
            href={`mailto:${email}`}
            className="hidden xs:inline-flex items-center gap-1.5 hover:text-[#00f0ff] transition-colors group no-underline text-slate-300"
            title="Email Us"
          >
            <Mail size={12} className="text-[#00cced] group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className="text-slate-300 group-hover:text-white truncate max-w-[200px] sm:max-w-none">{email}</span>
          </a>
        </div>

        {/* Center: Live Studio Status / Announcement Badge (Hidden on mobile) */}
        <div className="hidden lg:flex items-center gap-2 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[0.72rem] tracking-wide text-slate-300">{announcement}</span>
        </div>

        {/* Right: "Request a Quote" CTA Button */}
        <div className="flex items-center gap-3">
          <Link
            to={ctaLink}
            className="inline-flex items-center gap-1.5 px-3 py-1 sm:py-1 rounded-full text-[0.71rem] sm:text-[0.74rem] font-bold text-[#00f0ff] bg-[#00cced]/10 border border-[#00cced]/40 hover:bg-[#00cced]/20 hover:border-[#00f0ff] hover:shadow-[0_0_12px_rgba(0,240,255,0.35)] transition-all no-underline group"
          >
            <Sparkles size={11} className="text-[#00f0ff] group-hover:rotate-12 transition-transform" />
            <span>{ctaText}</span>
            <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  )
}
