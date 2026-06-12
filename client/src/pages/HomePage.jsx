import { lazy, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../lib/api'
import PageMeta             from '../components/PageMeta'
import HeroSection          from '../components/sections/HeroSection'
import PromoTeaser          from '../components/sections/PromoTeaser'
import TestimonialsSection  from '../components/sections/TestimonialsSection'
import CTABanner            from '../components/sections/CTABanner'

const ThreeBackground = lazy(() => import('../components/ThreeBackground'))

export default function HomePage() {
  const { data: siteData } = useQuery({
    queryKey: ['site-data'],
    queryFn:  () => publicApi.getSiteData().then(r => r.data),
  })

  const content      = siteData?.content      || {}
  const testimonials = siteData?.testimonials || []
  const activePromo  = siteData?.activePromo  || null

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
      <HeroSection content={content} />

      {/* Active promo teaser (hidden when no active promotion) */}
      <PromoTeaser promo={activePromo} />

      {/* Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* CTA Banner */}
      <CTABanner />
    </>
  )
}
