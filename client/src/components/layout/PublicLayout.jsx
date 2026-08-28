import { useEffect, lazy, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../../lib/api'
import Navbar from '../sections/Navbar'
import { Footer } from '../sections/ContactFooter'

const ChatBot = lazy(() => import('../chatbot/ChatBot'))
const InteractiveDotGrid = lazy(() => import('../InteractiveDotGrid'))

export default function PublicLayout() {
  const { pathname } = useLocation()

  // Scroll to top and track pageview on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    publicApi.trackView({ path: pathname, referrer: document.referrer || '' }).catch(() => {})
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
      {showDotGrid && (
        <Suspense fallback={null}>
          <InteractiveDotGrid />
        </Suspense>
      )}
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer content={content} />
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </div>
  )
}
