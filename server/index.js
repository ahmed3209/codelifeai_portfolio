import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDb } from './db/database.js'

// Routes
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
app.use(express.json({ limit: '10mb' }))

// API routes
app.use('/api', publicRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', chatRoutes)

// Serve built React app in production
const publicDir = path.join(__dirname, 'public')
app.use(express.static(publicDir))
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(publicDir, 'index.html'))
  }
})

// Boot
await initDb()

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 CodeLifeAI server running on http://localhost:${PORT}`)
    console.log(`   Admin panel: http://localhost:${PORT}/admin`)
    console.log(`   API:         http://localhost:${PORT}/api\n`)
  })
}

export default app
