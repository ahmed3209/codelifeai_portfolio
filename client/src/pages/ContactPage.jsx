import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../lib/api'
import PageMeta from '../components/PageMeta'
import { ContactSection } from '../components/sections/ContactFooter'

export default function ContactPage() {
  const { data: siteData } = useQuery({
    queryKey: ['site-data'],
    queryFn:  () => publicApi.getSiteData().then(r => r.data),
  })
  const content = siteData?.content || {}

  return (
    <div className="pt-20">
      <PageMeta
        title="Contact"
        description="Get in touch with CodeLifeAI. Tell us about your project and we'll reply within 24 hours with a free consultation and tailored proposal."
        keywords="contact codelifeai, software development inquiry, project consultation, hire developers, get a quote, free consultation, software project enquiry"
      />
      <ContactSection content={content} />
    </div>
  )
}
