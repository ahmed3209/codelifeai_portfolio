import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Zap } from 'lucide-react'
import { publicApi } from '../../lib/api'

const PANEL_VARIANTS = {
  hidden: { opacity: 0, scale: 0.88, y: 16, originX: 1, originY: 1 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', damping: 24, stiffness: 320 },
  },
  exit: {
    opacity: 0, scale: 0.88, y: 12,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
}

const MSG_VARIANTS = {
  hidden:  { opacity: 0, y: 10, scale: 0.95 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring', damping: 20, stiffness: 300 } },
}

const GREETING = { role: 'assistant', content: "Hi! I'm the CodeLifeAI assistant. Ask me about our services, team, or how we can help build your next product!" }

export default function ChatBot() {
  const [open,     setOpen]     = useState(false)
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showDot,  setShowDot]  = useState(true)
  const [messages, setMessages] = useState([GREETING])
  const endRef   = useRef(null)
  const inputRef = useRef(null)

  // Hydrate from server history on mount. Returning visitors see their
  // previous conversation; new visitors see just the greeting.
  useEffect(() => {
    let cancelled = false
    publicApi.getChatHistory()
      .then(r => {
        if (cancelled) return
        const past = (r.data?.messages || []).filter(m => m.role === 'user' || m.role === 'assistant')
        if (past.length > 0) setMessages(past)
      })
      .catch(() => { /* keep greeting */ })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (open) {
      setShowDot(false)
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [open])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      // Server is authoritative for history — it loads our prior turns from
      // the visitor_sessions cookie. We only send the new message.
      const { data } = await publicApi.sendMessage({ message: text })
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble right now. Please email us at hello@codelifeai.com!"
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="fixed bottom-7 right-7 z-[1000] flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            variants={PANEL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-[360px] flex flex-col rounded-2xl border border-white/[0.1] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
            style={{ height: 500, background: '#0b0b1d' }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0"
              style={{ background: 'linear-gradient(90deg, rgba(0,212,245,0.08), rgba(124,58,237,0.08))' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #00d4f5, #7c3aed)' }}
                >
                  <Zap size={14} className="text-black" />
                </div>
                <div>
                  <p className="text-[0.85rem] font-bold text-bb-white leading-tight">CodeLifeAI Assistant</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-[pulseGlow_2s_ease-in-out_infinite]" />
                    <span className="text-[0.66rem] text-emerald-400 font-medium">Online · Ask anything</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg text-bb-muted hover:text-bb-white hover:bg-white/[0.07] flex items-center justify-center transition-all"
              >
                <X size={13} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    variants={MSG_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[0.82rem] leading-snug
                      ${m.role === 'user'
                        ? 'ml-auto rounded-br-sm font-medium text-black'
                        : 'mr-auto rounded-bl-sm text-white/80 bg-white/[0.06]'
                      }`}
                    style={m.role === 'user'
                      ? { background: 'linear-gradient(135deg, #00d4f5, #0099bb)' }
                      : {}
                    }
                  >
                    {m.content}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  variants={MSG_VARIANTS}
                  initial="hidden"
                  animate="visible"
                  className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-sm bg-white/[0.06] mr-auto"
                >
                  <div className="flex items-center gap-1">
                    {[0, 180, 360].map(d => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-white/40"
                        style={{ animation: `dotPulse 1.2s ${d}ms ease-in-out infinite` }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/[0.06] flex gap-2 flex-shrink-0 bg-black/20">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type a message…"
                rows={1}
                className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[0.82rem] text-bb-white placeholder:text-white/20 outline-none focus:border-bb-accent/30 transition-colors resize-none max-h-[90px] scrollbar-thin"
                style={{ lineHeight: 1.5 }}
              />
              <motion.button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
                className="w-9 h-9 rounded-xl bg-bb-accent flex items-center justify-center flex-shrink-0 self-end hover:opacity-90 transition-opacity disabled:opacity-35"
              >
                <Send size={14} className="text-black" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #00d4f5, #7c3aed)',
          boxShadow: '0 4px 28px rgba(0,212,245,0.35), 0 2px 8px rgba(0,0,0,0.4)',
        }}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                <X size={20} className="text-white" />
              </motion.span>
            : <motion.span key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                <MessageSquare size={20} className="text-white" />
              </motion.span>
          }
        </AnimatePresence>

        {/* Notification dot */}
        <AnimatePresence>
          {showDot && !open && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ delay: 1.6, type: 'spring', damping: 10 }}
              className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#06060f]"
            />
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
