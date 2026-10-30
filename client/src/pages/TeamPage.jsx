import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  ArrowUpRight, Linkedin, Github, MapPin, 
  Target, Compass, ShieldCheck, Sparkles, Users, 
  CheckCircle2, ArrowRight
} from 'lucide-react'
import { publicApi, resolveApiUrl } from '../lib/api'
import { formatExternalUrl } from '../lib/url'
import PageMeta from '../components/PageMeta'

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState('mission')

  // Fetch ALL team members (not just the 2 on homepage)
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['all-team-members'],
    queryFn: async () => {
      try {
        const res = await publicApi.getFounders()
        if (res?.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          return res.data.data
        }
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          return res.data
        }
      } catch (e) {
        console.warn('Failed to fetch /api/founders, falling back to siteData:', e)
      }
      const site = await publicApi.getSiteData()
      return site?.data?.allFounders || site?.data?.founders || []
    },
  })

  // Find primary founder photo for "Our Journey" section, fallback to Anas or Ahmed
  const primaryFounder = teamMembers.find(m => m.photo_url) || teamMembers[0] || {}

  const tabContents = {
    mission: {
      title: 'Engineering Purposeful Digital Impact',
      desc: 'Our mission is to deliver intelligent technology solutions and structured business services that help organizations automate operations, improve efficiency, and grow sustainably in competitive global markets.',
      highlight: 'We focus on building AI-driven systems, scalable software solutions, and performance-oriented digital platforms that create measurable business impact and long-term success.',
      points: [
        'High-velocity delivery without technical debt',
        'Direct architectural partnership with founders',
        'Autonomous AI systems engineered for production ROI'
      ]
    },
    vision: {
      title: 'Architecting the Future of Software & AI',
      desc: 'To become the world’s most trusted high-velocity engineering studio, recognized for turning complex product visions into resilient, scalable, and autonomous software platforms.',
      highlight: 'We envision a future where software builds upon self-learning workflows, enabling ambitious companies to out-innovate larger competitors with agile, intelligent systems.',
      points: [
        'Global remote delivery with Silicon Valley standards',
        'Pioneering agentic AI and hybrid vector systems',
        'Empowering startups to ship production products in weeks'
      ]
    },
    values: {
      title: 'Integrity, Velocity & Architectural Rigor',
      desc: 'We operate with relentless honesty, deep technical pride, and a builder-first mentality. We don’t just write code; we take holistic ownership of product success.',
      highlight: 'Technology should solve real problems — not create new ones. Every line of code, database schema, and deployment pipeline is crafted with long-term resilience in mind.',
      points: [
        'Radical transparency in timelines & roadmaps',
        'Zero tolerance for fragile hacks or bloated dependencies',
        'Client-first ownership — we treat your product as our own'
      ]
    }
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#060b14] text-slate-200 overflow-hidden">
      <PageMeta
        path="/team"
        title="Leadership & Visionaries — CodeLifeAI"
        description="Meet the founders, software architects, and visionaries driving engineering excellence, autonomous AI, and high-velocity digital products at CodeLifeAI."
        keywords="codelifeai team, software founders, anas waheed, muhammad ahmed, software architect, engineering leaders, cto for hire, ai developers"
      />

      {/* ── 1. OUR JOURNEY SECTION ────────────────────────────────────────────── */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-12 max-w-[1240px] mx-auto">
        {/* Ambient radial glow */}
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] rounded-full -translate-y-1/2 bg-cyan-500/5 blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-[#00cced]/15 border border-[#00cced]/30 text-[#00f0ff]">
              <span>●</span> Our Story & Philosophy
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              Our <span className="text-gradient">Journey</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Explore our story, innovation, and commitment to delivering world-class digital solutions. <strong>CodeLifeAI</strong> was grown and developed as a pioneer software engineering studio with the vision to change the way that business firms work through the incorporation of advanced technology.
            </p>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Our mission right from our start has been to offer quality and efficient software engineering, scalable cloud infrastructure, and autonomous AI agents to solve all operational processes — with uncompromising speed and craftsmanship.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#00f0ff]">99.9%</p>
                <p className="text-xs text-slate-400 mt-0.5">Uptime & Reliability</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">High-Velocity</p>
                <p className="text-xs text-slate-400 mt-0.5">Weekly Sprints</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-cyan-300">Global</p>
                <p className="text-xs text-slate-400 mt-0.5">Remote Delivery</p>
              </div>
            </div>
          </motion.div>

          {/* Right Circular / Studio Portrait Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative">
              {/* Outer decorative glowing ring */}
              <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-transparent blur-xl pointer-events-none" />
              
              {/* Circular portrait container */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full p-2 bg-gradient-to-b from-[#00cced]/40 via-cyan-900/30 to-[#091527] shadow-2xl shadow-cyan-950/50">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 relative">
                  {primaryFounder.photo_url ? (
                    <img
                      src={resolveApiUrl(primaryFounder.photo_url)}
                      alt={primaryFounder.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-[#060b14] text-white">
                      <Users size={56} className="text-cyan-400 opacity-60 mb-2" />
                      <span className="text-xs font-mono tracking-widest uppercase text-cyan-300">CodeLifeAI Studio</span>
                    </div>
                  )}
                  {/* Subtle inner dark vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060b14]/50 to-transparent pointer-events-none" />
                </div>

                {/* Floating Badge */}
                <div className="absolute bottom-4 right-2 sm:right-4 px-3.5 py-1.5 rounded-full bg-[#091527]/90 backdrop-blur-md border border-[#00cced]/30 shadow-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-white">Engineered to Scale</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. MISSION / VISION / VALUES SECTION (Interactive Tabs) ───────────── */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-12 max-w-[1240px] mx-auto border-t border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Interactive Tab Buttons & Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tabs Header */}
            <div className="flex items-center gap-3 sm:gap-6 border-b border-slate-800 pb-3">
              {[
                { id: 'mission', label: 'Mission', icon: Target },
                { id: 'vision',  label: 'Vision',  icon: Compass },
                { id: 'values',  label: 'Values',  icon: ShieldCheck }
              ].map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 text-base sm:text-xl font-bold transition-all relative pb-2 ${
                      isActive 
                        ? 'text-[#00f0ff]' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-[#00f0ff]' : 'text-slate-500'} />
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00f0ff] to-[#00cced]"
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Dynamic Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {tabContents[activeTab].title}
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {tabContents[activeTab].desc}
                </p>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed border-l-2 border-[#00cced]/40 pl-3.5 italic">
                  {tabContents[activeTab].highlight}
                </p>

                <div className="space-y-2 pt-2">
                  {tabContents[activeTab].points.map((pt, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
                      <CheckCircle2 size={16} className="text-[#00f0ff] flex-shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Mission Graphic Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl p-6 sm:p-8 bg-[#091527]/90 border border-[#00cced]/25 shadow-xl shadow-black/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">Core Architecture</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">v2.5 Standard</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex items-start gap-3">
                  <Sparkles size={20} className="text-[#00f0ff] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Autonomous Intelligence</h4>
                    <p className="text-xs text-slate-400 mt-0.5">RAG pipelines, custom agents, and high-precision automation.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex items-start gap-3">
                  <ShieldCheck size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Production Hardened</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Automated CI/CD health checks and zero-downtime deployments.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex items-start gap-3">
                  <Target size={20} className="text-cyan-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Full-Stack Velocity</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Next.js 15, Flutter 3, and high-throughput databases.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. MEET THE VISIONARIES SECTION (Full-Height Portrait Grid) ──────── */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-12 max-w-[1240px] mx-auto border-t border-slate-800/80">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="section-number mb-1 block">03 / Executive Team</p>
          <div className="section-label inline-flex">Leadership & Engineers</div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-1">
            Meet The <span className="text-gradient">Visionaries</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
            Our team consists of experienced developers, engineers, designers, and technology specialists dedicated to building AI-powered solutions, web platforms, and mobile applications that drive business success.
          </p>
        </div>

        {/* Visionaries Grid (Showing ALL Team Members with Tall Full-Height Portraits) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="h-full"
            >
              <VisionaryCard member={member} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 4. HAVE A MIND TO BE A PARTNER? (CTA BANNER) ─────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-12 max-w-[1240px] mx-auto">
        <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-b from-[#091527] to-[#040811] border border-[#00cced]/25 shadow-2xl text-center relative overflow-hidden group">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 blur-[90px] pointer-events-none" />

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-[#00cced]/15 border border-[#00cced]/30 text-[#00f0ff] mb-4">
            Partner With CodeLifeAI
          </span>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Have a Mind to be a Partner?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-3 leading-relaxed">
            Transform your operations with intelligent AI automation and robust digital products. Let's build smart systems that save time, reduce costs, and improve efficiency across your business.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm tracking-wide bg-gradient-to-r from-[#00f0ff] via-[#1cb1f3] to-[#00cced] text-black shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/50 hover:scale-105 transition-all"
            >
              <span>LET'S WORK TOGETHER</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

function VisionaryCard({ member }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl overflow-hidden h-[420px] sm:h-[450px] bg-[#091527] border border-[#00cced]/25 hover:border-[#00cced]/60 transition-all duration-500 group shadow-xl shadow-black/60 flex flex-col justify-end"
    >
      {/* Photo Background (Full Height) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#060b14]">
        {member.photo_url ? (
          <img
            src={resolveApiUrl(member.photo_url)}
            alt={member.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-108"
          />
        ) : (
          /* Executive Studio Silhouette Fallback for members without uploaded photo */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#0e213d] via-[#091527] to-[#040811] relative">
            {/* Ambient spotlight */}
            <div className="absolute top-1/3 w-36 h-36 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />
            
            <div className="w-24 h-24 rounded-full border-2 border-cyan-400/40 bg-cyan-950/60 flex items-center justify-center text-3xl font-extrabold text-[#00f0ff] shadow-xl shadow-cyan-950/80 mb-3 group-hover:scale-105 transition-transform duration-500">
              {member.initials || member.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <span className="text-xs font-mono tracking-wider text-cyan-300 uppercase">
              {member.role || 'Software Engineer'}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Gradient Fade (Zensol Style) */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#060b14] via-[#060b14]/80 to-transparent pointer-events-none" />

      {/* Top Floating Badge (Optional status / Role) */}
      <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/10 text-[0.68rem] font-semibold text-emerald-400 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Core Team</span>
      </div>

      {/* Top-Right LinkedIn Button */}
      {member.linkedin_url && (
        <a
          href={formatExternalUrl(member.linkedin_url)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-xl bg-black/60 hover:bg-[#0077b5] backdrop-blur-md border border-white/15 hover:border-[#0077b5] text-cyan-300 hover:text-white flex items-center justify-center transition-all shadow-lg hover:scale-110 z-10"
          title={`Connect with ${member.name} on LinkedIn`}
        >
          <Linkedin size={14} className="fill-current" />
        </a>
      )}

      {/* Bottom Information (Floats gracefully over the dark fade) */}
      <div className="relative p-5 sm:p-6 z-10 space-y-1">
        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight group-hover:text-[#00f0ff] transition-colors">
          {member.name}
        </h3>
        
        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-400">
          {member.role}
        </p>

        {member.location && (
          <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-0.5">
            <MapPin size={10} className="text-cyan-400" /> {member.location}
          </p>
        )}

        {/* Bio on hover (smooth expand) */}
        {member.bio && (
          <p className="text-xs text-slate-300 line-clamp-2 pt-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {member.bio}
          </p>
        )}
      </div>
    </div>
  )
}
