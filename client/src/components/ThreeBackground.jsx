import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Next-Level Interactive 3D WebGL Scene:
 * - Multi-layered glowing cyber core with faceted inner nucleus & wireframe matrix
 * - Dual counter-rotating orbital rings with glowing satellite crystal nodes
 * - Floating geometric cyber prisms reacting to scroll and cursor momentum
 * - Dynamic starry neural particle field with depth perspective
 * - Optimized lifecycle with graceful cleanup and reduced-motion support
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
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 0)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.25

      // ── Scene & Camera ──────────────────────────────────────────
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.set(0, 0, 6.2)

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

      // 1. Faceted Inner Nucleus (Icosahedron)
      const nucleusGeo = track(new THREE.IcosahedronGeometry(1.35, 1))
      const nucleusMat = track(new THREE.MeshPhongMaterial({
        color: 0x031828,
        emissive: 0x003355,
        specular: 0x00d4f5,
        shininess: 100,
        wireframe: false,
        transparent: true,
        opacity: 0.6,
      }))
      const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat)
      mainGroup.add(nucleusMesh)

      // 2. Wireframe Shell Layer
      const wireGeo = track(new THREE.IcosahedronGeometry(1.58, 2))
      const wireMat = track(new THREE.MeshBasicMaterial({
        color: 0x00d4f5,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      }))
      const wireMesh = new THREE.Mesh(wireGeo, wireMat)
      mainGroup.add(wireMesh)

      // 3. Orbital Torus Ring 1 (Cyan)
      const ring1Geo = track(new THREE.TorusGeometry(2.35, 0.018, 16, 100))
      const ring1Mat = track(new THREE.MeshBasicMaterial({
        color: 0x00d4f5,
        transparent: true,
        opacity: 0.35,
      }))
      const ring1 = new THREE.Mesh(ring1Geo, ring1Mat)
      ring1.rotation.x = Math.PI / 3.2
      ring1.rotation.y = Math.PI / 6
      mainGroup.add(ring1)

      // 4. Orbital Torus Ring 2 (Electric Violet)
      const ring2Geo = track(new THREE.TorusGeometry(2.65, 0.015, 16, 100))
      const ring2Mat = track(new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        transparent: true,
        opacity: 0.28,
      }))
      const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
      ring2.rotation.x = -Math.PI / 2.8
      ring2.rotation.y = Math.PI / 4
      mainGroup.add(ring2)

      // 5. Orbiting Satellite Nodes
      const satellites = []
      const satGroup = new THREE.Group()
      mainGroup.add(satGroup)

      const satGeo = track(new THREE.OctahedronGeometry(0.12, 0))
      const satColors = [0x00d4f5, 0xa855f7, 0x38bdf8, 0x22c55e]

      for (let i = 0; i < 6; i++) {
        const mat = track(new THREE.MeshBasicMaterial({
          color: satColors[i % satColors.length],
          wireframe: true,
        }))
        const sat = new THREE.Mesh(satGeo, mat)
        const radius = 2.2 + (i % 3) * 0.4
        const angle = (i / 6) * Math.PI * 2
        sat.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 1.2, Math.sin(angle) * radius)
        satGroup.add(sat)
        satellites.push({ mesh: sat, radius, angle, speed: 0.25 + (i * 0.08) })
      }

      // ── Floating Ambient Cyber Crystals ─────────────────────────
      const floatingGroup = new THREE.Group()
      scene.add(floatingGroup)
      const floatingShapes = []

      const prismGeos = [
        track(new THREE.OctahedronGeometry(0.35, 0)),
        track(new THREE.TetrahedronGeometry(0.4, 0)),
        track(new THREE.DodecahedronGeometry(0.3, 0)),
      ]

      for (let i = 0; i < 18; i++) {
        const geo = prismGeos[i % prismGeos.length]
        const mat = track(new THREE.MeshPhongMaterial({
          color: 0x050e1e,
          emissive: (i % 2 === 0) ? 0x001a33 : 0x1a0b2e,
          specular: 0x00d4f5,
          shininess: 90,
          transparent: true,
          opacity: 0.4,
          wireframe: i % 3 === 0,
        }))
        const mesh = new THREE.Mesh(geo, mat)
        const x = (Math.random() - 0.5) * 14
        const y = (Math.random() - 0.5) * 10
        const z = -2 + Math.random() * 4
        mesh.position.set(x, y, z)
        floatingGroup.add(mesh)

        floatingShapes.push({
          mesh,
          baseY: y,
          rotSpeedX: (Math.random() - 0.5) * 0.6,
          rotSpeedY: (Math.random() - 0.5) * 0.6,
          floatSpeed: 0.4 + Math.random() * 0.6,
          phase: Math.random() * Math.PI * 2,
        })
      }

      // ── Neural Particle Starfield ───────────────────────────────
      const PARTICLE_COUNT = 380
      const partPositions = new Float32Array(PARTICLE_COUNT * 3)
      const partColors = new Float32Array(PARTICLE_COUNT * 3)

      const colCyan = new THREE.Color(0x00d4f5)
      const colPurple = new THREE.Color(0xa855f7)
      const colWhite = new THREE.Color(0xffffff)

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        partPositions[i * 3 + 0] = (Math.random() - 0.5) * 18
        partPositions[i * 3 + 1] = (Math.random() - 0.5) * 14
        partPositions[i * 3 + 2] = -4 + Math.random() * 8

        const cChoice = Math.random()
        const c = cChoice < 0.5 ? colCyan : (cChoice < 0.8 ? colPurple : colWhite)
        partColors[i * 3 + 0] = c.r
        partColors[i * 3 + 1] = c.g
        partColors[i * 3 + 2] = c.b
      }

      const partGeo = track(new THREE.BufferGeometry())
      partGeo.setAttribute('position', new THREE.BufferAttribute(partPositions, 3))
      partGeo.setAttribute('color', new THREE.BufferAttribute(partColors, 3))

      const partMat = track(new THREE.PointsMaterial({
        size: 0.045,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
      }))
      const particles = new THREE.Points(partGeo, partMat)
      scene.add(particles)

      // ── Lights ──────────────────────────────────────────────────
      const ambientLight = track(new THREE.AmbientLight(0x040c1e, 2.5))
      scene.add(ambientLight)

      const cyanPoint = track(new THREE.PointLight(0x00d4f5, 4.5, 18))
      cyanPoint.position.set(3, 3, 4)
      scene.add(cyanPoint)

      const purplePoint = track(new THREE.PointLight(0xa855f7, 3.5, 18))
      purplePoint.position.set(-3, -2, 3)
      scene.add(purplePoint)

      // ── Animation Loop ──────────────────────────────────────────
      let animId
      function animate() {
        animId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()

        // Cursor smooth interpolation
        curMouse.x += (targetMouse.x - curMouse.x) * 0.05
        curMouse.y += (targetMouse.y - curMouse.y) * 0.05

        // Core rotations
        nucleusMesh.rotation.x = t * 0.15
        nucleusMesh.rotation.y = t * 0.22
        wireMesh.rotation.x = -t * 0.12
        wireMesh.rotation.y = -t * 0.18

        // Rings rotation & breathing
        ring1.rotation.z = t * 0.28
        ring2.rotation.z = -t * 0.22

        // Main group reaction to cursor & scroll
        const scrollFactor = (scrollY / (window.innerHeight || 1)) * 0.4
        mainGroup.position.x = curMouse.x * 0.45
        mainGroup.position.y = (curMouse.y * 0.35) - scrollFactor
        mainGroup.rotation.y = curMouse.x * 0.35
        mainGroup.rotation.x = -curMouse.y * 0.25

        // Satellite orbits
        satellites.forEach(s => {
          s.angle += s.speed * 0.012
          s.mesh.position.x = Math.cos(s.angle) * s.radius
          s.mesh.position.z = Math.sin(s.angle) * s.radius
          s.mesh.position.y = Math.sin(t * 1.5 + s.angle) * 0.45
          s.mesh.rotation.x += 0.02
          s.mesh.rotation.y += 0.03
        })

        // Floating ambient shapes
        floatingShapes.forEach((shape, idx) => {
          shape.mesh.rotation.x += shape.rotSpeedX * 0.015
          shape.mesh.rotation.y += shape.rotSpeedY * 0.015
          shape.mesh.position.y = shape.baseY + Math.sin(t * shape.floatSpeed + shape.phase) * 0.3 - scrollFactor * 0.7
        })

        // Particle field slow drift
        particles.rotation.y = t * 0.02
        particles.rotation.x = t * 0.01

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
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
