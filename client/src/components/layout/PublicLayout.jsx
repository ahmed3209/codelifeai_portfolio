import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../../lib/api'
import Navbar from '../sections/Navbar'
import { Footer } from '../sections/ContactFooter'
import ChatBot from '../chatbot/ChatBot'
import InteractiveDotGrid from '../InteractiveDotGrid'

export default function PublicLayout() {
  const { pathname } = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  const { data: siteData } = useQuery({
    queryKey: ['site-data'],
    queryFn:  () => publicApi.getSiteData().then(r => r.data),
  })
  const content = siteData?.content || {}

  // Interactive dot grid background on every page EXCEPT home.
  // Home has its own 3D WebGL scene (ThreeBackground) rendered by HomePage.
  const showDotGrid = pathname !== '/'

  return (
    <div className="relative min-h-screen">
      {showDotGrid && <InteractiveDotGrid />}
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer content={content} />
      <ChatBot />
    </div>
  )
}
