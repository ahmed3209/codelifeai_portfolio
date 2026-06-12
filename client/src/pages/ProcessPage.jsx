import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../lib/api'
import PageMeta from '../components/PageMeta'
import ProcessSection from '../components/sections/ProcessSection'
import CTABanner from '../components/sections/CTABanner'

export default function ProcessPage() {
  const { data: siteData } = useQuery({
    queryKey: ['site-data'],
    queryFn:  () => publicApi.getSiteData().then(r => r.data),
  })
  const process = siteData?.process || []

  return (
    <div className="pt-20">
      <PageMeta
        path="/process"
        title="How We Work"
        description="Our software delivery process — discovery, design, agile build sprints, and post-launch support. A transparent workflow from first call to final launch."
        keywords="software delivery process, agile development, mvp development, product engineering workflow, sprint based delivery, design to code, software development methodology"
      />
      <ProcessSection steps={process} />
      <CTABanner />
    </div>
  )
}
