import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../../lib/api'

const NAV_LINKS = [
  { to: '/',        label: 'Home'     },
  { to: '/services', label: 'Services' },
  { to: '/work',     label: 'Work'     },
  { to: '/team',     label: 'Team'     },
  { to: '/process',  label: 'Process'  },
  { to: '/blog',     label: 'Blog'     },
  { to: '/contact',  label: 'Contact'  },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const { pathname } = useLocation()

  const { data: siteData } = useQuery({
    queryKey: ['site-data'],
    queryFn: () => publicApi.getSiteData().then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
  const logoUrl = siteData?.content?.site_logo_url || '/logo.svg'

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[300] h-[2px]">
        <div
          className="h-full transition-all duration-75"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #00d4f5, #7c3aed)',
          }}
        />
      </div>

      {/* Main navigation bar */}
      <motion.nav
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-4 sm:px-6 lg:px-14 py-3.5 sm:py-4 transition-all duration-300
          ${scrolled ? 'glass border-b border-white/[0.055]' : 'bg-[#06060f]/60 backdrop-blur-md'}`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center no-underline" aria-label="CodeLifeAI — Home">
          <img
            src={logoUrl}
            alt="CodeLifeAI"
            width="408"
            height="110"
            className="h-6 sm:h-8 w-auto object-contain"
            onError={(e) => { e.target.src = '/logo.svg' }}
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-9 list-none m-0 p-0">
          {NAV_LINKS.map(l => {
            const isActive = pathname === l.to
            return (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`relative text-[0.75rem] font-semibold uppercase tracking-[0.09em] transition-colors no-underline group/link pb-0.5
                    ${isActive ? 'text-bb-white' : 'text-bb-muted hover:text-bb-white'}`}
                >
                  {l.label}
                  <span className={`absolute bottom-0 left-0 h-[1.5px] rounded-full transition-all duration-300
                    ${isActive ? 'w-full' : 'w-0 group-hover/link:w-full'}`}
                    style={{ background: 'linear-gradient(90deg, #00d4f5, #7c3aed)' }}
                  />
                </Link>
              </li>
            )
          })}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/contact" className="btn-primary text-[0.82rem] py-2.5 px-5">
            Let's Talk
            <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] text-bb-white cursor-pointer"
        >
          <span className={`block w-4 h-0.5 bg-current transition-transform duration-250 ${menuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`} />
          <span className={`block w-4 h-0.5 bg-current transition-opacity duration-250 ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
          <span className={`block w-4 h-0.5 bg-current transition-transform duration-250 ${menuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`} />
        </button>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{    opacity: 0, y: -16 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-0 top-[60px] z-[190] glass border-b border-white/[0.08] px-6 py-8 flex flex-col gap-5 md:hidden"
          >
            {NAV_LINKS.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className="text-base font-semibold text-bb-white hover:text-bb-accent transition-colors no-underline"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/[0.08]">
              <Link to="/contact" className="btn-primary text-sm w-full justify-center">
                Let's Talk →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
