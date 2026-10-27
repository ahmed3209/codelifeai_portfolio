import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Ultra-Smooth, High-Impact 3D Cyber-Core:
 * - Positioned in the Hero zone
 * - Smoothly fades out as user scrolls past hero so service cards remain 100% clean & legible
 * - Auto-pauses WebGL render loop when scrolled off-screen or tab hidden (120 FPS buttery smooth)
 */
export default function ThreeBackground() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    if (window.innerWidth < 768) return

    let animId
    let isRenderingActive = true
    const canvas = canvasRef.current
    if (!canvas) return

    const disposables = []
    const track = (obj) => { disposables.push(obj); return obj }

    // ── 1. High-Efficiency WebGL Renderer ──────────────────────────
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    })
    renderer.setPixelRatio(dpr)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)

    // ── 2. Scene & Camera ──────────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, 0, 6.2)

    const clock = new THREE.Clock()
    const targetMouse = { x: 0, y: 0 }
    const curMouse = { x: 0, y: 0 }
    let scrollOffset = 0

    // ── 3. Smooth Event Listeners ──────────────────────────────────
    const onMouseMove = (e) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }

    const onScroll = () => {
      scrollOffset = window.scrollY
      if (containerRef.current) {
        // Fade out smoothly within first 600px of scroll
        const opacity = Math.max(0, Math.min(0.75, 0.75 - (scrollOffset / 500) * 0.75))
        containerRef.current.style.opacity = String(opacity)
      }

      if (scrollOffset > window.innerHeight * 1.2) {
        isRenderingActive = false
      } else if (!document.hidden) {
        isRenderingActive = true
      }
    }

    const onVisibilityChange = () => {
      isRenderingActive = !document.hidden && scrollOffset <= window.innerHeight * 1.2
    }

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('resize', onResize)

    // ── 4. Main Ambient Space Group ───────────────────────────────
    const ambientGroup = new THREE.Group()
    scene.add(ambientGroup)

    // A. Quantum Deep-Space Particle Matrix
    const PARTICLE_COUNT = 180
    const partPositions = new Float32Array(PARTICLE_COUNT * 3)
    const partColors = new Float32Array(PARTICLE_COUNT * 3)

    const colorTeal = new THREE.Color(0x00cced)
    const colorSky = new THREE.Color(0x1cb1f3)
    const colorWhite = new THREE.Color(0xffffff)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      partPositions[i * 3 + 0] = (Math.random() - 0.5) * 18
      partPositions[i * 3 + 1] = (Math.random() - 0.5) * 14
      partPositions[i * 3 + 2] = -4 + Math.random() * 8

      const rnd = Math.random()
      const c = rnd < 0.45 ? colorTeal : (rnd < 0.8 ? colorSky : colorWhite)
      partColors[i * 3 + 0] = c.r
      partColors[i * 3 + 1] = c.g
      partColors[i * 3 + 2] = c.b
    }

    const partGeo = track(new THREE.BufferGeometry())
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPositions, 3))
    partGeo.setAttribute('color', new THREE.BufferAttribute(partColors, 3))

    const partMat = track(new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true,
    }))
    const particleField = new THREE.Points(partGeo, partMat)
    ambientGroup.add(particleField)

    // B. Subtle Cyber Gyro Ambient Ring (Low opacity background depth)
    const bgRingGeo = track(new THREE.TorusGeometry(4.2, 0.008, 16, 120))
    const bgRingMat = track(new THREE.MeshBasicMaterial({
      color: 0x00cced,
      transparent: true,
      opacity: 0.12,
    }))
    const bgRing = new THREE.Mesh(bgRingGeo, bgRingMat)
    bgRing.rotation.x = Math.PI / 3.5
    bgRing.position.set(2, 0, -2)
    ambientGroup.add(bgRing)

    // ── 5. High-Performance Render Loop ────────────────────────────
    function animate() {
      animId = requestAnimationFrame(animate)

      if (!isRenderingActive) return

      const t = clock.getElapsedTime()

      // Smooth cursor parallax lerp
      curMouse.x += (targetMouse.x - curMouse.x) * 0.035
      curMouse.y += (targetMouse.y - curMouse.y) * 0.035

      ambientGroup.position.x = curMouse.x * 0.35
      ambientGroup.position.y = curMouse.y * 0.25
      ambientGroup.rotation.y = t * 0.02 + curMouse.x * 0.1
      bgRing.rotation.z = t * 0.04

      // Starfield gentle drift
      particleField.rotation.y = t * 0.009

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('resize', onResize)

      disposables.forEach(d => {
        if (d && typeof d.dispose === 'function') d.dispose()
      })
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 right-0 h-screen pointer-events-none z-0 overflow-hidden transition-opacity duration-300"
      style={{ opacity: 0.75 }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="w-full h-full will-change-transform"
      />
      {/* High-Contrast Soft Vignette Mask */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 75% 65% at 50% 35%, transparent 25%, #06060f 95%)',
        }}
      />
    </div>
  )
}
