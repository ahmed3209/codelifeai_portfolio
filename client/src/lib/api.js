import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cl_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('cl_token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ─── Public API helpers ───────────────────────────────────────
export const publicApi = {
  getSiteData:  () => api.get('/site-data'),
  getServices:  () => api.get('/services'),
  getFounders:  () => api.get('/founders'),
  sendMessage:  (data) => api.post('/chat', data),
  sendContact:  (data) => api.post('/contact', data),
  requestEarlyAccess: (data) => api.post('/early-access', data),
}

// ─── Admin API helpers ────────────────────────────────────────
export const adminApi = {
  login: (creds) => api.post('/admin/login', creds),

  // Services
  getServices:    () => api.get('/admin/services'),
  createService:  (d) => api.post('/admin/services', d),
  updateService:  (id, d) => api.put(`/admin/services/${id}`, d),
  deleteService:  (id) => api.delete(`/admin/services/${id}`),
  reorderServices:(order) => api.put('/admin/services/reorder', { order }),

  // Founders
  getFounders:   () => api.get('/admin/founders'),
  createFounder: (d) => api.post('/admin/founders', d),
  updateFounder: (id, d) => api.put(`/admin/founders/${id}`, d),
  deleteFounder: (id) => api.delete(`/admin/founders/${id}`),

  // Site content (hero text, about, etc.)
  getContent:    () => api.get('/admin/content'),
  updateContent: (d) => api.put('/admin/content', d),

  // Chatbot knowledge base
  getKbDocs:     () => api.get('/admin/kb'),
  addKbDoc:      (d) => api.post('/admin/kb', d),
  deleteKbDoc:   (id) => api.delete(`/admin/kb/${id}`),
  rebuildIndex:  () => api.post('/admin/kb/rebuild'),

  // Settings
  getSettings:    () => api.get('/admin/settings'),
  updateSettings: (d) => api.put('/admin/settings', d),
  changePassword: (d) => api.put('/admin/change-password', d),

  // Projects (What We've Built)
  getProjects:   () => api.get('/admin/projects'),
  createProject: (d) => api.post('/admin/projects', d),
  updateProject: (id, d) => api.put(`/admin/projects/${id}`, d),
  deleteProject: (id) => api.delete(`/admin/projects/${id}`),

  // Testimonials
  getTestimonials:   () => api.get('/admin/testimonials'),
  createTestimonial: (d) => api.post('/admin/testimonials', d),
  updateTestimonial: (id, d) => api.put(`/admin/testimonials/${id}`, d),
  deleteTestimonial: (id) => api.delete(`/admin/testimonials/${id}`),

  // Process steps
  getProcess:   () => api.get('/admin/process'),
  createStep:   (d) => api.post('/admin/process', d),
  updateStep:   (id, d) => api.put(`/admin/process/${id}`, d),
  deleteStep:   (id) => api.delete(`/admin/process/${id}`),

  // Enquiries (contact form submissions)
  getContacts:   () => api.get('/admin/contacts'),
  deleteContact: (id) => api.delete(`/admin/contacts/${id}`),

  // Early access requests (ZYRA AI)
  getEarlyAccess:    () => api.get('/admin/early-access'),
  deleteEarlyAccess: (id) => api.delete(`/admin/early-access/${id}`),

  // Dashboard stats
  getStats: () => api.get('/admin/stats'),
}
