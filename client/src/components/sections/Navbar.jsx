import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { to: '/services', label: 'Services' },
  { to: '/work',     label: 'Work'     },
  { to: '/team',     label: 'Team'     },
  { to: '/process',  label: 'Process'  },
  { to: '/contact',  label: 'Contact'  },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const { pathname } = useLocation()

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
            background: 'linear-gradient(90deg, #00d4f5, #7c3aed, #00d4f5)',
            backgroundSize: '200% 100%',
            animation: progress > 0 ? 'gradientShift 3s linear infinite' : 'none',
          }}
        />
      </div>

      {/* Main nav */}
      <motion.nav
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-6 lg:px-14 py-4 mt-0.5 transition-all duration-300
          ${scrolled ? 'glass border-b border-white/[0.055]' : ''}`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center no-underline" aria-label="CodeLifeAI — Home">
          <img src="/favicon.svg" alt="" className="block sm:hidden h-8 w-auto" />
          <img src="/logo.svg" alt="CodeLifeAI" className="hidden sm:block h-8 w-auto" />
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

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden flex flex-col items-center justify-center gap-[5px] w-9 h-9 rounded-lg hover:bg-white/[0.04] transition-colors"
          aria-label="Toggle menu"
        >
          <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }}
            className="block h-[1.5px] w-5 bg-bb-white rounded-full origin-center" />
          <motion.span animate={{ opacity: menuOpen ? 0 : 1, scaleX: menuOpen ? 0 : 1 }}
            className="block h-[1.5px] w-5 bg-bb-white rounded-full" />
          <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }}
            className="block h-[1.5px] w-5 bg-bb-white rounded-full origin-center" />
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[57px] left-0 right-0 z-[198] glass border-b border-white/[0.05] overflow-hidden"
          >
            <div className="px-6 py-5 flex flex-col gap-0.5">
              {NAV_LINKS.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.055, duration: 0.3 }}
                >
                  <Link
                    to={l.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center text-sm font-medium text-bb-muted hover:text-bb-white transition-colors no-underline py-3 border-b border-white/[0.04] last:border-0"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.055 }}
              >
                <Link
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary mt-3 text-sm text-center w-full"
                >
                  Let's Talk
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
