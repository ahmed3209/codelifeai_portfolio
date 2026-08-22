import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../lib/api'
import PageMeta from '../components/PageMeta'
import ServicesSection from '../components/sections/ServicesSection'
import TechRadar from '../components/sections/TechRadar'
import ProjectEstimator from '../components/sections/ProjectEstimator'
import CTABanner from '../components/sections/CTABanner'

export default function ServicesPage() {
  const { data: siteData } = useQuery({
    queryKey: ['site-data'],
    queryFn:  () => publicApi.getSiteData().then(r => r.data),
  })
  const services = siteData?.services || []

  return (
    <div className="pt-20">
      <PageMeta
        path="/services"
        title="Engineering Services &amp; Capabilities"
        description="Full-stack web development, mobile apps, UI/UX design, custom AI agents, and enterprise cloud & DevOps infrastructure built by senior engineers."
        keywords="software development services, web development, mobile app development, ui ux design services, ai integration, llm integration, cloud architecture, devops, react development, nextjs development, flutter development, technical consulting"
      />
      <ServicesSection services={services} />
      <TechRadar />
      <ProjectEstimator />
      <CTABanner />
    </div>
  )
}
