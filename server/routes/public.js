import { Router } from 'express'
import { getDb } from '../db/database.js'

const router = Router()

// GET /api/site-data — everything the homepage needs in one request
router.get('/site-data', async (req, res) => {
  const db = getDb()

  const [services, founders, projects, testimonials, process, rawContent] = await Promise.all([
    db.execute('SELECT * FROM services ORDER BY sort_order ASC'),
    db.execute('SELECT * FROM founders ORDER BY sort_order ASC'),
    db.execute('SELECT * FROM projects ORDER BY sort_order ASC'),
    db.execute('SELECT * FROM testimonials ORDER BY sort_order ASC'),
    db.execute('SELECT * FROM process_steps ORDER BY sort_order ASC'),
    db.execute('SELECT key, value FROM content'),
  ])

  const content = rawContent.rows.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

  res.json({
    services: services.rows,
    founders: founders.rows,
    projects: projects.rows,
    testimonials: testimonials.rows,
    process: process.rows,
    content,
  })
})

// GET /api/services
router.get('/services', async (req, res) => {
  const { rows } = await getDb().execute('SELECT * FROM services ORDER BY sort_order ASC')
  res.json(rows)
})

// GET /api/founders
router.get('/founders', async (req, res) => {
  const { rows } = await getDb().execute('SELECT * FROM founders ORDER BY sort_order ASC')
  res.json(rows)
})

// POST /api/contact
router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' })

  await getDb().execute({
    sql: 'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
    args: [name, email, message],
  })
  res.json({ ok: true })
})

// POST /api/early-access — ZYRA AI early access requests
router.post('/early-access', async (req, res) => {
  const { name, email, reason } = req.body
  if (!name || !email || !reason) {
    return res.status(400).json({ error: 'Name, email, and reason are all required' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' })
  }

  await getDb().execute({
    sql: 'INSERT INTO early_access (name, email, reason) VALUES (?, ?, ?)',
    args: [name.trim(), email.trim(), reason.trim()],
  })
  res.json({ ok: true })
})

export default router
