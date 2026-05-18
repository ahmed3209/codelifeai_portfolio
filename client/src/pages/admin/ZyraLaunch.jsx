import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import toast from 'react-hot-toast'

function isoToLocalInput(iso) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export default function AdminZyraLaunch() {
  const qc = useQueryClient()
  const { data: content = {} } = useQuery({
    queryKey: ['admin-content'],
    queryFn: () => adminApi.getContent().then(r => r.data),
  })

  const [form, setForm] = useState({ zyra_enabled: 'true', zyra_name: '', zyra_tagline: '', zyra_launch_local: '' })

  useEffect(() => {
    setForm({
      zyra_enabled: content.zyra_enabled || 'true',
      zyra_name: content.zyra_name || 'ZYRA AI',
      zyra_tagline: content.zyra_tagline || '',
      zyra_launch_local: isoToLocalInput(content.zyra_launch_at || ''),
    })
  }, [content])

  const saveMut = useMutation({
    mutationFn: adminApi.updateContent,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-content'] }); toast.success('ZYRA launch settings saved!') },
    onError: () => toast.error('Failed to save'),
  })

  function save() {
    const launchDate = new Date(form.zyra_launch_local)
    if (isNaN(launchDate.getTime())) { toast.error('Please pick a valid launch date & time'); return }
    saveMut.mutate({
      zyra_enabled: form.zyra_enabled,
      zyra_name: form.zyra_name,
      zyra_tagline: form.zyra_tagline,
      zyra_launch_at: launchDate.toISOString(),
    })
  }

  const enabled = form.zyra_enabled === 'true'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-bb-white tracking-tight">ZYRA AI — Launch</h1>
        <p className="text-bb-muted text-sm mt-1">Control the countdown screen and the homepage teaser banner.</p>
      </div>

      <Card>
        <CardHeader><h2 className="text-sm font-bold text-bb-white">Countdown Settings</h2></CardHeader>
        <CardBody className="space-y-5">
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div>
              <p className="text-sm font-semibold text-bb-white">Show ZYRA AI promotion</p>
              <p className="text-xs text-bb-muted mt-0.5">Toggles the /launch countdown and the homepage teaser band.</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, zyra_enabled: enabled ? 'false' : 'true' }))}
              className={`relative w-12 h-7 rounded-full transition-colors ${enabled ? 'bg-bb-accent' : 'bg-white/[0.12]'}`}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${enabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <Input label="Tool name" value={form.zyra_name} onChange={e => setForm(p => ({ ...p, zyra_name: e.target.value }))} placeholder="ZYRA AI" />
          <Textarea label="Tagline / description" value={form.zyra_tagline} onChange={e => setForm(p => ({ ...p, zyra_tagline: e.target.value }))} rows={3}
            placeholder="One AI for everything — chat, create, analyze, automate." />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-bb-muted uppercase tracking-widest">Launch date &amp; time</label>
            <input
              type="datetime-local"
              value={form.zyra_launch_local}
              onChange={e => setForm(p => ({ ...p, zyra_launch_local: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-bb-white outline-none focus:border-bb-accent/40 transition-colors [color-scheme:dark]"
            />
            <p className="text-[0.7rem] text-bb-muted">Set in your local time. The countdown ticks down to this exact moment for every visitor.</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={save} loading={saveMut.isPending}>Save Launch Settings</Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <p className="text-xs text-bb-muted leading-relaxed">
            The public countdown lives at <code className="text-bb-accent">/launch</code>. Early-access requests submitted there
            appear under <strong className="text-bb-white">Early Access</strong> in the sidebar.
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
