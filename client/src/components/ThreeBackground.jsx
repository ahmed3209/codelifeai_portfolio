import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Fixed full-screen WebGL background: crystal core + rings + satellites +
 * particle field + floating shapes, reacting to scroll and cursor.
 * Scoped to whatever page mounts it; fully disposed on unmount.
 */
export default function ThreeBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    // Respect reduced-motion: skip the animated scene entirely.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return

    const isSmall = window.innerWidth < 768
    const disposables = []
    const track = (obj) => { disposables.push(obj); return obj }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isSmall, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 0, 6)

    const clock = new THREE.Clock()
    let scrollY = window.scrollY || 0
    const mouse = new THREE.Vector2(0, 0)

    const onScroll = () => { scrollY = window.scrollY }
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('resize', onResize)

    // ── Hero crystal group ──────────────────────────────────────
    const sphereGroup = new THREE.Group()
    scene.add(sphereGroup)

    const coreGeo = track(new THREE.SphereGeometry(1.6, 64, 64))
    const coreMat = track(new THREE.MeshPhongMaterial({
      color: 0x001830, emissive: 0x002244, specular: 0x00d4e8,
      shininess: 120, transparent: true, opacity: 0.5,
    }))
    sphereGroup.add(new THREE.Mesh(coreGeo, coreMat))

    const wireGeo = track(new THREE.SphereGeometry(1.85, 24, 24))
    const wireMat = track(new THREE.MeshBasicMaterial({ color: 0x00d4e8, wireframe: true, transparent: true, opacity: 0.07 }))
    sphereGroup.add(new THREE.Mesh(wireGeo, wireMat))

    const icoGeo = track(new THREE.IcosahedronGeometry(1.1, 1))
    const icoMat = track(new THREE.MeshPhongMaterial({
      color: 0x8b5cf6, emissive: 0x4c1d95, specular: 0xffffff,
      shininess: 200, transparent: true, opacity: 0.55,
    }))
    const icoMesh = new THREE.Mesh(icoGeo, icoMat)
    sphereGroup.add(icoMesh)

    const icoWireGeo = track(new THREE.IcosahedronGeometry(1.12, 1))
    const icoWireMat = track(new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.25 }))
    sphereGroup.add(new THREE.Mesh(icoWireGeo, icoWireMat))

    const makeRing = (r, tube, rot, color, opacity) => {
      const g = track(new THREE.TorusGeometry(r, tube, 8, 80))
      const m = track(new THREE.MeshBasicMaterial({ color, transparent: true, opacity }))
      const mesh = new THREE.Mesh(g, m)
      mesh.rotation.set(rot.x || 0, rot.y || 0, rot.z || 0)
      return mesh
    }
    const ring1 = makeRing(2.1, 0.012, { x: Math.PI / 2.2, z: 0.4 }, 0x00d4e8, 0.5)
    const ring2 = makeRing(1.8, 0.010, { x: 1.1, y: 0.8 }, 0x8b5cf6, 0.4)
    const ring3 = makeRing(2.4, 0.008, { z: 0.7, y: 0.3 }, 0xec4899, 0.25)
    sphereGroup.add(ring1, ring2, ring3)

    const satGroup = new THREE.Group()
    sphereGroup.add(satGroup)
    const SAT_COLORS = [0x00d4e8, 0x8b5cf6, 0xec4899]
    const SAT_EMISSIVE = [0x002244, 0x2e1065, 0x831843]
    for (let i = 0; i < 8; i++) {
      const g = track(new THREE.OctahedronGeometry(0.07 + Math.random() * 0.04))
      const m = track(new THREE.MeshPhongMaterial({ color: SAT_COLORS[i % 3], emissive: SAT_EMISSIVE[i % 3], shininess: 200 }))
      const sat = new THREE.Mesh(g, m)
      const angle = (i / 8) * Math.PI * 2
      const radius = 2.0 + Math.random() * 0.4
      sat.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 1.2, Math.sin(angle) * radius)
      sat.userData = { angle, speed: 0.003 + Math.random() * 0.004, radius, yOff: sat.position.y }
      satGroup.add(sat)
    }
    sphereGroup.position.set(2.8, 0, 0)

    // ── Particle field ──────────────────────────────────────────
    const PART_COUNT = isSmall ? 700 : 1800
    const partPositions = new Float32Array(PART_COUNT * 3)
    const partColors = new Float32Array(PART_COUNT * 3)
    const partSpeeds = new Float32Array(PART_COUNT)
    const palette = [new THREE.Color(0x00d4e8), new THREE.Color(0x8b5cf6), new THREE.Color(0xec4899)]
    for (let i = 0; i < PART_COUNT; i++) {
      partPositions[i * 3] = (Math.random() - 0.5) * 22
      partPositions[i * 3 + 1] = (Math.random() - 0.5) * 14
      partPositions[i * 3 + 2] = (Math.random() - 0.5) * 10
      const col = palette[Math.floor(Math.random() * 3)]
      partColors[i * 3] = col.r
      partColors[i * 3 + 1] = col.g
      partColors[i * 3 + 2] = col.b
      partSpeeds[i] = 0.002 + Math.random() * 0.006
    }
    const partGeo = track(new THREE.BufferGeometry())
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPositions, 3))
    partGeo.setAttribute('color', new THREE.BufferAttribute(partColors, 3))
    const partMat = track(new THREE.PointsMaterial({ size: 0.03, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true }))
    scene.add(new THREE.Points(partGeo, partMat))

    // ── Grid plane ──────────────────────────────────────────────
    const grid = new THREE.GridHelper(30, 40, 0x00d4e8, 0x00d4e8)
    grid.material.transparent = true
    grid.material.opacity = 0.04
    grid.position.y = -3.5
    track(grid.geometry); track(grid.material)
    scene.add(grid)

    // ── Floating shapes ─────────────────────────────────────────
    const geoShapes = []
    const shapeDefs = [
      { geo: new THREE.TetrahedronGeometry(0.25), pos: [-3.5, 1.5, -2], color: 0x00d4e8, speed: 0.008 },
      { geo: new THREE.OctahedronGeometry(0.18), pos: [-4, -1.2, -1], color: 0x8b5cf6, speed: 0.006 },
      { geo: new THREE.IcosahedronGeometry(0.15, 0), pos: [-2.8, 2.2, 1], color: 0xec4899, speed: 0.009 },
      { geo: new THREE.TetrahedronGeometry(0.2), pos: [5, 1.8, -3], color: 0x8b5cf6, speed: 0.007 },
      { geo: new THREE.OctahedronGeometry(0.22), pos: [4.5, -1.5, -1], color: 0x00d4e8, speed: 0.005 },
    ]
    shapeDefs.forEach((def) => {
      const mat = track(new THREE.MeshPhongMaterial({ color: def.color, emissive: def.color, emissiveIntensity: 0.15, transparent: true, opacity: 0.45, shininess: 150 }))
      const wireMat = track(new THREE.MeshBasicMaterial({ color: def.color, wireframe: true, transparent: true, opacity: 0.4 }))
      track(def.geo)
      const cloned = track(def.geo.clone())
      const group = new THREE.Group()
      group.add(new THREE.Mesh(def.geo, mat), new THREE.Mesh(cloned, wireMat))
      group.position.set(...def.pos)
      group.userData = { speed: def.speed, initY: def.pos[1] }
      scene.add(group)
      geoShapes.push(group)
    })

    // ── Lights ──────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.3))
    const pointLight1 = new THREE.PointLight(0x00d4e8, 3, 12); pointLight1.position.set(3, 3, 4); scene.add(pointLight1)
    const pointLight2 = new THREE.PointLight(0x8b5cf6, 2.5, 12); pointLight2.position.set(-3, -2, 3); scene.add(pointLight2)
    const pointLight3 = new THREE.PointLight(0xec4899, 1.5, 8); pointLight3.position.set(0, 4, -2); scene.add(pointLight3)

    // ── Loop ────────────────────────────────────────────────────
    let rafId
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      const scroll = scrollY / (document.body.scrollHeight - window.innerHeight || 1)

      camera.position.y = -scroll * 2.5 + Math.sin(t * 0.15) * 0.08
      camera.position.x = mouse.x * 0.35 + Math.sin(t * 0.2) * 0.05
      camera.lookAt(0, camera.position.y, 0)

      sphereGroup.rotation.y = t * 0.12 + mouse.x * 0.3
      sphereGroup.rotation.x = mouse.y * 0.15 + Math.sin(t * 0.08) * 0.05
      sphereGroup.position.x = 2.8 - scroll * 1.5
      sphereGroup.position.y = Math.sin(t * 0.4) * 0.12
      sphereGroup.scale.setScalar(1 - scroll * 0.3 + 0.001)

      icoMesh.rotation.y = -t * 0.25
      icoMesh.rotation.x = t * 0.15
      ring1.rotation.z = t * 0.18
      ring2.rotation.y = t * 0.12
      ring3.rotation.x = t * 0.08

      satGroup.children.forEach((sat) => {
        sat.userData.angle += sat.userData.speed
        const a = sat.userData.angle
        const r = sat.userData.radius
        sat.position.x = Math.cos(a) * r
        sat.position.z = Math.sin(a) * r
        sat.position.y = sat.userData.yOff + Math.sin(a * 2) * 0.3
        sat.rotation.x = t * 0.5
        sat.rotation.z = t * 0.3
      })

      const pos = partGeo.attributes.position.array
      for (let i = 0; i < PART_COUNT; i++) {
        pos[i * 3 + 1] += partSpeeds[i] * (Math.sin(t + i) * 0.5 + 0.5)
        if (pos[i * 3 + 1] > 7) pos[i * 3 + 1] = -7
      }
      partGeo.attributes.position.needsUpdate = true

      geoShapes.forEach((g, i) => {
        g.rotation.x = t * g.userData.speed * 40
        g.rotation.y = t * g.userData.speed * 30
        g.position.y = g.userData.initY + Math.sin(t * 0.6 + i) * 0.35
      })

      pointLight1.intensity = 3 + Math.sin(t * 1.2) * 0.5
      pointLight2.intensity = 2.5 + Math.cos(t * 0.9) * 0.4
      pointLight1.position.x = 3 + Math.sin(t * 0.3) * 1.5
      pointLight2.position.y = -2 + Math.cos(t * 0.4) * 1.5

      renderer.render(scene, camera)
    }
    animate()

    // ── Cleanup ─────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      disposables.forEach((d) => d?.dispose?.())
      renderer.dispose()
      renderer.forceContextLoss?.()
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
