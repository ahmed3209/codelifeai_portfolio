import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * High-Impact, Vibrant 3D WebGL Cyber-Core Background:
 * - Glowing Futuristic Polyhedron with neon vertex highlights & inner energy core
 * - Dual rotating orbital gimbal rings with pulsing signal nodes
 * - Smooth interactive cursor parallax physics & 60/120 FPS performance auto-pause
 * - High-contrast backdrop ensuring 100% crisp typography readability
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
    camera.position.set(0, 0, 6.5)

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

    // ── 4. Main 3D Cybernetic Core Group ───────────────────────────
    const mainGroup = new THREE.Group()
    scene.add(mainGroup)

    // A. Inner Glowing Energy Crystal (Glossy Dark Obsidian with Neon Facets)
    const coreGeo = track(new THREE.IcosahedronGeometry(1.25, 0))
    const coreMat = track(new THREE.MeshStandardMaterial({
      color: 0x051329,
      emissive: 0x02254d,
      roughness: 0.15,
      metalness: 0.95,
      transparent: true,
      opacity: 0.92,
      wireframe: false,
    }))
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    mainGroup.add(coreMesh)

    // B. Vibrant Holographic Outer Wireframe Shell
    const wireGeo = track(new THREE.IcosahedronGeometry(1.35, 1))
    const wireMat = track(new THREE.MeshBasicMaterial({
      color: 0x00d4f5,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    }))
    const wireMesh = new THREE.Mesh(wireGeo, wireMat)
    mainGroup.add(wireMesh)

    // C. Glowing Vertices (Point Nodes on Core)
    const nodeGeo = track(new THREE.SphereGeometry(0.045, 8, 8))
    const nodeMat = track(new THREE.MeshBasicMaterial({ color: 0x00d4f5 }))
    const positions = wireGeo.attributes.position.array
    const nodeCount = Math.min(positions.length / 3, 24)
    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat)
      node.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
      mainGroup.add(node)
    }

    // D. Dual Gimbal Orbital Quantum Rings
    const ring1Geo = track(new THREE.TorusGeometry(2.1, 0.016, 16, 80))
    const ring1Mat = track(new THREE.MeshBasicMaterial({
      color: 0x00d4f5,
      transparent: true,
      opacity: 0.45,
    }))
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat)
    ring1.rotation.x = Math.PI / 3.4
    ring1.rotation.y = Math.PI / 5
    mainGroup.add(ring1)

    const ring2Geo = track(new THREE.TorusGeometry(2.45, 0.014, 16, 80))
    const ring2Mat = track(new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.38,
    }))
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
    ring2.rotation.x = -Math.PI / 2.6
    ring2.rotation.y = -Math.PI / 7
    mainGroup.add(ring2)

    // E. Orbiting Signal Beacons (Cyan & Violet)
    const beaconGeo = track(new THREE.OctahedronGeometry(0.09, 0))
    const beaconMatCyan = track(new THREE.MeshBasicMaterial({ color: 0x00d4f5 }))
    const beaconMatViolet = track(new THREE.MeshBasicMaterial({ color: 0xc084fc }))

    const beacons = []
    for (let i = 0; i < 4; i++) {
      const bMesh = new THREE.Mesh(beaconGeo, i % 2 === 0 ? beaconMatCyan : beaconMatViolet)
      const radius = 2.1 + (i % 2) * 0.35
      const speed = 0.4 + i * 0.12
      const initialAngle = (i / 4) * Math.PI * 2
      mainGroup.add(bMesh)
      beacons.push({ mesh: bMesh, radius, speed, angle: initialAngle })
    }

    // ── 5. Starfield & Micro-Constellations ─────────────────────────
    const PARTICLE_COUNT = 150
    const partPositions = new Float32Array(PARTICLE_COUNT * 3)
    const partColors = new Float32Array(PARTICLE_COUNT * 3)

    const colorCyan = new THREE.Color(0x00d4f5)
    const colorViolet = new THREE.Color(0xa855f7)
    const colorWhite = new THREE.Color(0xffffff)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      partPositions[i * 3 + 0] = (Math.random() - 0.5) * 15
      partPositions[i * 3 + 1] = (Math.random() - 0.5) * 11
      partPositions[i * 3 + 2] = -3 + Math.random() * 6

      const rnd = Math.random()
      const c = rnd < 0.45 ? colorCyan : (rnd < 0.75 ? colorViolet : colorWhite)
      partColors[i * 3 + 0] = c.r
      partColors[i * 3 + 1] = c.g
      partColors[i * 3 + 2] = c.b
    }

    const partGeo = track(new THREE.BufferGeometry())
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPositions, 3))
    partGeo.setAttribute('color', new THREE.BufferAttribute(partColors, 3))

    const partMat = track(new THREE.PointsMaterial({
      size: 0.042,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    }))
    const particleField = new THREE.Points(partGeo, partMat)
    scene.add(particleField)

    // ── 6. Dynamic Scene Lighting ──────────────────────────────────
    const ambLight = track(new THREE.AmbientLight(0x06152d, 3.2))
    scene.add(ambLight)

    const keyLight = track(new THREE.PointLight(0x00d4f5, 5.5, 18))
    keyLight.position.set(4, 3, 4.5)
    scene.add(keyLight)

    const fillLight = track(new THREE.PointLight(0xa855f7, 4.2, 18))
    fillLight.position.set(-4, -3, 3.5)
    scene.add(fillLight)

    // ── 7. High-Performance Render Loop ────────────────────────────
    function animate() {
      animId = requestAnimationFrame(animate)

      if (!isRenderingActive) return

      const t = clock.getElapsedTime()

      // Smooth cursor parallax lerp
      curMouse.x += (targetMouse.x - curMouse.x) * 0.045
      curMouse.y += (targetMouse.y - curMouse.y) * 0.045

      // Core & wireframe rotation
      coreMesh.rotation.x = t * 0.14
      coreMesh.rotation.y = t * 0.2
      wireMesh.rotation.x = -t * 0.1
      wireMesh.rotation.y = -t * 0.15

      // Gimbal rings rotation
      ring1.rotation.z = t * 0.22
      ring2.rotation.z = -t * 0.18

      // Main model positioning with cursor follow
      mainGroup.position.x = curMouse.x * 0.32
      mainGroup.position.y = curMouse.y * 0.24 - (scrollOffset / window.innerHeight) * 0.3
      mainGroup.rotation.y = curMouse.x * 0.28
      mainGroup.rotation.x = -curMouse.y * 0.2

      // Orbiting beacons physics
      for (let i = 0; i < beacons.length; i++) {
        const b = beacons[i]
        b.angle += b.speed * 0.012
        b.mesh.position.x = Math.cos(b.angle) * b.radius
        b.mesh.position.z = Math.sin(b.angle) * b.radius
        b.mesh.position.y = Math.sin(t * 1.6 + b.angle) * 0.4
        b.mesh.rotation.x += 0.025
        b.mesh.rotation.y += 0.035
      }

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
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="w-full h-full opacity-75 will-change-transform"
      />
      {/* High-Contrast Soft Vignette Mask */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 75% 65% at 50% 30%, transparent 25%, #06060f 92%)',
        }}
      />
    </div>
  )
}
