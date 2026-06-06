import { useEffect, useRef } from 'react'

/**
 * Full-viewport interactive dot grid background.
 *
 * Renders a grid of dots on a fixed canvas. Each dot's opacity, size and
 * colour shifts toward the cyan accent as the cursor approaches it,
 * producing a soft "spotlight" effect. A radial centre mask fades dots
 * near the viewport edges to match the static body::after grid that this
 * component replaces on non-home routes.
 *
 * Hides the static body::after grid while mounted (via the `has-dotgrid`
 * body class — handled in index.css) so the two grids never double-up.
 *
 * Respects prefers-reduced-motion (renders nothing in that case).
 */
export default function InteractiveDotGrid() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    document.body.classList.add('has-dotgrid')

    let width  = 0
    let height = 0
    let cx     = 0
    let cy     = 0
    let mouseX = -10000
    let mouseY = -10000
    let rafId  = 0

    const SPACING        = 36
    const BASE_OPACITY   = 0.06
    const HOVER_OPACITY  = 0.55
    const HOVER_RADIUS   = 170

    function resize() {
      width  = window.innerWidth
      height = window.innerHeight
      cx     = width  / 2
      cy     = height / 2
      canvas.width        = Math.floor(width  * dpr)
      canvas.height       = Math.floor(height * dpr)
      canvas.style.width  = width  + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw() {
      ctx.clearRect(0, 0, width, height)

      // Match the body::after `mask-image: radial-gradient(ellipse 80% 80%)`
      const maskRadius  = Math.min(width, height) * 0.55
      const maskFalloff = Math.min(width, height) * 0.45

      for (let x = SPACING / 2; x < width; x += SPACING) {
        for (let y = SPACING / 2; y < height; y += SPACING) {
          // Distance to cursor → intensity 0..1 (quadratic falloff)
          const dxM = x - mouseX
          const dyM = y - mouseY
          const distM = Math.sqrt(dxM * dxM + dyM * dyM)
          let intensity = 0
          if (distM < HOVER_RADIUS) {
            const linear = 1 - distM / HOVER_RADIUS
            intensity = linear * linear
          }

          // Distance to centre → mask 0..1 (full inside, fades past maskRadius)
          const dxC = x - cx
          const dyC = y - cy
          const distC = Math.sqrt(dxC * dxC + dyC * dyC)
          let mask = 1
          if (distC > maskRadius) {
            mask = 1 - (distC - maskRadius) / maskFalloff
            if (mask < 0) mask = 0
          }

          const opacity = (BASE_OPACITY + (HOVER_OPACITY - BASE_OPACITY) * intensity) * mask
          if (opacity <= 0.005) continue

          const size = 1 + intensity * 1.7

          // White → cyan accent (#00d4f5 = 0,212,245) as intensity grows
          const r = Math.round(255 - intensity * 255)
          const g = Math.round(255 - intensity * 43)
          const b = Math.round(255 - intensity * 10)

          ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      rafId = requestAnimationFrame(draw)
    }

    function onMove(e) {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    function onLeave() {
      mouseX = -10000
      mouseY = -10000
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.body.classList.remove('has-dotgrid')
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
