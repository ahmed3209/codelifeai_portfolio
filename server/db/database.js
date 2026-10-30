import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let db
let initPromise

export function getDb() {
  if (!db) {
    const url = process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, 'codelifeai.db').replace(/\\/g, '/')}`
    const authToken = process.env.TURSO_AUTH_TOKEN
    db = createClient({ url, authToken })
  }
  return db
}

export function initDb() {
  if (!initPromise) {
    initPromise = doInit().catch(err => {
      initPromise = null
      throw err
    })
  }
  return initPromise
}

async function doInit() {
  const db = getDb()

  const statements = [
    `CREATE TABLE IF NOT EXISTS services (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      icon        TEXT DEFAULT '⚡',
      short_desc  TEXT,
      long_desc   TEXT,
      features    TEXT DEFAULT '[]',
      stack       TEXT DEFAULT '[]',
      sort_order  INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS founders (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT NOT NULL,
      role         TEXT,
      bio          TEXT,
      initials     TEXT,
      photo_url    TEXT,
      photo_data   TEXT DEFAULT '',
      photo_mime   TEXT DEFAULT '',
      avatar_bg    TEXT DEFAULT 'linear-gradient(135deg,#7c3aed,#00d4f5)',
      tags         TEXT DEFAULT '[]',
      linkedin_url TEXT DEFAULT '',
      sort_order   INTEGER DEFAULT 0,
      created_at   TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS content (
      key         TEXT PRIMARY KEY,
      value       TEXT,
      updated_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS kb_documents (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      content     TEXT NOT NULL,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
      key         TEXT PRIMARY KEY,
      value       TEXT,
      updated_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS admin_users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      username    TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS contacts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT,
      email       TEXT,
      message     TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS early_access (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL,
      reason      TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS projects (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      category    TEXT,
      tags        TEXT DEFAULT '[]',
      outcome     TEXT,
      emoji       TEXT DEFAULT '🚀',
      accent      TEXT DEFAULT '#00d4f5',
      bg          TEXT,
      live_url    TEXT DEFAULT '',
      sort_order  INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS testimonials (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      role        TEXT,
      avatar      TEXT,
      bg          TEXT DEFAULT 'linear-gradient(135deg, #00d4f5, #0099bb)',
      rating      INTEGER DEFAULT 5,
      quote       TEXT NOT NULL,
      sort_order  INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS process_steps (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      number      TEXT,
      title       TEXT NOT NULL,
      icon        TEXT,
      description TEXT,
      sort_order  INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS promos (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      tagline     TEXT,
      launch_at   TEXT,
      cta_label   TEXT DEFAULT 'Request Early Access',
      live_url    TEXT DEFAULT '',
      badge       TEXT DEFAULT 'LIVE NOW',
      is_active   INTEGER DEFAULT 0,
      sort_order  INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS live_products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      tagline     TEXT,
      url         TEXT NOT NULL,
      icon        TEXT DEFAULT '✨',
      badge       TEXT DEFAULT 'LIVE NOW',
      cta_label   TEXT DEFAULT 'Open Live Website',
      is_active   INTEGER DEFAULT 1,
      sort_order  INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now'))
    )`,
    // Anonymous visitor session — issued on first /api hit, keyed off the
    // cl_visitor cookie. Powers chat history persistence + light analytics.
    `CREATE TABLE IF NOT EXISTS visitor_sessions (
      id          TEXT PRIMARY KEY,
      user_agent  TEXT,
      first_seen  TEXT DEFAULT (datetime('now')),
      last_seen   TEXT DEFAULT (datetime('now'))
    )`,
    // Real-time visitor pageviews for accurate traffic and analytics
    `CREATE TABLE IF NOT EXISTS visitor_pageviews (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id  TEXT NOT NULL,
      path        TEXT NOT NULL,
      referrer    TEXT DEFAULT '',
      user_agent  TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id  TEXT NOT NULL,
      role        TEXT NOT NULL,
      content     TEXT NOT NULL,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS industries (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      slug        TEXT UNIQUE NOT NULL,
      icon        TEXT DEFAULT 'Building2',
      badge       TEXT DEFAULT 'ENTERPRISE VERTICAL',
      short_desc  TEXT,
      long_desc   TEXT,
      challenges  TEXT DEFAULT '[]',
      solutions   TEXT DEFAULT '[]',
      features    TEXT DEFAULT '[]',
      stack       TEXT DEFAULT '[]',
      metrics     TEXT DEFAULT '[]',
      image_url   TEXT DEFAULT '',
      show_on_home INTEGER DEFAULT 1,
      sort_order  INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now'))
    )`,
  ]

  for (const sql of statements) await db.execute(sql)

  console.log('✅ Database schema ready')

  const { rows } = await db.execute('SELECT COUNT(*) as c FROM services')
  if (rows[0].c === 0) {
    console.log('🌱 Seeding database…')
    await seed(db)
  }

  // Idempotent backfill — runs every boot so existing (already-seeded)
  // databases also get the newer tables/keys populated.
  await ensureExtras(db)
}

async function ensureExtras(db) {
  // ── Idempotent schema extensions: ALTER TABLE statements for columns
  //    added after the initial schema shipped. Wrapped in try/catch because
  //    SQLite/libSQL don't support `ADD COLUMN IF NOT EXISTS`.
  const schemaExtensions = [
    "ALTER TABLE founders ADD COLUMN linkedin_url TEXT DEFAULT ''",
    "ALTER TABLE founders ADD COLUMN photo_data   TEXT DEFAULT ''",
    "ALTER TABLE founders ADD COLUMN photo_mime   TEXT DEFAULT ''",
    "ALTER TABLE promos ADD COLUMN live_url TEXT DEFAULT ''",
    "ALTER TABLE promos ADD COLUMN badge    TEXT DEFAULT 'LIVE NOW'",
    "ALTER TABLE projects ADD COLUMN live_url TEXT DEFAULT ''",
    "ALTER TABLE projects ADD COLUMN image_url TEXT DEFAULT ''",
    "ALTER TABLE projects ADD COLUMN description TEXT DEFAULT ''",
    "ALTER TABLE founders ADD COLUMN show_on_home INTEGER DEFAULT 1",
    "ALTER TABLE services ADD COLUMN show_on_home INTEGER DEFAULT 1",
    "ALTER TABLE services ADD COLUMN image_url TEXT DEFAULT ''",
    "ALTER TABLE services ADD COLUMN parent_id INTEGER DEFAULT NULL",
    "ALTER TABLE services ADD COLUMN slug TEXT DEFAULT ''",
    "ALTER TABLE testimonials ADD COLUMN show_on_home INTEGER DEFAULT 1",
    "ALTER TABLE contacts ADD COLUMN status TEXT DEFAULT 'new'",
    "ALTER TABLE contacts ADD COLUMN reply_subject TEXT DEFAULT ''",
    "ALTER TABLE contacts ADD COLUMN reply_message TEXT DEFAULT ''",
    "ALTER TABLE contacts ADD COLUMN replied_at TEXT DEFAULT ''",
    "ALTER TABLE contacts ADD COLUMN company TEXT DEFAULT ''",
    "ALTER TABLE contacts ADD COLUMN country TEXT DEFAULT ''",
    "ALTER TABLE contacts ADD COLUMN service_interest TEXT DEFAULT ''",
    "ALTER TABLE contacts ADD COLUMN referral_source TEXT DEFAULT ''",
    "ALTER TABLE process_steps ADD COLUMN timeline TEXT DEFAULT ''",
    "ALTER TABLE process_steps ADD COLUMN summary TEXT DEFAULT ''",
    "ALTER TABLE process_steps ADD COLUMN deliverables TEXT DEFAULT '[]'",
    "ALTER TABLE process_steps ADD COLUMN tools TEXT DEFAULT '[]'",
    "ALTER TABLE process_steps ADD COLUMN client_checkpoint TEXT DEFAULT ''",
  ]
  for (const sql of schemaExtensions) {
    try { await db.execute(sql) }
    catch (e) {
      if (!/duplicate column|already exists/i.test(e.message || '')) throw e
    }
  }

  // Normalize any founder linkedin_urls missing https://
  try {
    const { rows: fRows } = await db.execute("SELECT id, name, linkedin_url FROM founders")
    for (const f of fRows) {
      let url = (f.linkedin_url || '').trim()
      if (url && !/^(https?:\/\/)/i.test(url)) {
        await db.execute({
          sql: 'UPDATE founders SET linkedin_url = ? WHERE id = ?',
          args: [`https://${url.replace(/^\/+/, '')}`, f.id],
        })
      }
      if (f.name === 'Anas Waheed' && (!url || url.includes('anas-waheed'))) {
        await db.execute({
          sql: 'UPDATE founders SET linkedin_url = ? WHERE id = ?',
          args: ['https://www.linkedin.com/in/anas-waheed-68b355267', f.id],
        })
      }
    }
  } catch {}

  // Deduplicate any repeated project titles
  try {
    await db.execute(`
      DELETE FROM projects
      WHERE id NOT IN (
        SELECT MIN(id) FROM projects GROUP BY title
      )
    `)
  } catch {}

  // Ensure each service has its own dedicated high-quality asset image
  const serviceImageMap = [
    { pattern: '%Web%', img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop' },
    { pattern: '%Mobile%', img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200&auto=format&fit=crop' },
    { pattern: '%UI%', img: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1200&auto=format&fit=crop' },
    { pattern: '%Design%', img: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1200&auto=format&fit=crop' },
    { pattern: '%AI%', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop' },
    { pattern: '%Cloud%', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop' },
    { pattern: '%DevOps%', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop' },
    { pattern: '%Consulting%', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop' },
    { pattern: '%Enterprise%', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop' },
  ]
  for (const item of serviceImageMap) {
    try {
      await db.execute({
        sql: "UPDATE services SET image_url = ? WHERE (image_url IS NULL OR image_url = '') AND title LIKE ?",
        args: [item.img, item.pattern],
      })
    } catch {}
  }

  // Ensure all projects have dedicated high-resolution mockups
  const projectImageMap = [
    { pattern: '%FinTrack%', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop' },
    { pattern: '%ShopEase%', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop' },
    { pattern: '%MedSync%', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop' },
    { pattern: '%LogiFlow%', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop' },
    { pattern: '%ZYRA%', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop' },
    { pattern: '%SocialPulse%', img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop' },
    { pattern: '%ScreenSnap%', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop' },
    { pattern: '%EduPath%', img: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1200&auto=format&fit=crop' },
    { pattern: '%CloudGuard%', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop' },
    { pattern: '%Alarmify%', img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=1200&auto=format&fit=crop' },
  ]
  for (const item of projectImageMap) {
    try {
      await db.execute({
        sql: "UPDATE projects SET image_url = ? WHERE (image_url IS NULL OR image_url = '') AND title LIKE ?",
        args: [item.img, item.pattern],
      })
    } catch {}
  }

  const projects = [
    {
      title: 'FinTrack — Real-Time Banking & Wealth Dashboard',
      category: 'Web Application',
      tags: JSON.stringify(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS']),
      outcome: '10k+ Active Users',
      emoji: '💳',
      accent: '#00d4f5',
      image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
      live_url: 'https://fintrack.codelifeai.com',
      description: 'An enterprise-grade financial analytics and wealth management dashboard with sub-second portfolio valuations, multi-currency wallets, and automated banking transaction categorization.',
      bg: 'linear-gradient(135deg, rgba(0,212,245,0.12) 0%, rgba(124,58,237,0.06) 100%)',
      sort_order: 1,
    },
    {
      title: 'ShopEase — High-Conversion E-Commerce Platform',
      category: 'E-Commerce',
      tags: JSON.stringify(['Next.js 15', 'Stripe Connect', 'MongoDB', 'Redis', 'TailwindCSS']),
      outcome: '$2M+ Processed',
      emoji: '🛍️',
      accent: '#a855f7',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
      live_url: 'https://shopease.codelifeai.com',
      description: 'A headless e-commerce store with instant edge search, personalized product recommendations, Stripe multi-currency checkout, and real-time inventory management.',
      bg: 'linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(0,212,245,0.05) 100%)',
      sort_order: 2,
    },
    {
      title: 'MedSync — Telehealth & Patient Records Mobile App',
      category: 'Mobile Apps',
      tags: JSON.stringify(['Flutter', 'Firebase', 'WebRTC', 'HIPAA Shield', 'Dart']),
      outcome: '4.9★ on App Store',
      emoji: '🏥',
      accent: '#22c55e',
      image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop',
      live_url: 'https://medsync.app',
      description: 'HIPAA-compliant mobile healthcare application featuring encrypted HD video doctor consultations, instant digital prescription issuance, and vitals monitoring.',
      bg: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(0,212,245,0.04) 100%)',
      sort_order: 3,
    },
    {
      title: 'LogiFlow — Intelligent Supply Chain SaaS',
      category: 'SaaS Platforms',
      tags: JSON.stringify(['React', 'Python FastAPI', 'AWS ECS', 'PostgreSQL', 'Docker']),
      outcome: '35% Cost Reduction',
      emoji: '📦',
      accent: '#f59e0b',
      image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
      live_url: 'https://logiflow.io',
      description: 'A global logistics optimization SaaS platform handling 2M+ telemetry events per day with dynamic GPS fleet route recalculation and predictive warehouse restocking.',
      bg: 'linear-gradient(135deg, rgba(245,158,11,0.11) 0%, rgba(124,58,237,0.05) 100%)',
      sort_order: 4,
    },
    {
      title: 'ZYRA AI — Multimodal Autonomous Work Assistant',
      category: 'AI & Machine Learning',
      tags: JSON.stringify(['Gemini 2.0', 'LangChain', 'Next.js', 'Python', 'Vector DB']),
      outcome: '50k+ Early Users',
      emoji: '⚡',
      accent: '#00d4f5',
      image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      live_url: 'https://zyra-ai.com',
      description: 'An all-in-one AI agent that automates complex multi-step workflows: document intelligence, deep market research, automated code refactoring, and data visualization.',
      bg: 'linear-gradient(135deg, rgba(0,212,245,0.15) 0%, rgba(168,85,247,0.1) 100%)',
      sort_order: 5,
    },
    {
      title: 'SocialPulse — AI Sentiment & Viral Growth Engine',
      category: 'AI & Machine Learning',
      tags: JSON.stringify(['Python', 'OpenAI', 'React', 'FastAPI', 'Redis']),
      outcome: '500+ Agency Clients',
      emoji: '📊',
      accent: '#f43f5e',
      image_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop',
      live_url: 'https://socialpulse.io',
      description: 'Real-time multi-platform social media intelligence tracking viral sentiment patterns, competitor brand health, and automated content scheduling recommendations.',
      bg: 'linear-gradient(135deg, rgba(244,63,94,0.11) 0%, rgba(0,212,245,0.04) 100%)',
      sort_order: 6,
    },
    {
      title: 'ScreenSnap — AI Screen Capture & Annotation Suite',
      category: 'SaaS Platforms',
      tags: JSON.stringify(['Electron', 'React', 'WebRTC', 'Tesseract OCR', 'Cloudflare']),
      outcome: '120k+ Downloads',
      emoji: '📸',
      accent: '#38bdf8',
      image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop',
      live_url: 'https://screensnap.app',
      description: 'Ultra-fast screen recording and automated screenshot OCR desktop tool with instant cloud sharing, auto-transcription, and team collaboration annotations.',
      bg: 'linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(124,58,237,0.05) 100%)',
      sort_order: 7,
    },
    {
      title: 'EduPath — Interactive Video LMS & Skill Academy',
      category: 'Web Application',
      tags: JSON.stringify(['Next.js', 'HLS Video', 'Node.js', 'PostgreSQL', 'Stripe']),
      outcome: '20k+ Enrolled Students',
      emoji: '🎓',
      accent: '#38bdf8',
      image_url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1200&auto=format&fit=crop',
      live_url: 'https://edupath.academy',
      description: 'A modern online learning platform with adaptive video bitrates, interactive in-browser coding exercises, verified certificate generation, and community discussion channels.',
      bg: 'linear-gradient(135deg, rgba(56,189,248,0.11) 0%, rgba(124,58,237,0.05) 100%)',
      sort_order: 8,
    },
    {
      title: 'CloudGuard — Zero-Trust DevOps & Cluster Monitor',
      category: 'SaaS Platforms',
      tags: JSON.stringify(['Go', 'Kubernetes', 'Prometheus', 'React', 'Docker']),
      outcome: '99.999% Reliability',
      emoji: '🛡️',
      accent: '#10b981',
      image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
      live_url: 'https://cloudguard.dev',
      description: 'Real-time Kubernetes cluster visualization and security anomaly detection agent with automated container vulnerability patching and zero-downtime rollback alerts.',
      bg: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(0,212,245,0.04) 100%)',
      sort_order: 9,
    },
    {
      title: 'Alarmify — AI Sleep Partner & Smart Wake System',
      category: 'Mobile Apps',
      tags: JSON.stringify(['Flutter', 'TensorFlow Lite', 'Audio DSP', 'SQLite', 'iOS']),
      outcome: '25k+ Daily Users',
      emoji: '⏰',
      accent: '#f59e0b',
      image_url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=1200&auto=format&fit=crop',
      live_url: 'https://alarmify.app',
      description: 'Smart biometric sleep cycle tracking app that analyzes REM breathing patterns on-device and wakes users gently during their lightest sleep window.',
      bg: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(236,72,153,0.05) 100%)',
      sort_order: 10,
    },
  ]

  const projCount = await db.execute('SELECT COUNT(*) as c FROM projects')
  if (Number(projCount.rows[0].c) < 8) {
    // Re-seed with rich projects if existing DB only has basic 6
    await db.execute('DELETE FROM projects')
    for (const p of projects) {
      await db.execute({
        sql: `INSERT INTO projects (title, category, tags, outcome, emoji, accent, image_url, live_url, description, bg, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [p.title, p.category, p.tags, p.outcome, p.emoji, p.accent, p.image_url, p.live_url, p.description, p.bg, p.sort_order],
      })
    }
  }

  const testimonials = [
    { name: 'Ahmed Al-Rashid', role: 'Founder, FinTrack', avatar: 'AR', bg: 'linear-gradient(135deg, #00d4f5, #0099bb)', rating: 5, quote: "CodeLifeAI delivered our banking dashboard in record time — clean code, beautiful UI, and zero post-launch issues. They didn't just build what we asked; they made it better than we imagined.", sort_order: 1 },
    { name: 'Sarah Mitchell', role: 'CTO, ShopEase Inc.', avatar: 'SM', bg: 'linear-gradient(135deg, #a855f7, #7c3aed)', rating: 5, quote: "Working with CodeLifeAI felt like having a senior in-house engineering team. Communication was seamless, timelines were respected, and the final product drove a 40% increase in our conversion rate.", sort_order: 2 },
    { name: 'Dr. Iman Yousuf', role: 'CEO, MedSync Health', avatar: 'IY', bg: 'linear-gradient(135deg, #22c55e, #16a34a)', rating: 5, quote: "Our medical app needed to be both beautiful and HIPAA-compliant. CodeLifeAI nailed it. The Flutter development was exceptional — users literally rate us 4.9 stars on the Play Store.", sort_order: 3 },
    { name: 'James Thornton', role: 'Head of Product, LogiFlow', avatar: 'JT', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', rating: 5, quote: "We cut operational costs by 35% after CodeLifeAI rebuilt our supply chain platform. The Python data pipelines they built process 2 million records daily without a single failure. Remarkable work.", sort_order: 4 },
  ]
  const testCount = await db.execute('SELECT COUNT(*) as c FROM testimonials')
  if (testCount.rows[0].c === 0) {
    for (const t of testimonials) {
      await db.execute({
        sql: 'INSERT INTO testimonials (name,role,avatar,bg,rating,quote,sort_order) VALUES (?,?,?,?,?,?,?)',
        args: [t.name, t.role, t.avatar, t.bg, t.rating, t.quote, t.sort_order],
      })
    }
  }

  const processSteps = [
    {
      number: '01',
      title: 'Discovery & System Architecture',
      timeline: 'Week 1',
      icon: '🔍',
      description: 'Deep architectural dive into your business logic, technical constraints, data schemas, and scalability targets.',
      summary: 'Deep architectural dive into your business logic, technical constraints, data schemas, and scalability targets.',
      deliverables: JSON.stringify([
        'Product Requirements Document (PRD)',
        'Database Entity Relationship Diagram (ERD)',
        'API Architecture & Third-Party Integration Map',
        'Sprint Roadmap & Milestone Cost Breakdown',
      ]),
      tools: JSON.stringify(['Figma Jam', 'PostgreSQL / Prisma', 'Swagger / OpenAPI', 'Notion']),
      client_checkpoint: 'Architecture Review & Kickoff Call (Full Scope Alignment)',
      sort_order: 1,
    },
    {
      number: '02',
      title: 'UI/UX & Interactive Prototyping',
      timeline: 'Week 1 – 2',
      icon: '🎨',
      description: 'Translating concepts into high-fidelity, high-conversion user interfaces with responsive design systems.',
      summary: 'Translating concepts into high-fidelity, high-conversion user interfaces with responsive design systems.',
      deliverables: JSON.stringify([
        'Complete Clickable Figma Prototype',
        'Atomic Design System & Component Library',
        'Mobile Responsive Breakpoints (iOS/Android/Web)',
        'Micro-Interactions & Animation Specs',
      ]),
      tools: JSON.stringify(['Figma', 'Tailwind Design Tokens', 'Framer', 'Lottie']),
      client_checkpoint: 'Interactive Prototype Walkthrough & Visual Signoff',
      sort_order: 2,
    },
    {
      number: '03',
      title: 'Agile Build & Weekly Sprints',
      timeline: 'Week 2 – 6',
      icon: '⚙️',
      description: 'High-velocity test-driven development in 1-week sprints with working software deployed to private staging.',
      summary: 'High-velocity test-driven development in 1-week sprints with working software deployed to private staging.',
      deliverables: JSON.stringify([
        'Clean Modular TypeScript / Flutter / Python Code',
        'Live Staging Sandbox with Test Data',
        'Automated CI/CD Pipeline & Unit Testing Suite',
        'Weekly Async Video Demo & Progress Loom',
      ]),
      tools: JSON.stringify(['React / Next.js', 'Flutter / Dart', 'Node / FastAPI', 'GitHub Actions']),
      client_checkpoint: 'Weekly Live Sandbox Testing & Iterative Feedback',
      sort_order: 3,
    },
    {
      number: '04',
      title: 'Production Deploy & Hardening',
      timeline: 'Launch Week',
      icon: '🚀',
      description: 'Zero-downtime production deployment, performance audits, security hardening, and DNS cutover.',
      summary: 'Zero-downtime production deployment, performance audits, security hardening, and DNS cutover.',
      deliverables: JSON.stringify([
        'Production Kubernetes / AWS / GCP Cluster',
        'SSL Encryption, Cloudflare WAF & Edge CDN',
        'Sub-Second Page Load Optimization',
        'Automated Database Backup Snapshots',
      ]),
      tools: JSON.stringify(['AWS / GCP', 'Docker / Kubernetes', 'Cloudflare', 'PostgreSQL']),
      client_checkpoint: 'Production Go-Live & Domain Launch Cutover',
      sort_order: 4,
    },
    {
      number: '05',
      title: 'Observability, Scale & Warranty',
      timeline: 'Post-Launch',
      icon: '🛡️',
      description: 'Continuous 24/7 APM monitoring, 30-day bug warranty, and sprint retainers for feature scaling.',
      summary: 'Continuous 24/7 APM monitoring, 30-day bug warranty, and sprint retainers for feature scaling.',
      deliverables: JSON.stringify([
        '30-Day Complete Post-Launch Bug Warranty',
        'Prometheus & Grafana Real-Time APM Dashboards',
        '100% IP & Clean Repository Handover',
        'Dedicated Sprint Scaling Support Option',
      ]),
      tools: JSON.stringify(['Prometheus', 'Grafana', 'Sentry', 'GitHub Enterprise']),
      client_checkpoint: 'Handover Certification & Growth Roadmap Meeting',
      sort_order: 5,
    },
  ]

  const stepCount = await db.execute('SELECT COUNT(*) as c FROM process_steps')
  if (Number(stepCount.rows[0].c) < 5) {
    await db.execute('DELETE FROM process_steps')
    for (const s of processSteps) {
      await db.execute({
        sql: `INSERT INTO process_steps (number, title, timeline, icon, description, summary, deliverables, tools, client_checkpoint, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [s.number, s.title, s.timeline, s.icon, s.description, s.summary, s.deliverables, s.tools, s.client_checkpoint, s.sort_order],
      })
    }
  }

  // ── Promos: seed a default ZYRA promo on fresh installs, and migrate any
  //    pre-existing legacy `zyra_*` content keys into the promo row on
  //    upgrade. Idempotent — only runs while the promos table is empty.
  const promoCount = await db.execute('SELECT COUNT(*) as c FROM promos')
  if (Number(promoCount.rows[0].c) === 0) {
    const legacy = await db.execute(
      "SELECT key, value FROM content WHERE key IN ('zyra_enabled','zyra_name','zyra_tagline','zyra_launch_at')"
    )
    const c = legacy.rows.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
    await db.execute({
      sql: `INSERT INTO promos (slug, name, tagline, launch_at, cta_label, is_active, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'zyra-ai',
        c.zyra_name || 'ZYRA AI',
        c.zyra_tagline || 'One AI for everything. Chat, create, analyze, automate — a single all-in-one assistant that does what ChatGPT and Claude do, together.',
        c.zyra_launch_at || '2026-06-17T18:00:00+05:00',
        'Request Early Access',
        c.zyra_enabled === 'false' ? 0 : 1,
        1,
      ],
    })
    // Drop the now-unused legacy content keys (no-op on fresh installs)
    await db.execute(
      "DELETE FROM content WHERE key IN ('zyra_enabled','zyra_name','zyra_tagline','zyra_launch_at')"
    )
  }

  // Ensure default promo products exist (Alarmify & ScreenSnap)
  try {
    const pRows = await db.execute("SELECT slug FROM promos")
    const pSlugs = new Set(pRows.rows.map(r => r.slug))
    if (!pSlugs.has('alarmify')) {
      await db.execute({
        sql: `INSERT INTO promos (slug, name, tagline, launch_at, cta_label, live_url, badge, is_active, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, 1, 2)`,
        args: ['alarmify', 'Alarmify', 'AI sleep partner and smart wake-up alarm system.', '2026-11-15T08:00:00+05:00', 'Request Early Access', 'https://alarmify.app', 'WEB APP']
      })
    }
    if (!pSlugs.has('screensnap')) {
      await db.execute({
        sql: `INSERT INTO promos (slug, name, tagline, launch_at, cta_label, live_url, badge, is_active, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, 1, 3)`,
        args: ['screensnap', 'Screen Snap', 'Instant screen recording, smart annotations & AI capture workflow.', '2026-11-01T12:00:00+05:00', 'Request Early Access', 'https://screensnap.app', 'LIVE NOW']
      })
    }
  } catch {}

  // Chatbot: seed Gemini default on existing DBs (idempotent). API key stays
  // unset until the admin adds one from the Settings page.
  await db.execute({
    sql: 'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
    args: ['gemini_model', process.env.GEMINI_MODEL || 'gemini-2.0-flash'],
  })

  // Admin session invalidation — bump token_version to log out other devices
  // (used on password change). ALTER is wrapped because existing DBs may
  // already have the column from a previous deploy.
  try {
    await db.execute('ALTER TABLE admin_users ADD COLUMN token_version INTEGER DEFAULT 1')
  } catch { /* column already exists */ }

  // Live Products: seed default products if empty
  const liveCount = await db.execute('SELECT COUNT(*) as c FROM live_products')
  if (Number(liveCount.rows[0].c) === 0) {
    const defaultLive = [
      {
        name: 'Screen Snap',
        tagline: 'Instant screen recording, smart annotations & AI capture workflow.',
        url: 'https://screensnap.app',
        icon: '📸',
        badge: 'LIVE NOW',
        cta_label: 'Open Live Website',
        is_active: 1,
        sort_order: 1
      },
      {
        name: 'ZYRA AI',
        tagline: 'One AI for everything — chat, create, analyze & automate workflows.',
        url: 'https://zyra-ai.com',
        icon: '⚡',
        badge: 'v2.4 LIVE',
        cta_label: 'Open Live Website',
        is_active: 1,
        sort_order: 2
      },
      {
        name: 'Alarmify',
        tagline: 'AI sleep partner and smart wake-up alarm system.',
        url: 'https://alarmify.app',
        icon: '⏰',
        badge: 'WEB APP',
        cta_label: 'Open Live Website',
        is_active: 1,
        sort_order: 3
      }
    ]
    for (const p of defaultLive) {
      await db.execute({
        sql: `INSERT INTO live_products (name, tagline, url, icon, badge, cta_label, is_active, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [p.name, p.tagline, p.url, p.icon, p.badge, p.cta_label, p.is_active, p.sort_order]
      })
    }
  }

  // ── FAQs Table and default seed ──────────────────────────────
  await db.execute(`
    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  const faqCount = await db.execute('SELECT COUNT(*) as c FROM faqs')
  if (Number(faqCount.rows[0].c) === 0) {
    const defaultFaqs = [
      { question: 'What is the typical timeline to build and launch an MVP with CodeLifeAI?', answer: 'Most MVP projects take 4 to 8 weeks from kickoff to production launch. We operate on high-velocity 1-week sprints with working software delivered at every milestone.', category: 'Process & Timeline', sort_order: 1 },
      { question: 'Do I retain 100% full intellectual property (IP) and code ownership?', answer: 'Yes, absolutely. You retain 100% ownership of all source code, architecture, designs, databases, and intellectual property from day one upon milestone completion.', category: 'Legal & Ownership', sort_order: 2 },
      { question: 'How do you handle project confidentiality and NDAs?', answer: 'We execute mutual Non-Disclosure Agreements (NDAs) before reviewing any proprietary assets or starting architecture planning. Your business concepts and technical data remain strictly confidential.', category: 'Security & NDA', sort_order: 3 },
      { question: 'What technologies and frameworks does CodeLifeAI specialize in?', answer: 'Our core stack includes React, Next.js, TypeScript on frontend; Node.js, Express, Python, Go on backend; Flutter and React Native for mobile; PostgreSQL, MongoDB, Redis, LibSQL for databases; and AWS, GCP, Cloudflare, Docker for cloud infrastructure.', category: 'Technology', sort_order: 4 },
      { question: 'Do you offer post-launch maintenance, bug warranty, and scale support?', answer: 'Yes. Every project includes a 30-day post-launch warranty with dedicated monitoring. We also provide ongoing sprint retainers and SLA maintenance packages for continuous scaling.', category: 'Support & Warranty', sort_order: 5 },
      { question: 'How do we communicate and track sprint progress during development?', answer: 'We provide a dedicated communication channel (Slack / WhatsApp / Discord), weekly live video demos, and private staging links where you test working builds in real time.', category: 'Communication', sort_order: 6 },
    ]
    for (const f of defaultFaqs) {
      await db.execute({
        sql: 'INSERT INTO faqs (question, answer, category, sort_order) VALUES (?, ?, ?, ?)',
        args: [f.question, f.answer, f.category, f.sort_order],
      })
    }
  }

  // ── Blogs / Articles Table and default seed ──────────────────
  await db.execute(`
    CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      cover_image TEXT DEFAULT '',
      category TEXT DEFAULT 'Engineering',
      author_name TEXT DEFAULT 'CodeLifeAI Engineering',
      author_role TEXT DEFAULT 'Core Team',
      read_time TEXT DEFAULT '5 min read',
      is_published INTEGER DEFAULT 1,
      views INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      published_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)

  const blogCount = await db.execute('SELECT COUNT(*) as c FROM blogs')
  if (Number(blogCount.rows[0].c) === 0) {
    const defaultBlogs = [
      {
        title: 'Building Production-Grade AI Agents with Gemini 2.0 & Next.js 15',
        slug: 'building-production-ai-agents-gemini-nextjs',
        category: 'AI & Machine Learning',
        author_name: 'CodeLifeAI Engineering',
        author_role: 'AI Architecture Lead',
        read_time: '6 min read',
        excerpt: 'A practical architectural blueprint for deploying autonomous multi-step AI agents with low-latency tool execution and streaming state management.',
        content: `### Introduction\n\nAI agents are evolving from basic conversational bots into autonomous task execution engines. In this architecture breakdown, we examine how to orchestrate multi-step reasoning using Google's **Gemini 2.0 Flash** model combined with **Next.js 15 Server Actions** and vector databases.\n\n### 1. The Core Execution Loop\n\nTraditional LLM calls are stateless and single-turn. A true autonomous agent requires:\n- **Perception Layer:** Parsing user intent and tool definitions.\n- **Action Execution:** Running external database queries, API lookups, or calculations.\n- **Observation & Feedback:** Feeding execution outputs back into the context window for recursive synthesis.\n\n\`\`\`javascript\n// High-velocity tool dispatcher loop\nasync function executeAgentTurn(prompt, tools) {\n  const response = await ai.generateContent({\n    model: 'gemini-2.0-flash',\n    contents: prompt,\n    tools: tools.map(t => ({ functionDeclarations: [t.declaration] })),\n  })\n  return response\n}\n\`\`\`\n\n### 2. State Management & Latency Optimization\n\nTo achieve sub-500ms initial response times, streaming text generation is mandatory. By leveraging server-sent events (SSE) alongside token streaming, users observe immediate progress while background tool chains execute in parallel.\n\n### Conclusion\n\nAutonomous agents deliver tremendous business value when architected with strict validation, prompt guardrails, and deterministic fallbacks. At CodeLifeAI, we integrate these patterns into production products daily.`,
        sort_order: 1,
      },
      {
        title: 'Microservices vs Modular Monolith: How We Architect for High Throughput',
        slug: 'microservices-vs-modular-monolith-architecture',
        category: 'Architecture',
        author_name: 'CodeLifeAI Engineering',
        author_role: 'Principal Systems Architect',
        read_time: '7 min read',
        excerpt: 'Why starting with distributed microservices too early creates unnecessary network latency and how a well-factored modular monolith scales gracefully.',
        content: `### The Microservice Dilemma\n\nMany engineering teams jump directly into distributed microservices on Day 1, only to suffer from distributed transactions, network serialization overhead, and debugging nightmares. For 95% of software applications, a **Modular Monolith** provides superior throughput, simpler deployments, and zero network serialization penalty.\n\n### Core Architecture Principles\n\n1. **Strict Boundary Isolation:** Domain modules must interact only through exported interfaces, never direct database queries across domain schemas.\n2. **Event-Driven Decoupling:** Use in-memory or Redis-backed pub/sub channels for async operations (e.g. email notifications, analytics beacons, invoice generation).\n3. **Independent Database Schemas:** Logical separation within a single relational database (like PostgreSQL or LibSQL) allows future microservice extraction without data migration friction.\n\n### Benchmark Comparison\n\n- **Modular Monolith Inter-Module Latency:** ~0.05ms (direct memory call)\n- **Distributed RPC / HTTP Microservice Latency:** ~15ms - 45ms per hop\n\nBy keeping core business domains consolidated until specific scaling bottlenecks emerge, teams maximize velocity and uptime.`,
        sort_order: 2,
      },
      {
        title: 'The Flutter 3 Cross-Platform Blueprint: Achieving 60 FPS Native Performance',
        slug: 'flutter-3-cross-platform-60fps-blueprint',
        category: 'Mobile Engineering',
        author_name: 'CodeLifeAI Engineering',
        author_role: 'Mobile Lead',
        read_time: '5 min read',
        excerpt: 'How we architect offline-first mobile applications with local SQLite replication, smooth animations, and platform-specific native performance.',
        content: `### Delivering True 60 FPS on Mobile\n\nCross-platform development often gets criticized for sluggish frame rates or unpolished touch interactions. With Flutter 3's **Impeller rendering engine**, applications achieve consistent 60–120 FPS without shader compilation jank.\n\n### Key Strategies for Top-Tier Mobile UX\n\n- **Offline-First Data Layer:** Use local SQLite or embedded key-value stores for instant UI hydration on boot. Remote API sync happens seamlessly in the background.\n- **Isolate-Based Heavy Compute:** Offload JSON parsing, cryptographic hashing, and image compression to background Dart isolates to ensure the main UI thread never drops a single frame.\n- **Adaptive Native Design:** Use Cupertino widgets on iOS and Material You styling on Android while sharing 90%+ of core business logic.\n\nOur client mobile apps consistently achieve 4.9-star ratings on the Apple App Store and Google Play.`,
        sort_order: 3,
      },
      {
        title: 'Zero-Downtime CI/CD Pipelines with Docker, Cloudflare & Automated Health Checks',
        slug: 'zero-downtime-cicd-docker-cloudflare',
        category: 'Cloud & DevOps',
        author_name: 'CodeLifeAI Engineering',
        author_role: 'Cloud & DevOps Lead',
        read_time: '6 min read',
        excerpt: 'A comprehensive walk-through of blue-green rolling deployments, automated rollback strategies, and global edge cache invalidation.',
        content: `### High-Availability Production Deployments\n\nEvery second of deployment downtime degrades user trust and conversion rates. Our production pipeline delivers seamless rolling updates with automated canary testing and instant rollback safeguards.\n\n### The Deployment Pipeline Breakdown\n\n1. **Automated Unit & Integration Checks:** Every GitHub PR triggers automated linting, test suites, and Docker multi-stage builds.\n2. **Health Check Probing:** New container instances must pass active HTTP \`/health\` probes before ingress traffic is routed to them.\n3. **Edge Cache Purging:** Cloudflare cache tags are selectively invalidated for modified static assets while preserving edge-cached assets.\n\nThis pipeline guarantees 99.99% availability and allows our engineering team to ship production features multiple times per day with zero disruption.`,
        sort_order: 4,
      },
      {
        title: 'Agentic RAG with Hybrid Vector Search: Beyond Semantic Similarity',
        slug: 'agentic-rag-hybrid-vector-search',
        category: 'AI & Machine Learning',
        author_name: 'CodeLifeAI Engineering',
        author_role: 'AI Architecture Lead',
        read_time: '7 min read',
        excerpt: 'Why pure vector embeddings fail on keyword-exact entity queries and how combining BM25 full-text indexing with dense embeddings and cross-encoder re-ranking yields 98%+ precision.',
        content: `### The Limitations of Pure Vector Search\n\nMost naive Retrieval-Augmented Generation (RAG) pipelines rely solely on dense vector embeddings (such as OpenAI text-embedding-3 or Gemini embeddings). While vector similarity excels at fuzzy conceptual matching, it frequently fails when users search for exact serial numbers, product SKUs, acronyms, or specific function identifiers.\n\n### Hybrid Retrieval: The Best of Both Worlds\n\nTo solve this, modern production search systems pair dense vector similarity with sparse keyword indexing (BM25 or Reciprocal Rank Fusion - RRF).\n\n- **Dense Embeddings:** Capture contextual semantics, synonyms, and multi-lingual equivalents.\n- **Sparse BM25 Indexing:** Captures exact token matches, proper nouns, and rare technical keywords.\n- **Reciprocal Rank Fusion (RRF):** Merges normalized scores from both engines without requiring manual weight tuning.\n\n\`\`\`javascript\n// Reciprocal Rank Fusion (RRF) scoring algorithm\nfunction computeRRF(denseRankings, sparseRankings, k = 60) {\n  const scores = new Map()\n  \n  denseRankings.forEach((docId, rank) => {\n    scores.set(docId, (scores.get(docId) || 0) + 1 / (k + rank + 1))\n  })\n  \n  sparseRankings.forEach((docId, rank) => {\n    scores.set(docId, (scores.get(docId) || 0) + 1 / (k + rank + 1))\n  })\n  \n  return Array.from(scores.entries())\n    .sort((a, b) => b[1] - a[1])\n    .map(([docId]) => docId)\n}\n\`\`\`\n\n### Self-Correcting Agentic Query Routing\n\nRather than running every user query through the entire retrieval pipeline, an agentic router classifies the query intent:\n- **Direct LLM Memory:** Simple conversational prompts bypass search entirely to save latency.\n- **Vector + Full-Text Search:** Complex knowledge lookups execute parallel dual-index queries.\n- **Re-Ranking Filter:** A lightweight cross-encoder model evaluates the top 20 retrieved chunks and retains only the top 3 high-confidence context passages.\n\n### Production Results\n\nImplementing Hybrid RAG with cross-encoder re-ranking reduced hallucination rates by 74% and eliminated document retrieval misses across our enterprise client projects.`,
        sort_order: 5,
      },
      {
        title: 'Scaling Real-Time WebSockets to 50k Connections with Redis Streams',
        slug: 'scaling-websockets-redis-streams',
        category: 'Architecture',
        author_name: 'CodeLifeAI Engineering',
        author_role: 'Principal Systems Architect',
        read_time: '6 min read',
        excerpt: 'How to architect a fault-tolerant, horizontally scalable WebSocket cluster with Redis Pub/Sub backpressure, connection heartbeat sweeps, and graceful zero-loss restarts.',
        content: `### The Real-Time Concurrency Challenge\n\nStateful WebSocket connections pose unique architectural challenges when scaling across multiple horizontal server nodes. A client connected to Node A must receive instant updates when Node B processes a relevant event.\n\n### Decoupling Socket State from Business Logic\n\nBy using **Redis Pub/Sub** and **Redis Streams**, we separate real-time socket delivery from long-running business compute.\n\n- **Gateway Layer:** Stateless Node.js WebSocket gateways maintain socket handshakes and TLS termination.\n- **Pub/Sub Broker:** Inter-node event distribution distributes chat messages, notifications, and live status beacons in sub-millisecond time.\n- **Persistent Event Stream:** Redis Streams store message backlogs, allowing disconnected mobile clients to replay missed events upon reconnection.\n\n\`\`\`javascript\n// Redis Pub/Sub WebSocket broadcast dispatcher\nimport { createClient } from 'redis'\n\nconst pubClient = createClient({ url: process.env.REDIS_URL })\nconst subClient = pubClient.duplicate()\n\nawait Promise.all([pubClient.connect(), subClient.connect()])\n\n// Subscribe to room-level channel\nsubClient.subscribe('room:global:events', (message) => {\n  const payload = JSON.parse(message)\n  wsServer.clients.forEach(client => {\n    if (client.readyState === WebSocket.OPEN && client.subscribedRooms.has(payload.roomId)) {\n      client.send(JSON.stringify(payload))\n    }\n  })\n})\n\`\`\`\n\n### Heartbeat & Memory Leak Prevention\n\n- **30-Second Ping/Pong Sweeps:** Terminate dead TCP half-open sockets automatically to reclaim system file descriptors.\n- **Backpressure Buffers:** Pause incoming client socket streams when local buffer queues exceed safety thresholds.\n- **Sticky Session Load Balancing:** Use IP-hash routing on reverse proxies to ensure seamless connection stability.\n\n### Takeaway\n\nA Redis-backed WebSocket architecture ensures linear horizontal scaling without coupling application instances to fragile local state.`,
        sort_order: 6,
      },
      {
        title: 'Mastering Next.js 15 Server Actions, Partial Prerendering & Optimistic UI',
        slug: 'mastering-nextjs-15-server-actions-ppr',
        category: 'Engineering',
        author_name: 'CodeLifeAI Engineering',
        author_role: 'Full-Stack Lead',
        read_time: '6 min read',
        excerpt: 'A deep dive into Next.js 15 Partial Prerendering (PPR), type-safe Server Actions with Zod validation, and instant Optimistic UI state updates for blazing fast web apps.',
        content: `### Next.js 15 & The Evolution of React Server Components\n\nWith Next.js 15, the boundary between server-rendered static shells and dynamic interactive components is tighter than ever. **Partial Prerendering (PPR)** delivers instantaneous initial page loads by streaming dynamic holes into pre-compiled static HTML shells.\n\n### Type-Safe Server Actions with Zod Validation\n\nServer Actions allow direct form mutations and asynchronous backend logic without manually building boilerplate REST API endpoints.\n\n\`\`\`typescript\n// Type-safe Server Action with schema validation\n'use server'\nimport { z } from 'zod'\nimport { revalidatePath } from 'next/cache'\n\nconst ContactSchema = z.object({\n  name: z.string().min(2),\n  email: z.string().email(),\n  message: z.string().min(10),\n})\n\nexport async function submitEnquiry(formData: FormData) {\n  const parsed = ContactSchema.safeParse(Object.fromEntries(formData))\n  if (!parsed.success) {\n    return { success: false, errors: parsed.error.flatten() }\n  }\n  \n  await db.insertEnquiry(parsed.data)\n  revalidatePath('/contact')\n  return { success: true }\n}\n\`\`\`\n\n### Optimistic UI: Zero Perceived Latency\n\nBy pairing \`useOptimistic\` with Server Actions, user interactions like liking a post, submitting a comment, or toggling a status update reflect immediately on the screen before the network roundtrip completes.\n\n- **Instant Feedback:** The UI updates in 0ms using client state.\n- **Automatic Rollback:** If the Server Action fails due to network error, React automatically rolls back the optimistic state.\n- **Cache Invalidation:** \`revalidateTag\` or \`revalidatePath\` guarantees that fresh server data syncs silently in the background.\n\n### Why This Matters for Modern Web Apps\n\nCombining PPR with Optimistic Server Actions yields 99+ Google Lighthouse scores and an application feel that rivals native desktop software.`,
        sort_order: 7,
      },
      {
        title: 'High-Throughput PostgreSQL: Query Optimization, Indexing & Connection Pooling',
        slug: 'high-throughput-postgresql-optimization',
        category: 'Cloud & DevOps',
        author_name: 'CodeLifeAI Engineering',
        author_role: 'Database & Cloud Lead',
        read_time: '7 min read',
        excerpt: 'Practical indexing blueprints (B-tree, GIN, BRIN), PgBouncer connection pooling strategies, and EXPLAIN ANALYZE profiling to eliminate database bottlenecks.',
        content: `### The Hidden Cost of Unoptimized Databases\n\nAs web traffic grows, unindexed queries and uncontrolled database connection spikes quickly exhaust CPU and memory resources. Optimizing PostgreSQL at the schema and pooling layer often yields 10x throughput gains without spending a dollar on larger server instances.\n\n### 1. Selecting the Right Index Type\n\nStandard B-tree indexes are great for equality and range checks, but specialized workloads require tailored index types:\n\n- **B-Tree:** Default choice for primary keys, timestamps, and foreign keys.\n- **GIN (Generalized Inverted Index):** Essential for JSONB column queries, full-text search, and array containment operations.\n- **BRIN (Block Range Index):** Extremely lightweight indexes for append-only time-series data, taking up less than 1% of the disk space of a B-tree index.\n- **Partial Indexes:** Indexing only active records (\`WHERE is_active = true\`) drastically shrinks index size and boosts write speed.\n\n\`\`\`sql\n-- High-efficiency partial index for active subscription lookups\nCREATE INDEX CONCURRENTLY idx_active_subscriptions \nON subscriptions (user_id, plan_id) \nWHERE status = 'ACTIVE';\n\`\`\`\n\n### 2. PgBouncer Connection Pooling\n\nPostgreSQL allocates a dedicated process per connection (costing ~5–10MB RAM each). When hundreds of serverless or containerized app instances connect simultaneously, connection exhaustion crashes the database.\n\n- **Transaction Pooling:** Reuses database connections immediately after a transaction completes rather than holding them open for idle clients.\n- **Max Client Connections:** PgBouncer can comfortably multiplex 10,000 incoming client connections into 50–100 physical Postgres connections.\n\n### 3. Query Profiling with EXPLAIN (ANALYZE, BUFFERS)\n\nAlways profile slow queries to identify sequential table scans (\`Seq Scan\`) and high shared buffer hits. Eliminating unnecessary joins and adding composite indexes resolves 90% of slow query issues in production.`,
        sort_order: 8,
      },
    ]

    for (const b of defaultBlogs) {
      await db.execute({
        sql: `INSERT INTO blogs (title, slug, excerpt, content, category, author_name, author_role, read_time, is_published, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        args: [b.title, b.slug, b.excerpt, b.content, b.category, b.author_name, b.author_role, b.read_time, b.sort_order],
      })
    }
  }

  // ── Industries: ensure default 8 verticals are seeded on boot ──────
  const indCount = await db.execute('SELECT COUNT(*) as c FROM industries')
  if (Number(indCount.rows[0]?.c || 0) === 0) {
    console.log('🌱 Seeding 8 Industry Verticals...')
    await seedIndustries(db)
  }

  // Indexes for analytics and hot paths. CREATE INDEX IF NOT EXISTS is
  // idempotent, so this is safe to run every boot.
  await db.execute('CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, id)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_pageviews_created ON visitor_pageviews(created_at)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_pageviews_path ON visitor_pageviews(path)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_visitor_sessions_last_seen ON visitor_sessions(last_seen)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(is_published, published_at)')
}

export const INDUSTRIES_SEED_DATA = [
  {
    title: 'E-Commerce & Retail',
    slug: 'e-commerce-retail',
    icon: 'ShoppingBag',
    badge: 'HIGH-CONVERSION RETAIL',
    short_desc: 'High-conversion headless commerce, unified checkout & sub-second catalog search.',
    long_desc: 'We architect and engineer modern headless commerce platforms designed for high-volume consumer brands and B2B distributors. By decoupling frontend shopping experiences from backend inventory management, we achieve blazing-fast sub-200ms page transitions, seamless checkout flows, and frictionless omnichannel shopping.\n\nOur engineering team specializes in custom Shopify Plus integrations, Medusa/commercelayer headless microservices, elastic search engines, and real-time inventory synchronization across multi-warehouse supply chains.',
    challenges: [
      'Monolithic storefronts causing high bounce rates and cart abandonment due to 4+ second load times.',
      'Disjointed inventory reconciliation between brick-and-mortar POS and digital storefronts.',
      'Database locks and checkout bottlenecks during Black Friday and flash sales events.',
    ],
    solutions: [
      'Headless Next.js edge-rendered storefronts achieving 95+ Google Lighthouse performance scores.',
      'Event-driven inventory synchronization pipelines updating stock counts across all channels in real time.',
      'Distributed serverless checkout microservices engineered to process 50,000+ concurrent transactions without latency degradation.',
    ],
    features: [
      'Headless Next.js / Hydrogen Digital Storefronts',
      'Custom Checkout & PCI-DSS Compliant Payment Gateways',
      'Sub-Second Vector & Keyword Catalog Search (Algolia / Elasticsearch)',
      'Omnichannel Warehouse & ERP Synchronization (NetSuite / SAP)',
      'Personalized Recommendation & Dynamic Pricing Microservices',
      'PWA & Cross-Platform Mobile Commerce Apps (iOS & Android)',
    ],
    stack: ['Next.js', 'Shopify Plus', 'Medusa', 'Stripe', 'PostgreSQL', 'Redis', 'Elasticsearch', 'AWS', 'Tailwind CSS'],
    metrics: [
      { label: 'Search Latency', value: '<120ms' },
      { label: 'Conversion Boost', value: '+34%' },
      { label: 'Uptime on Peak Days', value: '99.99%' },
    ],
    image_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 1,
  },
  {
    title: 'Healthcare & Life Sciences',
    slug: 'healthcare-life-sciences',
    icon: 'HeartPulse',
    badge: 'HIPAA COMPLIANT',
    short_desc: 'HIPAA-compliant patient portals, encrypted telemetry & digital health systems.',
    long_desc: 'We build mission-critical digital health software engineered for uncompromising data security and regulatory compliance. From WebRTC-powered virtual consultation rooms to bidirectional Electronic Health Record (EHR) interoperability gateways, our platforms modernize patient care.\n\nEvery line of code adheres strictly to HIPAA, HITECH, and GDPR guidelines, featuring end-to-end data encryption at rest and in transit, comprehensive immutable audit logging, and role-based clinician access control.',
    challenges: [
      'Strict regulatory penalties and severe legal liability surrounding PHI (Protected Health Information) data breaches.',
      'Fragmented legacy EHR systems that block clinicians from accessing longitudinal patient medical records.',
      'Unstable video connections and high latency during critical telehealth appointments.',
    ],
    solutions: [
      'SOC2 Type II and HIPAA-audited cloud infrastructure with hardware-encrypted storage and zero PHI leakage.',
      'Standardized HL7 FHIR API connectors enabling bi-directional sync with Epic, Cerner, and AthenaHealth.',
      'Low-latency WebRTC streaming clusters with adaptive bitrate streaming for crystal-clear clinical video calls.',
    ],
    features: [
      'HIPAA-Compliant Patient & Provider Telehealth Web/Mobile Portals',
      'HL7 & FHIR Electronic Health Record (EHR) Bridges',
      'Medical IoT Device Telemetry & Vital Signs Monitoring',
      'Secure E-Prescriptions & Clinical Lab Result Distribution',
      'Clinical Trial Data Capture & Compliance Audit Trails',
      'AI-Assisted Medical Imaging Analysis & Diagnostic Workflows',
    ],
    stack: ['React', 'Node.js', 'Python', 'WebRTC', 'PostgreSQL', 'FHIR API', 'Docker', 'AWS GovCloud', 'Redis'],
    metrics: [
      { label: 'Compliance Standard', value: '100% HIPAA' },
      { label: 'Telehealth Latency', value: '<180ms' },
      { label: 'Patient Adoption', value: '+58%' },
    ],
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 2,
  },
  {
    title: 'Education & EdTech',
    slug: 'education-edtech',
    icon: 'GraduationCap',
    badge: 'GLOBAL LEARNING PLATFORMS',
    short_desc: 'Accessible real-time learning portals, LMS microservices & adaptive assessments.',
    long_desc: 'We engineer interactive educational software that transforms how students, educators, and enterprise teams learn. By combining real-time collaboration with AI-driven adaptive assessment engines, our platforms boost student retention and course completion.\n\nOur solutions support modern educational standards including SCORM, xAPI, and LTI, ensuring seamless integration with existing university registries and institutional learning ecosystems.',
    challenges: [
      'Student disengagement and high drop-off rates in passive video-based e-learning courses.',
      'Server crashes when tens of thousands of students submit synchronized exams or stream lectures simultaneously.',
      'Inaccessibility for neurodivergent or visually impaired students due to poor accessibility compliance.',
    ],
    solutions: [
      'Gamified interactive modules, real-time code sandboxes, and collaborative virtual whiteboards.',
      'Horizontally autoscaling WebSocket microservices engineered to support 150,000+ simultaneous test takers.',
      'Full adherence to WCAG 2.1 AA accessibility guidelines, screen-reader optimizations, and keyboard navigation.',
    ],
    features: [
      'Custom Learning Management Systems (LMS) with SCORM / xAPI Support',
      'Synchronized Virtual Classrooms with WebRTC Audio/Video & Canvas Whiteboard',
      'AI-Powered Adaptive Assessment Engines with Instant Grading',
      'Student Engagement & Drop-off Prediction Analytics Dashboards',
      'Enterprise Single Sign-On (SAML / OAuth2) & Student Registry Sync',
      'Offline-First Mobile Learning Apps with Automatic Background Sync',
    ],
    stack: ['React', 'Next.js', 'Node.js', 'WebSockets', 'WebRTC', 'PostgreSQL', 'Redis', 'AWS CloudFront', 'Tailwind CSS'],
    metrics: [
      { label: 'Course Completion', value: '+72%' },
      { label: 'Concurrent Students', value: '150k+' },
      { label: 'Accessibility Rating', value: 'WCAG 2.1 AA' },
    ],
    image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 3,
  },
  {
    title: 'Logistics & Supply Chain',
    slug: 'logistics-supply-chain',
    icon: 'Truck',
    badge: 'REAL-TIME GEOSPATIAL TELEMETRY',
    short_desc: 'Real-time geospatial fleet tracking, automated dispatch & warehouse operations.',
    long_desc: 'We engineer high-throughput supply chain intelligence and freight management platforms. From IoT sensor data streaming on container ships and long-haul trucks to computer-vision-assisted warehouse sorting, our software eliminates blind spots.\n\nOur platforms integrate seamlessly with major carriers and standard logistics protocols (EDI 204, 210, 214), delivering end-to-end visibility from factory floor to doorstep delivery.',
    challenges: [
      'Blind spots across third-party carrier handoffs causing inaccurate ETAs and frustrated customers.',
      'Suboptimal vehicle routing driving up diesel consumption, driver overtime, and fleet wear-and-tear.',
      'Manual inventory counts and spreadsheet errors leading to warehouse stockouts and shipping delays.',
    ],
    solutions: [
      'Real-time GPS telemetry pipelines streaming coordinates directly to low-latency Mapbox visualizations.',
      'AI heuristic routing algorithms that dynamically factor in live traffic, axle weight limits, and delivery windows.',
      'Barcode and RFID scanning web/mobile applications that reconcile warehouse inventory in real time.',
    ],
    features: [
      'Sub-Second GPS Fleet Tracking & Geofenced Alerts',
      'AI Automated Dispatch & Multi-Stop Route Optimization',
      'Warehouse Management Systems (WMS) with Barcode & RFID Support',
      'Driver Mobile Apps (Turn-by-turn guidance & Digital Proof of Delivery)',
      'EDI 204 / 210 / 214 Carrier & Freight Brokerage Integrations',
      'Predictive Inventory Stockout & Replenishment Dashboards',
    ],
    stack: ['React', 'Mapbox GL', 'Node.js', 'Python', 'PostGIS', 'Kafka', 'Redis', 'Docker', 'AWS IoT Core'],
    metrics: [
      { label: 'Route Efficiency', value: '+28%' },
      { label: 'ETA Accuracy', value: '98.4%' },
      { label: 'Fuel Cost Savings', value: '19%' },
    ],
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 4,
  },
  {
    title: 'Automotive & Mobility',
    slug: 'automotive-mobility',
    icon: 'Car',
    badge: 'CONNECTED MOBILITY & TELEMETRY',
    short_desc: 'Connected vehicle telemetry, dealer CRM portals & predictive diagnostics.',
    long_desc: 'We architect modern software platforms for vehicle manufacturers, EV charging networks, and automotive dealership groups. We ingest high-frequency CAN-bus and OBD-II telemetry streams, power digital car configurators, and manage dealership operations.\n\nWhether developing OCPP-compliant EV charging management clouds or companion mobile apps with digital vehicle key functionality, we build secure, scalable automotive tech.',
    challenges: [
      'Massive volumes of high-frequency sensor streams overwhelming conventional database architectures.',
      'Fragmented dealership software ecosystems causing disconnects between online shoppers and showroom sales reps.',
      'Unpredicted mechanical breakdowns causing fleet downtime and warranty cost overruns.',
    ],
    solutions: [
      'High-throughput time-series ingestion pipelines built on Apache Kafka and TimescaleDB handling millions of data points per minute.',
      'Integrated omnichannel dealer portals connecting online vehicle configuration with CRM sales workflows.',
      'Predictive anomaly detection models analyzing vibration and heat metrics to flag component wear before failure.',
    ],
    features: [
      'Connected Vehicle CAN-Bus & OBD-II Cloud Ingestion Engines',
      'Automotive Dealership Digital Showrooms & Inventory Portals',
      'EV Charging Station Management & Billing Platforms (OCPP 1.6 / 2.0.1)',
      'Predictive Vehicle Component Diagnostics & Maintenance Alerts',
      'Driver Companion Mobile Apps (Remote start, lock, and battery telemetry)',
      'Fleet Sharing & Rental Reservation Booking Platforms',
    ],
    stack: ['React', 'React Native', 'Go', 'Python', 'TimescaleDB', 'Kafka', 'MQTT', 'AWS IoT', 'Tailwind CSS'],
    metrics: [
      { label: 'Telemetry Ingestion', value: '1M+ msgs/sec' },
      { label: 'Diagnostic Accuracy', value: '96.2%' },
      { label: 'Dealer Leads', value: '+44%' },
    ],
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 5,
  },
  {
    title: 'Fintech & Enterprise Software',
    slug: 'fintech-enterprise-software',
    icon: 'Landmark',
    badge: 'SOC2 & PCI-DSS READY',
    short_desc: 'SOC2-ready financial platforms, immutable ledgers & real-time settlement APIs.',
    long_desc: 'We build institutional-grade financial platforms that move money securely and instantly. From core double-entry accounting ledgers to algorithmic fraud prevention and digital banking interfaces, our software powers next-generation financial services.\n\nEvery platform is engineered to satisfy stringent SOC2 Type II, PCI-DSS Level 1, and ISO 27001 audit standards, providing mathematically immutable audit trails and microsecond transaction settlement.',
    challenges: [
      'Zero tolerance for ledger imbalances, transaction loss, or concurrency race conditions.',
      'Sophisticated automated fraud attacks that bypass static rule engines and trigger chargeback penalties.',
      'Complex multi-party regulatory compliance (KYC, AML, OFAC sanctions checks).',
    ],
    solutions: [
      'Mathematically provable double-entry ledger architecture with ACID transactional integrity and cryptographic verification.',
      'Real-time machine learning inference scoring risk in under 35ms on every card authorization.',
      'Automated KYC/AML verification workflows integrating biometric identity verification and sanctions screening.',
    ],
    features: [
      'Double-Entry Ledger & Multi-Currency Digital Wallet Microservices',
      'Real-Time Card Issuance & Core Banking API Connectors',
      'AI-Powered Real-Time Fraud & Anomaly Risk Scoring Engine',
      'Automated KYC / AML Identity Verification & Biometric Match',
      'Institutional Asset Management & Algorithmic Trading Dashboards',
      'Open Banking Integrations with Plaid, MX, and Stripe Financial Connections',
    ],
    stack: ['TypeScript', 'React', 'Node.js', 'Go', 'PostgreSQL', 'Redis', 'Kafka', 'AWS CloudHSM', 'Docker'],
    metrics: [
      { label: 'Audit Standards', value: 'SOC2 Type II' },
      { label: 'Transaction Latency', value: '<35ms' },
      { label: 'Fraud Detection Rate', value: '99.4%' },
    ],
    image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 6,
  },
  {
    title: 'Travel & Tourism',
    slug: 'travel-tourism',
    icon: 'Plane',
    badge: 'HIGH-CONCURRENCY BOOKING',
    short_desc: 'High-concurrency flight booking engines, reservation APIs & payment gateways.',
    long_desc: 'We engineer high-availability reservation engines and immersive travel planning software. By integrating Global Distribution Systems (Amadeus, Sabre) and direct airline NDC APIs, our platforms deliver sub-second search results across millions of flight and hotel combinations.\n\nOur systems handle high-volume booking spikes with resilient distributed locking, multi-currency processing, and automated itinerary management.',
    challenges: [
      'Massive traffic spikes during holiday travel promotions overwhelming database servers and dropping bookings.',
      'Multi-second latency when querying complex multi-leg flight combinations across legacy GDS APIs.',
      'Complex cancellation, change fee calculations, and currency conversion reconciliations.',
    ],
    solutions: [
      'Distributed caching layers and asynchronous flight search matrix pipelines delivering sub-400ms query times.',
      'Resilient booking state machines with distributed locks preventing double-bookings.',
      'Automated self-service passenger portals enabling instant flight changes, refunds, and voucher issuance.',
    ],
    features: [
      'GDS Flight Search & Direct Airline Ticketing (NDC API, Amadeus, Sabre)',
      'Hotel & Vacation Rental Property Reservation Management Systems',
      'Dynamic Pricing Engines with Competitor Rate Scraping',
      'Interactive Multilingual Itinerary Builders with Offline Mobile Sync',
      'Multi-Currency Local Payment Gateways (Alipay, Klarna, Apple Pay)',
      'Customer Self-Service Rebooking & Instant Refund Automation',
    ],
    stack: ['Next.js', 'React', 'Node.js', 'Python', 'PostgreSQL', 'Redis', 'Elasticsearch', 'AWS', 'Tailwind CSS'],
    metrics: [
      { label: 'Flight Matrix Query', value: '<350ms' },
      { label: 'Checkout Completion', value: '92.8%' },
      { label: 'Peak Concurrency', value: '80k users' },
    ],
    image_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 7,
  },
  {
    title: 'Professional Services',
    slug: 'professional-services',
    icon: 'Briefcase',
    badge: 'ENTERPRISE PRODUCTIVITY',
    short_desc: 'Custom enterprise ERPs, client workflow automation & executive analytics portals.',
    long_desc: 'We build bespoke practice management and enterprise software for legal firms, accounting practices, management consultancies, and digital agencies. We consolidate disparate spreadsheets and tools into a single, cohesive operating system.\n\nFrom smart time-tracking and automated progress billing to secure client document portals and real-time partner analytics, our software eliminates administrative drag.',
    challenges: [
      'Unbilled hours and revenue leakage caused by disconnected manual time-tracking across spreadsheets.',
      'Slow invoice turnaround and delayed client collections harming cash flow predictability.',
      'Partners and executives lacking real-time visibility into project profitability and consultant utilization.',
    ],
    solutions: [
      'Automated background time-tracking tools with single-click conversion into itemized client invoices.',
      'Self-service client intake portals with integrated electronic signatures and instant credit card / ACH payments.',
      'Executive KPI dashboards displaying real-time billable utilization, project margins, and revenue forecasting.',
    ],
    features: [
      'Custom Enterprise Resource Planning (ERP) & Practice Management Systems',
      'Automated Client Intake & Legally Compliant E-Signature Portals',
      'Smart Time-Tracking, Billable Rate Calculators & Automated Invoicing',
      'Executive KPI & Resource Utilization Dashboards',
      'Role-Based Access Control (RBAC) & Bank-Grade Document Vaults',
      'Seamless Integrations with QuickBooks, Xero, Salesforce & Google Workspace',
    ],
    stack: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe Invoicing', 'AWS', 'Tailwind CSS'],
    metrics: [
      { label: 'Admin Time Saved', value: '18 hrs/week' },
      { label: 'Payment Turnaround', value: '-45% days' },
      { label: 'Team Utilization', value: '+24%' },
    ],
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 8,
  },
]

export async function seedIndustries(db) {
  for (const ind of INDUSTRIES_SEED_DATA) {
    const existing = await db.execute({
      sql: 'SELECT id FROM industries WHERE slug = ? OR title = ?',
      args: [ind.slug, ind.title],
    })
    if (existing.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO industries (title, slug, icon, badge, short_desc, long_desc, challenges, solutions, features, stack, metrics, image_url, show_on_home, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          ind.title,
          ind.slug,
          ind.icon,
          ind.badge,
          ind.short_desc,
          ind.long_desc,
          JSON.stringify(ind.challenges),
          JSON.stringify(ind.solutions),
          JSON.stringify(ind.features),
          JSON.stringify(ind.stack),
          JSON.stringify(ind.metrics),
          ind.image_url,
          ind.show_on_home,
          ind.sort_order,
        ],
      })
    }
  }
}

async function seed(db) {
  const hash = bcrypt.hashSync('codelifeai2025', 10)
  await db.execute({
    sql: 'INSERT OR IGNORE INTO admin_users (username, password) VALUES (?, ?)',
    args: ['admin', hash],
  })

  const services = [
    { title: 'Web Development', icon: '⚡',
      short_desc: 'Full-stack web apps with modern frameworks. Fast, responsive, built to scale from MVP to enterprise.',
      long_desc: 'We build performant, scalable full-stack web applications — from polished landing pages to complex SaaS platforms that grow with your business.',
      features: JSON.stringify(['Custom full-stack applications','REST & GraphQL APIs','Responsive & mobile-first UI','Authentication & security','Database design & optimization','Third-party integrations','SEO & performance tuning','Ongoing maintenance & support']),
      stack: JSON.stringify(['React','Next.js','Node.js','TypeScript','PostgreSQL','MongoDB','Tailwind CSS','Vercel','AWS']), sort_order: 1 },
    { title: 'Mobile Apps', icon: '📱',
      short_desc: 'Native and cross-platform experiences for iOS & Android. Intuitive UX that users actually love.',
      long_desc: 'Native and cross-platform mobile apps for iOS & Android. We design for delight and engineer for reliability — apps your users will actually keep.',
      features: JSON.stringify(['iOS & Android development','React Native / Flutter','Offline-first architecture','Push notifications','App Store submission','In-app purchases','Analytics integration','Performance profiling']),
      stack: JSON.stringify(['React Native','Flutter','Swift','Kotlin','Firebase','Expo','Redux','App Store Connect']), sort_order: 2 },
    { title: 'UI/UX Design', icon: '🎨',
      short_desc: "Design systems, prototyping, and product design. We obsess over details so your users don't have to think.",
      long_desc: 'Interfaces that feel inevitable. We craft design systems, flows, and micro-interactions that reduce friction and build user trust from the first tap.',
      features: JSON.stringify(['User research & personas','Information architecture','Wireframing & prototyping','Design systems & tokens','Usability testing','Accessibility (WCAG)','Interactive prototypes','Developer-ready handoffs']),
      stack: JSON.stringify(['Figma','FigJam','Framer','Lottie','Storybook','Zeroheight','Maze','Hotjar']), sort_order: 3 },
    { title: 'AI Integration', icon: '🤖',
      short_desc: 'LLMs, automation pipelines, and intelligent features woven into your product where they actually add value.',
      long_desc: "We bring intelligent features to your product — not as gimmicks, but as genuine value. From LLM-powered workflows to custom model deployments.",
      features: JSON.stringify(['LLM integration (GPT, Claude)','Custom fine-tuning','RAG pipelines','AI chatbots & assistants','Document intelligence','Semantic search','Automation workflows','Model evaluation & safety']),
      stack: JSON.stringify(['OpenAI','Anthropic','LangChain','Pinecone','Supabase pgvector','Python','FastAPI','Hugging Face']), sort_order: 4 },
    { title: 'Cloud & DevOps', icon: '☁️',
      short_desc: 'Infrastructure, CI/CD, and deployment strategies that keep your product reliable, secure, and always-on.',
      long_desc: 'Infrastructure that stays out of your way. We design, build, and operate cloud environments that are reliable, secure, and cost-efficient at any scale.',
      features: JSON.stringify(['Cloud architecture design','CI/CD pipelines','Docker & Kubernetes','Infrastructure as Code','Monitoring & alerting','Auto-scaling setup','Security hardening','Cost optimisation']),
      stack: JSON.stringify(['AWS','GCP','Azure','Terraform','GitHub Actions','Docker','Kubernetes','Datadog','Cloudflare']), sort_order: 5 },
    { title: 'Consulting', icon: '🔐',
      short_desc: 'Technical strategy, architecture reviews, and startup advisory. Move fast without breaking things.',
      long_desc: "Straight-talk technical guidance from founders who've built and shipped real products. We help you make better decisions, faster.",
      features: JSON.stringify(['Technical architecture review','CTO-as-a-service','Tech stack selection','Code & process audits','Startup roadmap planning','Team structure advice','Vendor evaluation','Pre-investment tech due diligence']),
      stack: JSON.stringify(['Systems Design','Agile','JIRA','Notion','Linear','Miro','Loom','Slack']), sort_order: 6 },
  ]
  for (const s of services) {
    await db.execute({
      sql: 'INSERT INTO services (title,icon,short_desc,long_desc,features,stack,sort_order) VALUES (?,?,?,?,?,?,?)',
      args: [s.title, s.icon, s.short_desc, s.long_desc, s.features, s.stack, s.sort_order],
    })
  }

  const founders = [
    { name: 'Muhammad Ahmed', role: 'Co-Founder & CEO',
      bio: "Visionary builder and strategic mind behind CodeLifeAI. Muhammad drives product direction, client relationships, and the relentless pursuit of clean, purposeful software. He believes technology should solve real problems — not create new ones.",
      initials: 'MA', photo_url: '', avatar_bg: 'linear-gradient(135deg,#7c3aed,#00d4f5)',
      tags: JSON.stringify(['Product Strategy','Full-Stack Dev','Startup Growth','Team Leadership']), sort_order: 1 },
    { name: 'Anas Waheed', role: 'Co-Founder & CTO',
      bio: 'The technical architect who turns ambitious ideas into production-ready systems. Anas leads engineering at CodeLifeAI with a passion for scalable architecture, developer experience, and shipping things that just work — elegantly.',
      initials: 'AW', photo_url: '', avatar_bg: 'linear-gradient(135deg,#00d4f5,#0891b2)',
      tags: JSON.stringify(['Systems Architecture','Backend Engineering','AI & ML','DevOps']), sort_order: 2 },
  ]
  for (const f of founders) {
    await db.execute({
      sql: 'INSERT INTO founders (name,role,bio,initials,photo_url,avatar_bg,tags,sort_order) VALUES (?,?,?,?,?,?,?,?)',
      args: [f.name, f.role, f.bio, f.initials, f.photo_url, f.avatar_bg, f.tags, f.sort_order],
    })
  }

  const contentDefaults = {
    hero_badge:           "We build what's next",
    hero_title:           'We Create',
    hero_cycling_words:   'Software., Products., Experiences., The Future., What Matters.',
    hero_subtitle:        'CodeLifeAI is a software studio crafting next-generation digital products — from scalable web apps and mobile experiences to custom autonomous AI agents.',
    marquee_items:        'Web Development, Mobile Apps, UI/UX Design, AI Integration, Cloud & DevOps, Tech Consulting',
    header_topbar_enabled: '1',
    header_phone:         '+923168435767',
    header_email:         'contact@codelifeai.com',
    header_announcement:  '⚡ Open for Q1/Q2 Projects · High-Velocity Delivery',
    header_cta_text:      'Request a Quote',
    header_cta_link:      '/contact',
    contact_email:        'contact@codelifeai.com',
    contact_phone:        '+923168435767',
    contact_subtitle:     "Have a project in mind? We'd love to hear about it. Reach out and let's start a conversation.",
    footer_tagline:       'We build digital products that are fast, modern, and built to scale.',
    footer_about:         'Next-generation software engineering studio creating high-velocity web applications, fluid mobile apps, and autonomous AI agents for ambitious teams worldwide.',
    footer_address:       'Karachi, Pakistan · Global Remote Delivery',
    footer_copyright:     '© {year} CodeLifeAI. All rights reserved.',
    footer_services:      'Web Development, Mobile Apps, AI & Custom Agents, Cloud & DevOps, UI/UX Architecture',
    social_linkedin:      '',
    social_facebook:      '',
    social_instagram:     '',
    social_twitter:       '',
    social_github:        '',
    social_whatsapp:      '+923168435767',
  }
  for (const [k, v] of Object.entries(contentDefaults)) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO content (key, value) VALUES (?, ?)',
      args: [k, v],
    })
  }

  const settingsDefaults = {
    gemini_model:      process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    chatbot_name:      'CodeLifeAI Assistant',
    chatbot_greeting:  "Hi! I'm the CodeLifeAI assistant. Ask me about our services, team, or how we can help you build your next product!",
  }
  for (const [k, v] of Object.entries(settingsDefaults)) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      args: [k, v],
    })
  }

  await db.execute({
    sql: 'INSERT INTO kb_documents (title, content) VALUES (?, ?)',
    args: [
      'CodeLifeAI Company Overview',
      `CodeLifeAI is a software startup founded by Muhammad Ahmed (CEO) and Anas Waheed (CTO), based in Pakistan.

We build elegant digital products including web applications, mobile apps, UI/UX design, AI integrations, cloud infrastructure, and offer technical consulting services.

Our Services:
- Web Development: Full-stack React/Next.js apps, Node.js APIs, PostgreSQL databases
- Mobile Apps: React Native and Flutter for iOS & Android
- UI/UX Design: Figma design systems, prototyping, user research, accessibility
- AI Integration: LLM integrations, RAG pipelines, chatbots using OpenAI and Anthropic APIs
- Cloud & DevOps: AWS, GCP, Docker, Kubernetes, Terraform, CI/CD pipelines
- Consulting: Technical architecture reviews, CTO-as-a-service, startup advisory

Our Process:
1. Discovery — understand goals, users, and constraints
2. Design — wireframes, prototypes, design systems
3. Build — agile sprints with weekly deliverables
4. Launch — deployment, monitoring, post-launch support

Contact: hello@codelifeai.com
We work with startups, founders, and growing businesses worldwide.`,
    ],
  })

  await seedIndustries(db)

  console.log('✅ Database seeded with default data')
  console.log('   Admin login: admin / codelifeai2025')
}
