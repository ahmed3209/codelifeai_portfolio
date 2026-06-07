import jwt from 'jsonwebtoken'
import { getDb } from '../db/database.js'

const SECRET = process.env.JWT_SECRET || 'codelifeai-super-secret-2025'
export const ADMIN_COOKIE = 'cl_session'

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

/**
 * Verify the admin session. Accepts a JWT from either:
 *   - the `cl_session` HttpOnly cookie (preferred — XSS-safe), OR
 *   - the legacy `Authorization: Bearer …` header (kept so the migration
 *     doesn't lock out anyone whose client still sends it).
 *
 * Then checks the JWT's `tv` (token_version) against the DB so admin
 * password changes invalidate sessions on other devices.
 */
export async function authMiddleware(req, res, next) {
  const cookieToken = req.cookies?.[ADMIN_COOKIE]
  const header = req.headers.authorization
  const headerToken = header?.startsWith('Bearer ') ? header.slice(7) : null
  const token = cookieToken || headerToken

  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  let payload
  try {
    payload = jwt.verify(token, SECRET)
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  // Validate token_version matches the live admin_users row. Tokens minted
  // before a password change have a stale `tv` and get rejected.
  try {
    const db = getDb()
    const { rows } = await db.execute({
      sql: 'SELECT token_version FROM admin_users WHERE id = ?',
      args: [payload.id],
    })
    if (!rows[0]) return res.status(401).json({ error: 'Account no longer exists' })
    const currentTv = Number(rows[0].token_version ?? 1)
    const tokenTv = Number(payload.tv ?? 1)
    if (currentTv !== tokenTv) return res.status(401).json({ error: 'Session invalidated' })
  } catch (err) {
    console.error('auth tv check failed', err?.message ?? err)
    return res.status(500).json({ error: 'Session check failed' })
  }

  req.user = payload
  next()
}
