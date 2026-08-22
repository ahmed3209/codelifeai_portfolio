import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { adminApi } from '../../lib/api'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { Trash2, Mail, Send, CheckCircle2, Clock, Sparkles, MessageSquare, ExternalLink, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminEnquiries() {
  const qc = useQueryClient()
  const [replyModal, setReplyModal] = useState(null) // selected contact object or null
  const [viewReplyModal, setViewReplyModal] = useState(null) // selected contact object to view past reply
  const [replySubject, setReplySubject] = useState('')
  const [replyMessage, setReplyMessage] = useState('')

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: () => adminApi.getContacts().then(r => r.data),
  })

  const deleteMut = useMutation({
    mutationFn: adminApi.deleteContact,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-contacts'] })
      toast.success('Enquiry deleted')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to delete enquiry')
    }
  })

  const replyMut = useMutation({
    mutationFn: ({ id, subject, message }) => adminApi.replyContact(id, { subject, message }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-contacts'] })
      setReplyModal(null)
      setReplySubject('')
      setReplyMessage('')
      toast.success('Email reply sent successfully!')
    },
    onError: (err) => {
      const msg = err.response?.data?.error || err.message || 'Failed to send email reply'
      toast.error(msg, { duration: 6000 })
    }
  })

  function openReply(c) {
    setReplyModal(c)
    setReplySubject(`Re: Enquiry from CodeLifeAI — ${c.name}`)
    setReplyMessage(`Hi ${c.name},\n\nThank you for reaching out to CodeLifeAI!\n\nWe have received your enquiry regarding:\n"${c.message}"\n\n`)
  }

  function applySnippet(text) {
    if (!replyModal) return
    const formatted = text.replace(/\[Name\]/g, replyModal.name || 'there')
    setReplyMessage(formatted)
  }

  function handleSendReply(e) {
    e.preventDefault()
    if (!replyModal) return
    if (!replyMessage.trim()) {
      toast.error('Please write a reply message')
      return
    }
    replyMut.mutate({
      id: replyModal.id,
      subject: replySubject.trim(),
      message: replyMessage.trim(),
    })
  }

  const QUICK_SNIPPETS = [
    {
      title: 'Schedule Discovery Call',
      body: `Hi [Name],\n\nThank you for contacting CodeLifeAI!\n\nWe would love to learn more about your project goals and discuss how we can build the ideal solution for you. Are you available for a brief 15-minute discovery call this week?\n\nLooking forward to speaking with you!`,
    },
    {
      title: 'Scope & Proposal Estimate',
      body: `Hi [Name],\n\nThank you for reaching out. We have reviewed your request and would be glad to prepare a detailed scope and timeline estimate for you.\n\nCould you please share a few additional details regarding your target launch date or any specific technical preferences?\n\nBest regards,`,
    },
    {
      title: 'General Confirmation',
      body: `Hi [Name],\n\nThank you for contacting CodeLifeAI! Our team has received your message and we are reviewing the specifications.\n\nWe will follow up with you with full details shortly.`,
    },
  ]

  const newCount = items.filter(c => c.status !== 'replied').length
  const repliedCount = items.filter(c => c.status === 'replied').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bb-white tracking-tight">Enquiries &amp; Client Messages</h1>
          <p className="text-bb-muted text-sm mt-1">
            Manage contact form messages and reply directly via your business email (<strong className="text-[#00d4f5]">contact@codelifeai.com</strong>).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#00d4f5]/10 border border-[#00d4f5]/25 text-[#00d4f5]">
            <Clock size={12} /> {newCount} New
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
            <CheckCircle2 size={12} /> {repliedCount} Replied
          </span>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <CardBody><p className="text-bb-muted text-sm py-4">Loading enquiries…</p></CardBody>
        ) : items.length === 0 ? (
          <CardBody>
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-bb-muted">
                <Mail size={20} />
              </div>
              <p className="text-bb-white font-medium text-sm">No enquiries yet</p>
              <p className="text-bb-muted text-xs mt-1">Messages submitted through your website contact form will appear here.</p>
            </div>
          </CardBody>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {items.map(c => {
              const isReplied = c.status === 'replied'
              return (
                <div key={c.id} className="p-5 sm:p-6 hover:bg-white/[0.015] transition-colors space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${isReplied ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-bb-accent/10 border border-bb-accent/20 text-bb-accent'}`}>
                        <Mail size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-bb-white">{c.name}</h3>
                          <a href={`mailto:${c.email}`} className="text-xs text-[#00d4f5] hover:underline font-mono">
                            {c.email}
                          </a>
                          {isReplied ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[0.62rem] font-bold text-emerald-400 uppercase tracking-wider">
                              <CheckCircle2 size={10} /> Replied
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bb-accent/10 border border-bb-accent/25 text-[0.62rem] font-bold text-bb-accent uppercase tracking-wider">
                              <Clock size={10} /> New
                            </span>
                          )}
                        </div>
                        <p className="text-[0.7rem] text-bb-muted mt-0.5">
                          Received: {new Date(c.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                          {isReplied && c.replied_at && (
                            <span className="text-emerald-400/80 ml-2">
                              · Replied: {new Date(c.replied_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isReplied ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewReplyModal(c)}
                            title="View the email sent to this client"
                          >
                            <MessageSquare size={13} /> View Sent Reply
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReply(c)}
                            title="Send another reply or follow-up"
                          >
                            <Send size={13} /> Reply Again
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => openReply(c)}
                          title="Reply directly via email"
                          className="bg-[#00d4f5] hover:bg-[#00d4f5]/85 text-black font-semibold shadow-lg shadow-[#00d4f5]/15"
                        >
                          <Send size={13} /> Reply via Email
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => { if (confirm(`Delete enquiry from ${c.name}?`)) deleteMut.mutate(c.id) }}
                        title="Delete enquiry"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                    {c.message}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* ── Reply Email Modal ── */}
      <Modal
        open={!!replyModal}
        onClose={() => setReplyModal(null)}
        title={replyModal ? `Reply to ${replyModal.name}` : 'Reply via Email'}
        size="lg"
      >
        {replyModal && (
          <form onSubmit={handleSendReply} className="space-y-4">
            {/* Recipient & Sender Info Header */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-bb-muted">To:</span>
                <span className="text-bb-white font-semibold font-mono">
                  {replyModal.name} &lt;{replyModal.email}&gt;
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-bb-muted">From:</span>
                <span className="text-[#00d4f5] font-semibold font-mono">
                  CodeLifeAI &lt;contact@codelifeai.com&gt;
                </span>
              </div>
            </div>

            {/* Subject Input */}
            <Input
              label="Subject"
              value={replySubject}
              onChange={e => setReplySubject(e.target.value)}
              required
              placeholder="e.g. Re: Enquiry from CodeLifeAI"
            />

            {/* Quick Templates */}
            <div>
              <label className="text-xs font-semibold text-bb-muted uppercase tracking-widest block mb-2">
                Quick Response Snippets
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_SNIPPETS.map((snip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applySnippet(snip.body)}
                    className="text-[0.72rem] font-medium px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-[#00d4f5]/40 hover:bg-[#00d4f5]/5 text-bb-muted hover:text-bb-white transition-colors"
                  >
                    ⚡ {snip.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body */}
            <Textarea
              label="Your Message"
              value={replyMessage}
              onChange={e => setReplyMessage(e.target.value)}
              required
              rows={8}
              placeholder="Type your response here…"
            />

            {/* Original Enquiry Preview */}
            <div className="bg-black/30 border border-white/[0.06] rounded-xl p-3 text-xs text-bb-muted">
              <span className="font-semibold text-white/50 block mb-1">Original Enquiry from {replyModal.name}:</span>
              <p className="italic line-clamp-3 text-slate-300">"{replyModal.message}"</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                to="/admin/settings"
                target="_blank"
                className="text-[0.72rem] text-bb-muted hover:text-[#00d4f5] inline-flex items-center gap-1 transition-colors"
              >
                Configure SMTP Password in Settings <ExternalLink size={11} />
              </Link>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={() => setReplyModal(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={replyMut.isPending}
                  className="bg-[#00d4f5] hover:bg-[#00d4f5]/85 text-black font-bold"
                >
                  <Send size={14} /> Send Email Reply
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* ── View Sent Reply Modal ── */}
      <Modal
        open={!!viewReplyModal}
        onClose={() => setViewReplyModal(null)}
        title="Sent Email Details"
        size="md"
      >
        {viewReplyModal && (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-400">
              <CheckCircle2 size={16} className="flex-shrink-0" />
              <span>
                Email reply delivered to <strong>{viewReplyModal.email}</strong> on{' '}
                {viewReplyModal.replied_at
                  ? new Date(viewReplyModal.replied_at).toLocaleString()
                  : 'recently'}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-bb-muted font-semibold uppercase tracking-wider">Subject</p>
              <p className="text-sm font-semibold text-bb-white bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2">
                {viewReplyModal.reply_subject || 'Response from CodeLifeAI'}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-bb-muted font-semibold uppercase tracking-wider">Sent Message Body</p>
              <div className="text-xs text-slate-200 bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {viewReplyModal.reply_message || 'No reply text recorded'}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setViewReplyModal(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
