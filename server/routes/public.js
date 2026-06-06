import { Router } from 'express'
import { getDb } from '../db/database.js'

const router = Router()

// GET /api/site-data — everything the homepage needs in one request
router.get('/site-data', async (req, res) => {
  const db = getDb()

  const [services, founders, projects, testimonials, process, rawContent, activePromo] = await Promise.all([
    db.execute('SELECT * FROM services ORDER BY sort_order ASC'),
    db.execute('SELECT id, name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url, sort_order, created_at FROM founders ORDER BY sort_order ASC'),
    db.execute('SELECT * FROM projects ORDER BY sort_order ASC'),
    db.execute('SELECT * FROM testimonials ORDER BY sort_order ASC'),
    db.execute('SELECT * FROM process_steps ORDER BY sort_order ASC'),
    db.execute('SELECT key, value FROM content'),
    db.execute('SELECT * FROM promos WHERE is_active = 1 LIMIT 1'),
  ])

  const content = rawContent.rows.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

  res.json({
    services: services.rows,
    founders: founders.rows,
    projects: projects.rows,
    testimonials: testimonials.rows,
    process: process.rows,
    content,
    activePromo: activePromo.rows[0] || null,
  })
})

// GET /api/promos/active — the currently featured promo (or null)
router.get('/promos/active', async (req, res) => {
  const { rows } = await getDb().execute('SELECT * FROM promos WHERE is_active = 1 LIMIT 1')
  res.json(rows[0] || null)
})

// GET /api/promos/:slug — a specific promo by slug (for direct-linked /launch/:slug)
router.get('/promos/:slug', async (req, res) => {
  const { rows } = await getDb().execute({
    sql: 'SELECT * FROM promos WHERE slug = ? LIMIT 1',
    args: [req.params.slug],
  })
  if (!rows[0]) return res.status(404).json({ error: 'Promo not found' })
  res.json(rows[0])
})

// GET /api/services
router.get('/services', async (req, res) => {
  const { rows } = await getDb().execute('SELECT * FROM services ORDER BY sort_order ASC')
  res.json(rows)
})

// GET /api/founders
router.get('/founders', async (req, res) => {
  const { rows } = await getDb().execute('SELECT id, name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url, sort_order, created_at FROM founders ORDER BY sort_order ASC')
  res.json(rows)
})

// GET /api/founders/:id/photo — serves the stored photo bytes.
// `photo_url` on each founder row points at this endpoint when a photo
// is uploaded (e.g. `/api/founders/3/photo?v=1717... `).
router.get('/founders/:id/photo', async (req, res) => {
  const { rows } = await getDb().execute({
    sql: 'SELECT photo_data, photo_mime FROM founders WHERE id = ?',
    args: [req.params.id],
  })
  const row = rows[0]
  if (!row || !row.photo_data) return res.status(404).json({ error: 'Photo not found' })

  const buf = Buffer.from(row.photo_data, 'base64')
  res.setHeader('Content-Type', row.photo_mime || 'image/jpeg')
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  res.setHeader('Content-Length', buf.length)
  res.end(buf)
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
