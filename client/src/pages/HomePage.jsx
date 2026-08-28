import { lazy, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../lib/api'
import PageMeta             from '../components/PageMeta'
import HeroSection          from '../components/sections/HeroSection'
import TrustMarquee         from '../components/sections/TrustMarquee'
import ServicesSection      from '../components/sections/ServicesSection'
import PromoTeaser          from '../components/sections/PromoTeaser'
import BlogPreviewSection   from '../components/sections/BlogPreviewSection'
import FoundersSection      from '../components/sections/FoundersSection'
import TestimonialsSection  from '../components/sections/TestimonialsSection'
import CTABanner            from '../components/sections/CTABanner'

const ThreeBackground = lazy(() => import('../components/ThreeBackground'))

const DEFAULT_SERVICES = [
  {
    id: 1,
    icon: '⚡',
    title: 'Web Application Development',
    short_desc: 'High-performance React, Next.js, and Node.js applications built for scale and sub-second page loads.',
    features: JSON.stringify(['Custom Next.js & React Frontends', 'Scalable Node/FastAPI Microservices', 'Real-time WebSocket Architectures', 'Edge Caching & Performance']),
    stack: JSON.stringify(['React', 'Next.js', 'Node.js', 'PostgreSQL', 'TailwindCSS']),
    show_on_home: 1,
    sort_order: 1,
  },
  {
    id: 2,
    icon: '📱',
    title: 'Mobile App Engineering',
    short_desc: 'Cross-platform iOS and Android applications with Flutter delivering fluid 120 FPS native performance.',
    features: JSON.stringify(['Native 120 FPS Fluid Animations', 'Offline-first SQLite & Sync', 'Encrypted Biometric Auth', 'App Store & Play Store CI/CD']),
    stack: JSON.stringify(['Flutter', 'Dart', 'Firebase', 'SQLite', 'WebRTC']),
    show_on_home: 1,
    sort_order: 2,
  },
  {
    id: 3,
    icon: '🧠',
    title: 'Custom AI Agents & Automation',
    short_desc: 'Autonomous multi-agent workflows, fine-tuned LLMs, and Retrieval-Augmented Generation (RAG) pipelines.',
    features: JSON.stringify(['Autonomous Task Execution', 'Context-Aware RAG Search', 'Multi-Model Routing (GPT/Claude/Gemini)', 'Document Intelligence & OCR']),
    stack: JSON.stringify(['Python', 'LangChain', 'OpenAI', 'Gemini 2.0', 'Pinecone']),
    show_on_home: 1,
    sort_order: 3,
  },
  {
    id: 4,
    icon: '☁️',
    title: 'Cloud Architecture & DevOps',
    short_desc: 'Zero-downtime Kubernetes deployments, automated CI/CD pipelines, and high-availability cloud setups.',
    features: JSON.stringify(['Zero-Downtime Deployment Pipelines', 'Kubernetes & Docker Containerization', 'AWS & GCP Infrastructure as Code', 'Prometheus & Grafana Monitoring']),
    stack: JSON.stringify(['Kubernetes', 'Docker', 'AWS', 'Terraform', 'GitHub Actions']),
    show_on_home: 1,
    sort_order: 4,
  },
]

const DEFAULT_FOUNDERS = [
  {
    id: 1,
    name: 'Muhammad Ahmed',
    role: 'Co-Founder & CEO',
    bio: 'Passionate software architect and product strategist with deep expertise in scalable full-stack web platforms and engineering leadership.',
    initials: 'MA',
    photo_url: '',
    avatar_bg: 'linear-gradient(135deg,#00d4f5,#0072b1)',
    tags: JSON.stringify(['Product Architecture', 'Full-Stack Systems', 'Cloud Scale']),
    show_on_home: 1,
    sort_order: 1,
  },
  {
    id: 2,
    name: 'Anas Waheed',
    role: 'Co-Founder & CTO',
    bio: 'Systems engineer and AI specialist driving core technology, distributed backend architectures, and machine learning integrations.',
    initials: 'AW',
    photo_url: '',
    avatar_bg: 'linear-gradient(135deg,#7c3aed,#00d4f5)',
    tags: JSON.stringify(['AI Engineering', 'Distributed Backend', 'High-Performance Mobile']),
    show_on_home: 1,
    sort_order: 2,
  },
]

import { DEFAULT_BLOGS } from '../data/defaultBlogs'

const DEFAULT_TESTIMONIALS = [
  { name: 'Ahmed Al-Rashid', role: 'Founder, FinTrack', avatar: 'AR', bg: 'linear-gradient(135deg, #00d4f5, #0099bb)', rating: 5, quote: "CodeLifeAI delivered our banking dashboard in record time — clean code, beautiful UI, and zero post-launch issues. They didn't just build what we asked; they made it better than we imagined." },
  { name: 'Sarah Mitchell', role: 'CTO, ShopEase Inc.', avatar: 'SM', bg: 'linear-gradient(135deg, #a855f7, #7c3aed)', rating: 5, quote: "Working with CodeLifeAI felt like having a senior in-house engineering team. Communication was seamless, timelines were respected, and the final product drove a 40% increase in our conversion rate." },
  { name: 'Dr. Iman Yousuf', role: 'CEO, MedSync Health', avatar: 'IY', bg: 'linear-gradient(135deg, #22c55e, #16a34a)', rating: 5, quote: "Our medical app needed to be both beautiful and HIPAA-compliant. CodeLifeAI nailed it. The Flutter development was exceptional — users literally rate us 4.9 stars on the Play Store." },
  { name: 'James Thornton', role: 'Head of Product, LogiFlow', avatar: 'JT', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', rating: 5, quote: "We cut operational costs by 35% after CodeLifeAI rebuilt our supply chain platform. The Python data pipelines they built process 2 million records daily without a single failure. Remarkable work." },
]

const DEFAULT_CONTENT = {
  hero_badge: "We build what's next",
  hero_title: 'We Create',
  hero_cycling_words: 'Software., Products., Experiences., AI Systems.',
  hero_subtitle: 'CodeLifeAI is a high-velocity software engineering studio crafting next-generation web applications, mobile products, and custom AI agents for ambitious teams worldwide.',
  section_trust_marquee: '1',
  section_services: '1',
  section_promo_teaser: '1',
  section_blog_preview: '1',
  section_testimonials: '1',
  section_founders: '1',
  section_cta_banner: '1',
}

const DEFAULT_SITE_DATA = {
  services: DEFAULT_SERVICES,
  founders: DEFAULT_FOUNDERS,
  blogs: DEFAULT_BLOGS,
  testimonials: DEFAULT_TESTIMONIALS,
  content: DEFAULT_CONTENT,
  activePromo: null,
  activePromos: [],
  liveProducts: [],
}

export default function HomePage() {
  const { data: siteData } = useQuery({
    queryKey: ['site-data'],
    queryFn:  () => publicApi.getSiteData().then(r => r.data),
    staleTime: 1000 * 60 * 5, // 5 min client cache
    placeholderData: (prev) => prev || DEFAULT_SITE_DATA,
  })

  const content      = siteData?.content && Object.keys(siteData.content).length > 0 ? siteData.content : DEFAULT_CONTENT
  const services     = siteData?.services && siteData.services.length > 0 ? siteData.services : DEFAULT_SERVICES
  const founders     = siteData?.founders && siteData.founders.length > 0 ? siteData.founders : DEFAULT_FOUNDERS
  const blogs        = siteData?.blogs && siteData.blogs.length > 0 ? siteData.blogs : DEFAULT_BLOGS
  const testimonials = siteData?.testimonials && siteData.testimonials.length > 0 ? siteData.testimonials : DEFAULT_TESTIMONIALS
  const activePromo  = siteData?.activePromo || null
  const liveProducts = siteData?.liveProducts || []

  // Section visibility toggles
  const showMarquee      = content.section_trust_marquee !== '0'
  const showServices     = content.section_services !== '0' && services.length > 0
  const showPromo        = content.section_promo_teaser !== '0' && (activePromo || (siteData?.activePromos && siteData.activePromos.length > 0))
  const showBlogs        = content.section_blog_preview !== '0' && blogs.length > 0
  const showTestimonials = content.section_testimonials !== '0' && testimonials.length > 0
  const showFounders     = content.section_founders !== '0' && founders.length > 0
  const showCTA          = content.section_cta_banner !== '0'

  return (
    <>
      <PageMeta
        path="/"
        title="CodeLifeAI — We Build What's Next | Web, Mobile &amp; AI Engineering Studio"
        description="CodeLifeAI is a high-velocity software studio crafting next-generation digital products — scalable web applications, mobile apps, custom AI agents, and enterprise cloud infrastructure."
        keywords="codelifeai, software studio, software development company, web development, mobile app development, ui ux design, ai integration, cloud devops, react, nextjs, flutter, full stack development"
      />

      {/* Subtle, High-Contrast 3D WebGL background */}
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>

      {/* 1. Hero Section */}
      <HeroSection content={content} promo={activePromo} liveProducts={liveProducts} />

      {/* 2. Trust & Engineering Metrics Ticker */}
      {showMarquee && <TrustMarquee />}

      {/* 3. Core Services Preview */}
      {showServices && <ServicesSection services={services} />}

      {/* 4. Active Promo / Launch Teaser */}
      {showPromo && (
        <PromoTeaser promo={activePromo} promos={siteData?.activePromos || (activePromo ? [activePromo] : [])} />
      )}

      {/* 5. Latest Engineering Insights & Blog Articles */}
      {showBlogs && <BlogPreviewSection blogs={blogs} />}

      {/* 6. Verified Client Testimonials */}
      {showTestimonials && <TestimonialsSection testimonials={testimonials} />}

      {/* 7. Founders & Senior Engineering Leadership */}
      {showFounders && <FoundersSection founders={founders} />}

      {/* 8. Bottom Conversion CTA Banner */}
      {showCTA && <CTABanner />}
    </>
  )
}
