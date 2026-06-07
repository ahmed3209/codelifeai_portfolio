import { Router } from 'express'
import { GoogleGenAI } from '@google/genai'
import { getDb } from '../db/database.js'

const router = Router()

// Default to Gemini 2.0 Flash — free tier: 1500 req/day, 15 RPM, 1M TPM.
// Admin can override via the `gemini_model` setting (e.g. gemini-2.0-flash-lite,
// gemini-2.5-flash) from the admin Settings page.
const DEFAULT_MODEL = 'gemini-2.0-flash'

async function loadSettings(db) {
  const { rows } = await db.execute('SELECT key, value FROM settings')
  return rows.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
}

async function loadContactEmail(db) {
  const { rows } = await db.execute({
    sql: "SELECT value FROM content WHERE key = 'contact_email'",
    args: [],
  })
  return rows[0]?.value || 'hello@codelifeai.com'
}

async function buildSystemPrompt(db, settings, contactEmail) {
  const chatbotName = settings.chatbot_name || 'CodeLifeAI Assistant'

  // Inline the whole services catalog + KB. Smaller and higher quality than
  // keyword retrieval for a portfolio-sized dataset, and lets Gemini ground
  // every answer in the same context.
  const [services, kb] = await Promise.all([
    db.execute('SELECT title, short_desc, long_desc FROM services ORDER BY sort_order ASC'),
    db.execute('SELECT title, content FROM kb_documents'),
  ])

  const servicesBlock = services.rows
    .map(s => `### ${s.title}\n${s.short_desc}${s.long_desc ? `\n\n${s.long_desc}` : ''}`)
    .join('\n\n')

  const kbBlock = kb.rows.length
    ? kb.rows.map(d => `### ${d.title}\n${d.content}`).join('\n\n---\n\n')
    : '(no knowledge base documents yet)'

  return `You are ${chatbotName}, the AI assistant on CodeLifeAI's portfolio website.

CodeLifeAI is a software startup co-founded by Muhammad Ahmed (CEO) and Anas Waheed (CTO), based in Pakistan.

## Our Services
${servicesBlock}

## Knowledge Base
${kbBlock}

## Contact
${contactEmail}

## Style
- Be concise, warm, and professional. Max 2-3 short paragraphs.
- **Plain prose only — no markdown.** Never use asterisks (*, **), bullet points, numbered lists, headings (#), or code blocks. Write in natural conversational sentences only. When you need to list things, weave them into a sentence with commas (e.g. "we cover web development, mobile apps, and AI integration") rather than bullets.
- Ground every claim in the services or knowledge base above.
- For pricing or scope questions, direct the user to ${contactEmail}.
- For off-topic questions, gently bring the conversation back to how CodeLifeAI can help.
- Never invent facts not present above.`
}

function offlineReply(contactEmail) {
  return `Our AI assistant is offline right now — please reach out directly at ${contactEmail} and we'll get right back to you!`
}

// Load the last N turns of this visitor's chat history from the DB, format
// for Gemini, and append the new user message. History is server-authoritative
// — the frontend doesn't need to (and now doesn't) send it.
async function buildContentsFromHistory(db, sessionId, currentMessage) {
  let history = []
  if (sessionId) {
    const { rows } = await db.execute({
      sql: 'SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY id DESC LIMIT 10',
      args: [sessionId],
    })
    history = rows.reverse()
  }

  const merged = [...history, { role: 'user', content: currentMessage }]
  const contents = merged.map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }],
  }))

  // Gemini requires the first turn to be 'user'.
  while (contents.length > 0 && contents[0].role !== 'user') {
    contents.shift()
  }
  return contents
}

// Persist a user→assistant exchange. Fire-and-forget — chat history is
// advisory, never block returning the reply on this.
async function persistExchange(db, sessionId, userMessage, assistantReply) {
  if (!sessionId) return
  try {
    await db.batch([
      {
        sql: 'INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)',
        args: [sessionId, 'user', userMessage],
      },
      {
        sql: 'INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)',
        args: [sessionId, 'assistant', assistantReply],
      },
    ], 'write')
  } catch (err) {
    console.error('chat persist failed', err?.message ?? err)
  }
}

function classifyError(err) {
  // Different SDK versions and nested errors put the status code in different places.
  const status = err?.status
              ?? err?.code
              ?? err?.error?.code
              ?? err?.response?.status
              ?? err?.cause?.status

  const message = String(err?.message || err?.error?.message || err || '').toLowerCase()

  // Numeric status is the most reliable signal — try it first.
  if (typeof status === 'number') {
    if (status === 400) return 'bad_request'
    if (status === 401 || status === 403) return 'auth'
    if (status === 404) return 'not_found'
    if (status === 429) return 'rate_limit'
    if (status >= 500) return 'server'
  }

  // Fall back to message inspection — use word boundaries to avoid false
  // positives like "generateContent" matching the substring "rate".
  if (/\bapi[_ -]?key\b/.test(message) || /\bpermission[_ -]?denied\b/.test(message) || /\bunauthorized\b/.test(message)) {
    return 'auth'
  }
  if (/\bquota\b/.test(message) || /\brate[ _-]?limit/.test(message) || /\bresource[_ -]?exhausted\b/.test(message)) {
    return 'rate_limit'
  }
  if (/\bnot[ _-]?found\b/.test(message) || /\bdoes not exist\b/.test(message)) {
    return 'not_found'
  }
  if (/\b(unavailable|overloaded|internal[ _-]?error)\b/.test(message)) {
    return 'server'
  }
  if (/\binvalid[ _-]?argument\b/.test(message) || /\bbad[ _-]?request\b/.test(message)) {
    return 'bad_request'
  }
  return 'unknown'
}

// POST /api/chat — public chatbot endpoint
router.post('/chat', async (req, res) => {
  const db = getDb()
  const { message } = req.body
  const sessionId = req.visitorSessionId

  if (!message?.trim()) return res.status(400).json({ error: 'Message required' })

  const settings = await loadSettings(db)
  const contactEmail = await loadContactEmail(db)
  const apiKey = settings.gemini_api_key || process.env.GEMINI_API_KEY
  const model = settings.gemini_model || DEFAULT_MODEL

  if (!apiKey) {
    const reply = offlineReply(contactEmail)
    await persistExchange(db, sessionId, message, reply)
    return res.json({ reply })
  }

  let systemInstruction, contents
  try {
    systemInstruction = await buildSystemPrompt(db, settings, contactEmail)
    contents = await buildContentsFromHistory(db, sessionId, message)
  } catch (err) {
    console.error('chat prompt build error', err)
    const reply = `I'm having trouble right now — please reach us at ${contactEmail}!`
    await persistExchange(db, sessionId, message, reply)
    return res.json({ reply })
  }

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        maxOutputTokens: 1024, // ~2-3 short paragraphs
        temperature: 0.7,
      },
    })

    const reply = (response.text || '').trim() ||
      `I couldn't generate a response — please try again or email us at ${contactEmail}.`

    // Light usage logging — surfaces in Vercel function logs.
    if (response.usageMetadata) {
      console.log('gemini usage', {
        model,
        prompt: response.usageMetadata.promptTokenCount,
        output: response.usageMetadata.candidatesTokenCount,
        total: response.usageMetadata.totalTokenCount,
      })
    }

    await persistExchange(db, sessionId, message, reply)
    res.json({ reply })
  } catch (err) {
    const kind = classifyError(err)
    // Stringify the full error object so any nested fields land in Vercel logs.
    console.error('gemini error', kind, JSON.stringify({
      status: err?.status,
      code: err?.code,
      message: err?.message,
      errorMessage: err?.error?.message,
      stack: err?.stack?.split('\n').slice(0, 3),
    }))

    let reply
    switch (kind) {
      case 'auth':
      case 'not_found':
        // Either the API key was rejected or the configured model doesn't
        // exist — both require admin attention, so show the offline message.
        reply = offlineReply(contactEmail)
        break
      case 'rate_limit':
        reply = `We're getting more questions than usual right now. Please try again in a moment, or email us at ${contactEmail}.`
        break
      case 'bad_request':
        reply = `I had trouble understanding that. Could you rephrase, or email us at ${contactEmail}?`
        break
      default:
        reply = `I'm having trouble right now. Please reach us at ${contactEmail}!`
    }

    // Always 200 — the chatbot UI just renders whatever reply we return.
    // Errors are visible to the admin in Vercel function logs (console.error
    // above). No debug field exposed to public visitors.
    await persistExchange(db, sessionId, message, reply)
    res.json({ reply })
  }
})

// GET /api/chat/history — returns this visitor's chat history. The chatbot
// hydrates from this on mount so reloading the page doesn't lose context.
router.get('/chat/history', async (req, res) => {
  const sessionId = req.visitorSessionId
  if (!sessionId) return res.json({ messages: [] })
  try {
    const { rows } = await getDb().execute({
      sql: `SELECT role, content, created_at FROM chat_messages
            WHERE session_id = ?
            ORDER BY id ASC
            LIMIT 200`,
      args: [sessionId],
    })
    res.json({ messages: rows })
  } catch (err) {
    console.error('chat history load failed', err?.message ?? err)
    res.json({ messages: [] })
  }
})

// GET /api/chat/models — admin Settings uses this to verify the API key works
// and populate the model picker.
router.get('/chat/models', async (req, res) => {
  const db = getDb()
  const settings = await loadSettings(db)
  const apiKey = settings.gemini_api_key || process.env.GEMINI_API_KEY

  if (!apiKey) {
    return res.json({ connected: false, models: [], reason: 'no_api_key' })
  }

  try {
    const ai = new GoogleGenAI({ apiKey })
    // Pager auto-paginates on iteration; filter to generateContent-capable
    // models so we don't show embedding/tts variants.
    const list = []
    const pager = await ai.models.list()
    for await (const m of pager) {
      const methods = m.supportedActions || m.supportedGenerationMethods || []
      const canGenerate = methods.length === 0 || methods.includes('generateContent')
      if (!canGenerate) continue
      const id = (m.name || '').replace(/^models\//, '')
      if (!id) continue
      list.push({ id, name: m.displayName || id })
    }
    res.json({ connected: true, models: list })
  } catch (err) {
    const kind = classifyError(err)
    res.json({
      connected: false,
      models: [],
      reason: kind === 'auth' ? 'invalid_key' : 'api_error',
      detail: err?.message,
    })
  }
})

export default router
