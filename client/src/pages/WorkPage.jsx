import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../lib/api'
import PageMeta from '../components/PageMeta'
import WorkSection from '../components/sections/WorkSection'
import CTABanner from '../components/sections/CTABanner'

export default function WorkPage() {
  const { data: siteData } = useQuery({
    queryKey: ['site-data'],
    queryFn:  () => publicApi.getSiteData().then(r => r.data),
  })
  const projects = siteData?.projects || []

  return (
    <div className="pt-20">
      <PageMeta
        title="Our Work"
        description="Selected projects from our software portfolio — fintech dashboards, e-commerce platforms, healthcare mobile apps, SaaS tools, AI analytics, and LMS systems shipped for clients worldwide."
        keywords="software portfolio, case studies, project showcase, fintech app development, e-commerce platform, healthcare app, saas development, lms platform, ai analytics, react projects, flutter apps"
      />
      <WorkSection projects={projects} />
      <CTABanner />
    </div>
  )
}
