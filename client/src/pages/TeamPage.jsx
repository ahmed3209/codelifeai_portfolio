import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../lib/api'
import PageMeta from '../components/PageMeta'
import FoundersSection from '../components/sections/FoundersSection'
import CTABanner from '../components/sections/CTABanner'

export default function TeamPage() {
  const { data: siteData } = useQuery({
    queryKey: ['site-data'],
    queryFn:  () => publicApi.getSiteData().then(r => r.data),
  })
  const founders = siteData?.founders || []

  return (
    <div className="pt-20">
      <PageMeta
        path="/team"
        title="Team"
        description="Meet the founders and senior engineers behind CodeLifeAI — builders shipping production-grade software across web, mobile, AI, and cloud."
        keywords="codelifeai team, software founders, senior engineers, full stack developers, software architect, cto for hire, engineering team, software development team pakistan"
      />
      <FoundersSection founders={founders} />
      <CTABanner />
    </div>
  )
}
