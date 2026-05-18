import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { getDb } from '../db/database.js'
import { authMiddleware, signToken } from '../middleware/auth.js'

const router = Router()

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
  const { rows } = await getDb().execute('SELECT * FROM founders ORDER BY sort_order ASC')
  res.json(rows)
})

router.post('/founders', async (req, res) => {
  const { name, role, bio, initials, photo_url, avatar_bg, tags, sort_order } = req.body
  const db = getDb()
  const max = await db.execute('SELECT MAX(sort_order) as m FROM founders')
  const nextOrder = sort_order || (Number(max.rows[0].m) || 0) + 1
  const ins = await db.execute({
    sql: 'INSERT INTO founders (name,role,bio,initials,photo_url,avatar_bg,tags,sort_order) VALUES (?,?,?,?,?,?,?,?)',
    args: [name, role, bio, initials, photo_url || '', avatar_bg || 'linear-gradient(135deg,#7c3aed,#00d4f5)', tags || '[]', nextOrder],
  })
  const { rows } = await db.execute({
    sql: 'SELECT * FROM founders WHERE id = ?',
    args: [Number(ins.lastInsertRowid)],
  })
  res.json(rows[0])
})

router.put('/founders/:id', async (req, res) => {
  const { name, role, bio, initials, photo_url, avatar_bg, tags, sort_order } = req.body
  const db = getDb()
  await db.execute({
    sql: 'UPDATE founders SET name=?,role=?,bio=?,initials=?,photo_url=?,avatar_bg=?,tags=?,sort_order=? WHERE id=?',
    args: [name, role, bio, initials, photo_url, avatar_bg, tags, sort_order, req.params.id],
  })
  const { rows } = await db.execute({
    sql: 'SELECT * FROM founders WHERE id = ?',
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

export default router
