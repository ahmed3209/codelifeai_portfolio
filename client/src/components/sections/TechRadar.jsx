import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Layout, Server, Smartphone, Cloud, Database, Sparkles, CheckCircle2, Zap } from 'lucide-react'

const CATEGORIES = [
  {
    id: 'ai',
    name: 'AI & Neural Agents',
    icon: Cpu,
    accent: '#00d4f5',
    desc: 'Autonomous AI agents, enterprise LLM pipelines, RAG systems, and smart workflows.',
    items: [
      { name: 'Gemini 2.0 Flash & Pro', role: 'Multimodal AI & Reasoning', mastery: '98%', highlight: '1,500 req/day API' },
      { name: 'Claude 3.5 Sonnet & Haiku', role: 'Code Gen & Deep Logic', mastery: '97%', highlight: '200k Context' },
      { name: 'OpenAI GPT-4o & Assistants', role: 'Function Calling & Audio', mastery: '99%', highlight: 'Sub-second' },
      { name: 'RAG & Vector Retrieval', role: 'Enterprise Knowledge Bases', mastery: '95%', highlight: 'Pinecone / Qdrant' },
      { name: 'LangChain & LlamaIndex', role: 'Autonomous Agent Loops', mastery: '94%', highlight: 'Tool Augmentation' },
      { name: 'Local Ollama & Open Models', role: 'On-Premise Privacy AI', mastery: '92%', highlight: 'DeepSeek / Llama 3' },
    ]
  },
  {
    id: 'frontend',
    name: 'Frontend & UI/UX',
    icon: Layout,
    accent: '#a855f7',
    desc: 'Breathtaking 60fps web applications, micro-interactions, and design systems.',
    items: [
      { name: 'React 19 & Next.js 15', role: 'SSR & Server Components', mastery: '99%', highlight: 'Instant Page Load' },
      { name: 'TypeScript', role: 'Type-Safe Architecture', mastery: '99%', highlight: 'Zero Runtime Errors' },
      { name: 'TailwindCSS & Vanilla CSS', role: 'Adaptive Micro-Design', mastery: '98%', highlight: 'Fluid Glassmorphism' },
      { name: 'Three.js & WebGL', role: '3D Graphics & Shaders', mastery: '93%', highlight: 'Hardware Accelerated' },
      { name: 'Framer Motion', role: 'Physics-Based Spring Physics', mastery: '96%', highlight: 'Fluid 60 FPS' },
      { name: 'Vite & Turbopack', role: 'High-Velocity Bundling', mastery: '98%', highlight: '< 100ms HMR' },
    ]
  },
  {
    id: 'backend',
    name: 'Backend & High-Scale APIs',
    icon: Server,
    accent: '#38bdf8',
    desc: 'High-throughput microservices, real-time WebSockets, and secure API gateways.',
    items: [
      { name: 'Node.js & Express / NestJS', role: 'Event-Driven Microservices', mastery: '98%', highlight: 'High Concurrency' },
      { name: 'Python (FastAPI & Django)', role: 'AI Backends & Data Pipelines', mastery: '96%', highlight: 'Async Execution' },
      { name: 'Go (Golang)', role: 'Ultra-Low Latency Microservices', mastery: '92%', highlight: '< 10ms Latency' },
      { name: 'GraphQL & REST APIs', role: 'Declarative Data Layer', mastery: '97%', highlight: 'Zero Overfetching' },
      { name: 'WebSockets & SSE', role: 'Real-Time Bi-Directional Feeds', mastery: '95%', highlight: 'Live Streaming' },
      { name: 'JWT, OAuth2 & Auth0', role: 'Stateless Secure Auth', mastery: '99%', highlight: 'HttpOnly Sessions' },
    ]
  },
  {
    id: 'mobile',
    name: 'Mobile Engineering',
    icon: Smartphone,
    accent: '#22c55e',
    desc: 'Native iOS & Android mobile apps engineered for speed, offline storage, and elegance.',
    items: [
      { name: 'Flutter & Dart', role: 'Cross-Platform Native Apps', mastery: '97%', highlight: '60/120 FPS Native' },
      { name: 'React Native & Expo', role: 'Universal Web/Mobile Apps', mastery: '95%', highlight: 'Code Sharing' },
      { name: 'iOS Swift & Swift UI', role: 'Native Apple Platform Feats', mastery: '90%', highlight: 'WidgetKit / Health' },
      { name: 'Android Kotlin & Jetpack', role: 'Native Android Performance', mastery: '90%', highlight: 'Material You' },
      { name: 'Offline Sync (SQLite/Watermelon)', role: 'Zero-Latency Local DB', mastery: '96%', highlight: 'Offline First' },
      { name: 'App Store / Play Store CI', role: 'Automated Deployments', mastery: '98%', highlight: 'Fastlane / OTA' },
    ]
  },
  {
    id: 'cloud',
    name: 'Cloud & Infrastructure',
    icon: Cloud,
    accent: '#f59e0b',
    desc: 'Resilient cloud architecture, automated CI/CD pipelines, and zero-downtime clusters.',
    items: [
      { name: 'AWS (ECS, Lambda, S3, RDS)', role: 'Enterprise Cloud Scalability', mastery: '96%', highlight: 'Auto-Scaling' },
      { name: 'Google Cloud Platform (GCP)', role: 'AI & Managed Compute', mastery: '95%', highlight: 'Cloud Run' },
      { name: 'Docker & Kubernetes', role: 'Containerized Microservices', mastery: '94%', highlight: 'Self-Healing' },
      { name: 'Cloudflare Workers & CDN', role: 'Global Edge Execution', mastery: '98%', highlight: '< 30ms Worldwide' },
      { name: 'GitHub Actions & CI/CD', role: 'Automated Test & Deploy', mastery: '99%', highlight: 'Zero Downtime' },
      { name: 'Nginx, Caddy & Reverse Proxies', role: 'SSL & Load Balancing', mastery: '97%', highlight: 'High Security' },
    ]
  },
  {
    id: 'database',
    name: 'Databases & Storage',
    icon: Database,
    accent: '#ec4899',
    desc: 'ACID-compliant relational engines, distributed caches, and vector databases.',
    items: [
      { name: 'PostgreSQL & Supabase', role: 'Relational ACID Data & Row Security', mastery: '98%', highlight: 'High Reliability' },
      { name: 'Redis', role: 'In-Memory Cache & Message Broker', mastery: '97%', highlight: 'Sub-millisecond' },
      { name: 'MongoDB', role: 'Flexible Document Schema', mastery: '95%', highlight: 'Sharded Clusters' },
      { name: 'LibSQL & SQLite', role: 'Edge-Replicated Embedded DB', mastery: '96%', highlight: 'Ultra Fast' },
      { name: 'Pinecone & Weaviate', role: 'High-Dimensional Vector Search', mastery: '93%', highlight: 'Cosine Similarity' },
      { name: 'AWS S3 & Cloud Storage', role: 'Object Storage & Media Delivery', mastery: '99%', highlight: '11 9s Durability' },
    ]
  },
]

export default function TechRadar() {
  const [activeTab, setActiveTab] = useState('ai')
  const currentCategory = CATEGORIES.find(c => c.id === activeTab) || CATEGORIES[0]

  return (
    <section className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00d4f5]/10 border border-[#00d4f5]/25 text-[0.68rem] font-bold uppercase tracking-widest text-[#00d4f5] mb-4">
          <Sparkles size={12} /> Engineering Stack
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-bb-white tracking-tight leading-tight">
          Battle-Tested Technologies, <br />
          <span className="bg-gradient-to-r from-[#00d4f5] via-[#38bdf8] to-[#a855f7] bg-clip-text text-transparent">
            Built for Extreme Speed &amp; Scale
          </span>
        </h2>
        <p className="text-bb-muted text-sm sm:text-base mt-4 leading-relaxed">
          We don't use legacy shortcuts. Every system we ship is engineered using cutting-edge, type-safe, and highly optimized stacks designed for high performance.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-10">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon
          const isActive = cat.id === activeTab
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? 'bg-white/[0.08] border border-white/[0.18] text-white shadow-xl shadow-black/40'
                  : 'bg-white/[0.02] border border-white/[0.05] text-bb-muted hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: isActive ? `${cat.accent}20` : 'transparent',
                  color: isActive ? cat.accent : 'currentColor',
                }}
              >
                <Icon size={13} />
              </div>
              <span>{cat.name}</span>
            </button>
          )
        })}
      </div>

      {/* Active Category Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Category Banner */}
          <div className="bg-[#0b0b1a]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${currentCategory.accent}25, rgba(255,255,255,0.02))`,
                  border: `1px solid ${currentCategory.accent}40`,
                  color: currentCategory.accent,
                }}
              >
                <currentCategory.icon size={24} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-bb-white">
                  {currentCategory.name}
                </h3>
                <p className="text-xs sm:text-sm text-bb-muted mt-1 leading-relaxed max-w-2xl">
                  {currentCategory.desc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-bb-muted">
              <Zap size={13} className="text-[#00d4f5]" /> Production Verified
            </div>
          </div>

          {/* Grid of Tech Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCategory.items.map((item, idx) => (
              <div
                key={idx}
                className="group relative bg-[#090916]/70 border border-white/[0.06] hover:border-white/[0.18] rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-bb-white group-hover:text-[#00d4f5] transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[0.72rem] text-bb-muted mt-0.5 font-medium">
                      {item.role}
                    </p>
                  </div>
                  <span
                    className="text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: `${currentCategory.accent}12`,
                      color: currentCategory.accent,
                      border: `1px solid ${currentCategory.accent}25`,
                    }}
                  >
                    {item.highlight}
                  </span>
                </div>

                {/* Skill bar */}
                <div className="space-y-1 mt-4 pt-3 border-t border-white/[0.04]">
                  <div className="flex items-center justify-between text-[0.65rem] font-mono text-bb-muted">
                    <span>Engineering Depth</span>
                    <span className="font-bold text-white/90">{item.mastery}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: item.mastery,
                        background: `linear-gradient(90deg, ${currentCategory.accent}, #00d4f5)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
