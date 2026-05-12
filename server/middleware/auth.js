import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'codelifeai-super-secret-2025'

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' })

  try {
    const payload = jwt.verify(header.slice(7), SECRET)
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}
