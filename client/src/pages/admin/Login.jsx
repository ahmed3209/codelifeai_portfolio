import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [creds, setCreds] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await adminApi.login(creds)
      localStorage.setItem('cl_token', data.token)
      setAuth(data.token, data.user)
      navigate('/admin')
    } catch {
      toast.error('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bb-black flex items-center justify-center px-4 font-jakarta">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/logo.svg" alt="CodeLifeAI" width="408" height="110" className="h-9 w-auto mb-3" />
          <p className="text-bb-muted text-sm">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-bb-card border border-white/[0.06] rounded-2xl p-8 space-y-4">
          <h1 className="text-lg font-bold text-bb-white mb-2">Sign in</h1>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-bb-muted uppercase tracking-widest">Username</label>
            <input
              value={creds.username}
              onChange={e => setCreds(p => ({...p, username: e.target.value}))}
              placeholder="admin"
              required
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-bb-white placeholder:text-bb-muted outline-none focus:border-bb-accent/40 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-bb-muted uppercase tracking-widest">Password</label>
            <input
              value={creds.password}
              onChange={e => setCreds(p => ({...p, password: e.target.value}))}
              type="password"
              placeholder="••••••••"
              required
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-bb-white placeholder:text-bb-muted outline-none focus:border-bb-accent/40 transition-colors"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full mt-2 text-sm font-semibold text-bb-black bg-bb-accent py-2.5 rounded-full hover:opacity-85 transition-all disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
        <p className="text-center text-xs text-bb-muted mt-4">Default: admin / codelifeai2025</p>
      </div>
    </div>
  )
}
