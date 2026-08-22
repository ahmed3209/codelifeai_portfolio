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
    "ALTER TABLE testimonials ADD COLUMN show_on_home INTEGER DEFAULT 1",
    "ALTER TABLE contacts ADD COLUMN status TEXT DEFAULT 'new'",
    "ALTER TABLE contacts ADD COLUMN reply_subject TEXT DEFAULT ''",
    "ALTER TABLE contacts ADD COLUMN reply_message TEXT DEFAULT ''",
    "ALTER TABLE contacts ADD COLUMN replied_at TEXT DEFAULT ''",
    "ALTER TABLE contacts ADD COLUMN company TEXT DEFAULT ''",
    "ALTER TABLE contacts ADD COLUMN country TEXT DEFAULT ''",
    "ALTER TABLE contacts ADD COLUMN service_interest TEXT DEFAULT ''",
    "ALTER TABLE contacts ADD COLUMN referral_source TEXT DEFAULT ''",
  ]
  for (const sql of schemaExtensions) {
    try { await db.execute(sql) }
    catch (e) {
      if (!/duplicate column|already exists/i.test(e.message || '')) throw e
    }
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
    { number: '01', title: 'Discovery', icon: '🔍', description: 'Deep dive into your goals, users, and constraints. We ask hard questions to define the right problem before writing a single line of code.', sort_order: 1 },
    { number: '02', title: 'Design', icon: '✏️', description: 'Wireframes, prototypes, and a full design system. We validate ideas visually before committing to production.', sort_order: 2 },
    { number: '03', title: 'Build', icon: '⚙️', description: 'Agile sprints with real deliverables every week. You see live progress — not just status updates and promises.', sort_order: 3 },
    { number: '04', title: 'Launch', icon: '🚀', description: 'CI/CD deployment, performance monitoring, and dedicated post-launch support. We stay involved until you are fully in flight.', sort_order: 4 },
  ]
  const stepCount = await db.execute('SELECT COUNT(*) as c FROM process_steps')
  if (stepCount.rows[0].c === 0) {
    for (const s of processSteps) {
      await db.execute({
        sql: 'INSERT INTO process_steps (number,title,icon,description,sort_order) VALUES (?,?,?,?,?)',
        args: [s.number, s.title, s.icon, s.description, s.sort_order],
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
    ]

    for (const b of defaultBlogs) {
      await db.execute({
        sql: `INSERT INTO blogs (title, slug, excerpt, content, category, author_name, author_role, read_time, is_published, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        args: [b.title, b.slug, b.excerpt, b.content, b.category, b.author_name, b.author_role, b.read_time, b.sort_order],
      })
    }
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
    hero_subtitle:        'CodeLifeAI is a software startup crafting elegant digital products — from sleek web apps to powerful mobile experiences.',
    marquee_items:        'Web Development, Mobile Apps, UI/UX Design, AI Integration, Cloud & DevOps, Tech Consulting',
    contact_email:        'hello@codelifeai.com',
    contact_phone:        '',
    contact_subtitle:     "Have a project in mind? We'd love to hear about it. Reach out and let's start a conversation.",
    footer_tagline:       'We build digital products that are fast, beautiful, and built to last.',
    social_linkedin:      '',
    social_facebook:      '',
    social_instagram:     '',
    social_twitter:       '',
    social_github:        '',
    social_whatsapp:      '',
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

  console.log('✅ Database seeded with default data')
  console.log('   Admin login: admin / codelifeai2025')
}
