import { Router } from 'express'
import { getDb, seedIndustries } from '../db/database.js'

const router = Router()

let siteDataCache = null
let siteDataCacheTime = 0
const SITE_DATA_TTL_MS = 60 * 1000 // 60 seconds in-memory cache

export function clearSiteDataCache() {
  siteDataCache = null
  siteDataCacheTime = 0
}

// GET /api/site-data — everything the homepage needs in one request
router.get('/site-data', async (req, res) => {
  const now = Date.now()
  if (siteDataCache && (now - siteDataCacheTime < SITE_DATA_TTL_MS)) {
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    return res.json(siteDataCache)
  }

  const db = getDb()

  const [services, founders, projects, testimonials, process, rawContent, activePromos, liveProducts, faqs, blogs, industriesRes] = await Promise.all([
    db.execute('SELECT * FROM services ORDER BY parent_id ASC NULLS FIRST, sort_order ASC, id ASC'),
    db.execute('SELECT id, name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url, show_on_home, sort_order, created_at FROM founders WHERE show_on_home = 1 OR show_on_home IS NULL ORDER BY sort_order ASC'),
    db.execute('SELECT * FROM projects ORDER BY sort_order ASC'),
    db.execute('SELECT * FROM testimonials WHERE show_on_home = 1 OR show_on_home IS NULL ORDER BY sort_order ASC'),
    db.execute('SELECT * FROM process_steps ORDER BY sort_order ASC'),
    db.execute('SELECT key, value FROM content'),
    db.execute('SELECT * FROM promos WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'),
    db.execute('SELECT * FROM live_products WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'),
    db.execute('SELECT * FROM faqs ORDER BY sort_order ASC, id ASC'),
    db.execute('SELECT id, title, slug, excerpt, category, author_name, author_role, read_time, cover_image, published_at FROM blogs WHERE is_published = 1 ORDER BY sort_order ASC, published_at DESC LIMIT 3'),
    db.execute('SELECT * FROM industries ORDER BY sort_order ASC, id ASC'),
  ])

  let industries = industriesRes.rows || []
  if (industries.length === 0) {
    try {
      await seedIndustries(db)
      const ref = await db.execute('SELECT * FROM industries ORDER BY sort_order ASC, id ASC')
      industries = ref.rows || []
    } catch (e) {
      console.error('Auto-seed industries failed:', e)
    }
  }

  const content = rawContent.rows.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

  siteDataCache = {
    services: services.rows,
    founders: founders.rows,
    projects: projects.rows,
    testimonials: testimonials.rows,
    process: process.rows,
    content,
    activePromo: activePromos.rows[0] || null,
    activePromos: activePromos.rows || [],
    liveProducts: liveProducts.rows || [],
    faqs: faqs.rows || [],
    blogs: blogs.rows || [],
    industries,
  }
  siteDataCacheTime = now

  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  res.json(siteDataCache)
})

// GET /api/blogs — public published articles list
router.get('/blogs', async (req, res) => {
  try {
    const { category } = req.query
    const db = getDb()
    let query = 'SELECT id, title, slug, excerpt, category, author_name, author_role, read_time, cover_image, views, published_at FROM blogs WHERE is_published = 1'
    const args = []
    if (category && category !== 'All') {
      query += ' AND category = ?'
      args.push(category)
    }
    query += ' ORDER BY sort_order ASC, published_at DESC'
    const { rows } = await db.execute({ sql: query, args })
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const BLOG_SLUG_ALIASES = {
  'flutter-3-performance-120fps-rendering-guide': 'flutter-3-cross-platform-60fps-blueprint',
  'building-production-ai-agents-langchain-claude': 'building-production-ai-agents-gemini-nextjs',
}

const PROMO_SLUG_ALIASES = {
  'https-screensnap-codelifeai-com': 'screensnap',
  'screensnap-app': 'screensnap',
}

// GET /api/blogs/:slug — single published article with view increment
router.get('/blogs/:slug', async (req, res) => {
  try {
    const db = getDb()
    const targetSlug = BLOG_SLUG_ALIASES[req.params.slug] || req.params.slug
    const { rows } = await db.execute({
      sql: 'SELECT * FROM blogs WHERE slug = ? AND is_published = 1',
      args: [targetSlug],
    })
    if (!rows[0]) return res.status(404).json({ error: 'Article not found' })

    // Non-blocking view increment
    db.execute({ sql: 'UPDATE blogs SET views = views + 1 WHERE id = ?', args: [rows[0].id] }).catch(() => {})

    // Fetch related articles
    const related = await db.execute({
      sql: 'SELECT id, title, slug, excerpt, category, read_time, cover_image FROM blogs WHERE is_published = 1 AND id != ? ORDER BY sort_order ASC LIMIT 3',
      args: [rows[0].id],
    })

    res.json({ ...rows[0], canonical_slug: rows[0].slug, related: related.rows || [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/faqs — public FAQs list
router.get('/faqs', async (req, res) => {
  const { rows } = await getDb().execute('SELECT * FROM faqs ORDER BY sort_order ASC, id ASC')
  res.json(rows)
})

// GET /api/live-products — public active live products list
router.get('/live-products', async (req, res) => {
  const { rows } = await getDb().execute('SELECT * FROM live_products WHERE is_active = 1 ORDER BY sort_order ASC, id ASC')
  res.json(rows)
})

// GET /api/promos/active — the currently featured promos
router.get('/promos/active', async (req, res) => {
  const { rows } = await getDb().execute('SELECT * FROM promos WHERE is_active = 1 ORDER BY sort_order ASC, id ASC')
  res.json(rows)
})

// GET /api/promos/:slug — a specific promo by slug (for direct-linked /launch/:slug)
router.get('/promos/:slug', async (req, res) => {
  try {
    const db = getDb()
    const targetSlug = PROMO_SLUG_ALIASES[req.params.slug] || req.params.slug
    let { rows } = await db.execute({
      sql: 'SELECT * FROM promos WHERE slug = ? LIMIT 1',
      args: [targetSlug],
    })

    if (!rows[0]) {
      // Fallback: check live_products for matching name/slug
      const lp = await db.execute('SELECT * FROM live_products')
      const match = lp.rows.find(p => {
        const slug = (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        return slug === targetSlug.toLowerCase() || p.name.toLowerCase() === targetSlug.toLowerCase()
      })
      if (match) {
        rows = [{
          id: match.id,
          slug: targetSlug,
          name: match.name,
          tagline: match.tagline,
          launch_at: match.created_at || '2026-11-01T12:00:00+05:00',
          cta_label: match.cta_label || 'Request Early Access',
          live_url: match.url || '',
          badge: match.badge || 'LIVE NOW',
          is_active: 1,
        }]
      }
    }

    if (!rows[0]) return res.status(404).json({ error: 'Promo not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/services
router.get('/services', async (req, res) => {
  const { rows } = await getDb().execute('SELECT * FROM services ORDER BY parent_id ASC NULLS FIRST, sort_order ASC, id ASC')
  res.json(rows)
})

// GET /api/services/:id
router.get('/services/:id', async (req, res) => {
  try {
    const db = getDb()
    const param = req.params.id
    let service = null

    if (/^\d+$/.test(param)) {
      const { rows } = await db.execute({
        sql: 'SELECT * FROM services WHERE id = ?',
        args: [parseInt(param, 10)],
      })
      service = rows[0]
    }

    if (!service) {
      // Try slug or clean title match
      const { rows: allRows } = await db.execute('SELECT * FROM services')
      service = allRows.find(s => {
        const slug = (s.slug || s.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        return slug === param.toLowerCase() || String(s.id) === param
      })
    }

    if (!service) return res.status(404).json({ error: 'Service not found' })

    // If Head Service (no parent_id), load its child services
    if (!service.parent_id) {
      const { rows: children } = await db.execute({
        sql: 'SELECT * FROM services WHERE parent_id = ? ORDER BY sort_order ASC, id ASC',
        args: [service.id],
      })
      return res.json({ ...service, children: children || [] })
    }

    // If Child Service, load parent and siblings
    const [parentRes, siblingsRes] = await Promise.all([
      db.execute({
        sql: 'SELECT * FROM services WHERE id = ?',
        args: [service.parent_id],
      }),
      db.execute({
        sql: 'SELECT * FROM services WHERE parent_id = ? AND id != ? ORDER BY sort_order ASC, id ASC',
        args: [service.parent_id, service.id],
      }),
    ])

    return res.json({
      ...service,
      parent: parentRes.rows[0] || null,
      siblings: siblingsRes.rows || [],
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/founders
router.get('/founders', async (req, res) => {
  const { rows } = await getDb().execute('SELECT id, name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url, show_on_home, sort_order, created_at FROM founders ORDER BY sort_order ASC')
  res.json(rows)
})

// GET /api/industries — public list of all industry verticals
router.get('/industries', async (req, res) => {
  const db = getDb()
  let { rows } = await db.execute('SELECT * FROM industries ORDER BY sort_order ASC, id ASC')
  if (rows.length === 0) {
    try {
      await seedIndustries(db)
      const ref = await db.execute('SELECT * FROM industries ORDER BY sort_order ASC, id ASC')
      rows = ref.rows || []
    } catch {}
  }
  res.json(rows)
})

// GET /api/industries/:id — fetch single industry by id or slug
router.get('/industries/:id', async (req, res) => {
  try {
    const db = getDb()
    const param = req.params.id
    let industry = null

    const countCheck = await db.execute('SELECT COUNT(*) as c FROM industries')
    if (Number(countCheck.rows[0]?.c || 0) === 0) {
      try { await seedIndustries(db) } catch {}
    }

    if (/^\d+$/.test(param)) {
      const { rows } = await db.execute({
        sql: 'SELECT * FROM industries WHERE id = ?',
        args: [parseInt(param, 10)],
      })
      industry = rows[0]
    }

    if (!industry) {
      const { rows: allRows } = await db.execute('SELECT * FROM industries')
      industry = allRows.find(ind => {
        const slug = (ind.slug || ind.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        return slug === param.toLowerCase() || String(ind.id) === param
      })
    }

    if (!industry) return res.status(404).json({ error: 'Industry not found' })

    res.json(industry)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
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
  const { first_name, last_name, name, email, company, country, message, service_interest, referral_source } = req.body
  const fullName = (name || `${first_name || ''} ${last_name || ''}`).trim()
  if (!fullName || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and requirements are required' })
  }

  // Build structured message context for admin/email
  let fullDetails = message
  const metaParts = []
  if (company) metaParts.push(`Company: ${company}`)
  if (country) metaParts.push(`Country: ${country}`)
  if (service_interest) metaParts.push(`Service Interest: ${service_interest}`)
  if (referral_source) metaParts.push(`Heard via: ${referral_source}`)

  if (metaParts.length > 0) {
    fullDetails = `${message}\n\n---\n📋 Project Inquiry Details:\n${metaParts.join('\n')}`
  }

  try {
    await getDb().execute({
      sql: 'INSERT INTO contacts (name, email, message, company, country, service_interest, referral_source) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [fullName, email, fullDetails, company || '', country || '', service_interest || '', referral_source || ''],
    })
  } catch (err) {
    // Fallback if DB columns not yet migrated
    await getDb().execute({
      sql: 'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
      args: [fullName, email, fullDetails],
    })
  }
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

// POST /api/track-view — records a real-time pageview
router.post('/track-view', async (req, res) => {
  try {
    const db = getDb()
    const sid = req.visitorSessionId || 'anon'
    const path = String(req.body?.path || '/').slice(0, 500)
    const referrer = String(req.body?.referrer || '').slice(0, 500)
    const ua = (req.headers['user-agent'] || '').slice(0, 255)

    await db.execute({
      sql: `INSERT INTO visitor_pageviews (session_id, path, referrer, user_agent, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))`,
      args: [sid, path, referrer, ua],
    })

    // Also bump last_seen on visitor_sessions
    if (sid && sid !== 'anon') {
      await db.execute({
        sql: `INSERT INTO visitor_sessions (id, user_agent, first_seen, last_seen)
              VALUES (?, ?, datetime('now'), datetime('now'))
              ON CONFLICT(id) DO UPDATE SET last_seen = datetime('now')`,
        args: [sid, ua],
      })
    }

    res.json({ ok: true })
  } catch (err) {
    // Non-blocking response
    res.status(200).json({ ok: false, error: err.message })
  }
})

export default router
