import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from './components/layout/PublicLayout'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import WorkPage from './pages/WorkPage'
import TeamPage from './pages/TeamPage'
import ProcessPage from './pages/ProcessPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/admin/ProtectedRoute'

// Lazy chunks — homepage visitors never download these.
const LaunchPage          = lazy(() => import('./pages/LaunchPage'))
const AdminLogin          = lazy(() => import('./pages/admin/Login'))
const AdminLayout         = lazy(() => import('./components/layout/AdminLayout'))
const AdminDashboard      = lazy(() => import('./pages/admin/Dashboard'))
const AdminServices       = lazy(() => import('./pages/admin/Services'))
const AdminFounders       = lazy(() => import('./pages/admin/Founders'))
const AdminContent        = lazy(() => import('./pages/admin/Content'))
const AdminChatbot        = lazy(() => import('./pages/admin/Chatbot'))
const AdminSettings       = lazy(() => import('./pages/admin/Settings'))
const AdminProjects       = lazy(() => import('./pages/admin/Projects'))
const AdminTestimonials   = lazy(() => import('./pages/admin/Testimonials'))
const AdminProcess        = lazy(() => import('./pages/admin/Process'))
const AdminEnquiries      = lazy(() => import('./pages/admin/Enquiries'))
const AdminEarlyAccess    = lazy(() => import('./pages/admin/EarlyAccess'))
const AdminPromotions     = lazy(() => import('./pages/admin/Promotions'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          {/* Public site */}
          <Route element={<PublicLayout />}>
            <Route path="/"         element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/work"     element={<WorkPage />} />
            <Route path="/team"     element={<TeamPage />} />
            <Route path="/process"  element={<ProcessPage />} />
            <Route path="/contact"  element={<ContactPage />} />
            <Route path="*"         element={<NotFoundPage />} />
          </Route>

          {/* Product launch / promo countdown (standalone, no portfolio chrome) */}
          <Route path="/launch"       element={<LaunchPage />} />
          <Route path="/launch/:slug" element={<LaunchPage />} />

          {/* Admin auth */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin panel (protected) */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="founders" element={<AdminFounders />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="process" element={<AdminProcess />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="zyra" element={<Navigate to="/admin/promotions" replace />} />
            <Route path="early-access" element={<AdminEarlyAccess />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="chatbot" element={<AdminChatbot />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
