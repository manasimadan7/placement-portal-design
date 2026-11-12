import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * Felt-textured blob characters peeking over the top edge of the hero's glass window.
 *   • they watch the cursor and blink now and then
 *   • hover one → it hops;  click one → it does a jump + twirl
 * The canvas sits inside the tilted 3D "device", so the characters share its perspective,
 * and the frosted glass panel in front hides their lower halves.
 */

type Shape = 'pebble' | 'round' | 'hero' | 'bunny' | 'tall'

type Spec = {
  shape: Shape
  x: number
  z: number
  color: string
  size: [number, number, number] // ellipsoid radii
  lift: number // how far the centre sits above the glass edge
}

type Blob = {
  root: THREE.Group // position + hop
  body: THREE.Group // look-at rotation + breathing
  eyes: THREE.Group[]
  meshes: THREE.Object3D[]
  baseY: number
  phase: number
  hover: number
  hop: number
  hopV: number
  twirl: number
  blinkIn: number
  blinkT: number
}

// Canvas geometry (frame units) – must match .hero-blobs in styles.css
export const BLOB_CANVAS = { height: 340, edgeFromTop: 240 }

const SPECS: Spec[] = [
  { shape: 'pebble', x: -5.0, z: -0.6, color: '#dcbdff', size: [1.3, 0.95, 1.0], lift: 0.5 },
  { shape: 'round', x: -2.85, z: -0.35, color: '#f6f1fb', size: [1.0, 1.15, 0.95], lift: 0.62 },
  { shape: 'hero', x: -0.45, z: 0.45, color: '#7759b8', size: [1.45, 1.32, 1.22], lift: 0.48 },
  { shape: 'bunny', x: 2.1, z: -0.2, color: '#f6c7a3', size: [0.98, 0.95, 0.9], lift: 0.42 },
  { shape: 'tall', x: 4.3, z: -0.5, color: '#9fd3dc', size: [0.82, 1.85, 0.78], lift: 0.95 },
]

const rand = (a: number, b: number) => a + Math.random() * (b - a)

export function createBlobScene(
  host: HTMLElement,
  events: HTMLElement,
  opts: { reducedMotion: boolean; scale: () => number },
): () => void {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  } catch {
    return () => {}
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.setClearColor(0x000000, 0)
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envTex
  scene.environmentIntensity = 0.45
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9c8f5, 1.1))
  const key = new THREE.DirectionalLight(0xfff4ea, 2.2)
  key.position.set(3, 6, 8)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xc9dcff, 0.7)
  fill.position.set(-6, 1, 4)
  scene.add(fill)

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60)
  camera.position.set(0, 0.2, 11)
  camera.lookAt(0, 0, 0)

  const halfH = Math.tan(THREE.MathUtils.degToRad(15)) * 11
  const edgeY = halfH - (BLOB_CANVAS.edgeFromTop / BLOB_CANVAS.height) * 2 * halfH

  /* ── shared resources ── */
  const sphere = new THREE.SphereGeometry(1, 64, 48)
  const disposables: { dispose(): void }[] = [sphere]
  const felt = (color: string) => {
    const c = new THREE.Color(color)
    const m = new THREE.MeshPhysicalMaterial({
      color: c,
      roughness: 0.92,
      sheen: 1,
      sheenRoughness: 0.55,
      sheenColor: c.clone().lerp(new THREE.Color('#ffffff'), 0.55),
    })
    disposables.push(m)
    return m
  }
  const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x15121f, roughness: 0.15, clearcoat: 1 })
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  disposables.push(eyeMat, glintMat)

  const ellipsoid = (mat: THREE.Material, r: [number, number, number], pos: [number, number, number], rotZ = 0) => {
    const m = new THREE.Mesh(sphere, mat)
    m.scale.set(...r)
    m.position.set(...pos)
    m.rotation.z = rotZ
    return m
  }

  /* ── build characters ── */
  const blobs: Blob[] = []
  const pickables: THREE.Object3D[] = []

  for (const s of SPECS) {
    const mat = felt(s.color)
    const [a, b, c] = s.size
    const root = new THREE.Group()
    const body = new THREE.Group()
    root.add(body)
    const parts: THREE.Mesh[] = [ellipsoid(mat, [a, b, c], [0, 0, 0])]

    if (s.shape === 'hero') {
      parts.push(ellipsoid(mat, [0.36, 0.42, 0.34], [0.25, b * 0.98, -0.1], -0.35)) // tuft
    }
    if (s.shape === 'bunny') {
      parts.push(ellipsoid(mat, [0.26, 0.62, 0.2], [-0.42, b + 0.35, -0.05], 0.45))
      parts.push(ellipsoid(mat, [0.26, 0.62, 0.2], [0.42, b + 0.35, -0.05], -0.45))
    }
    if (s.shape === 'round' || s.shape === 'tall') {
      parts.push(ellipsoid(mat, [0.2, 0.24, 0.18], [-a * 0.55, b * 0.86, 0]))
      parts.push(ellipsoid(mat, [0.2, 0.24, 0.18], [a * 0.55, b * 0.86, 0]))
    }
    parts.forEach((p) => body.add(p))

    // little hands resting on the glass edge (main character only)
    if (s.shape === 'hero') {
      const handY = edgeY - (edgeY + s.lift) + 0.18
      body.add(ellipsoid(mat, [0.36, 0.3, 0.34], [-a * 0.82, handY, c * 0.55]))
      body.add(ellipsoid(mat, [0.36, 0.3, 0.34], [a * 0.82, handY, c * 0.55]))
    }

    // eyes on the ellipsoid surface
    const eyes: THREE.Group[] = []
    for (const side of [-1, 1]) {
      const d = new THREE.Vector3(side * 0.3, 0.2, 0.93).normalize()
      const p = new THREE.Vector3(d.x * a, d.y * b, d.z * c)
      const eye = new THREE.Group()
      eye.position.copy(p)
      const ball = new THREE.Mesh(sphere, eyeMat)
      ball.scale.setScalar(0.085)
      const glint = new THREE.Mesh(sphere, glintMat)
      glint.scale.setScalar(0.024)
      glint.position.set(0.03, 0.035, 0.065)
      eye.add(ball, glint)
      body.add(eye)
      eyes.push(eye)
    }

    const baseY = edgeY + s.lift
    root.position.set(s.x, baseY, s.z)
    scene.add(root)

    const blob: Blob = {
      root, body, eyes, meshes: [], baseY,
      phase: rand(0, Math.PI * 2), hover: 0, hop: 0, hopV: 0, twirl: 0,
      blinkIn: rand(1.5, 4.5), blinkT: 0,
    }
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.userData.blob = blob
        blob.meshes.push(o)
        pickables.push(o)
      }
    })
    blobs.push(blob)
  }

  /* ── pointer ── */
  const pointer = new THREE.Vector2()
  const look = new THREE.Vector2()
  let inside = false
  let overCanvas = false
  const raycaster = new THREE.Raycaster()

  const toNdc = (e: PointerEvent) => {
    const r = host.getBoundingClientRect()
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1))
    overCanvas = Math.abs(pointer.x) <= 1 && Math.abs(pointer.y) <= 1
  }
  const onMove = (e: PointerEvent) => {
    inside = true
    toNdc(e)
  }
  const onLeave = () => {
    inside = false
    overCanvas = false
  }
  const onDown = (e: PointerEvent) => {
    toNdc(e)
    const hit = pick()
    if (hit && !opts.reducedMotion) {
      hit.hopV = 5.2
      hit.twirl = Math.PI * 2
    }
  }
  events.addEventListener('pointermove', onMove, { passive: true })
  events.addEventListener('pointerleave', onLeave)
  host.addEventListener('pointerdown', onDown)

  function pick(): Blob | null {
    if (!overCanvas) return null
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObjects(pickables, false)[0]
    return hit ? (hit.object.userData.blob as Blob) : null
  }

  /* ── sizing: layout size × page scale × DPR (canvas lives in a CSS-zoomed, 3D-tilted box) ── */
  const resize = () => {
    const w = host.clientWidth
    const h = host.clientHeight
    if (!w || !h) return
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2) * opts.scale())
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(host)
  window.addEventListener('resize', resize)

  /* ── loop ── */
  const clock = new THREE.Clock()
  const proj = new THREE.Vector3()
  let raf = 0
  let visible = true
  let t = 0

  function frame() {
    raf = 0
    const dt = Math.min(clock.getDelta(), 0.05)
    t += dt
    const still = opts.reducedMotion

    // where the characters look: the cursor, or gently around when it's away
    const target = inside ? pointer : new THREE.Vector2(Math.sin(t * 0.4) * 0.3, 0.1)
    look.lerp(target, Math.min(1, dt * 4))

    const hovered = inside ? pick() : null
    host.style.cursor = hovered ? 'pointer' : ''

    for (const b of blobs) {
      const isHover = b === hovered
      if (isHover && b.hover < 0.5 && b.hop === 0 && !still) b.hopV = 3.4 // hop as the cursor arrives
      b.hover += ((isHover ? 1 : 0) - b.hover) * Math.min(1, dt * 8)

      // hop physics
      if (b.hopV !== 0 || b.hop > 0) {
        b.hopV -= 14 * dt
        b.hop = Math.max(0, b.hop + b.hopV * dt)
        if (b.hop === 0 && b.hopV < 0) b.hopV = 0
      }
      // twirl after a click
      if (b.twirl > 0) b.twirl = Math.max(0, b.twirl - dt * 9)

      // look toward the cursor
      proj.copy(b.root.position).project(camera)
      const yaw = THREE.MathUtils.clamp((look.x - proj.x) * 0.9, -0.6, 0.6)
      const pitch = THREE.MathUtils.clamp(-(look.y - proj.y) * 0.5, -0.35, 0.3)
      b.body.rotation.y += (yaw + b.twirl - b.body.rotation.y) * Math.min(1, dt * 6)
      b.body.rotation.x += (pitch - b.body.rotation.x) * Math.min(1, dt * 6)

      // breathing, sway, squash & stretch
      const breathe = still ? 0 : Math.sin(t * 2.1 + b.phase)
      const stretch = THREE.MathUtils.clamp(b.hopV * 0.035, -0.08, 0.14)
      b.body.scale.set(1 + breathe * 0.012 - stretch * 0.5 + b.hover * 0.03, 1 + breathe * 0.022 + stretch + b.hover * 0.03, 1)
      b.root.rotation.z = still ? 0 : Math.sin(t * 0.9 + b.phase) * 0.035
      b.root.position.y = b.baseY + b.hop + (still ? 0 : Math.sin(t * 1.3 + b.phase) * 0.03)

      // blinking (eyes widen a little while hovered)
      let lid = 1
      if (!still) {
        b.blinkIn -= dt
        if (b.blinkIn <= 0) {
          b.blinkT = 0.14
          b.blinkIn = rand(2.2, 5.5)
        }
        if (b.blinkT > 0) {
          b.blinkT -= dt
          lid = 0.12
        }
      }
      const wide = 1 + b.hover * 0.25
      for (const e of b.eyes) e.scale.set(wide, wide * lid, wide)
    }

    renderer.render(scene, camera)
    if (visible && !document.hidden) raf = requestAnimationFrame(frame)
  }

  const start = () => {
    if (!raf && visible && !document.hidden) {
      clock.getDelta()
      raf = requestAnimationFrame(frame)
    }
  }
  const stop = () => {
    cancelAnimationFrame(raf)
    raf = 0
  }
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible) start()
    else stop()
  })
  io.observe(host)
  const onVis = () => (document.hidden ? stop() : start())
  document.addEventListener('visibilitychange', onVis)
  start()

  return () => {
    stop()
    io.disconnect()
    ro.disconnect()
    window.removeEventListener('resize', resize)
    document.removeEventListener('visibilitychange', onVis)
    events.removeEventListener('pointermove', onMove)
    events.removeEventListener('pointerleave', onLeave)
    host.removeEventListener('pointerdown', onDown)
    host.style.cursor = ''
    disposables.forEach((d) => d.dispose())
    envTex.dispose()
    pmrem.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}
