import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDb } from './db/database.js'
import { ensureVisitorSession } from './middleware/session.js'

import publicRoutes  from './routes/public.js'
import adminRoutes   from './routes/admin.js'
import chatRoutes    from './routes/chat.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 4000

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true)
    cb(null, allowedOrigins.includes(origin))
  },
  credentials: true,
}))
app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))

// Health check — does not touch the DB. Useful for confirming the function loads.
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    vercel: !!process.env.VERCEL,
    hasTurso: !!process.env.TURSO_DATABASE_URL,
  })
})

// Lazy DB init on first /api request
app.use('/api', async (req, res, next) => {
  try {
    await initDb()
    next()
  } catch (err) {
    console.error('initDb failed:', err)
    res.status(500).json({ error: 'Database init failed', message: err.message })
  }
})

// Issue/refresh anonymous visitor session cookie on every /api hit. Powers
// chat history persistence and lightweight analytics.
app.use('/api', ensureVisitorSession)

// API routes
app.use('/api', publicRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', chatRoutes)

// Serve built React app (local Docker compose mode only)
if (!process.env.VERCEL) {
  const publicDir = path.join(__dirname, 'public')
  app.use(express.static(publicDir))
}

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' })
  }
  if (process.env.VERCEL) {
    return res.json({ ok: true, service: 'codelifeai-api', note: 'Static client is hosted on Hostinger.' })
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 CodeLifeAI server running on http://localhost:${PORT}`)
    console.log(`   API:         http://localhost:${PORT}/api\n`)
  })
}

export default app
