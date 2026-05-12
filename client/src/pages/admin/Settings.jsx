import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import api from '../../lib/api'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { CheckCircle, XCircle, RefreshCw, Terminal, Cpu, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

// Recommended models with descriptions
const RECOMMENDED_MODELS = [
  { name: 'llama3.2',       size: '2GB',  desc: 'Meta Llama 3.2 — fast, great for chat' },
  { name: 'llama3.1',       size: '4.7GB',desc: 'Meta Llama 3.1 — higher quality responses' },
  { name: 'mistral',        size: '4.1GB',desc: 'Mistral 7B — excellent instruction following' },
  { name: 'gemma2',         size: '5.5GB',desc: 'Google Gemma 2 — strong reasoning' },
  { name: 'phi3',           size: '2.3GB',desc: 'Microsoft Phi-3 — lightweight & capable' },
  { name: 'qwen2.5',        size: '4.7GB',desc: 'Alibaba Qwen 2.5 — multilingual support' },
  { name: 'deepseek-r1:7b', size: '4.7GB',desc: 'DeepSeek R1 — strong reasoning model' },
]

export default function AdminSettings() {
  const qc = useQueryClient()
  const [form, setForm]   = useState({})
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [ollamaStatus, setOllamaStatus] = useState(null)  // null | { connected, models }
  const [checkingOllama, setCheckingOllama] = useState(false)
  const [showModelPicker, setShowModelPicker] = useState(false)

  const { data: settings = {} } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings().then(r => r.data)
  })

  useEffect(() => { setForm(settings) }, [settings])

  const saveMut = useMutation({
    mutationFn: adminApi.updateSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings'] })
      toast.success('Settings saved!')
    }
  })

  const pwMut = useMutation({
    mutationFn: adminApi.changePassword,
    onSuccess: () => { setPwForm({ current: '', newPw: '', confirm: '' }); toast.success('Password changed!') },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to change password')
  })

  async function checkOllama() {
    setCheckingOllama(true)
    setOllamaStatus(null)
    try {
      const { data } = await api.get('/chat/models')
      setOllamaStatus(data)
    } catch {
      setOllamaStatus({ connected: false, models: [] })
    } finally {
      setCheckingOllama(false)
    }
  }

  function handlePw(e) {
    e.preventDefault()
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    if (pwForm.newPw.length < 8) { toast.error('Min. 8 characters'); return }
    pwMut.mutate({ currentPassword: pwForm.current, newPassword: pwForm.newPw })
  }

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const currentModel = form.ollama_model || 'llama3.2'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-bb-white tracking-tight">Settings</h1>
        <p className="text-bb-muted text-sm mt-1">Chatbot, account, and deployment configuration.</p>
      </div>

      {/* ── Ollama Setup Guide ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-bb-accent" />
            <h2 className="text-sm font-bold text-bb-white">Local AI Setup (Ollama)</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          <p className="text-xs text-bb-muted leading-relaxed">
            Your chatbot runs entirely on your own machine using <strong className="text-bb-white">Ollama</strong> — no API keys, no cloud, no costs. Install it once, pull a model, and you're live.
          </p>

          {/* Steps */}
          <div className="space-y-3">
            {[
              {
                step: '1',
                title: 'Install Ollama',
                cmd: 'curl -fsSL https://ollama.com/install.sh | sh',
                note: 'Or download from ollama.com — supports macOS, Linux, Windows'
              },
              {
                step: '2',
                title: 'Start the Ollama server',
                cmd: 'ollama serve',
                note: 'Runs on http://localhost:11434 by default'
              },
              {
                step: '3',
                title: `Pull a model (e.g. ${currentModel})`,
                cmd: `ollama pull ${currentModel}`,
                note: 'Only needed once — the model is cached locally'
              },
            ].map(({ step, title, cmd, note }) => (
              <div key={step} className="flex gap-3 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="w-6 h-6 rounded-full bg-bb-accent/15 border border-bb-accent/25 flex items-center justify-center text-[0.68rem] font-bold text-bb-accent flex-shrink-0 mt-0.5">
                  {step}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-bb-white mb-1.5">{title}</p>
                  <div className="flex items-center gap-2 bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2">
                    <Terminal size={12} className="text-bb-accent flex-shrink-0" />
                    <code className="text-[0.76rem] text-bb-accent font-mono tracking-tight">{cmd}</code>
                  </div>
                  <p className="text-[0.68rem] text-bb-muted mt-1">{note}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Connection check */}
          <div className="flex items-center gap-3 pt-1">
            <Button variant="outline" size="sm" onClick={checkOllama} loading={checkingOllama}>
              <RefreshCw size={13} /> Check Connection
            </Button>

            {ollamaStatus !== null && (
              <div className={`flex items-center gap-1.5 text-xs font-medium ${ollamaStatus.connected ? 'text-green-400' : 'text-red-400'}`}>
                {ollamaStatus.connected
                  ? <><CheckCircle size={14} /> Connected — {ollamaStatus.models.length} model{ollamaStatus.models.length !== 1 ? 's' : ''} available</>
                  : <><XCircle size={14} /> Not reachable — is Ollama running?</>
                }
              </div>
            )}
          </div>

          {/* Live model list */}
          {ollamaStatus?.connected && ollamaStatus.models.length > 0 && (
            <div>
              <p className="text-[0.68rem] font-bold tracking-[0.1em] uppercase text-bb-muted mb-2">Pulled Models</p>
              <div className="flex flex-wrap gap-2">
                {ollamaStatus.models.map(m => (
                  <button key={m}
                    onClick={() => { setForm(p => ({ ...p, ollama_model: m })); toast.success(`Model set to ${m}`) }}
                    className={`text-xs px-3 py-1 rounded-full border transition-all font-medium ${
                      currentModel === m
                        ? 'bg-bb-accent/15 border-bb-accent/30 text-bb-accent'
                        : 'bg-white/[0.03] border-white/[0.08] text-bb-muted hover:text-bb-white hover:border-white/20'
                    }`}>
                    {m} {currentModel === m && '✓'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Ollama Config ── */}
      <Card>
        <CardHeader><h2 className="text-sm font-bold text-bb-white">Ollama Configuration</h2></CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Ollama Server URL"
            value={form.ollama_url || ''}
            onChange={set('ollama_url')}
            placeholder="http://localhost:11434"
          />
          <p className="text-xs text-bb-muted -mt-2">
            Default is localhost. For remote servers use the machine's IP/hostname.
          </p>

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
                  {/* Manual entry */}
                  <div className="p-3 border-b border-white/[0.06]">
                    <input
                      value={form.ollama_model || ''}
                      onChange={set('ollama_model')}
                      placeholder="Type any model name…"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-bb-white placeholder:text-bb-muted outline-none focus:border-bb-accent/40 font-mono"
                    />
                  </div>
                  {/* Recommended list */}
                  <div className="max-h-56 overflow-y-auto scrollbar-thin">
                    <p className="px-3 pt-2.5 pb-1 text-[0.65rem] font-bold tracking-widest uppercase text-bb-muted">Recommended Models</p>
                    {RECOMMENDED_MODELS.map(m => (
                      <button key={m.name} type="button"
                        onClick={() => { setForm(p => ({ ...p, ollama_model: m.name })); setShowModelPicker(false) }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.04] transition-colors text-left ${currentModel === m.name ? 'bg-bb-accent/[0.07]' : ''}`}
                      >
                        <div>
                          <span className="text-xs font-mono font-semibold text-bb-white">{m.name}</span>
                          <span className="text-[0.7rem] text-bb-muted ml-2">{m.desc}</span>
                        </div>
                        <span className="text-[0.68rem] text-bb-muted flex-shrink-0 ml-3">{m.size}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-bb-muted">Run <code className="text-bb-accent font-mono">ollama pull {currentModel}</code> to download this model.</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => saveMut.mutate(form)} loading={saveMut.isPending}>Save Settings</Button>
          </div>
        </CardBody>
      </Card>

      {/* ── Chatbot persona ── */}
      <Card>
        <CardHeader><h2 className="text-sm font-bold text-bb-white">Chatbot Persona</h2></CardHeader>
        <CardBody className="space-y-4">
          <Input label="Chatbot Name" value={form.chatbot_name || ''} onChange={set('chatbot_name')} placeholder="CodeLifeAI Assistant" />
          <Input label="Greeting Message" value={form.chatbot_greeting || ''} onChange={set('chatbot_greeting')}
            placeholder="Hi! I'm the CodeLifeAI assistant. Ask me anything!" />
          <div className="flex justify-end">
            <Button onClick={() => saveMut.mutate(form)} loading={saveMut.isPending}>Save Settings</Button>
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
