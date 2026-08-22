import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../lib/api'
import PageMeta from '../components/PageMeta'
import WorkSection from '../components/sections/WorkSection'
import TrustMarquee from '../components/sections/TrustMarquee'
import TestimonialsSection from '../components/sections/TestimonialsSection'
import CTABanner from '../components/sections/CTABanner'

export default function WorkPage() {
  const { data: siteData } = useQuery({
    queryKey: ['site-data'],
    queryFn:  () => publicApi.getSiteData().then(r => r.data),
  })
  const projects = siteData?.projects || []
  const testimonials = siteData?.testimonials || []

  return (
    <div className="pt-20">
      <PageMeta
        path="/work"
        title="Our Work &amp; Case Studies"
        description="Selected projects from our software studio — fintech banking dashboards, e-commerce platforms, healthcare mobile apps, SaaS tools, AI workflows, and LMS systems."
        keywords="software portfolio, case studies, project showcase, fintech app development, e-commerce platform, healthcare app, saas development, lms platform, ai analytics, react projects, flutter apps"
      />
      <WorkSection projects={projects} />
      <TrustMarquee />
      {testimonials.length > 0 && <TestimonialsSection testimonials={testimonials} />}
      <CTABanner />
    </div>
  )
}
