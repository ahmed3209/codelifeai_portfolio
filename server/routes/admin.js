import { Router } from 'express'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import { getDb } from '../db/database.js'
import { authMiddleware, signToken } from '../middleware/auth.js'

const router = Router()

// Multer config for founder photo uploads: in-memory, 1MB max, image MIME only.
const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 }, // 1 MB
  fileFilter(req, file, cb) {
    if (!/^image\/(jpe?g|png|webp|gif)$/i.test(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, WebP or GIF images are allowed'))
    }
    cb(null, true)
  },
})

// ── AUTH ──────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const db = getDb()

  const { rows } = await db.execute({
    sql: 'SELECT * FROM admin_users WHERE username = ?',
    args: [username],
  })
  const user = rows[0]
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.password)
    .catch(() => password === user.password)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = signToken({ id: user.id, username: user.username })
  res.json({ token, user: { id: user.id, username: user.username } })
})

// All routes below require auth
router.use(authMiddleware)

// ── DASHBOARD STATS ───────────────────────────────────────────

router.get('/stats', async (req, res) => {
  const db = getDb()
  const [services, founders, kb, contacts, projects, testimonials, earlyAccess] = await Promise.all([
    db.execute('SELECT COUNT(*) as c FROM services'),
    db.execute('SELECT COUNT(*) as c FROM founders'),
    db.execute('SELECT COUNT(*) as c FROM kb_documents'),
    db.execute('SELECT COUNT(*) as c FROM contacts'),
    db.execute('SELECT COUNT(*) as c FROM projects'),
    db.execute('SELECT COUNT(*) as c FROM testimonials'),
    db.execute('SELECT COUNT(*) as c FROM early_access'),
  ])
  res.json({
    services:     Number(services.rows[0].c),
    founders:     Number(founders.rows[0].c),
    kb_docs:      Number(kb.rows[0].c),
    contacts:     Number(contacts.rows[0].c),
    projects:     Number(projects.rows[0].c),
    testimonials: Number(testimonials.rows[0].c),
    early_access: Number(earlyAccess.rows[0].c),
  })
})

// ── SERVICES ──────────────────────────────────────────────────

router.get('/services', async (req, res) => {
  const { rows } = await getDb().execute('SELECT * FROM services ORDER BY sort_order ASC')
  res.json(rows)
})

router.post('/services', async (req, res) => {
  const { title, icon, short_desc, long_desc, features, stack, sort_order } = req.body
  const db = getDb()
  const max = await db.execute('SELECT MAX(sort_order) as m FROM services')
  const nextOrder = sort_order || (Number(max.rows[0].m) || 0) + 1
  const ins = await db.execute({
    sql: 'INSERT INTO services (title,icon,short_desc,long_desc,features,stack,sort_order) VALUES (?,?,?,?,?,?,?)',
    args: [title, icon || '⚡', short_desc, long_desc, features || '[]', stack || '[]', nextOrder],
  })
  const { rows } = await db.execute({
    sql: 'SELECT * FROM services WHERE id = ?',
    args: [Number(ins.lastInsertRowid)],
  })
  res.json(rows[0])
})

router.put('/services/reorder', async (req, res) => {
  const { order } = req.body  // array of { id, sort_order }
  const db = getDb()
  await db.batch(
    order.map(i => ({
      sql: 'UPDATE services SET sort_order = ? WHERE id = ?',
      args: [i.sort_order, i.id],
    })),
    'write'
  )
  res.json({ ok: true })
})

router.put('/services/:id', async (req, res) => {
  const { title, icon, short_desc, long_desc, features, stack, sort_order } = req.body
  const db = getDb()
  await db.execute({
    sql: `UPDATE services SET title=?,icon=?,short_desc=?,long_desc=?,features=?,stack=?,sort_order=?,
          updated_at=datetime('now') WHERE id=?`,
    args: [title, icon, short_desc, long_desc, features, stack, sort_order, req.params.id],
  })
  const { rows } = await db.execute({
    sql: 'SELECT * FROM services WHERE id = ?',
    args: [req.params.id],
  })
  res.json(rows[0])
})

router.delete('/services/:id', async (req, res) => {
  await getDb().execute({
    sql: 'DELETE FROM services WHERE id = ?',
    args: [req.params.id],
  })
  res.json({ ok: true })
})

// ── FOUNDERS ──────────────────────────────────────────────────

router.get('/founders', async (req, res) => {
  const { rows } = await getDb().execute('SELECT id, name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url, sort_order, created_at FROM founders ORDER BY sort_order ASC')
  res.json(rows)
})

router.post('/founders', async (req, res) => {
  const { name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url, sort_order } = req.body
  const db = getDb()
  const max = await db.execute('SELECT MAX(sort_order) as m FROM founders')
  const nextOrder = sort_order || (Number(max.rows[0].m) || 0) + 1
  const ins = await db.execute({
    sql: 'INSERT INTO founders (name,role,bio,initials,photo_url,avatar_bg,tags,linkedin_url,sort_order) VALUES (?,?,?,?,?,?,?,?,?)',
    args: [name, role, bio, initials, photo_url || '', avatar_bg || 'linear-gradient(135deg,#7c3aed,#00d4f5)', tags || '[]', linkedin_url || '', nextOrder],
  })
  const { rows } = await db.execute({
    sql: 'SELECT id, name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url, sort_order, created_at FROM founders WHERE id = ?',
    args: [Number(ins.lastInsertRowid)],
  })
  res.json(rows[0])
})

router.put('/founders/:id', async (req, res) => {
  const { name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url, sort_order } = req.body
  const db = getDb()
  await db.execute({
    sql: 'UPDATE founders SET name=?,role=?,bio=?,initials=?,photo_url=?,avatar_bg=?,tags=?,linkedin_url=?,sort_order=? WHERE id=?',
    args: [name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url || '', sort_order, req.params.id],
  })
  const { rows } = await db.execute({
    sql: 'SELECT id, name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url, sort_order, created_at FROM founders WHERE id = ?',
    args: [req.params.id],
  })
  res.json(rows[0])
})

router.delete('/founders/:id', async (req, res) => {
  await getDb().execute({
    sql: 'DELETE FROM founders WHERE id = ?',
    args: [req.params.id],
  })
  res.json({ ok: true })
})

// ── FOUNDER PHOTO UPLOAD/DELETE ──────────────────────────────
// Photo bytes live in `founders.photo_data` (base64 TEXT) + `photo_mime`.
// The public-facing `photo_url` is rewritten to `/api/founders/:id/photo?v=<ts>`
// so the existing <img src={founder.photo_url}> works unchanged.

router.post('/founders/:id/photo', photoUpload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' })
  const db = getDb()
  const id = req.params.id

  // Ensure the founder exists
  const check = await db.execute({
    sql: 'SELECT id FROM founders WHERE id = ?',
    args: [id],
  })
  if (!check.rows[0]) return res.status(404).json({ error: 'Founder not found' })

  const base64 = req.file.buffer.toString('base64')
  const mime   = req.file.mimetype
  const publicUrl = `/api/founders/${id}/photo?v=${Date.now()}`

  await db.execute({
    sql: `UPDATE founders SET photo_data = ?, photo_mime = ?, photo_url = ? WHERE id = ?`,
    args: [base64, mime, publicUrl, id],
  })

  res.json({ ok: true, photo_url: publicUrl })
})

router.delete('/founders/:id/photo', async (req, res) => {
  await getDb().execute({
    sql: `UPDATE founders SET photo_data = '', photo_mime = '', photo_url = '' WHERE id = ?`,
    args: [req.params.id],
  })
  res.json({ ok: true })
})

// Multer / fileFilter error handler — keep the JSON contract for upload errors.
router.use('/founders/:id/photo', (err, req, res, next) => {
  if (!err) return next()
  const msg = err.code === 'LIMIT_FILE_SIZE'
    ? 'Image is too large (max 1 MB)'
    : err.message || 'Upload failed'
  res.status(400).json({ error: msg })
})

// ── CONTENT ───────────────────────────────────────────────────

router.get('/content', async (req, res) => {
  const { rows } = await getDb().execute('SELECT key, value FROM content')
  res.json(rows.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {}))
})

router.put('/content', async (req, res) => {
  const db = getDb()
  const entries = Object.entries(req.body)
  await db.batch(
    entries.map(([k, v]) => ({
      sql: `INSERT INTO content (key, value, updated_at) VALUES (?, ?, datetime('now'))
            ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')`,
      args: [k, v],
    })),
    'write'
  )
  res.json({ ok: true })
})

// ── KNOWLEDGE BASE ────────────────────────────────────────────

router.get('/kb', async (req, res) => {
  const { rows } = await getDb().execute('SELECT * FROM kb_documents ORDER BY created_at DESC')
  res.json(rows)
})

router.post('/kb', async (req, res) => {
  const { title, content } = req.body
  if (!title || !content) return res.status(400).json({ error: 'title and content required' })
  const ins = await getDb().execute({
    sql: 'INSERT INTO kb_documents (title, content) VALUES (?, ?)',
    args: [title, content],
  })
  res.json({ id: Number(ins.lastInsertRowid), title, content })
})

router.delete('/kb/:id', async (req, res) => {
  await getDb().execute({
    sql: 'DELETE FROM kb_documents WHERE id = ?',
    args: [req.params.id],
  })
  res.json({ ok: true })
})

router.post('/kb/rebuild', (req, res) => {
  res.json({ ok: true, message: 'Index is up to date' })
})

// ── SETTINGS ─────────────────────────────────────────────────

router.get('/settings', async (req, res) => {
  const { rows } = await getDb().execute('SELECT key, value FROM settings')
  const settings = rows.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
  if (settings.anthropic_api_key) settings.anthropic_api_key = settings.anthropic_api_key.slice(0, 8) + '…'
  res.json(settings)
})

router.put('/settings', async (req, res) => {
  const db = getDb()
  const entries = Object.entries(req.body)
  await db.batch(
    entries.map(([k, v]) => ({
      sql: `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
            ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')`,
      args: [k, v],
    })),
    'write'
  )
  res.json({ ok: true })
})

router.put('/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const db = getDb()
  const { rows } = await db.execute({
    sql: 'SELECT * FROM admin_users WHERE id = ?',
    args: [req.user.id],
  })
  const user = rows[0]

  const valid = await bcrypt.compare(currentPassword, user.password)
    .catch(() => currentPassword === user.password)
  if (!valid) return res.status(400).json({ error: 'Current password is incorrect' })

  const hash = await bcrypt.hash(newPassword, 10)
  await db.execute({
    sql: 'UPDATE admin_users SET password = ? WHERE id = ?',
    args: [hash, req.user.id],
  })
  res.json({ ok: true })
})

// ── CONTACTS / ENQUIRIES ─────────────────────────────────────

router.get('/contacts', async (req, res) => {
  const { rows } = await getDb().execute('SELECT * FROM contacts ORDER BY created_at DESC')
  res.json(rows)
})

router.delete('/contacts/:id', async (req, res) => {
  await getDb().execute({
    sql: 'DELETE FROM contacts WHERE id = ?',
    args: [req.params.id],
  })
  res.json({ ok: true })
})

// ── EARLY ACCESS (ZYRA AI) ───────────────────────────────────

router.get('/early-access', async (req, res) => {
  const { rows } = await getDb().execute('SELECT * FROM early_access ORDER BY created_at DESC')
  res.json(rows)
})

router.delete('/early-access/:id', async (req, res) => {
  await getDb().execute({
    sql: 'DELETE FROM early_access WHERE id = ?',
    args: [req.params.id],
  })
  res.json({ ok: true })
})

// ── PROJECTS (What We've Built) ──────────────────────────────

router.get('/projects', async (req, res) => {
  const { rows } = await getDb().execute('SELECT * FROM projects ORDER BY sort_order ASC')
  res.json(rows)
})

router.post('/projects', async (req, res) => {
  const { title, category, tags, outcome, emoji, accent, bg, sort_order } = req.body
  const db = getDb()
  const max = await db.execute('SELECT MAX(sort_order) as m FROM projects')
  const nextOrder = sort_order || (Number(max.rows[0].m) || 0) + 1
  const ins = await db.execute({
    sql: 'INSERT INTO projects (title,category,tags,outcome,emoji,accent,bg,sort_order) VALUES (?,?,?,?,?,?,?,?)',
    args: [title, category || '', tags || '[]', outcome || '', emoji || '🚀', accent || '#00d4f5',
           bg || 'linear-gradient(135deg, rgba(0,212,245,0.1) 0%, rgba(124,58,237,0.06) 100%)', nextOrder],
  })
  const { rows } = await db.execute({ sql: 'SELECT * FROM projects WHERE id = ?', args: [Number(ins.lastInsertRowid)] })
  res.json(rows[0])
})

router.put('/projects/:id', async (req, res) => {
  const { title, category, tags, outcome, emoji, accent, bg, sort_order } = req.body
  const db = getDb()
  await db.execute({
    sql: 'UPDATE projects SET title=?,category=?,tags=?,outcome=?,emoji=?,accent=?,bg=?,sort_order=? WHERE id=?',
    args: [title, category, tags, outcome, emoji, accent, bg, sort_order, req.params.id],
  })
  const { rows } = await db.execute({ sql: 'SELECT * FROM projects WHERE id = ?', args: [req.params.id] })
  res.json(rows[0])
})

router.delete('/projects/:id', async (req, res) => {
  await getDb().execute({ sql: 'DELETE FROM projects WHERE id = ?', args: [req.params.id] })
  res.json({ ok: true })
})

// ── TESTIMONIALS ─────────────────────────────────────────────

router.get('/testimonials', async (req, res) => {
  const { rows } = await getDb().execute('SELECT * FROM testimonials ORDER BY sort_order ASC')
  res.json(rows)
})

router.post('/testimonials', async (req, res) => {
  const { name, role, avatar, bg, rating, quote, sort_order } = req.body
  const db = getDb()
  const max = await db.execute('SELECT MAX(sort_order) as m FROM testimonials')
  const nextOrder = sort_order || (Number(max.rows[0].m) || 0) + 1
  const ins = await db.execute({
    sql: 'INSERT INTO testimonials (name,role,avatar,bg,rating,quote,sort_order) VALUES (?,?,?,?,?,?,?)',
    args: [name, role || '', avatar || (name ? name.slice(0, 2).toUpperCase() : '??'),
           bg || 'linear-gradient(135deg, #00d4f5, #0099bb)', rating || 5, quote, nextOrder],
  })
  const { rows } = await db.execute({ sql: 'SELECT * FROM testimonials WHERE id = ?', args: [Number(ins.lastInsertRowid)] })
  res.json(rows[0])
})

router.put('/testimonials/:id', async (req, res) => {
  const { name, role, avatar, bg, rating, quote, sort_order } = req.body
  const db = getDb()
  await db.execute({
    sql: 'UPDATE testimonials SET name=?,role=?,avatar=?,bg=?,rating=?,quote=?,sort_order=? WHERE id=?',
    args: [name, role, avatar, bg, rating, quote, sort_order, req.params.id],
  })
  const { rows } = await db.execute({ sql: 'SELECT * FROM testimonials WHERE id = ?', args: [req.params.id] })
  res.json(rows[0])
})

router.delete('/testimonials/:id', async (req, res) => {
  await getDb().execute({ sql: 'DELETE FROM testimonials WHERE id = ?', args: [req.params.id] })
  res.json({ ok: true })
})

// ── PROCESS STEPS ────────────────────────────────────────────

router.get('/process', async (req, res) => {
  const { rows } = await getDb().execute('SELECT * FROM process_steps ORDER BY sort_order ASC')
  res.json(rows)
})

router.post('/process', async (req, res) => {
  const { number, title, icon, description, sort_order } = req.body
  const db = getDb()
  const max = await db.execute('SELECT MAX(sort_order) as m FROM process_steps')
  const nextOrder = sort_order || (Number(max.rows[0].m) || 0) + 1
  const num = number || String(nextOrder).padStart(2, '0')
  const ins = await db.execute({
    sql: 'INSERT INTO process_steps (number,title,icon,description,sort_order) VALUES (?,?,?,?,?)',
    args: [num, title, icon || '', description || '', nextOrder],
  })
  const { rows } = await db.execute({ sql: 'SELECT * FROM process_steps WHERE id = ?', args: [Number(ins.lastInsertRowid)] })
  res.json(rows[0])
})

router.put('/process/:id', async (req, res) => {
  const { number, title, icon, description, sort_order } = req.body
  const db = getDb()
  await db.execute({
    sql: 'UPDATE process_steps SET number=?,title=?,icon=?,description=?,sort_order=? WHERE id=?',
    args: [number, title, icon, description, sort_order, req.params.id],
  })
  const { rows } = await db.execute({ sql: 'SELECT * FROM process_steps WHERE id = ?', args: [req.params.id] })
  res.json(rows[0])
})

router.delete('/process/:id', async (req, res) => {
  await getDb().execute({ sql: 'DELETE FROM process_steps WHERE id = ?', args: [req.params.id] })
  res.json({ ok: true })
})

// ── PROMOTIONS / LAUNCHES ────────────────────────────────────

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'promo'
}

async function ensureUniqueSlug(db, base, ignoreId) {
  let slug = base
  let n = 2
  while (true) {
    const { rows } = await db.execute({
      sql: 'SELECT id FROM promos WHERE slug = ?',
      args: [slug],
    })
    if (rows.length === 0 || (ignoreId && Number(rows[0].id) === Number(ignoreId))) return slug
    slug = `${base}-${n++}`
  }
}

router.get('/promos', async (req, res) => {
  const { rows } = await getDb().execute('SELECT * FROM promos ORDER BY sort_order ASC, id ASC')
  res.json(rows)
})

router.post('/promos', async (req, res) => {
  const { name, tagline, launch_at, cta_label, sort_order, slug } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  const db = getDb()
  const max = await db.execute('SELECT MAX(sort_order) as m FROM promos')
  const nextOrder = sort_order || (Number(max.rows[0].m) || 0) + 1
  const uniqueSlug = await ensureUniqueSlug(db, slugify(slug || name))
  const ins = await db.execute({
    sql: `INSERT INTO promos (slug, name, tagline, launch_at, cta_label, is_active, sort_order)
          VALUES (?, ?, ?, ?, ?, 0, ?)`,
    args: [uniqueSlug, name, tagline || '', launch_at || '', cta_label || 'Request Early Access', nextOrder],
  })
  const { rows } = await db.execute({ sql: 'SELECT * FROM promos WHERE id = ?', args: [Number(ins.lastInsertRowid)] })
  res.json(rows[0])
})

router.put('/promos/:id', async (req, res) => {
  const { name, tagline, launch_at, cta_label, sort_order, slug } = req.body
  const db = getDb()
  const id = req.params.id
  const uniqueSlug = await ensureUniqueSlug(db, slugify(slug || name || 'promo'), id)
  await db.execute({
    sql: `UPDATE promos SET slug=?, name=?, tagline=?, launch_at=?, cta_label=?, sort_order=?,
          updated_at=datetime('now') WHERE id=?`,
    args: [uniqueSlug, name, tagline || '', launch_at || '', cta_label || 'Request Early Access', sort_order || 0, id],
  })
  const { rows } = await db.execute({ sql: 'SELECT * FROM promos WHERE id = ?', args: [id] })
  res.json(rows[0])
})

router.delete('/promos/:id', async (req, res) => {
  await getDb().execute({ sql: 'DELETE FROM promos WHERE id = ?', args: [req.params.id] })
  res.json({ ok: true })
})

// Set this promo as the single active one (or clear all when active=false)
router.put('/promos/:id/activate', async (req, res) => {
  const { active } = req.body
  const db = getDb()
  await db.execute('UPDATE promos SET is_active = 0')
  if (active !== false) {
    await db.execute({
      sql: 'UPDATE promos SET is_active = 1 WHERE id = ?',
      args: [req.params.id],
    })
  }
  const { rows } = await db.execute({ sql: 'SELECT * FROM promos WHERE id = ?', args: [req.params.id] })
  res.json(rows[0])
})

export default router
