import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../lib/api'
import PageMeta from '../components/PageMeta'
import ProcessSection from '../components/sections/ProcessSection'
import FAQSection from '../components/sections/FAQSection'
import CTABanner from '../components/sections/CTABanner'

export default function ProcessPage() {
  const { data: siteData } = useQuery({
    queryKey: ['site-data'],
    queryFn:  () => publicApi.getSiteData().then(r => r.data),
  })
  const process = siteData?.process || []
  const faqs = siteData?.faqs || []

  return (
    <div className="pt-20">
      <PageMeta
        path="/process"
        title="Our Delivery Protocol &amp; Agile Process"
        description="Our software delivery process — discovery, system architecture, high-velocity agile build sprints, and dedicated post-launch support."
        keywords="software delivery process, agile development, mvp development, product engineering workflow, sprint based delivery, design to code, software development methodology"
      />
      <ProcessSection steps={process} />
      <FAQSection faqs={faqs} />
      <CTABanner />
    </div>
  )
}
