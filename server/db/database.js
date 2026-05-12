import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let db

export function getDb() {
  if (!db) {
    const url = process.env.TURSO_DATABASE_URL
      || `file:${process.env.DB_PATH || path.join(__dirname, 'codelifeai.db')}`

    db = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return db
}

export async function initDb() {
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
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      role        TEXT,
      bio         TEXT,
      initials    TEXT,
      photo_url   TEXT,
      avatar_bg   TEXT DEFAULT 'linear-gradient(135deg,#7c3aed,#00d4f5)',
      tags        TEXT DEFAULT '[]',
      sort_order  INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now'))
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
  ]

  for (const sql of statements) await db.execute(sql)

  console.log('✅ Database schema ready')

  const { rows } = await db.execute('SELECT COUNT(*) as c FROM services')
  if (rows[0].c === 0) {
    console.log('🌱 Seeding database…')
    await seed(db)
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
    hero_subtitle:        'CodeLifeAI is a software startup crafting elegant digital products — from sleek web apps to powerful mobile experiences.',
    marquee_items:        'Web Development, Mobile Apps, UI/UX Design, AI Integration, Cloud & DevOps, Tech Consulting',
    contact_email:        'hello@codelifeai.com',
    contact_subtitle:     "Have a project in mind? We'd love to hear about it. Reach out and let's start a conversation.",
    footer_tagline:       'We build digital products that are fast, beautiful, and built to last.',
    social_linkedin:      '',
    social_github:        '',
    social_twitter:       '',
    social_whatsapp:      '',
  }
  for (const [k, v] of Object.entries(contentDefaults)) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO content (key, value) VALUES (?, ?)',
      args: [k, v],
    })
  }

  const settingsDefaults = {
    ollama_url:        process.env.OLLAMA_URL   || 'http://localhost:11434',
    ollama_model:      process.env.OLLAMA_MODEL || 'llama3.2',
    chatbot_name:      'CodeLifeAI Assistant',
    chatbot_greeting:  "Hi! 👋 I'm the CodeLifeAI assistant. Ask me about our services, team, or how we can help you build your next product!",
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
