import { lazy, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../lib/api'
import PageMeta             from '../components/PageMeta'
import HeroSection          from '../components/sections/HeroSection'
import PromoTeaser          from '../components/sections/PromoTeaser'
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
  const testimonials = (siteData?.testimonials && siteData.testimonials.length > 0) ? siteData.testimonials : DEFAULT_TESTIMONIALS
  const activePromo  = siteData?.activePromo  || null
  const liveProducts = siteData?.liveProducts || []

  return (
    <>
      <PageMeta
        path="/"
        description="CodeLifeAI is a software studio crafting elegant digital products — modern web apps, mobile experiences, AI integrations, and cloud infrastructure built by senior engineers."
        keywords="codelifeai, software studio, software development company, web development, mobile app development, ui ux design, ai integration, cloud devops, react, nextjs, flutter, full stack development"
      />

      {/* Interactive 3D WebGL background (homepage only, lazy-loaded) */}
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>

      {/* Hero */}
      <HeroSection content={content} promo={activePromo} liveProducts={liveProducts} />

      {/* Active promo teaser (hidden when no active promotion) */}
      <PromoTeaser promo={activePromo} />

      {/* Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* CTA Banner */}
      <CTABanner />
    </>
  )
}
