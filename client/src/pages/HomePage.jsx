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
  const founders     = siteData?.founders     || []
  const blogs        = siteData?.blogs        || []
  const testimonials = (siteData?.testimonials && siteData.testimonials.length > 0) ? siteData.testimonials : DEFAULT_TESTIMONIALS
  const activePromo  = siteData?.activePromo  || null
  const liveProducts = siteData?.liveProducts || []

  // Granular section visibility toggles controlled from Admin Panel
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
