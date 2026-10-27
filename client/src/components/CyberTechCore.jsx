import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Rotate3D, Sparkles, Cpu } from 'lucide-react'

/**
 * CyberTechCore — Elite 3D Interactive Centerpiece for CodeLifeAI
 * Built with pure Three.js:
 * - Inner Glowing Faceted Quantum Core (PBR Metallic)
 * - Holographic Geodesic Lattice with Glowing Vertex Nodes
 * - Flowing Quantum Torus Knot Algorithm Ribbon
 * - Precision Gyroscopic Gimbal Laser Rings
 * - Orbiting AI Agent Drone Nodes
 * - Interactive 360° Drag-to-Rotate Physics & Cursor Parallax
 */
export default function CyberTechCore() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const [isInteracting, setIsInteracting] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    let animId
    let isRendering = true
    const disposables = []
    const track = (obj) => { disposables.push(obj); return obj }

    // Dimensions
    const getWidth = () => container.clientWidth || 500
    const getHeight = () => container.clientHeight || 500

    // ── 1. WebGL Renderer ──────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    })
    renderer.setPixelRatio(dpr)
    renderer.setSize(getWidth(), getHeight())
    renderer.setClearColor(0x000000, 0)

    // ── 2. Scene & Camera ──────────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, getWidth() / getHeight(), 0.1, 100)
    camera.position.set(0, 0, 7.2)

    // ── 3. Lighting (Vibrant Teal / Cyan Brand Palette) ─────────────
    const ambLight = track(new THREE.AmbientLight(0x051d30, 2.8))
    scene.add(ambLight)

    const keyLight = track(new THREE.PointLight(0x00f0ff, 12, 22))
    keyLight.position.set(4, 5, 5)
    scene.add(keyLight)

    const fillLight = track(new THREE.PointLight(0x1cb1f3, 8, 20))
    fillLight.position.set(-4, -4, 4)
    scene.add(fillLight)

    const rimLight = track(new THREE.PointLight(0x00cced, 6, 16))
    rimLight.position.set(0, 4, -4)
    scene.add(rimLight)

    // ── 4. Main 3D Model Group ─────────────────────────────────────
    const rootGroup = new THREE.Group()
    scene.add(rootGroup)

    // A. Inner Energy Core (Reflective PBR Icosahedron)
    const coreGeo = track(new THREE.IcosahedronGeometry(1.15, 0))
    const coreMat = track(new THREE.MeshStandardMaterial({
      color: 0x051a2e,
      emissive: 0x00cced,
      emissiveIntensity: 0.6,
      roughness: 0.12,
      metalness: 0.92,
      transparent: true,
      opacity: 0.95,
    }))
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    rootGroup.add(coreMesh)

    // B. Holographic Geodesic Lattice Cage
    const cageGeo = track(new THREE.IcosahedronGeometry(1.35, 1))
    const cageMat = track(new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.38,
    }))
    const cageMesh = new THREE.Mesh(cageGeo, cageMat)
    rootGroup.add(cageMesh)

    // C. Glowing Node Spheres at Lattice Vertices
    const nodeGeo = track(new THREE.SphereGeometry(0.042, 10, 10))
    const nodeMat = track(new THREE.MeshBasicMaterial({ color: 0x00f0ff }))
    const cagePositions = cageGeo.attributes.position.array
    const nodeCount = Math.min(cagePositions.length / 3, 30)
    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat)
      node.position.set(cagePositions[i * 3], cagePositions[i * 3 + 1], cagePositions[i * 3 + 2])
      cageMesh.add(node)
    }

    // D. The Quantum Torus Knot Ribbon (Fluid Algorithm Stream)
    const knotGeo = track(new THREE.TorusKnotGeometry(1.85, 0.12, 180, 24, 2, 3))
    const knotMat = track(new THREE.MeshStandardMaterial({
      color: 0x07223b,
      emissive: 0x0088aa,
      emissiveIntensity: 0.45,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: 0.75,
    }))
    const knotMesh = new THREE.Mesh(knotGeo, knotMat)
    rootGroup.add(knotMesh)

    // Outer wireframe outline on Torus Knot for high-tech holographic fringe
    const knotWireMat = track(new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    }))
    const knotWireMesh = new THREE.Mesh(knotGeo, knotWireMat)
    knotMesh.add(knotWireMesh)

    // E. High-Precision Gyroscopic Gimbal Rings
    const ring1Geo = track(new THREE.TorusGeometry(2.35, 0.02, 16, 120))
    const ring1Mat = track(new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.55,
    }))
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat)
    ring1.rotation.x = Math.PI / 3.2
    ring1.rotation.y = Math.PI / 6
    rootGroup.add(ring1)

    const ring2Geo = track(new THREE.TorusGeometry(2.65, 0.016, 16, 120))
    const ring2Mat = track(new THREE.MeshBasicMaterial({
      color: 0x1cb1f3,
      transparent: true,
      opacity: 0.45,
    }))
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
    ring2.rotation.x = -Math.PI / 2.8
    ring2.rotation.y = -Math.PI / 5
    rootGroup.add(ring2)

    // F. Orbiting Autonomous Satellites (AI Agent Nodes)
    const droneGeo = track(new THREE.OctahedronGeometry(0.1, 0))
    const droneMatTeal = track(new THREE.MeshBasicMaterial({ color: 0x00f0ff }))
    const droneMatSky = track(new THREE.MeshBasicMaterial({ color: 0x1cb1f3 }))

    const drones = []
    const DRONE_COUNT = 4
    for (let i = 0; i < DRONE_COUNT; i++) {
      const dMesh = new THREE.Mesh(droneGeo, i % 2 === 0 ? droneMatTeal : droneMatSky)
      const radius = 2.25 + (i % 2) * 0.45
      const speed = 0.5 + i * 0.15
      const initialAngle = (i / DRONE_COUNT) * Math.PI * 2
      rootGroup.add(dMesh)
      drones.push({ mesh: dMesh, radius, speed, angle: initialAngle })
    }

    // G. Ambient Quantum Particle Cloud
    const PARTICLE_COUNT = 160
    const partPositions = new Float32Array(PARTICLE_COUNT * 3)
    const partColors = new Float32Array(PARTICLE_COUNT * 3)
    const colorTeal = new THREE.Color(0x00f0ff)
    const colorSky = new THREE.Color(0x1cb1f3)
    const colorWhite = new THREE.Color(0xffffff)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      partPositions[i * 3 + 0] = (Math.random() - 0.5) * 8.5
      partPositions[i * 3 + 1] = (Math.random() - 0.5) * 8.5
      partPositions[i * 3 + 2] = (Math.random() - 0.5) * 6

      const r = Math.random()
      const c = r < 0.5 ? colorTeal : (r < 0.8 ? colorSky : colorWhite)
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
      opacity: 0.65,
      sizeAttenuation: true,
    }))
    const particles = new THREE.Points(partGeo, partMat)
    rootGroup.add(particles)

    // ── 5. Physics & Interaction State ─────────────────────────────
    let isDragging = false
    let prevPointer = { x: 0, y: 0 }
    const rotSpeed = { x: 0, y: 0.006 }
    const targetRot = { x: 0.15, y: 0 }
    const curRot = { x: 0.15, y: 0 }
    const mouseParallax = { x: 0, y: 0 }

    // Resize Observer
    const onResize = () => {
      if (!container || !renderer) return
      const w = getWidth()
      const h = getHeight()
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(container)

    // Mouse Parallax on Window
    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      mouseParallax.x = ((e.clientX - cx) / window.innerWidth) * 0.4
      mouseParallax.y = -((e.clientY - cy) / window.innerHeight) * 0.3
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    // Drag to Rotate on Canvas
    const onPointerDown = (e) => {
      isDragging = true
      setIsInteracting(true)
      prevPointer = { x: e.clientX || e.touches?.[0]?.clientX || 0, y: e.clientY || e.touches?.[0]?.clientY || 0 }
    }

    const onPointerMove = (e) => {
      if (!isDragging) return
      const clientX = e.clientX || e.touches?.[0]?.clientX || 0
      const clientY = e.clientY || e.touches?.[0]?.clientY || 0
      const deltaX = clientX - prevPointer.x
      const deltaY = clientY - prevPointer.y
      prevPointer = { x: clientX, y: clientY }

      targetRot.y += deltaX * 0.008
      targetRot.x += deltaY * 0.008

      // Track momentum
      rotSpeed.y = deltaX * 0.002
      rotSpeed.x = deltaY * 0.002
    }

    const onPointerUp = () => {
      isDragging = false
      setIsInteracting(false)
    }

    canvas.addEventListener('mousedown', onPointerDown)
    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('mouseup', onPointerUp)

    canvas.addEventListener('touchstart', onPointerDown, { passive: true })
    window.addEventListener('touchmove', onPointerMove, { passive: true })
    window.addEventListener('touchend', onPointerUp)

    // ── 6. Render Loop ─────────────────────────────────────────────
    const clock = new THREE.Clock()

    function animate() {
      animId = requestAnimationFrame(animate)
      if (!isRendering) return

      const delta = clock.getDelta()
      const t = clock.getElapsedTime()

      // Idle auto-spin when not dragging
      if (!isDragging) {
        targetRot.y += 0.35 * delta
        targetRot.x *= 0.98
      }

      // Smooth inertia lerp
      curRot.x += (targetRot.x - curRot.x) * 0.08
      curRot.y += (targetRot.y - curRot.y) * 0.08

      // Apply rotations to main group
      rootGroup.rotation.x = curRot.x + mouseParallax.y
      rootGroup.rotation.y = curRot.y + mouseParallax.x

      // Individual component kinematics
      coreMesh.rotation.x = t * 0.2
      coreMesh.rotation.y = -t * 0.25
      cageMesh.rotation.x = -t * 0.15
      cageMesh.rotation.y = t * 0.18

      // Torus knot undulating rotation
      knotMesh.rotation.z = t * 0.22
      knotMesh.rotation.x = Math.sin(t * 0.4) * 0.25

      // Gyroscopic gimbal rings
      ring1.rotation.z = t * 0.28
      ring2.rotation.z = -t * 0.22

      // Orbiting AI Drone Satellites
      for (let i = 0; i < drones.length; i++) {
        const d = drones[i]
        d.angle += d.speed * delta * 0.8
        d.mesh.position.x = Math.cos(d.angle) * d.radius
        d.mesh.position.z = Math.sin(d.angle) * d.radius
        d.mesh.position.y = Math.sin(t * 2 + d.angle) * 0.45
        d.mesh.rotation.x += 0.03
        d.mesh.rotation.y += 0.04
      }

      // Emissive core pulse
      coreMat.emissiveIntensity = 0.5 + Math.sin(t * 2.2) * 0.22

      renderer.render(scene, camera)
    }

    animate()

    // Visibility optimization
    const onVisibility = () => {
      isRendering = !document.hidden
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('mouseup', onPointerUp)
      canvas.removeEventListener('touchstart', onPointerDown)
      window.removeEventListener('touchmove', onPointerMove)
      window.removeEventListener('touchend', onPointerUp)

      disposables.forEach((item) => {
        if (item.dispose) item.dispose()
      })
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[380px] sm:h-[460px] lg:h-[540px] flex items-center justify-center select-none"
    >
      {/* Ambient background glow behind the 3D model */}
      <div
        className="absolute w-[80%] h-[80%] rounded-full pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(0, 204, 237, 0.18) 0%, rgba(28, 177, 243, 0.08) 40%, transparent 70%)',
          filter: 'blur(32px)',
        }}
      />

      {/* Cyber Corner Decals (Elite Tech Studio Look) */}
      <div className="absolute top-2 left-2 flex items-center gap-2 px-3 py-1 rounded-full bg-[#081322]/80 border border-[#00cced]/25 backdrop-blur-md text-[0.65rem] font-mono text-[#00f0ff] shadow-[0_0_15px_rgba(0,204,237,0.15)] pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
        <Cpu size={12} className="text-[#00cced]" />
        <span>AI QUANTUM CORE // V3.8</span>
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#081322]/80 border border-white/10 text-[0.62rem] font-mono text-slate-400 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>120 FPS // READY</span>
      </div>

      {/* WebGL 3D Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full block cursor-grab active:cursor-grabbing transition-transform duration-200 ${
          isInteracting ? 'scale-[1.01]' : 'scale-100'
        }`}
        title="Click and drag to rotate 3D Core"
      />

      {/* Interactive Drag Hint (Bottom) */}
      <div className="absolute bottom-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#081322]/80 border border-[#00cced]/20 text-[0.65rem] font-medium text-slate-300 pointer-events-none backdrop-blur-md shadow-lg">
        <Rotate3D size={13} className="text-[#00f0ff]" />
        <span>Drag to rotate in 3D</span>
      </div>
    </div>
  )
}
