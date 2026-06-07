import crypto from 'crypto'
import { getDb } from '../db/database.js'

const VISITOR_COOKIE = 'cl_visitor'
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL

// Cookie options shared by every cookie this app sets. In prod the API and
// the frontend are on different origins (Vercel ↔ Hostinger) so the cookie
// must be SameSite=None + Secure. In dev they're proxied through Vite, where
// SameSite=Lax over http works fine.
export const cookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: maxAgeMs,
  path: '/',
})

/**
 * Assign or refresh an anonymous visitor session.
 * - First-time visitor: mint a UUID, set cookie, INSERT into visitor_sessions.
 * - Returning visitor: UPDATE last_seen.
 * - On failure: still continue (sessions are advisory, not blocking).
 *
 * After this middleware runs, `req.visitorSessionId` is set to the UUID.
 */
export async function ensureVisitorSession(req, res, next) {
  try {
    let sid = req.cookies?.[VISITOR_COOKIE]
    if (!sid || !UUID_RE.test(sid)) {
      sid = crypto.randomUUID()
      res.cookie(VISITOR_COOKIE, sid, cookieOptions(ONE_YEAR_MS))
    }
    req.visitorSessionId = sid

    const db = getDb()
    const ua = (req.headers['user-agent'] || '').slice(0, 255)
    // Upsert: insert on first contact, otherwise just bump last_seen.
    await db.execute({
      sql: `INSERT INTO visitor_sessions (id, user_agent, first_seen, last_seen)
            VALUES (?, ?, datetime('now'), datetime('now'))
            ON CONFLICT(id) DO UPDATE SET last_seen = datetime('now')`,
      args: [sid, ua],
    })
  } catch (err) {
    // Never block the request because session bookkeeping failed.
    console.error('visitor session error', err?.message ?? err)
  }
  next()
}
