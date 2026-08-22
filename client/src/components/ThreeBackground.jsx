import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Clean, Subtle, High-Contrast 3D WebGL Background:
 * - Sleek deep-sapphire faceted core with ambient cyan wireframe
 * - Gentle counter-rotating orbital rings
 * - Low-density neural starfield for depth without text obstruction
 * - Soft radial vignette overlay ensuring 100% text contrast and readability
 */
export default function ThreeBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    if (window.innerWidth < 768) return

    let cleanupFn
    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 1000))
    const cancelRic = window.cancelIdleCallback || clearTimeout

    const idleHandle = ric(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const disposables = []
      const track = (obj) => { disposables.push(obj); return obj }

      // ── Renderer ────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 0)

      // ── Scene & Camera ──────────────────────────────────────────
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.set(0, 0, 7)

      const clock = new THREE.Clock()
      let scrollY = window.scrollY || 0
      const targetMouse = new THREE.Vector2(0, 0)
      const curMouse = new THREE.Vector2(0, 0)

      const onScroll = () => { scrollY = window.scrollY }
      const onMouseMove = (e) => {
        targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1
        targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1
      }
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }

      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('mousemove', onMouseMove, { passive: true })
      window.addEventListener('resize', onResize)

      // ── Main Hero Cyber Group ───────────────────────────────────
      const mainGroup = new THREE.Group()
      scene.add(mainGroup)

      // 1. Faceted Sapphire Core (Icosahedron)
      const nucleusGeo = track(new THREE.IcosahedronGeometry(1.25, 1))
      const nucleusMat = track(new THREE.MeshPhongMaterial({
        color: 0x020a14,
        emissive: 0x001828,
        specular: 0x00d4f5,
        shininess: 90,
        wireframe: false,
        transparent: true,
        opacity: 0.7,
      }))
      const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat)
      mainGroup.add(nucleusMesh)

      // 2. Subtle Outer Wireframe
      const wireGeo = track(new THREE.IcosahedronGeometry(1.48, 1))
      const wireMat = track(new THREE.MeshBasicMaterial({
        color: 0x00d4f5,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
      }))
      const wireMesh = new THREE.Mesh(wireGeo, wireMat)
      mainGroup.add(wireMesh)

      // 3. Orbital Torus Ring 1 (Cyan)
      const ring1Geo = track(new THREE.TorusGeometry(2.1, 0.015, 16, 80))
      const ring1Mat = track(new THREE.MeshBasicMaterial({
        color: 0x00d4f5,
        transparent: true,
        opacity: 0.28,
      }))
      const ring1 = new THREE.Mesh(ring1Geo, ring1Mat)
      ring1.rotation.x = Math.PI / 3
      ring1.rotation.y = Math.PI / 6
      mainGroup.add(ring1)

      // 4. Orbital Torus Ring 2 (Purple)
      const ring2Geo = track(new THREE.TorusGeometry(2.4, 0.012, 16, 80))
      const ring2Mat = track(new THREE.MeshBasicMaterial({
        color: 0x7c3aed,
        transparent: true,
        opacity: 0.22,
      }))
      const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
      ring2.rotation.x = -Math.PI / 2.5
      mainGroup.add(ring2)

      // 5. Orbiting Satellites (4 subtle nodes)
      const satellites = []
      const satGroup = new THREE.Group()
      mainGroup.add(satGroup)

      const satGeo = track(new THREE.OctahedronGeometry(0.1, 0))
      const satMat = track(new THREE.MeshBasicMaterial({ color: 0x00d4f5, wireframe: true }))

      for (let i = 0; i < 4; i++) {
        const sat = new THREE.Mesh(satGeo, satMat)
        const radius = 2.0 + (i % 2) * 0.4
        const angle = (i / 4) * Math.PI * 2
        sat.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 0.8, Math.sin(angle) * radius)
        satGroup.add(sat)
        satellites.push({ mesh: sat, radius, angle, speed: 0.2 + (i * 0.06) })
      }

      // ── Starfield Particles (Low density to avoid visual noise) ─
      const PARTICLE_COUNT = 180
      const partPositions = new Float32Array(PARTICLE_COUNT * 3)
      const partColors = new Float32Array(PARTICLE_COUNT * 3)

      const colCyan = new THREE.Color(0x00d4f5)
      const colPurple = new THREE.Color(0x7c3aed)
      const colMuted = new THREE.Color(0x4a5568)

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        partPositions[i * 3 + 0] = (Math.random() - 0.5) * 16
        partPositions[i * 3 + 1] = (Math.random() - 0.5) * 12
        partPositions[i * 3 + 2] = -3 + Math.random() * 6

        const cChoice = Math.random()
        const c = cChoice < 0.4 ? colCyan : (cChoice < 0.7 ? colPurple : colMuted)
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
        opacity: 0.5,
      }))
      const particles = new THREE.Points(partGeo, partMat)
      scene.add(particles)

      // ── Lights ──────────────────────────────────────────────────
      const ambientLight = track(new THREE.AmbientLight(0x030a18, 2.0))
      scene.add(ambientLight)

      const cyanPoint = track(new THREE.PointLight(0x00d4f5, 3.5, 14))
      cyanPoint.position.set(3, 3, 4)
      scene.add(cyanPoint)

      const purplePoint = track(new THREE.PointLight(0x7c3aed, 2.5, 14))
      purplePoint.position.set(-3, -2, 3)
      scene.add(purplePoint)

      // ── Animation Loop ──────────────────────────────────────────
      let animId
      function animate() {
        animId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()

        // Cursor smooth interpolation
        curMouse.x += (targetMouse.x - curMouse.x) * 0.03
        curMouse.y += (targetMouse.y - curMouse.y) * 0.03

        // Core rotations
        nucleusMesh.rotation.x = t * 0.1
        nucleusMesh.rotation.y = t * 0.15
        wireMesh.rotation.x = -t * 0.08
        wireMesh.rotation.y = -t * 0.12

        // Rings rotation
        ring1.rotation.z = t * 0.18
        ring2.rotation.z = -t * 0.14

        // Smooth subtle response
        const scrollFactor = (scrollY / (window.innerHeight || 1)) * 0.3
        mainGroup.position.x = curMouse.x * 0.25
        mainGroup.position.y = (curMouse.y * 0.2) - scrollFactor
        mainGroup.rotation.y = curMouse.x * 0.2
        mainGroup.rotation.x = -curMouse.y * 0.15

        // Satellite orbits
        satellites.forEach(s => {
          s.angle += s.speed * 0.008
          s.mesh.position.x = Math.cos(s.angle) * s.radius
          s.mesh.position.z = Math.sin(s.angle) * s.radius
          s.mesh.position.y = Math.sin(t * 1.2 + s.angle) * 0.35
          s.mesh.rotation.x += 0.015
          s.mesh.rotation.y += 0.02
        })

        // Particle field slow drift
        particles.rotation.y = t * 0.01

        renderer.render(scene, camera)
      }

      animate()

      cleanupFn = () => {
        cancelAnimationFrame(animId)
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('resize', onResize)

        disposables.forEach(d => {
          if (d.dispose) d.dispose()
        })
        renderer.dispose()
      }
    })

    return () => {
      cancelRic(idleHandle)
      if (cleanupFn) cleanupFn()
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="w-full h-full opacity-60 transition-opacity duration-700"
      />
      {/* Soft vignette overlay for 100% text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 30%, transparent 20%, #06060f 90%)',
        }}
      />
    </div>
  )
}
