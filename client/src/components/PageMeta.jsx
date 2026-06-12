import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'CodeLifeAI'
const DEFAULT_TITLE = "CodeLifeAI — We Build What's Next"
const SITE_URL = 'https://codelifeai.com'

/**
 * Per-page SEO/social meta tags. Rendered into <head> via react-helmet-async.
 *
 * Usage:
 *   <PageMeta
 *     title="Services"
 *     description="Web, mobile, AI, cloud — end-to-end product engineering."
 *     keywords="web development, mobile apps, ai integration"
 *   />
 *
 * - title    : page-specific phrase. Final <title> becomes "title — CodeLifeAI".
 *              Pass null/undefined to use the brand default.
 * - description : 1-2 sentences, ~150-160 chars. Used in <meta description> + OG + Twitter.
 * - keywords : comma-separated focus keywords (still useful for some search engines / internal search).
 * - ogImage  : optional absolute URL for social previews. Falls back to none.
 * - path     : route path (e.g. "/services") used to build the absolute canonical
 *              URL + og:url. Pass "/" for the homepage. Omit on noindex pages.
 */
export default function PageMeta({ title, description, keywords, ogImage, path }) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE
  // Normalise: strip a trailing slash so "/services/" and "/services" don't
  // produce two canonicals. The root path stays as the bare origin.
  const canonical = path != null
    ? `${SITE_URL}${path === '/' ? '' : path.replace(/\/$/, '')}`
    : null

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {canonical && <meta property="og:url" content={canonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  )
}
