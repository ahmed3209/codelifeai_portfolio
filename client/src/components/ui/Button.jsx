import { clsx } from 'clsx'

export default function Button({ children, variant = 'primary', size = 'md', className, loading, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-bb-accent text-bb-black hover:opacity-85 hover:-translate-y-0.5 shadow-[0_0_0_0_rgba(0,212,245,0)] hover:shadow-[0_0_28px_rgba(0,212,245,0.35)]',
    outline: 'border border-white/[0.12] text-bb-white hover:border-white/[0.28] hover:bg-white/[0.04]',
    ghost:   'text-bb-muted hover:text-bb-white hover:bg-white/[0.04]',
    danger:  'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 py-3.5',
  }

  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} disabled={loading} {...props}>
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      )}
      {children}
    </button>
  )
}
