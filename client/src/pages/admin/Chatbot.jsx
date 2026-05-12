import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { Trash2, Plus, RefreshCw, BookOpen, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminChatbot() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })

  const { data: docs = [] } = useQuery({ queryKey: ['admin-kb'], queryFn: () => adminApi.getKbDocs().then(r => r.data) })

  const addMut     = useMutation({ mutationFn: adminApi.addKbDoc,    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-kb'] }); setForm({ title: '', content: '' }); setShowAdd(false); toast.success('Document added to knowledge base!') } })
  const deleteMut  = useMutation({ mutationFn: adminApi.deleteKbDoc, onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-kb'] }); toast.success('Document removed') } })
  const rebuildMut = useMutation({ mutationFn: adminApi.rebuildIndex, onSuccess: () => toast.success('Knowledge base index rebuilt!') })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight">Chatbot Knowledge Base</h1>
          <p className="text-bb-muted text-sm mt-1">Documents the AI assistant uses to answer visitor questions.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => rebuildMut.mutate()} loading={rebuildMut.isPending}>
            <RefreshCw size={15} /> Rebuild Index
          </Button>
          <Button onClick={() => setShowAdd(s => !s)}>
            <Plus size={15} /> Add Document
          </Button>
        </div>
      </div>

      {/* How it works */}
      <Card>
        <CardBody>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-bb-accent/10 rounded-lg text-bb-accent flex-shrink-0 mt-0.5"><Zap size={18} /></div>
            <div>
              <p className="text-sm font-semibold text-bb-white mb-1">How the RAG Chatbot Works</p>
              <p className="text-xs text-bb-muted leading-relaxed">
                When a visitor sends a message, the system searches your knowledge base for the most relevant documents and includes them as context with the AI's system prompt. Add company FAQs, service details, pricing guides, team bios, case studies, or any information you want the chatbot to know. The more you add, the smarter it gets.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Add form */}
      {showAdd && (
        <Card>
          <CardHeader><h2 className="text-sm font-bold text-bb-white">New Knowledge Base Document</h2></CardHeader>
          <CardBody>
            <form onSubmit={e => { e.preventDefault(); addMut.mutate(form) }} className="space-y-4">
              <Input label="Document Title" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required placeholder="e.g. CodeLifeAI Pricing Guide" />
              <Textarea label="Content" value={form.content} onChange={e => setForm(p => ({...p, content: e.target.value}))} rows={8} required
                placeholder="Paste any text here — FAQ answers, service descriptions, company info, process details, pricing, case studies…" />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit" loading={addMut.isPending}>Add to Knowledge Base</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Docs list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-bb-white">Documents ({docs.length})</h2>
            <p className="text-xs text-bb-muted">Used for AI context retrieval</p>
          </div>
        </CardHeader>
        <div className="divide-y divide-white/[0.06]">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-start gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
              <div className="p-1.5 bg-white/[0.04] rounded-lg text-bb-muted flex-shrink-0 mt-0.5"><BookOpen size={15} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-bb-white">{doc.title}</p>
                <p className="text-xs text-bb-muted mt-0.5 line-clamp-2">{doc.content}</p>
                <p className="text-[0.68rem] text-white/20 mt-1">{doc.content.length} characters</p>
              </div>
              <Button variant="danger" size="sm" onClick={() => { if (confirm('Remove this document?')) deleteMut.mutate(doc.id) }}>
                <Trash2 size={13} />
              </Button>
            </div>
          ))}
          {docs.length === 0 && (
            <CardBody>
              <p className="text-bb-muted text-sm text-center py-4">No documents yet. Add your first one to make the chatbot smarter!</p>
            </CardBody>
          )}
        </div>
      </Card>
    </div>
  )
}
