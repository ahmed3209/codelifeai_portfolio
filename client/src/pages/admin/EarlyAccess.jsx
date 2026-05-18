import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Trash2, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminEarlyAccess() {
  const qc = useQueryClient()
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-early-access'],
    queryFn: () => adminApi.getEarlyAccess().then(r => r.data),
  })

  const deleteMut = useMutation({
    mutationFn: adminApi.deleteEarlyAccess,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-early-access'] }); toast.success('Request deleted') },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-bb-white tracking-tight">ZYRA AI — Early Access</h1>
        <p className="text-bb-muted text-sm mt-1">People who requested early access to the tool ({items.length}).</p>
      </div>

      <Card>
        {isLoading ? (
          <CardBody><p className="text-bb-muted text-sm">Loading…</p></CardBody>
        ) : items.length === 0 ? (
          <CardBody><p className="text-bb-muted text-sm text-center py-6">No early-access requests yet.</p></CardBody>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {items.map(r => (
              <div key={r.id} className="flex items-start gap-4 px-6 py-5 hover:bg-white/[0.02] transition-colors">
                <div className="p-2 bg-white/[0.04] rounded-lg text-bb-accent flex-shrink-0 mt-0.5"><Sparkles size={16} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-bb-white">{r.name}</p>
                    <a href={`mailto:${r.email}`} className="text-xs text-bb-accent hover:underline">{r.email}</a>
                    <span className="text-[0.68rem] text-white/30">· {new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-bb-muted mt-1.5 whitespace-pre-wrap break-words">{r.reason}</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => { if (confirm('Delete this request?')) deleteMut.mutate(r.id) }}>
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
