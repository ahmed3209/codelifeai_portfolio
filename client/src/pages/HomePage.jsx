import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../lib/api'
import HeroSection          from '../components/sections/HeroSection'
import ServicesSection      from '../components/sections/ServicesSection'
import WorkSection          from '../components/sections/WorkSection'
import FoundersSection      from '../components/sections/FoundersSection'
import TestimonialsSection  from '../components/sections/TestimonialsSection'
import ProcessSection       from '../components/sections/ProcessSection'
import CTABanner            from '../components/sections/CTABanner'
import { ContactSection, Footer } from '../components/sections/ContactFooter'

export default function HomePage() {
  const { data: siteData } = useQuery({
    queryKey: ['site-data'],
    queryFn:  () => publicApi.getSiteData().then(r => r.data),
  })

  const content  = siteData?.content  || {}
  const services = siteData?.services || []
  const founders = siteData?.founders || []

  return (
    <>
      {/* 00 — Hero */}
      <HeroSection content={content} />

      {/* 01 — Services */}
      <ServicesSection services={services} />

      {/* 02 — Work */}
      <WorkSection />

      {/* 03 — Team */}
      <FoundersSection founders={founders} />

      {/* 04 — Testimonials */}
      <TestimonialsSection />

      {/* 05 — Process */}
      <ProcessSection content={content} />

      {/* CTA Banner */}
      <CTABanner />

      {/* 06 — Contact */}
      <ContactSection content={content} />

      {/* Footer */}
      <Footer content={content} />
    </>
  )
}
