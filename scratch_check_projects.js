import { getDb, initDb } from './server/db/database.js'

async function checkProjects() {
  await initDb()
  const db = getDb()
  const res = await db.execute('SELECT id, title, category, image_url, sort_order FROM projects ORDER BY id ASC')
  console.log(`Total projects in DB: ${res.rows.length}`)
  res.rows.forEach(p => console.log(`[${p.id}] ${p.title} (${p.category}) - ${p.image_url ? 'Has Image' : 'No Image'}`))
}

checkProjects().catch(console.error)
