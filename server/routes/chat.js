import { Router } from 'express'
import { getDb } from '../db/database.js'

const router = Router()

// ── RAG: keyword retrieval from SQLite knowledge base ────────────────────────
async function retrieveContext(db, query, limit = 4) {
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)

  for (const kw of keywords) {
    const { rows } = await db.execute({
      sql: `SELECT title, content FROM kb_documents
            WHERE lower(content) LIKE ? OR lower(title) LIKE ?
            LIMIT ?`,
      args: [`%${kw}%`, `%${kw}%`, limit],
    })
    if (rows.length > 0) return rows
  }

  const { rows } = await db.execute({
    sql: 'SELECT title, content FROM kb_documents LIMIT ?',
    args: [limit],
  })
  return rows
}

// ── Ollama API call ──────────────────────────────────────────────────────────
async function callOllama({ ollamaUrl, model, systemPrompt, history, message }) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-8),
    { role: 'user', content: message }
  ]

  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 512,
      }
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Ollama error ${response.status}: ${err}`)
  }

  const data = await response.json()
  return data.message?.content || "I couldn't generate a response. Please try again!"
}

// ── POST /api/chat ────────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  const db = getDb()
  const { message, history = [] } = req.body

  if (!message?.trim()) return res.status(400).json({ error: 'Message required' })

  const settingsRes = await db.execute('SELECT key, value FROM settings')
  const settings = settingsRes.rows.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

  const ollamaUrl    = settings.ollama_url   || process.env.OLLAMA_URL   || 'http://localhost:11434'
  const model        = settings.ollama_model || process.env.OLLAMA_MODEL || 'llama3.2'
  const chatbotName  = settings.chatbot_name || 'CodeLifeAI Assistant'

  const contactEmailRes = await db.execute({
    sql: "SELECT value FROM content WHERE key = 'contact_email'",
    args: [],
  })
  const contactEmail = contactEmailRes.rows[0]?.value || 'hello@codelifeai.com'

  const contextDocs = await retrieveContext(db, message)
  const contextText = contextDocs.length > 0
    ? contextDocs.map(d => `### ${d.title}\n${d.content}`).join('\n\n---\n\n')
    : ''

  const servicesRes = await db.execute('SELECT title, short_desc FROM services ORDER BY sort_order')
  const servicesText = servicesRes.rows.map(s => `- ${s.title}: ${s.short_desc}`).join('\n')

  const systemPrompt = `You are ${chatbotName}, the helpful AI assistant on CodeLifeAI's portfolio website.

CodeLifeAI is a software startup co-founded by Muhammad Ahmed (CEO) and Anas Waheed (CTO), based in Pakistan.

## Our Services
${servicesText}

## Contact
${contactEmail}

${contextText ? `## Knowledge Base\nUse the information below to answer accurately:\n\n${contextText}` : ''}

## Instructions
- Be concise, warm, and professional. Max 2–3 short paragraphs.
- Ground your answers in the knowledge base above.
- For pricing or project inquiries, direct the user to ${contactEmail}.
- For off-topic questions, gently redirect to how CodeLifeAI can help.
- Never invent facts not present in the context above.`

  try {
    const reply = await callOllama({ ollamaUrl, model, systemPrompt, history, message })
    res.json({ reply })
  } catch (err) {
    console.error('Ollama chat error:', err.message)

    const isConnectionRefused = err.message.includes('ECONNREFUSED') || err.message.includes('fetch failed')
    const reply = isConnectionRefused
      ? `Our AI assistant is currently offline. Please reach out directly at ${contactEmail} and we'll get right back to you!`
      : `I'm having trouble right now. Please reach us directly at ${contactEmail}!`

    res.json({ reply })
  }
})

// ── GET /api/chat/models — list available Ollama models ──────────────────────
router.get('/chat/models', async (req, res) => {
  const db = getDb()
  const { rows } = await db.execute('SELECT key, value FROM settings')
  const settings = rows.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
  const ollamaUrl = settings.ollama_url || process.env.OLLAMA_URL || 'http://localhost:11434'

  try {
    const response = await fetch(`${ollamaUrl}/api/tags`)
    if (!response.ok) throw new Error('Ollama not reachable')
    const data = await response.json()
    const models = data.models?.map(m => m.name) || []
    res.json({ models, connected: true })
  } catch {
    res.json({ models: [], connected: false })
  }
})

export default router
