import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../../lib/api'
import TopHeaderBar from './TopHeaderBar'
import {
  ChevronDown,
  ArrowRight,
  Code2,
  Bot,
  Smartphone,
  Cloud,
  Palette,
  Compass,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Truck,
  Car,
  Landmark,
  Plane,
  Briefcase,
  Building2,
  BookOpen,
  Sparkles,
  ExternalLink,
  Layers,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Terminal,
  Globe,
} from 'lucide-react'

// Clean multi-column software studio mega menu matching ELEXOFT agency structure
const SERVICES_CATEGORIES = [
  {
    title: 'ARTIFICIAL INTELLIGENCE',
    icon: Bot,
    serviceId: 4,
    items: [
      { name: 'AI Agent Development', path: '/services/4' },
      { name: 'AI Automation Workflows', path: '/services/4' },
      { name: 'Generative AI & LLMs', path: '/services/4' },
      { name: 'RAG Pipelines & Vector Search', path: '/services/4' },
      { name: 'Conversational AI & Chatbots', path: '/services/4' },
      { name: 'Machine Learning & Predictive AI', path: '/services/4' },
    ],
  },
  {
    title: 'WEB DEVELOPMENT',
    icon: Code2,
    serviceId: 1,
    items: [
      { name: 'Custom Web Development', path: '/services/1' },
      { name: 'React & Next.js Platforms', path: '/services/1' },
      { name: 'Enterprise SaaS Applications', path: '/services/1' },
      { name: 'E-Commerce & Digital Stores', path: '/services/1' },
      { name: 'CRM & ERP Custom Portals', path: '/services/1' },
      { name: 'REST & GraphQL Microservices', path: '/services/1' },
    ],
  },
  {
    title: 'MOBILE APP DEVELOPMENT',
    icon: Smartphone,
    serviceId: 2,
    items: [
      { name: 'Android App Development', path: '/services/2' },
      { name: 'iOS App Development', path: '/services/2' },
      { name: 'Flutter App Development', path: '/services/2' },
      { name: 'Cross-Platform Applications', path: '/services/2' },
      { name: 'Progressive Web Apps (PWA)', path: '/services/2' },
      { name: 'Mobile Backend & Offline Sync', path: '/services/2' },
    ],
  },
  {
    title: 'DEVOPS & CLOUD ENGINEERING',
    icon: Cloud,
    serviceId: 5,
    items: [
      { name: 'Cloud Migration & Strategy', path: '/services/5' },
      { name: 'AWS & GCP Cloud Architecture', path: '/services/5' },
      { name: 'DevOps Automation & CI/CD', path: '/services/5' },
      { name: 'Kubernetes & Containerization', path: '/services/5' },
      { name: 'Infrastructure as Code (IaC)', path: '/services/5' },
      { name: '24/7 Monitoring & APM Telemetry', path: '/services/5' },
    ],
  },
  {
    title: 'GRAPHIC DESIGN & UI/UX',
    icon: Palette,
    serviceId: 3,
    items: [
      { name: 'UI/UX & Product Design', path: '/services/3' },
      { name: 'Interactive Figma Prototypes', path: '/services/3' },
      { name: 'Design Systems & Tokens', path: '/services/3' },
      { name: 'Web & Mobile App Interfaces', path: '/services/3' },
      { name: 'Branding & Identity Design', path: '/services/3' },
      { name: 'Usability & Conversion Audits', path: '/services/3' },
    ],
  },
  {
    title: 'CUSTOM SOFTWARE & ADVISORY',
    icon: Briefcase,
    serviceId: 6,
    items: [
      { name: 'Custom Enterprise Software', path: '/services/6' },
      { name: 'Code & Architecture Audits', path: '/services/6' },
      { name: 'CTO-as-a-Service Advisory', path: '/services/6' },
      { name: 'Legacy System Modernization', path: '/services/6' },
      { name: 'Database Optimization & Scaling', path: '/services/6' },
      { name: 'Dedicated Engineering Teams', path: '/services/6' },
    ],
  },
]

// Curated Industries matching real software studio domains
const INDUSTRIES_DATA = [
  {
    title: 'E-Commerce & Retail',
    desc: 'High-conversion headless commerce, unified checkout & sub-second catalog search.',
    icon: ShoppingBag,
  },
  {
    title: 'Healthcare & Life Sciences',
    desc: 'HIPAA-compliant patient portals, encrypted telemetry & digital health systems.',
    icon: HeartPulse,
  },
  {
    title: 'Education & EdTech',
    desc: 'Accessible real-time learning portals, LMS microservices & adaptive assessments.',
    icon: GraduationCap,
  },
  {
    title: 'Logistics & Supply Chain',
    desc: 'Real-time geospatial fleet tracking, automated dispatch & warehouse operations.',
    icon: Truck,
  },
  {
    title: 'Automotive & Mobility',
    desc: 'Connected vehicle telemetry, dealer CRM portals & predictive diagnostics.',
    icon: Car,
  },
  {
    title: 'Fintech & Enterprise Software',
    desc: 'SOC2-ready financial platforms, immutable ledgers & real-time settlement APIs.',
    icon: Landmark,
  },
  {
    title: 'Travel & Tourism',
    desc: 'High-concurrency flight booking engines, reservation APIs & payment gateways.',
    icon: Plane,
  },
  {
    title: 'Professional Services',
    desc: 'Custom enterprise ERPs, client workflow automation & executive analytics portals.',
    icon: Briefcase,
  },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeDropdown, setActiveDropdown] = useState(null) // 'services' | 'industries' | 'company' | null
  const [mobileExpanded, setMobileExpanded] = useState(null)
  
  const navContainerRef = useRef(null)
  const timeoutRef = useRef(null)
  const { pathname } = useLocation()

  const { data: siteData } = useQuery({
    queryKey: ['site-data'],
    queryFn: () => publicApi.getSiteData().then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
  const content = siteData?.content || {}
  const logoUrl = content.site_logo_url || '/logo.svg'
  
  // Dynamic services and hierarchical categories from database
  const allServices = siteData?.services || []
  const dbHeadServices = allServices.filter(s => !s.parent_id)
  
  // Total count of capabilities
  const servicesCount = allServices.length > 0 ? allServices.length : 42

  // Dynamic Head Services with their children from DB
  const displayCategories = useMemo(() => {
    if (dbHeadServices.length > 0) {
      return dbHeadServices.map(head => {
        const children = allServices.filter(s => s.parent_id === head.id)
        let IconComp = Bot
        const titleLower = head.title.toLowerCase()
        if (titleLower.includes('software')) IconComp = Code2
        else if (titleLower.includes('mobile')) IconComp = Smartphone
        else if (titleLower.includes('web')) IconComp = Globe
        else if (titleLower.includes('automation') || titleLower.includes('process')) IconComp = Sparkles
        else if (titleLower.includes('cloud') || titleLower.includes('devops')) IconComp = Cloud
        else if (titleLower.includes('design') || titleLower.includes('ui')) IconComp = Palette
        else if (titleLower.includes('consult')) IconComp = Briefcase

        return {
          id: head.id,
          title: head.title,
          slug: head.slug || String(head.id),
          icon: IconComp,
          items: children.map(c => ({
            id: c.id,
            name: c.title,
            path: `/services/${c.slug || c.id}`,
          })),
        }
      })
    }
    return SERVICES_CATEGORIES
  }, [allServices, dbHeadServices])

  // Dynamic Industries from database
  const allIndustries = siteData?.industries || []
  const displayIndustries = useMemo(() => {
    if (allIndustries.length > 0) {
      const ICON_MAP = {
        ShoppingBag,
        HeartPulse,
        GraduationCap,
        Truck,
        Car,
        Landmark,
        Plane,
        Briefcase,
        Building2,
      }
      return allIndustries.map(ind => ({
        id: ind.id,
        title: ind.title,
        slug: ind.slug || String(ind.id),
        desc: ind.short_desc,
        icon: ICON_MAP[ind.icon] || Building2,
      }))
    }
    return INDUSTRIES_DATA.map(ind => ({
      ...ind,
      slug: (ind.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    }))
  }, [allIndustries])

  // Scroll progress listener and close dropdown on scroll
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0)
      if (window.scrollY > 10) {
        // If user scrolls, smoothly dismiss active mega menu
        setActiveDropdown(null)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setActiveDropdown(null)
    setMenuOpen(false)
  }, [pathname])

  // Close on outside click or escape key
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target)) {
        setActiveDropdown(null)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveDropdown(null)
    }
    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('click', handleDocumentClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Mouse hover handlers with debounced exit & immediate cancel
  const handleMouseEnterItem = (name) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveDropdown(name)
  }

  const handleMouseLeaveItem = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 120)
  }

  const cancelClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const handleMouseEnterNonDropdown = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveDropdown(null)
  }

  const toggleMobileAccordion = (name) => {
    setMobileExpanded(prev => (prev === name ? null : name))
  }

  return (
    <>
      <header
        ref={navContainerRef}
        className="fixed top-0 left-0 right-0 z-[200]"
        onMouseLeave={handleMouseLeaveItem}
      >
        {/* Scroll progress bar */}
        <div className="absolute top-0 left-0 right-0 z-[300] h-[2.5px] pointer-events-none">
          <div
            className="h-full transition-all duration-75"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00f0ff, #00cced, #1cb1f3)',
              boxShadow: '0 0 10px rgba(0,240,255,0.6)',
            }}
          />
        </div>

        {/* Top Header Utility Line with Phone, Email & Request a Quote button */}
        <TopHeaderBar content={content} scrolled={scrolled} />

        {/* Main navigation bar */}
        <motion.nav
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full flex items-center justify-between px-4 sm:px-6 lg:px-14 py-3 sm:py-3.5 transition-all duration-300 relative
            ${scrolled
              ? 'bg-[#050b14]/98 border-b border-[#00cced]/20 shadow-xl shadow-black/80 backdrop-blur-2xl'
              : 'bg-[#050b14]/90 backdrop-blur-xl border-b border-white/[0.08]'}`}
        >
          {/* Logo (Hovering closes any open mega menu) */}
          <Link
            to="/"
            onClick={() => setActiveDropdown(null)}
            onMouseEnter={handleMouseEnterNonDropdown}
            className="flex items-center no-underline"
            aria-label="CodeLifeAI — Home"
          >
            <img
              src={logoUrl}
              alt="CodeLifeAI"
              width="408"
              height="110"
              className="h-7 sm:h-9 w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,204,237,0.25)]"
              onError={(e) => { e.target.src = '/logo.svg' }}
            />
          </Link>

          {/* Desktop Nav Items */}
          <ul className="hidden md:flex items-center gap-7 lg:gap-9 list-none m-0 p-0">
            
            {/* Home (Non-dropdown, closes mega menu on hover) */}
            <li onMouseEnter={handleMouseEnterNonDropdown}>
              <Link
                to="/"
                onClick={() => setActiveDropdown(null)}
                className={`relative text-[0.82rem] font-bold uppercase tracking-[0.09em] transition-colors no-underline group/link pb-1
                  ${pathname === '/' ? 'text-white' : 'text-slate-300 hover:text-white'}`}
              >
                Home
                <span
                  className={`absolute bottom-0 left-0 h-[2px] rounded-full transition-all duration-300
                    ${pathname === '/' ? 'w-full shadow-[0_0_8px_#00f0ff]' : 'w-0 group-hover/link:w-full'}`}
                  style={{ background: 'linear-gradient(90deg, #00f0ff, #1cb1f3)' }}
                />
              </Link>
            </li>

            {/* Services (Direct Click Navigates to /services page, Hover opens mega menu) */}
            <li
              className="relative"
              onMouseEnter={() => handleMouseEnterItem('services')}
            >
              <Link
                to="/services"
                onClick={() => setActiveDropdown(null)}
                className={`flex items-center gap-1.5 text-[0.82rem] font-bold uppercase tracking-[0.09em] transition-colors pb-1 no-underline cursor-pointer
                  ${pathname.startsWith('/services') || activeDropdown === 'services' ? 'text-white' : 'text-slate-300 hover:text-white'}`}
              >
                <span>Services</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${activeDropdown === 'services' ? 'rotate-180 text-[#00f0ff]' : 'text-slate-400'}`}
                />
              </Link>
              <span
                className={`absolute bottom-0 left-0 h-[2px] rounded-full transition-all duration-300
                  ${pathname.startsWith('/services') || activeDropdown === 'services' ? 'w-full shadow-[0_0_8px_#00f0ff]' : 'w-0'}`}
                style={{ background: 'linear-gradient(90deg, #00f0ff, #1cb1f3)' }}
              />
            </li>

            {/* Industries (Dropdown Trigger) */}
            <li
              className="relative"
              onMouseEnter={() => handleMouseEnterItem('industries')}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'industries' ? null : 'industries')}
                className={`flex items-center gap-1.5 text-[0.82rem] font-bold uppercase tracking-[0.09em] transition-colors pb-1 cursor-pointer bg-transparent border-0 outline-none
                  ${activeDropdown === 'industries' ? 'text-white' : 'text-slate-300 hover:text-white'}`}
              >
                <span>Industries</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${activeDropdown === 'industries' ? 'rotate-180 text-[#00f0ff]' : 'text-slate-400'}`}
                />
              </button>
              <span
                className={`absolute bottom-0 left-0 h-[2px] rounded-full transition-all duration-300
                  ${activeDropdown === 'industries' ? 'w-full shadow-[0_0_8px_#00f0ff]' : 'w-0'}`}
                style={{ background: 'linear-gradient(90deg, #00f0ff, #1cb1f3)' }}
              />
            </li>

            {/* Portfolio / Work (Non-dropdown, closes mega menu on hover) */}
            <li onMouseEnter={handleMouseEnterNonDropdown}>
              <Link
                to="/work"
                onClick={() => setActiveDropdown(null)}
                className={`relative text-[0.82rem] font-bold uppercase tracking-[0.09em] transition-colors no-underline group/link pb-1
                  ${pathname === '/work' ? 'text-white' : 'text-slate-300 hover:text-white'}`}
              >
                Portfolio
                <span
                  className={`absolute bottom-0 left-0 h-[2px] rounded-full transition-all duration-300
                    ${pathname === '/work' ? 'w-full shadow-[0_0_8px_#00f0ff]' : 'w-0 group-hover/link:w-full'}`}
                  style={{ background: 'linear-gradient(90deg, #00f0ff, #1cb1f3)' }}
                />
              </Link>
            </li>

            {/* Company (Dropdown Trigger) */}
            <li
              className="relative"
              onMouseEnter={() => handleMouseEnterItem('company')}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'company' ? null : 'company')}
                className={`flex items-center gap-1.5 text-[0.82rem] font-bold uppercase tracking-[0.09em] transition-colors pb-1 cursor-pointer bg-transparent border-0 outline-none
                  ${['/team', '/process', '/blog'].includes(pathname) || activeDropdown === 'company' ? 'text-white' : 'text-slate-300 hover:text-white'}`}
              >
                <span>Company</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${activeDropdown === 'company' ? 'rotate-180 text-[#00f0ff]' : 'text-slate-400'}`}
                />
              </button>
              <span
                className={`absolute bottom-0 left-0 h-[2px] rounded-full transition-all duration-300
                  ${['/team', '/process', '/blog'].includes(pathname) || activeDropdown === 'company' ? 'w-full shadow-[0_0_8px_#00f0ff]' : 'w-0'}`}
                style={{ background: 'linear-gradient(90deg, #00f0ff, #1cb1f3)' }}
              />
            </li>

          </ul>

          {/* CTA Button (Closes mega menu on hover) */}
          <div className="hidden md:flex items-center gap-3" onMouseEnter={handleMouseEnterNonDropdown}>
            <Link
              to="/contact"
              onClick={() => setActiveDropdown(null)}
              className="btn-primary text-[0.82rem] py-2.5 px-5 shadow-[0_4px_20px_rgba(0,204,237,0.35)] uppercase tracking-wider font-bold no-underline"
            >
              <span>Let's Work Together</span>
              <ArrowRight size={13} className="inline-block transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white cursor-pointer"
          >
            <span className={`block w-4 h-0.5 bg-current transition-transform duration-250 ${menuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`} />
            <span className={`block w-4 h-0.5 bg-current transition-opacity duration-250 ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`block w-4 h-0.5 bg-current transition-transform duration-250 ${menuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`} />
          </button>

          {/* ════════════════════════════════════════════════════════════
              DESKTOP MEGA MENUS (ELEXOFT-STYLE CLEAN CORPORATE LAYOUT)
              Notice: Outer motion.div is pointer-events-none so mouse
              events outside the card fall through to backdrop!
          ════════════════════════════════════════════════════════════ */}
          <AnimatePresence>
            {activeDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.995 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-full left-0 right-0 px-4 sm:px-6 lg:px-12 pt-2 pointer-events-none z-[250]"
              >
                {/* 100% Solid Dark Container with pointer-events-auto */}
                <div
                  onMouseEnter={cancelClose}
                  onMouseLeave={handleMouseLeaveItem}
                  className="max-w-[1360px] mx-auto pointer-events-auto rounded-2xl border border-white/[0.10] p-6 sm:p-7 overflow-hidden relative shadow-[0_25px_70px_rgba(0,0,0,0.95)]"
                  style={{
                    backgroundColor: '#070e1b',
                    background: 'linear-gradient(180deg, #081120 0%, #050b14 100%)',
                  }}
                >
                  {/* Subtle Top Cyber Accent */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-90" />

                  {/* ── 1. SERVICES MEGA MENU (Clean 5-Column Agency Layout) ── */}
                  {activeDropdown === 'services' && (
                    <div className="space-y-4">
                      {/* Clean 5-Column Category Grid matching agency layout */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 lg:gap-6 items-start">
                        {displayCategories.map((cat, cIdx) => {
                          const Icon = cat.icon || Bot
                          const headUrl = `/services/${cat.slug || cat.serviceId || cat.id}`
                          return (
                            <div key={cIdx} className="space-y-2.5">
                              {/* Category Header with Icon + Title (Clickable) */}
                              <Link
                                to={headUrl}
                                onClick={() => setActiveDropdown(null)}
                                className="flex items-center gap-2 pb-2 border-b border-white/[0.08] group/cat no-underline"
                              >
                                <div className="w-6 h-6 rounded-lg bg-[#00cced]/10 border border-[#00cced]/20 flex items-center justify-center text-[#00f0ff] flex-shrink-0 group-hover/cat:bg-[#00cced]/20 transition-colors">
                                  <Icon size={13} />
                                </div>
                                <h4 className="text-[0.76rem] font-bold uppercase tracking-wider text-white group-hover/cat:text-[#00f0ff] transition-colors leading-tight font-mono">
                                  {cat.title}
                                </h4>
                              </Link>

                              {/* Clean list of text items */}
                              <ul className="space-y-1 list-none p-0 m-0">
                                {cat.items.map((item, iIdx) => (
                                  <li key={iIdx}>
                                    <Link
                                      to={item.path}
                                      onClick={() => setActiveDropdown(null)}
                                      className="text-[0.80rem] text-slate-300 hover:text-[#00f0ff] hover:translate-x-1 transition-all block py-1 font-normal no-underline leading-snug"
                                    >
                                      {item.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        })}
                      </div>

                      {/* Bottom Footer Ribbon with dynamic count */}
                      <div className="pt-3.5 mt-4 border-t border-white/[0.08] flex items-center justify-between flex-wrap gap-4 -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 px-6 py-3 sm:px-7 bg-[#040812]/80 rounded-b-2xl">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Sparkles size={13} className="text-[#00f0ff] flex-shrink-0" />
                          <span>Enterprise LTS tech stacks, senior engineering oversight, and 100% full IP ownership.</span>
                        </div>
                        <Link
                          to="/services"
                          onClick={() => setActiveDropdown(null)}
                          className="text-xs font-bold text-[#00f0ff] hover:text-white flex items-center gap-1.5 transition-colors no-underline group"
                        >
                          <span>Explore All {servicesCount} Detailed Services</span>
                          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* ── 2. INDUSTRIES MEGA MENU (Refined & Professional) ── */}
                  {activeDropdown === 'industries' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
                        {displayIndustries.map((ind, idx) => {
                          const Icon = ind.icon || Building2
                          return (
                            <Link
                              key={ind.id || idx}
                              to={`/industries/${ind.slug || ind.id}`}
                              onClick={() => setActiveDropdown(null)}
                              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.07] hover:border-[#00cced]/40 hover:bg-white/[0.04] transition-all group flex items-start gap-2.5 no-underline"
                            >
                              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#00f0ff] flex-shrink-0 group-hover:bg-[#00cced]/15 group-hover:border-[#00f0ff] transition-all">
                                <Icon size={16} />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-[0.82rem] font-bold text-white group-hover:text-[#00f0ff] transition-colors leading-snug">
                                  {ind.title}
                                </h4>
                                <p className="text-[0.70rem] text-slate-300 leading-relaxed mt-0.5 line-clamp-2 font-normal">
                                  {ind.desc}
                                </p>
                              </div>
                            </Link>
                          )
                        })}
                      </div>

                      {/* Bottom Ribbon */}
                      <div className="pt-3 mt-3 border-t border-white/[0.08] flex items-center justify-between flex-wrap gap-4 text-xs text-slate-300 -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 px-6 py-2.5 sm:px-7 bg-[#040812]/80 rounded-b-2xl">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                          <span>Engineered for high-compliance industry verticals, strict data governance, and high throughput.</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Link
                            to="/industries"
                            onClick={() => setActiveDropdown(null)}
                            className="font-bold text-[#00f0ff] hover:text-white flex items-center gap-1.5 transition-colors no-underline group text-xs"
                          >
                            <span>Explore All {displayIndustries.length} Verticals</span>
                            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── 3. COMPANY MEGA MENU ── */}
                  {activeDropdown === 'company' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        
                        {/* Column 1: About */}
                        <div className="md:col-span-3 space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
                            <Building2 size={15} className="text-[#00f0ff]" />
                            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#00f0ff]">
                              Studio Overview
                            </h3>
                          </div>

                          <div className="space-y-1">
                            <Link
                              to="/team"
                              onClick={() => setActiveDropdown(null)}
                              className="block py-1 text-[0.82rem] font-medium text-slate-300 hover:text-[#00f0ff] hover:translate-x-1 transition-all no-underline"
                            >
                              Founders &amp; Leadership
                            </Link>
                            <Link
                              to="/process"
                              onClick={() => setActiveDropdown(null)}
                              className="block py-1 text-[0.82rem] font-medium text-slate-300 hover:text-[#00f0ff] hover:translate-x-1 transition-all no-underline"
                            >
                              Engineering Delivery Process
                            </Link>
                            <Link
                              to="/contact"
                              onClick={() => setActiveDropdown(null)}
                              className="block py-1 text-[0.82rem] font-medium text-slate-300 hover:text-[#00f0ff] hover:translate-x-1 transition-all no-underline"
                            >
                              Contact Office
                            </Link>
                            <Link
                              to="/contact?subject=Careers"
                              onClick={() => setActiveDropdown(null)}
                              className="block py-1 text-[0.82rem] font-medium text-slate-300 hover:text-[#00f0ff] hover:translate-x-1 transition-all no-underline"
                            >
                              Careers &amp; Engineering Culture
                            </Link>
                          </div>
                        </div>

                        {/* Column 2: Blog & Resources */}
                        <div className="md:col-span-4 space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
                            <BookOpen size={15} className="text-[#1cb1f3]" />
                            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1cb1f3]">
                              Knowledge &amp; Work
                            </h3>
                          </div>

                          <div className="space-y-1">
                            <Link
                              to="/blog"
                              onClick={() => setActiveDropdown(null)}
                              className="block py-1 text-[0.82rem] font-medium text-slate-300 hover:text-[#00f0ff] hover:translate-x-1 transition-all no-underline"
                            >
                              Engineering Architecture Blog
                            </Link>
                            <Link
                              to="/work"
                              onClick={() => setActiveDropdown(null)}
                              className="block py-1 text-[0.82rem] font-medium text-slate-300 hover:text-[#00f0ff] hover:translate-x-1 transition-all no-underline"
                            >
                              Production Case Studies &amp; Results
                            </Link>
                            <Link
                              to="/blog"
                              onClick={() => setActiveDropdown(null)}
                              className="inline-flex items-center gap-1.5 py-1 text-xs font-bold text-[#00f0ff] hover:text-white transition-colors no-underline"
                            >
                              <span>Browse All Articles</span>
                              <ArrowRight size={13} />
                            </Link>
                          </div>
                        </div>

                        {/* Column 3: Featured Production Showcase */}
                        <div className="md:col-span-5">
                          <Link
                            to="/work"
                            onClick={() => setActiveDropdown(null)}
                            className="group/card block relative rounded-xl overflow-hidden border border-white/[0.10] p-4 shadow-lg transition-all hover:border-[#00f0ff] no-underline"
                            style={{
                              backgroundColor: '#091526',
                              background: 'linear-gradient(135deg, #0b1a30 0%, #050b14 100%)',
                            }}
                          >
                            <div className="relative h-28 rounded-lg overflow-hidden bg-black mb-2.5">
                              <img
                                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop"
                                alt="Global Business Mobility & AI"
                                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500 brightness-90 group-hover/card:brightness-100"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#050b14] via-transparent to-black/30" />
                              <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/85 border border-[#00cced]/40 text-[0.62rem] font-mono font-bold text-[#00f0ff]">
                                VERIFIED CLIENT WORK
                              </div>
                            </div>

                            <h4 className="text-sm font-bold text-white group-hover/card:text-[#00f0ff] transition-colors leading-tight">
                              Scalable SaaS &amp; Distributed Cloud Platforms
                            </h4>
                            <p className="text-[0.72rem] text-slate-300 leading-relaxed mt-0.5 line-clamp-2 font-normal">
                              From zero-to-one startups to distributed cloud systems serving millions of daily API transactions.
                            </p>
                          </Link>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.nav>

        {/* ════════════════════════════════════════════════════════════
            MOBILE DRAWER
        ════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="w-full max-h-[85vh] overflow-y-auto bg-[#060b14]/98 border-b border-[#00cced]/20 shadow-2xl backdrop-blur-2xl px-5 py-6 flex flex-col gap-3 md:hidden text-white"
            >
              {/* Home */}
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="text-base font-bold text-white hover:text-[#00f0ff] transition-colors no-underline py-2 border-b border-white/[0.05]"
              >
                Home
              </Link>

              {/* Services Accordion */}
              <div className="border-b border-white/[0.05] pb-2">
                <button
                  type="button"
                  onClick={() => toggleMobileAccordion('services')}
                  className="w-full flex items-center justify-between text-base font-bold text-white py-2 text-left bg-transparent border-0 cursor-pointer"
                >
                  <span>Services</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${mobileExpanded === 'services' ? 'rotate-180 text-[#00f0ff]' : 'text-slate-400'}`}
                  />
                </button>
                {mobileExpanded === 'services' && (
                  <div className="pl-3 py-2 space-y-2 border-l-2 border-[#00cced]/30 mt-1">
                    {displayCategories.map((cat, cIdx) => (
                      <div key={cIdx} className="py-1">
                        <Link
                          to={`/services/${cat.slug || cat.serviceId || cat.id}`}
                          onClick={() => setMenuOpen(false)}
                          className="block text-xs font-bold text-[#00f0ff] uppercase tracking-wider no-underline pb-1"
                        >
                          {cat.title}
                        </Link>
                        {cat.items.map((item, iIdx) => (
                          <Link
                            key={iIdx}
                            to={item.path}
                            onClick={() => setMenuOpen(false)}
                            className="block text-sm text-slate-300 hover:text-white no-underline py-0.5"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                    <Link
                      to="/services"
                      onClick={() => setMenuOpen(false)}
                      className="block text-xs font-bold text-[#00f0ff] no-underline pt-2"
                    >
                      Explore All {servicesCount} Services →
                    </Link>
                  </div>
                )}
              </div>

              {/* Industries Accordion */}
              <div className="border-b border-white/[0.05] pb-2">
                <button
                  type="button"
                  onClick={() => toggleMobileAccordion('industries')}
                  className="w-full flex items-center justify-between text-base font-bold text-white py-2 text-left bg-transparent border-0 cursor-pointer"
                >
                  <span>Industries</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${mobileExpanded === 'industries' ? 'rotate-180 text-[#00f0ff]' : 'text-slate-400'}`}
                  />
                </button>
                {mobileExpanded === 'industries' && (
                  <div className="pl-3 py-2 space-y-2 border-l-2 border-[#00cced]/30 mt-1">
                    {displayIndustries.map((ind, i) => (
                      <Link
                        key={ind.id || i}
                        to={`/industries/${ind.slug || ind.id}`}
                        onClick={() => setMenuOpen(false)}
                        className="block text-sm text-slate-300 hover:text-white no-underline py-1"
                      >
                        {ind.title}
                      </Link>
                    ))}
                    <Link
                      to="/industries"
                      onClick={() => setMenuOpen(false)}
                      className="block text-xs font-bold text-[#00f0ff] no-underline pt-2"
                    >
                      Explore All {displayIndustries.length} Verticals →
                    </Link>
                  </div>
                )}
              </div>

              {/* Portfolio */}
              <Link
                to="/work"
                onClick={() => setMenuOpen(false)}
                className="text-base font-bold text-white hover:text-[#00f0ff] transition-colors no-underline py-2 border-b border-white/[0.05]"
              >
                Portfolio
              </Link>

              {/* Company Accordion */}
              <div className="border-b border-white/[0.05] pb-2">
                <button
                  type="button"
                  onClick={() => toggleMobileAccordion('company')}
                  className="w-full flex items-center justify-between text-base font-bold text-white py-2 text-left bg-transparent border-0 cursor-pointer"
                >
                  <span>Company</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${mobileExpanded === 'company' ? 'rotate-180 text-[#00f0ff]' : 'text-slate-400'}`}
                  />
                </button>
                {mobileExpanded === 'company' && (
                  <div className="pl-3 py-2 space-y-2 border-l-2 border-[#00cced]/30 mt-1">
                    <Link to="/team" onClick={() => setMenuOpen(false)} className="block text-sm text-slate-300 hover:text-white no-underline py-1">
                      About Us &amp; Leadership
                    </Link>
                    <Link to="/process" onClick={() => setMenuOpen(false)} className="block text-sm text-slate-300 hover:text-white no-underline py-1">
                      Engineering Delivery Process
                    </Link>
                    <Link to="/blog" onClick={() => setMenuOpen(false)} className="block text-sm text-slate-300 hover:text-white no-underline py-1">
                      Engineering Blog
                    </Link>
                    <Link to="/contact" onClick={() => setMenuOpen(false)} className="block text-sm text-slate-300 hover:text-white no-underline py-1">
                      Contact Us
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile CTAs */}
              <div className="pt-4 flex flex-col gap-2.5">
                <Link
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary text-sm w-full justify-center no-underline"
                >
                  Let's Work Together →
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="btn-ghost text-xs w-full justify-center text-[#00f0ff] no-underline"
                >
                  Request a Quote
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Full-Screen Dark Scrim Backdrop (Hovering or clicking off immediately closes dropdown) */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[180] pointer-events-auto"
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current)
              setActiveDropdown(null)
            }}
            onClick={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current)
              setActiveDropdown(null)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
