import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Ultra-Smooth, High-Performance Futuristic 3D WebGL Background:
 * - Next-gen Obsidian & Neon Cybernetic Core (Glossy Icosahedron + Precision Wireframe)
 * - Dual Gimbal Orbital Rings with Neon Pulse Beacons
 * - Lightweight Quantum Particle Constellation (Zero runtime garbage collection)
 * - Auto-Pauses on Tab Hidden & Off-screen Scroll for 120 FPS buttery smooth performance
 * - Soft Vignette Mask ensuring 100% text readability and high contrast
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

    // ── 1. High-Efficiency Renderer ────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
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
    camera.position.set(0, 0, 6.8)

    const clock = new THREE.Clock()
    const targetMouse = { x: 0, y: 0 }
    const curMouse = { x: 0, y: 0 }
    let scrollOffset = 0

    // ── 3. Optimized Event Handlers ────────────────────────────────
    const onMouseMove = (e) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }

    const onScroll = () => {
      scrollOffset = window.scrollY
      // If scrolled down more than 1.5 screens, pause WebGL to keep site 100% smooth
      if (scrollOffset > window.innerHeight * 1.5) {
        isRenderingActive = false
      } else if (!document.hidden) {
        isRenderingActive = true
      }
    }

    const onVisibilityChange = () => {
      isRenderingActive = !document.hidden && scrollOffset <= window.innerHeight * 1.5
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

    // ── 4. Main Hero Cybernetic Core ──────────────────────────────
    const mainGroup = new THREE.Group()
    scene.add(mainGroup)

    // A. Obsidian Core
    const coreGeo = track(new THREE.IcosahedronGeometry(1.2, 1))
    const coreMat = track(new THREE.MeshStandardMaterial({
      color: 0x030b17,
      emissive: 0x011324,
      roughness: 0.2,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85,
    }))
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    mainGroup.add(coreMesh)

    // B. Cyan Holographic Outer Shell
    const shellGeo = track(new THREE.IcosahedronGeometry(1.42, 1))
    const shellMat = track(new THREE.MeshBasicMaterial({
      color: 0x00d4f5,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    }))
    const shellMesh = new THREE.Mesh(shellGeo, shellMat)
    mainGroup.add(shellMesh)

    // C. Dual Gimbal Orbital Rings
    const ring1Geo = track(new THREE.TorusGeometry(2.05, 0.014, 16, 72))
    const ring1Mat = track(new THREE.MeshBasicMaterial({
      color: 0x00d4f5,
      transparent: true,
      opacity: 0.35,
    }))
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat)
    ring1.rotation.x = Math.PI / 3.2
    ring1.rotation.y = Math.PI / 6
    mainGroup.add(ring1)

    const ring2Geo = track(new THREE.TorusGeometry(2.35, 0.012, 16, 72))
    const ring2Mat = track(new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.28,
    }))
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
    ring2.rotation.x = -Math.PI / 2.8
    ring2.rotation.y = -Math.PI / 8
    mainGroup.add(ring2)

    // D. 4 Orbiting Signal Beacons
    const beaconGeo = track(new THREE.OctahedronGeometry(0.08, 0))
    const beaconMatCyan = track(new THREE.MeshBasicMaterial({ color: 0x00d4f5 }))
    const beaconMatPurple = track(new THREE.MeshBasicMaterial({ color: 0x38bdf8 }))

    const beacons = []
    for (let i = 0; i < 4; i++) {
      const bMesh = new THREE.Mesh(beaconGeo, i % 2 === 0 ? beaconMatCyan : beaconMatPurple)
      const radius = 2.05 + (i % 2) * 0.3
      const speed = 0.35 + i * 0.1
      const initialAngle = (i / 4) * Math.PI * 2
      mainGroup.add(bMesh)
      beacons.push({ mesh: bMesh, radius, speed, angle: initialAngle })
    }

    // ── 5. Starfield & Micro-Constellation ─────────────────────────
    const PARTICLE_COUNT = 140
    const partPositions = new Float32Array(PARTICLE_COUNT * 3)
    const partColors = new Float32Array(PARTICLE_COUNT * 3)

    const colorCyan = new THREE.Color(0x00d4f5)
    const colorPurple = new THREE.Color(0x7c3aed)
    const colorMuted = new THREE.Color(0x334155)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      partPositions[i * 3 + 0] = (Math.random() - 0.5) * 14
      partPositions[i * 3 + 1] = (Math.random() - 0.5) * 10
      partPositions[i * 3 + 2] = -2.5 + Math.random() * 5

      const rnd = Math.random()
      const c = rnd < 0.4 ? colorCyan : (rnd < 0.7 ? colorPurple : colorMuted)
      partColors[i * 3 + 0] = c.r
      partColors[i * 3 + 1] = c.g
      partColors[i * 3 + 2] = c.b
    }

    const partGeo = track(new THREE.BufferGeometry())
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPositions, 3))
    partGeo.setAttribute('color', new THREE.BufferAttribute(partColors, 3))

    const partMat = track(new THREE.PointsMaterial({
      size: 0.038,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true,
    }))
    const particleField = new THREE.Points(partGeo, partMat)
    scene.add(particleField)

    // ── 6. Lighting ────────────────────────────────────────────────
    const ambLight = track(new THREE.AmbientLight(0x040d1a, 2.5))
    scene.add(ambLight)

    const keyLight = track(new THREE.PointLight(0x00d4f5, 4.0, 16))
    keyLight.position.set(4, 3, 4)
    scene.add(keyLight)

    const fillLight = track(new THREE.PointLight(0x7c3aed, 3.0, 16))
    fillLight.position.set(-4, -3, 3)
    scene.add(fillLight)

    // ── 7. Buttery 60/120 FPS Animation Loop ──────────────────────
    function animate() {
      animId = requestAnimationFrame(animate)

      if (!isRenderingActive) return

      const t = clock.getElapsedTime()

      // Smooth mouse lerp
      curMouse.x += (targetMouse.x - curMouse.x) * 0.04
      curMouse.y += (targetMouse.y - curMouse.y) * 0.04

      // Polyhedron rotation
      coreMesh.rotation.x = t * 0.12
      coreMesh.rotation.y = t * 0.18
      shellMesh.rotation.x = -t * 0.09
      shellMesh.rotation.y = -t * 0.14

      // Gimbal rotation
      ring1.rotation.z = t * 0.2
      ring2.rotation.z = -t * 0.16

      // Cursor parallax response
      mainGroup.position.x = curMouse.x * 0.3
      mainGroup.position.y = curMouse.y * 0.22 - (scrollOffset / window.innerHeight) * 0.3
      mainGroup.rotation.y = curMouse.x * 0.25
      mainGroup.rotation.x = -curMouse.y * 0.18

      // Beacons orbital physics
      for (let i = 0; i < beacons.length; i++) {
        const b = beacons[i]
        b.angle += b.speed * 0.01
        b.mesh.position.x = Math.cos(b.angle) * b.radius
        b.mesh.position.z = Math.sin(b.angle) * b.radius
        b.mesh.position.y = Math.sin(t * 1.5 + b.angle) * 0.35
        b.mesh.rotation.x += 0.02
        b.mesh.rotation.y += 0.03
      }

      // Starfield gentle drift
      particleField.rotation.y = t * 0.008

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
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="w-full h-full opacity-65 will-change-transform"
      />
      {/* High-Contrast Soft Vignette Mask */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 30%, transparent 20%, #06060f 90%)',
        }}
      />
    </div>
  )
}
