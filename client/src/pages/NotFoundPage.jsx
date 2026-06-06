import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Compass } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="pt-20 min-h-[calc(100vh-120px)] flex items-center justify-center px-6 py-20">
      <Helmet>
        <title>404 — Page Not Found · CodeLifeAI</title>
        <meta name="robots" content="noindex" />
        <meta name="description" content="The page you were looking for doesn't exist on CodeLifeAI." />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center max-w-[520px]"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-bb-accent/25 text-[0.7rem] font-bold tracking-[0.18em] uppercase text-bb-accent mb-6"
          style={{ background: 'rgba(0,212,245,0.06)' }}>
          <Compass size={12} /> Page Not Found
        </div>

        <h1 className="font-extrabold tracking-tight leading-[0.95] text-bb-white mb-3"
          style={{ fontSize: 'clamp(3.2rem, 9vw, 6rem)' }}>
          4<span className="text-gradient">0</span>4
        </h1>
        <p className="font-fraunces italic font-light text-white/45 text-lg sm:text-xl mb-3">
          Looks like that route doesn't exist.
        </p>
        <p className="text-bb-muted text-sm leading-relaxed mb-10 max-w-sm mx-auto">
          The page you were looking for may have moved, been renamed, or never existed in the first place.
          Head back to the homepage and try again.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/" className="btn-primary text-sm">
            <ArrowLeft size={14} /> Back to home
          </Link>
          <Link to="/contact" className="btn-ghost text-sm">
            Contact us
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
