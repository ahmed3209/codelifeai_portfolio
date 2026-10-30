/**
 * Normalizes an external URL so that it is always absolute.
 *
 * If a user or admin inputs "www.linkedin.com/in/username" or "linkedin.com/...",
 * browser <a> tags would treat it as a relative URL (e.g. /www.linkedin.com/...)
 * resulting in a 404 error.
 *
 * This function guarantees the protocol (https://) is always present.
 */
export function formatExternalUrl(url) {
  if (!url) return ''
  const trimmed = String(url).trim()
  if (!trimmed) return ''
  // Preserve valid existing protocols (http, https, mailto, tel)
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed
  }
  // Otherwise prepend https://
  return `https://${trimmed}`
}

