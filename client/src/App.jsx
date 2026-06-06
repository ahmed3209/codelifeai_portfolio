import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from './components/layout/PublicLayout'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import WorkPage from './pages/WorkPage'
import TeamPage from './pages/TeamPage'
import ProcessPage from './pages/ProcessPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'
import LaunchPage from './pages/LaunchPage'
import AdminLayout from './components/layout/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminServices from './pages/admin/Services'
import AdminFounders from './pages/admin/Founders'
import AdminContent from './pages/admin/Content'
import AdminChatbot from './pages/admin/Chatbot'
import AdminSettings from './pages/admin/Settings'
import AdminProjects from './pages/admin/Projects'
import AdminTestimonials from './pages/admin/Testimonials'
import AdminProcess from './pages/admin/Process'
import AdminEnquiries from './pages/admin/Enquiries'
import AdminEarlyAccess from './pages/admin/EarlyAccess'
import AdminPromotions from './pages/admin/Promotions'
import AdminLogin from './pages/admin/Login'
import ProtectedRoute from './components/admin/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}
