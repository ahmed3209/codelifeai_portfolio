import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../lib/api'
import PageMeta from '../components/PageMeta'
import { ContactSection } from '../components/sections/ContactFooter'

import FAQSection from '../components/sections/FAQSection'

export default function ContactPage() {
  const { data: siteData } = useQuery({
    queryKey: ['site-data'],
    queryFn:  () => publicApi.getSiteData().then(r => r.data),
  })
  const content = siteData?.content || {}
  const faqs = siteData?.faqs || []

  return (
    <div className="pt-20">
      <PageMeta
        path="/contact"
        title="Start Your Project"
        description="Get in touch with CodeLifeAI. Tell us about your project and we'll reply within 12 hours with a free architectural consultation and tailored proposal."
        keywords="contact codelifeai, software development inquiry, project consultation, hire developers, get a quote, free consultation, software project enquiry"
      />
      <ContactSection content={content} />
      <FAQSection faqs={faqs} />
    </div>
  )
}
