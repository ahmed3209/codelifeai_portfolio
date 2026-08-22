import { lazy, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../lib/api'
import PageMeta             from '../components/PageMeta'
import HeroSection          from '../components/sections/HeroSection'
import TrustMarquee         from '../components/sections/TrustMarquee'
import ServicesSection      from '../components/sections/ServicesSection'
import TechRadar            from '../components/sections/TechRadar'
import PromoTeaser          from '../components/sections/PromoTeaser'
import WorkSection          from '../components/sections/WorkSection'
import ProjectEstimator     from '../components/sections/ProjectEstimator'
import ProcessSection       from '../components/sections/ProcessSection'
import FoundersSection      from '../components/sections/FoundersSection'
import TestimonialsSection  from '../components/sections/TestimonialsSection'
import FAQSection           from '../components/sections/FAQSection'
import CTABanner            from '../components/sections/CTABanner'

const ThreeBackground = lazy(() => import('../components/ThreeBackground'))

const DEFAULT_TESTIMONIALS = [
  { name: 'Ahmed Al-Rashid', role: 'Founder, FinTrack', avatar: 'AR', bg: 'linear-gradient(135deg, #00d4f5, #0099bb)', rating: 5, quote: "CodeLifeAI delivered our banking dashboard in record time — clean code, beautiful UI, and zero post-launch issues. They didn't just build what we asked; they made it better than we imagined." },
  { name: 'Sarah Mitchell', role: 'CTO, ShopEase Inc.', avatar: 'SM', bg: 'linear-gradient(135deg, #a855f7, #7c3aed)', rating: 5, quote: "Working with CodeLifeAI felt like having a senior in-house engineering team. Communication was seamless, timelines were respected, and the final product drove a 40% increase in our conversion rate." },
  { name: 'Dr. Iman Yousuf', role: 'CEO, MedSync Health', avatar: 'IY', bg: 'linear-gradient(135deg, #22c55e, #16a34a)', rating: 5, quote: "Our medical app needed to be both beautiful and HIPAA-compliant. CodeLifeAI nailed it. The Flutter development was exceptional — users literally rate us 4.9 stars on the Play Store." },
  { name: 'James Thornton', role: 'Head of Product, LogiFlow', avatar: 'JT', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', rating: 5, quote: "We cut operational costs by 35% after CodeLifeAI rebuilt our supply chain platform. The Python data pipelines they built process 2 million records daily without a single failure. Remarkable work." },
]

export default function HomePage() {
  const { data: siteData } = useQuery({
    queryKey: ['site-data'],
    queryFn:  () => publicApi.getSiteData().then(r => r.data),
  })

  const content      = siteData?.content      || {}
  const services     = siteData?.services     || []
  const projects     = siteData?.projects     || []
  const founders     = siteData?.founders     || []
  const process      = siteData?.process      || []
  const faqs         = siteData?.faqs         || []
  const testimonials = (siteData?.testimonials && siteData.testimonials.length > 0) ? siteData.testimonials : DEFAULT_TESTIMONIALS
  const activePromo  = siteData?.activePromo  || null
  const liveProducts = siteData?.liveProducts || []

  return (
    <>
      <PageMeta
        path="/"
        title="CodeLifeAI — We Build What's Next | Web, Mobile & AI Engineering"
        description="CodeLifeAI is a high-velocity software studio crafting next-generation digital products — scalable web applications, mobile apps, custom AI agents, and enterprise cloud infrastructure."
        keywords="codelifeai, software studio, software development company, web development, mobile app development, ui ux design, ai integration, cloud devops, react, nextjs, flutter, full stack development, AI agents"
      />

      {/* Interactive 3D WebGL background (homepage only, lazy-loaded) */}
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>

      {/* 1. Hero Section */}
      <HeroSection content={content} promo={activePromo} liveProducts={liveProducts} />

      {/* 2. Trust & Engineering Metrics Ticker */}
      <TrustMarquee />

      {/* 3. Core Services Matrix */}
      {services.length > 0 && (
        <ServicesSection services={services} />
      )}

      {/* 4. Active Promo / Launch Countdown Slider */}
      <PromoTeaser promo={activePromo} promos={siteData?.activePromos || (activePromo ? [activePromo] : [])} />

      {/* 5. Interactive Engineering Tech Radar */}
      <TechRadar />

      {/* 6. Featured Case Studies & Live Products */}
      {projects.length > 0 && (
        <WorkSection projects={projects} />
      )}

      {/* 7. Interactive Project Cost & Timeline Estimator */}
      <ProjectEstimator />

      {/* 8. 4-Step Agile Delivery Protocol */}
      {process.length > 0 && (
        <ProcessSection steps={process} />
      )}

      {/* 9. Founders & Engineering Leadership */}
      {founders.length > 0 && (
        <FoundersSection founders={founders} />
      )}

      {/* 10. Verified Client Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* 11. Interactive FAQ Accordion with Live Search */}
      <FAQSection faqs={faqs} />

      {/* 12. Bottom Conversion CTA Banner */}
      <CTABanner />
    </>
  )
}
