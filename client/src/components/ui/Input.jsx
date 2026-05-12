import { clsx } from 'clsx'
import { forwardRef } from 'react'

export const Input = forwardRef(function Input({ label, error, className, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-bb-muted uppercase tracking-widest">{label}</label>}
      <input
        ref={ref}
        className={clsx(
          'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-bb-white placeholder:text-bb-muted outline-none transition-colors',
          'focus:border-bb-accent/40 focus:bg-white/[0.06]',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
})

export const Textarea = forwardRef(function Textarea({ label, error, className, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-bb-muted uppercase tracking-widest">{label}</label>}
      <textarea
        ref={ref}
        className={clsx(
          'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-bb-white placeholder:text-bb-muted outline-none transition-colors resize-none',
          'focus:border-bb-accent/40 focus:bg-white/[0.06]',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
})
