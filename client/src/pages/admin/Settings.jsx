import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import api from '../../lib/api'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { CheckCircle, XCircle, RefreshCw, Sparkles, ExternalLink, ChevronDown, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

// Curated free-tier-eligible Gemini models. Admin can also type any model
// name manually in the picker.
const RECOMMENDED_MODELS = [
  { name: 'gemini-2.0-flash',      desc: 'Fast, capable — best balance for chatbots',  badge: 'Recommended' },
  { name: 'gemini-2.0-flash-lite', desc: 'Even faster, cheaper, slightly lower quality' },
  { name: 'gemini-2.5-flash',      desc: 'Newer generation — more capable, slightly slower' },
  { name: 'gemini-1.5-flash',      desc: 'Older but stable fallback' },
]

export default function AdminSettings() {
  const qc = useQueryClient()
  const [form, setForm]     = useState({})
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [geminiStatus, setGeminiStatus] = useState(null) // null | { connected, models, reason }
  const [checking, setChecking] = useState(false)
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [newApiKey, setNewApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  const { data: settings = {} } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings().then(r => r.data)
  })

  useEffect(() => { setForm(settings) }, [settings])

  const saveMut = useMutation({
    mutationFn: adminApi.updateSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings'] })
      setNewApiKey('')
      toast.success('Settings saved!')
    },
    onError: () => toast.error('Failed to save settings'),
  })

  const pwMut = useMutation({
    mutationFn: adminApi.changePassword,
    onSuccess: () => { setPwForm({ current: '', newPw: '', confirm: '' }); toast.success('Password changed!') },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to change password')
  })

  async function checkConnection() {
    setChecking(true)
    setGeminiStatus(null)
    try {
      const { data } = await api.get('/chat/models')
      setGeminiStatus(data)
    } catch {
      setGeminiStatus({ connected: false, models: [], reason: 'api_error' })
    } finally {
      setChecking(false)
    }
  }

  function handlePw(e) {
    e.preventDefault()
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    if (pwForm.newPw.length < 8) { toast.error('Min. 8 characters'); return }
    pwMut.mutate({ currentPassword: pwForm.current, newPassword: pwForm.newPw })
  }

  // Build the save payload — only include the API key if the admin actually
  // typed a new one (otherwise we'd echo the masked value back and the
  // backend would have to filter it out).
  function saveChatbotSettings() {
    const payload = {
      gemini_model:     form.gemini_model || 'gemini-2.0-flash',
      chatbot_name:     form.chatbot_name || '',
      chatbot_greeting: form.chatbot_greeting || '',
    }
    if (newApiKey.trim()) payload.gemini_api_key = newApiKey.trim()
    saveMut.mutate(payload)
  }

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const currentModel = form.gemini_model || 'gemini-2.0-flash'
  const keyConfigured = !!settings.gemini_api_key

  // Merge live-fetched models with the recommended list, dedup by id.
  const modelChoices = useMemo(() => {
    const liveIds = new Set(geminiStatus?.models?.map(m => m.id) || [])
    const live = (geminiStatus?.models || []).map(m => ({ name: m.id, desc: m.name, live: true }))
    const extras = RECOMMENDED_MODELS.filter(m => !liveIds.has(m.name))
    return [...live, ...extras]
  }, [geminiStatus])

  const statusMessage = geminiStatus && !geminiStatus.connected && {
    no_api_key:  'No API key configured — paste one above',
    invalid_key: 'API key was rejected by Google',
    api_error:   geminiStatus.detail || 'Could not reach Google',
  }[geminiStatus.reason]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-bb-white tracking-tight">Settings</h1>
        <p className="text-bb-muted text-sm mt-1">Chatbot, account, and deployment configuration.</p>
      </div>

      {/* ── Gemini setup guide ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-bb-accent" />
            <h2 className="text-sm font-bold text-bb-white">Chatbot AI — Google Gemini (free)</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          <p className="text-xs text-bb-muted leading-relaxed">
            The chatbot uses Google's <strong className="text-bb-white">Gemini API</strong> on its free tier
            — <strong className="text-bb-white">1,500 requests / day</strong> on Gemini 2.0 Flash,
            no credit card required. Get a key in 60 seconds:
          </p>

          <div className="space-y-3">
            {[
              { step: '1', title: 'Open Google AI Studio',
                link: { href: 'https://aistudio.google.com/apikey', label: 'aistudio.google.com/apikey' },
                note: 'Sign in with any Google account.' },
              { step: '2', title: 'Click "Create API key"', note: 'Pick the default Cloud project, or create a new one.' },
              { step: '3', title: 'Paste the key below and Save', note: 'It will be stored encrypted in your database. Never shown again after save.' },
            ].map(({ step, title, link, note }) => (
              <div key={step} className="flex gap-3 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="w-6 h-6 rounded-full bg-bb-accent/15 border border-bb-accent/25 flex items-center justify-center text-[0.68rem] font-bold text-bb-accent flex-shrink-0 mt-0.5">
                  {step}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-bb-white mb-1">{title}</p>
                  {link && (
                    <a href={link.href} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[0.78rem] text-bb-accent hover:underline">
                      {link.label} <ExternalLink size={11} />
                    </a>
                  )}
                  <p className="text-[0.7rem] text-bb-muted mt-1">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ── Gemini config ── */}
      <Card>
        <CardHeader><h2 className="text-sm font-bold text-bb-white">Chatbot Configuration</h2></CardHeader>
        <CardBody className="space-y-4">
          {/* API key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-bb-muted uppercase tracking-widest flex items-center gap-2">
              Gemini API Key
              {keyConfigured && (
                <span className="inline-flex items-center gap-1 text-[0.62rem] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full normal-case tracking-normal">
                  <CheckCircle size={10} /> Configured
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={newApiKey}
                onChange={e => setNewApiKey(e.target.value)}
                placeholder={keyConfigured ? '••••••••• (leave blank to keep current)' : 'AIzaSy…'}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 pr-10 text-sm text-bb-white placeholder:text-bb-muted outline-none focus:border-bb-accent/40 transition-colors font-mono"
              />
              {newApiKey && (
                <button type="button" onClick={() => setShowKey(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-bb-muted hover:text-bb-white">
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              )}
            </div>
            <p className="text-[0.7rem] text-bb-muted">
              {keyConfigured
                ? 'A key is already set. Paste a new one here to replace it.'
                : 'Paste your Gemini API key. It is masked and never displayed again.'}
            </p>
          </div>

          {/* Connection check */}
          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <Button variant="outline" size="sm" onClick={checkConnection} loading={checking}>
              <RefreshCw size={13} /> Test Connection
            </Button>
            {geminiStatus !== null && (
              <div className={`flex items-center gap-1.5 text-xs font-medium ${geminiStatus.connected ? 'text-emerald-400' : 'text-red-400'}`}>
                {geminiStatus.connected
                  ? <><CheckCircle size={14} /> Connected — {geminiStatus.models.length} model{geminiStatus.models.length !== 1 ? 's' : ''} available</>
                  : <><XCircle size={14} /> {statusMessage}</>
                }
              </div>
            )}
          </div>

          {/* Model selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-bb-muted uppercase tracking-widest">Active Model</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelPicker(s => !s)}
                className="w-full flex items-center justify-between gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-bb-white hover:border-white/20 transition-colors"
              >
                <span className="font-mono">{currentModel}</span>
                <ChevronDown size={15} className={`text-bb-muted transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
              </button>

              {showModelPicker && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0e0e1e] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                  <div className="p-3 border-b border-white/[0.06]">
                    <input
                      value={form.gemini_model || ''}
                      onChange={set('gemini_model')}
                      placeholder="Type any Gemini model name…"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-bb-white placeholder:text-bb-muted outline-none focus:border-bb-accent/40 font-mono"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto scrollbar-thin">
                    <p className="px-3 pt-2.5 pb-1 text-[0.65rem] font-bold tracking-widest uppercase text-bb-muted">
                      {geminiStatus?.connected ? 'Available + Recommended' : 'Recommended'}
                    </p>
                    {modelChoices.map(m => (
                      <button key={m.name} type="button"
                        onClick={() => { setForm(p => ({ ...p, gemini_model: m.name })); setShowModelPicker(false) }}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-white/[0.04] transition-colors text-left ${currentModel === m.name ? 'bg-bb-accent/[0.07]' : ''}`}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-mono font-semibold text-bb-white">{m.name}</span>
                          {m.desc && <span className="text-[0.7rem] text-bb-muted ml-2">{m.desc}</span>}
                        </div>
                        {m.badge && (
                          <span className="text-[0.6rem] font-bold text-bb-accent bg-bb-accent/10 border border-bb-accent/20 px-2 py-0.5 rounded-full flex-shrink-0">
                            {m.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chatbot persona */}
          <Input label="Chatbot Name" value={form.chatbot_name || ''} onChange={set('chatbot_name')} placeholder="CodeLifeAI Assistant" />
          <Input label="Greeting Message" value={form.chatbot_greeting || ''} onChange={set('chatbot_greeting')}
            placeholder="Hi! I'm the CodeLifeAI assistant. Ask me anything!" />

          <div className="flex justify-end">
            <Button onClick={saveChatbotSettings} loading={saveMut.isPending}>Save Chatbot Settings</Button>
          </div>
        </CardBody>
      </Card>

      {/* ── Change Password ── */}
      <Card>
        <CardHeader><h2 className="text-sm font-bold text-bb-white">Change Password</h2></CardHeader>
        <CardBody>
          <form onSubmit={handlePw} className="space-y-4">
            <Input label="Current Password" value={pwForm.current} onChange={e => setPwForm(p => ({...p, current: e.target.value}))} type="password" required />
            <Input label="New Password" value={pwForm.newPw} onChange={e => setPwForm(p => ({...p, newPw: e.target.value}))} type="password" required placeholder="Min. 8 characters" />
            <Input label="Confirm New Password" value={pwForm.confirm} onChange={e => setPwForm(p => ({...p, confirm: e.target.value}))} type="password" required />
            <div className="flex justify-end">
              <Button type="submit" loading={pwMut.isPending}>Change Password</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
