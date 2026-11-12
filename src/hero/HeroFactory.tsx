import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { asset } from '../ui'

/*
 * Landing hero – an isometric "placement factory" built from interface slabs (three.js):
 *   1 Build    – people at desks on the resume-builder slab; resume cards come off the printer
 *   2 Verify   – cards ride a conveyor through a scanning gate; a checker stamps them ✓
 *   3 Apply    – verified cards drop into the apply tower and fly as envelopes to companies
 *   4 Contact  – a coordinator on the phone follows up; call / message bubbles pop by the buildings
 * plus a courier walking between stations and a status board.  Orthographic camera, soft shadows,
 * slight parallax with the pointer.  All animation pauses while the hero is off-screen.
 */

const C = {
  white: 0xf7f8fb,
  slab: 0xf2f3f7,
  line: 0xdfe3ec,
  blue: 0x5b8def,
  teal: 0x43aec4,
  violet: 0x7759b8,
  orange: 0xf28c3c,
  ink: 0x3b4252,
  belt: 0x5d6475,
  green: 0x3fbf86,
}
const SKIN = [0xf1c7a4, 0xd9a07a, 0xa86f4c, 0xf5d3b8, 0x8a5a3c]
const HAIR = [0x2d2a32, 0x4a3426, 0x1d1b22, 0x6b4a33, 0x2d2a32]

/* ───────── canvas textures ───────── */
function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath()
  g.roundRect(x, y, w, h, r)
}
const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

/** the resume-builder screen printed on the upper slab */
const builderScreen = () =>
  canvasTex(1024, 640, (g) => {
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, 1024, 640)
    g.fillStyle = '#eef1f7'
    g.fillRect(0, 0, 1024, 70)
    g.fillStyle = hex(C.violet)
    rr(g, 30, 20, 30, 30, 8)
    g.fill()
    g.fillStyle = '#3b4252'
    g.font = '600 30px DM Sans, sans-serif'
    g.fillText('Resume builder', 76, 46)
    ;['Work', 'PORs', 'Projects'].forEach((t, i) => {
      g.fillStyle = i === 0 ? hex(C.teal) : '#e3e7ef'
      rr(g, 520 + i * 150, 18, 130, 34, 17)
      g.fill()
      g.fillStyle = i === 0 ? '#fff' : '#6b7280'
      g.font = '500 20px DM Sans, sans-serif'
      g.fillText(t, 545 + i * 150, 42)
    })
    // pointer cards
    for (let i = 0; i < 3; i++) {
      const y = 100 + i * 170
      g.fillStyle = '#f5f6fa'
      rr(g, 30, y, 560, 150, 18)
      g.fill()
      g.fillStyle = '#c9cfdb'
      rr(g, 56, y + 26, 180, 18, 9)
      g.fill()
      g.fillStyle = '#dde2ea'
      rr(g, 56, y + 62, 460, 12, 6)
      g.fill()
      rr(g, 56, y + 84, 380, 12, 6)
      g.fill()
      g.fillStyle = i === 0 ? '#e4f3f7' : '#ffffff'
      g.strokeStyle = i === 0 ? hex(C.teal) : '#c9cfdb'
      g.lineWidth = 2
      rr(g, 430, y + 106, 130, 30, 10)
      g.fill()
      g.stroke()
    }
    // live preview sheet
    g.fillStyle = '#eef1f7'
    rr(g, 620, 100, 374, 510, 18)
    g.fill()
    g.fillStyle = '#ffffff'
    rr(g, 650, 125, 314, 460, 6)
    g.fill()
    g.fillStyle = hex(C.blue)
    g.fillRect(650, 125, 314, 10)
    g.fillStyle = '#9aa3b5'
    rr(g, 676, 160, 170, 16, 8)
    g.fill()
    for (let i = 0; i < 12; i++) {
      g.fillStyle = i % 4 === 0 ? hex(C.teal) : '#dde2ea'
      rr(g, 676, 200 + i * 30, i % 4 === 0 ? 120 : 250 - (i % 3) * 40, 10, 5)
      g.fill()
    }
  })

/** a resume card riding the line (verified = with a green tick) */
const cardTex = (verified: boolean) =>
  canvasTex(256, 180, (g) => {
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, 256, 180)
    g.fillStyle = hex(C.orange)
    g.fillRect(0, 0, 256, 16)
    g.fillStyle = '#c6d4f5'
    g.beginPath()
    g.arc(44, 62, 22, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#c9cfdb'
    rr(g, 80, 48, 120, 12, 6)
    g.fill()
    g.fillStyle = '#e2e6ee'
    for (let i = 0; i < 4; i++) rr(g, 24, 100 + i * 18, 200 - i * 26, 9, 5), g.fill()
    if (verified) {
      g.fillStyle = hex(C.green)
      g.beginPath()
      g.arc(214, 136, 28, 0, Math.PI * 2)
      g.fill()
      g.strokeStyle = '#fff'
      g.lineWidth = 8
      g.lineCap = 'round'
      g.beginPath()
      g.moveTo(200, 136)
      g.lineTo(211, 147)
      g.lineTo(229, 126)
      g.stroke()
    }
  })

/** status board */
const boardTex = () =>
  canvasTex(512, 380, (g) => {
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, 512, 380)
    g.fillStyle = '#3b4252'
    g.font = '600 30px DM Sans, sans-serif'
    g.fillText('Applications', 32, 54)
    const bars = [70, 120, 96, 150, 128, 170]
    bars.forEach((h, i) => {
      g.fillStyle = i === 5 ? hex(C.violet) : '#cdd6ee'
      rr(g, 40 + i * 62, 300 - h, 40, h, 8)
      g.fill()
    })
    ;[
      ['Pending', '#fde7d4', '#c76a1f'],
      ['Shortlisted', '#dcf3e8', '#2f8a5f'],
    ].forEach(([t, bg, fg], i) => {
      g.fillStyle = bg
      rr(g, 32 + i * 190, 318, 170, 40, 20)
      g.fill()
      g.fillStyle = fg
      g.font = '500 22px DM Sans, sans-serif'
      g.fillText(t, 52 + i * 190, 345)
    })
  })

/** company building windows */
const windowsTex = (tint: number) =>
  canvasTex(128, 256, (g) => {
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, 128, 256)
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 3; c++) {
        g.fillStyle = (r + c) % 3 === 0 ? hex(tint) : '#dbe4f6'
        rr(g, 14 + c * 38, 16 + r * 34, 26, 22, 4)
        g.fill()
      }
  })

/** floating station label */
const labelTex = (n: number, text: string, color: number) =>
  canvasTex(512, 128, (g) => {
    g.shadowColor = 'rgba(40,50,80,0.18)'
    g.shadowBlur = 18
    g.shadowOffsetY = 6
    g.fillStyle = '#ffffff'
    rr(g, 16, 16, 480, 92, 46)
    g.fill()
    g.shadowColor = 'transparent'
    g.fillStyle = hex(color)
    g.beginPath()
    g.arc(70, 62, 30, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#fff'
    g.font = '700 32px DM Sans, sans-serif'
    g.textAlign = 'center'
    g.fillText(String(n), 70, 73)
    g.textAlign = 'left'
    g.fillStyle = '#3b4252'
    g.font = '600 40px DM Sans, sans-serif'
    g.fillText(text, 120, 76)
  })

/** speech bubble with an icon (phone / mail / tick) */
const bubbleTex = (kind: 'phone' | 'mail' | 'check', color: number) =>
  canvasTex(160, 160, (g) => {
    g.fillStyle = '#ffffff'
    g.shadowColor = 'rgba(40,50,80,0.2)'
    g.shadowBlur = 12
    g.beginPath()
    g.arc(80, 72, 56, 0, Math.PI * 2)
    g.fill()
    g.beginPath()
    g.moveTo(58, 118)
    g.lineTo(80, 150)
    g.lineTo(96, 118)
    g.fill()
    g.shadowColor = 'transparent'
    g.strokeStyle = hex(color)
    g.fillStyle = hex(color)
    g.lineWidth = 9
    g.lineCap = 'round'
    g.lineJoin = 'round'
    if (kind === 'check') {
      g.beginPath()
      g.moveTo(54, 74)
      g.lineTo(72, 92)
      g.lineTo(106, 54)
      g.stroke()
    } else if (kind === 'mail') {
      g.strokeRect(46, 50, 68, 46)
      g.beginPath()
      g.moveTo(46, 52)
      g.lineTo(80, 78)
      g.lineTo(114, 52)
      g.stroke()
    } else {
      g.beginPath()
      g.moveTo(58, 46)
      g.quadraticCurveTo(52, 92, 100, 100)
      g.stroke()
      g.fillRect(50, 40, 18, 16)
      g.fillRect(94, 92, 18, 16)
    }
  })

/** "Open roles" job board – printed on frosted glass, so the background stays clear */
const jobBoardTex = () =>
  canvasTex(640, 400, (g) => {
    g.fillStyle = '#2f3646'
    g.font = '600 34px DM Sans, sans-serif'
    g.fillText('Open roles', 30, 52)
    g.fillStyle = 'rgba(255,255,255,0.7)'
    rr(g, 470, 22, 140, 40, 20)
    g.fill()
    g.fillStyle = hex(C.violet)
    g.font = '500 20px DM Sans, sans-serif'
    g.fillText('All · 24', 500, 49)
    const jobs = [
      ['Boston Consulting Group', 'Product Manager · ₹2.0L'],
      ['Google', 'Software Engineer · ₹2.4L'],
      ['Microsoft', 'Data Analyst · ₹2.2L'],
    ]
    jobs.forEach(([co, role], i) => {
      const y = 82 + i * 102
      g.fillStyle = 'rgba(255,255,255,0.78)'
      rr(g, 24, y, 592, 86, 18)
      g.fill()
      g.fillStyle = ['#cdd9f7', '#d3eef3', '#e6ddfb'][i]
      g.beginPath()
      g.arc(70, y + 43, 24, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = '#2f3646'
      g.font = '600 24px DM Sans, sans-serif'
      g.fillText(co, 110, y + 38)
      g.fillStyle = '#6b7280'
      g.font = '400 19px DM Sans, sans-serif'
      g.fillText(role, 110, y + 66)
      g.fillStyle = hex(C.teal)
      rr(g, 506, y + 25, 90, 36, 18)
      g.fill()
      g.fillStyle = '#fff'
      g.font = '600 18px DM Sans, sans-serif'
      g.fillText('Apply', 527, y + 49)
    })
  })

/** verification queue – on frosted glass behind the gate */
const queueTex = () =>
  canvasTex(320, 230, (g) => {
    g.fillStyle = '#2f3646'
    g.font = '600 24px DM Sans, sans-serif'
    g.fillText('Verification queue', 20, 38)
    ;[
      ['Aditi S.', 'ok'],
      ['Rohan K.', 'ok'],
      ['Neha G.', 'wait'],
    ].forEach(([n, s], i) => {
      const y = 58 + i * 54
      g.fillStyle = 'rgba(255,255,255,0.78)'
      rr(g, 16, y, 288, 44, 12)
      g.fill()
      g.fillStyle = '#3b4252'
      g.font = '500 19px DM Sans, sans-serif'
      g.fillText(n, 34, y + 29)
      g.fillStyle = s === 'ok' ? hex(C.green) : hex(C.orange)
      g.beginPath()
      g.arc(276, y + 22, 9, 0, Math.PI * 2)
      g.fill()
    })
  })

/** notifications – on frosted glass over the companies */
const notifTex = () =>
  canvasTex(420, 280, (g) => {
    g.fillStyle = '#2f3646'
    g.font = '600 26px DM Sans, sans-serif'
    g.fillText('Notifications', 22, 40)
    ;[
      ['BCG shortlisted 12', C.green],
      ['Interview · 3 pm today', C.violet],
      ['Offer from Google', C.orange],
    ].forEach(([t, c], i) => {
      const y = 60 + i * 70
      g.fillStyle = 'rgba(255,255,255,0.8)'
      rr(g, 16, y, 388, 58, 14)
      g.fill()
      g.fillStyle = hex(c as number)
      rr(g, 30, y + 17, 24, 24, 7)
      g.fill()
      g.fillStyle = '#3b4252'
      g.font = '500 21px DM Sans, sans-serif'
      g.fillText(t as string, 68, y + 37)
    })
  })

/** floating toast over the interview room */
const toastTex = () =>
  canvasTex(512, 128, (g) => {
    g.shadowColor = 'rgba(40,50,80,0.18)'
    g.shadowBlur = 18
    g.shadowOffsetY = 6
    g.fillStyle = '#ffffff'
    rr(g, 16, 16, 480, 92, 46)
    g.fill()
    g.shadowColor = 'transparent'
    g.fillStyle = hex(C.green)
    g.beginPath()
    g.arc(68, 62, 14, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#3b4252'
    g.font = '600 36px DM Sans, sans-serif'
    g.fillText('Shortlist out · 12 selected', 96, 75)
  })

/* ───────── little people ───────── */
type Person = {
  root: THREE.Group
  armL: THREE.Group
  armR: THREE.Group
  legL: THREE.Mesh
  legR: THREE.Mesh
  body: THREE.Group
}
function makePerson(shirt: number, i: number, mats: Map<number, THREE.Material>): Person {
  const m = (c: number) => {
    if (!mats.has(c)) mats.set(c, new THREE.MeshStandardMaterial({ color: c, roughness: 0.55 }))
    return mats.get(c)!
  }
  const root = new THREE.Group()
  const body = new THREE.Group()
  root.add(body)
  const legGeo = new THREE.CapsuleGeometry(0.055, 0.2, 4, 10)
  const legL = new THREE.Mesh(legGeo, m(0x3d4458))
  const legR = new THREE.Mesh(legGeo, m(0x3d4458))
  legL.position.set(-0.07, 0.16, 0)
  legR.position.set(0.07, 0.16, 0)
  root.add(legL, legR)
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.22, 6, 14), m(shirt))
  torso.position.y = 0.48
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 20, 16), m(SKIN[i % SKIN.length]))
  head.position.y = 0.78
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), m(HAIR[i % HAIR.length]))
  hair.position.y = 0.795
  hair.rotation.x = -0.25
  body.add(torso, head, hair)
  const arm = (side: number) => {
    const g = new THREE.Group()
    g.position.set(side * 0.16, 0.6, 0)
    const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.2, 4, 8), m(shirt))
    a.position.y = -0.13
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), m(SKIN[i % SKIN.length]))
    hand.position.y = -0.27
    g.add(a, hand)
    body.add(g)
    return g
  }
  const armL = arm(-1)
  const armR = arm(1)
  root.traverse((o) => ((o as THREE.Mesh).isMesh ? ((o as THREE.Mesh).castShadow = true) : null))
  return { root, armL, armR, legL, legR, body }
}

/* ───────── the scene ───────── */
export default function HeroFactory() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200)
    const CENTER = new THREE.Vector3(1.6, 0.4, 0.6)
    camera.position.copy(CENTER).add(new THREE.Vector3(14, 12.5, 14))
    camera.lookAt(CENTER)

    scene.add(new THREE.HemisphereLight(0xffffff, 0xdfe3ee, 0.75))
    const sun = new THREE.DirectionalLight(0xffffff, 2.1)
    sun.position.set(-6, 14, 9)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 })
    sun.shadow.radius = 5
    sun.shadow.bias = -0.0005
    scene.add(sun)

    const world = new THREE.Group()
    scene.add(world)
    const mats = new Map<number, THREE.Material>()
    const std = (color: number, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.5, ...o })
    const white = std(C.white, { roughness: 0.42 })
    const slabMat = std(C.slab, { roughness: 0.5 })

    const add = <T extends THREE.Object3D>(o: T, parent: THREE.Object3D = world) => {
      parent.add(o)
      o.traverse((x) => {
        const m = x as THREE.Mesh
        if (m.isMesh) m.castShadow = m.receiveShadow = true
      })
      return o
    }
    const rbox = (w: number, h: number, d: number, r: number, mat: THREE.Material) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat)

    // floor shadow catcher
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.1 }))
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    /* slabs: main deck, upper builder deck, company deck */
    const intro: { o: THREE.Object3D; at: number; y: number }[] = [] // pop-in on load
    const animators: ((T: number) => void)[] = [] // extra per-frame motion (floating panels, arm, packets…)
    const slab = (w: number, h: number, d: number, x: number, y: number, z: number, at: number) => {
      const s = add(rbox(w, h, d, 0.22, slabMat))
      s.position.set(x, y + h / 2, z)
      intro.push({ o: s, at, y: s.position.y })
      return s
    }
    slab(10.5, 0.55, 7.4, 0.6, 0, 0.4, 0)
    const upper = slab(5.2, 0.5, 3.4, -1.7, 0.55, -1.35, 0.15)
    slab(3.8, 0.4, 3.6, 7.6, 0, 3.4, 0.3)

    // builder screen on the upper deck
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.9), new THREE.MeshStandardMaterial({ map: builderScreen(), roughness: 0.6 }))
    screen.rotation.x = -Math.PI / 2
    screen.position.set(0, 0.252, 0.05)
    screen.receiveShadow = true
    upper.add(screen)

    /* desks + workers on the upper deck (Build) */
    const people: { p: Person; role: string; phase: number }[] = []
    const person = (shirt: number, role: string, x: number, y: number, z: number, ry: number) => {
      const p = makePerson(shirt, people.length, mats)
      p.root.position.set(x, y, z)
      p.root.rotation.y = ry
      add(p.root)
      people.push({ p, role, phase: people.length * 1.3 })
      intro.push({ o: p.root, at: 0.6 + people.length * 0.08, y })
      return p
    }
    const deckTop = 0.55 + 0.5
    const desk = (x: number, z: number) => {
      const d = add(rbox(0.9, 0.08, 0.55, 0.03, white))
      d.position.set(x, deckTop + 0.42, z)
      const leg = add(rbox(0.8, 0.4, 0.06, 0.02, std(C.line)))
      leg.position.set(x, deckTop + 0.2, z - 0.18)
      const lap = add(rbox(0.42, 0.26, 0.03, 0.02, std(C.ink, { roughness: 0.3 })))
      lap.position.set(x, deckTop + 0.6, z - 0.12)
      lap.rotation.x = -0.25
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.2), new THREE.MeshBasicMaterial({ color: 0x9fc0ff }))
      glow.position.set(0, 0, 0.017)
      lap.add(glow)
      intro.push({ o: d, at: 0.45, y: d.position.y })
    }
    desk(-2.9, -0.35)
    desk(-1.55, -0.35)
    person(C.blue, 'type', -2.9, deckTop, 0.02, Math.PI)
    person(C.violet, 'type', -1.55, deckTop, 0.02, Math.PI)

    // printer at the deck edge feeding the conveyor
    const printer = add(rbox(0.8, 0.55, 0.6, 0.08, white))
    printer.position.set(-0.2, deckTop + 0.27, 0.05)
    const slot = add(rbox(0.5, 0.05, 0.08, 0.02, std(C.orange)))
    slot.position.set(-0.2, deckTop + 0.4, 0.37)

    /* conveyor (Verify → Apply) */
    const top = 0.55
    const BELT = [
      new THREE.Vector3(-0.2, top + 0.06, 0.9),
      new THREE.Vector3(3.9, top + 0.06, 0.9),
      new THREE.Vector3(3.9, top + 0.06, 3.0),
    ]
    const beltTex = canvasTex(64, 64, (g) => {
      g.fillStyle = hex(C.belt)
      g.fillRect(0, 0, 64, 64)
      g.fillStyle = '#727a8c'
      g.fillRect(0, 0, 10, 64)
    })
    beltTex.wrapS = beltTex.wrapT = THREE.RepeatWrapping
    const beltTexs: THREE.Texture[] = []
    for (let i = 0; i < BELT.length - 1; i++) {
      const a = BELT[i]
      const b = BELT[i + 1]
      const len = a.distanceTo(b)
      const alongX = Math.abs(b.x - a.x) > 0.01
      const frame = add(rbox(alongX ? len + 0.7 : 0.78, 0.1, alongX ? 0.78 : len + 0.7, 0.04, white))
      frame.position.set((a.x + b.x) / 2, top + 0.02, (a.z + b.z) / 2)
      const t = beltTex.clone()
      t.needsUpdate = true
      t.repeat.set(len * 3, 1)
      if (!alongX) t.rotation = Math.PI / 2
      t.center.set(0.5, 0.5)
      beltTexs.push(t)
      const belt = new THREE.Mesh(new THREE.PlaneGeometry(alongX ? len + 0.55 : 0.55, alongX ? 0.55 : len + 0.55), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 }))
      belt.rotation.x = -Math.PI / 2
      belt.position.set((a.x + b.x) / 2, top + 0.075, (a.z + b.z) / 2)
      belt.receiveShadow = true
      world.add(belt)
    }
    const beltCurve = new THREE.CurvePath<THREE.Vector3>()
    for (let i = 0; i < BELT.length - 1; i++) beltCurve.add(new THREE.LineCurve3(BELT[i], BELT[i + 1]))
    const beltLen = beltCurve.getLength()

    // verify gate
    const GATE_X = 1.7
    const gate = new THREE.Group()
    const pillar = () => rbox(0.18, 1.0, 0.24, 0.05, white)
    const p1 = pillar()
    const p2 = pillar()
    p1.position.set(GATE_X, top + 0.5, 0.42)
    p2.position.set(GATE_X, top + 0.5, 1.38)
    const beam = rbox(0.32, 0.2, 1.2, 0.06, white)
    beam.position.set(GATE_X, top + 1.05, 0.9)
    const scanMat = new THREE.MeshBasicMaterial({ color: C.teal, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false })
    const scan = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), scanMat)
    scan.rotation.y = Math.PI / 2
    scan.position.set(GATE_X, top + 0.5, 0.9)
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 1.0), new THREE.MeshBasicMaterial({ color: C.teal }))
    strip.position.set(GATE_X, top + 0.94, 0.9)
    gate.add(p1, p2, beam, scan, strip)
    add(gate)
    intro.push({ o: gate, at: 0.35, y: 0 })
    person(C.teal, 'stamp', GATE_X + 0.15, top, 1.85, Math.PI * 0.85)

    // apply tower at the end of the line
    const tower = add(rbox(1.0, 1.6, 1.0, 0.16, white))
    tower.position.set(3.9, top + 0.8, 3.55)
    const towerBand = add(rbox(1.02, 0.28, 1.02, 0.12, std(C.blue)))
    towerBand.position.set(3.9, top + 0.55, 3.55)
    const towerCap = add(rbox(0.7, 0.16, 0.7, 0.08, std(C.orange)))
    towerCap.position.set(3.9, top + 1.68, 3.55)
    intro.push({ o: tower, at: 0.4, y: tower.position.y }, { o: towerBand, at: 0.42, y: towerBand.position.y }, { o: towerCap, at: 0.44, y: towerCap.position.y })
    person(C.orange, 'push', 4.75, top, 3.0, -Math.PI * 0.7)

    /* companies (Contact) */
    const cTop = 0.4
    const BUILDINGS = [
      { x: 6.8, z: 2.4, h: 1.9, tint: C.blue },
      { x: 8.3, z: 2.6, h: 1.4, tint: C.teal },
      { x: 7.4, z: 4.2, h: 1.1, tint: C.orange },
    ]
    const buildings = BUILDINGS.map((b, i) => {
      const tex = windowsTex(b.tint)
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 })
      const m = add(new THREE.Mesh(new RoundedBoxGeometry(0.85, b.h, 0.85, 3, 0.06), [mat, mat, white, white, mat, mat]))
      m.position.set(b.x, cTop + b.h / 2, b.z)
      intro.push({ o: m, at: 0.5 + i * 0.06, y: m.position.y })
      return m
    })
    person(C.violet, 'phone', 8.6, cTop, 4.3, -Math.PI * 0.75)

    // dashed route from the tower to the companies
    const routePts = [new THREE.Vector3(3.9, top + 1.8, 3.55), new THREE.Vector3(5.6, 2.9, 3.2), new THREE.Vector3(6.8, cTop + 2.1, 2.4)]
    const route = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(routePts[0], routePts[1], routePts[2]).getPoints(40)),
      new THREE.LineDashedMaterial({ color: C.orange, dashSize: 0.14, gapSize: 0.1 }),
    )
    route.computeLineDistances()
    world.add(route)

    /* status board + courier on the main deck */
    const board = add(rbox(2.0, 1.5, 0.1, 0.08, white))
    board.position.set(-3.8, top + 1.1, 2.6)
    board.rotation.y = Math.PI / 4
    const boardFace = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 1.36), new THREE.MeshStandardMaterial({ map: boardTex(), roughness: 0.6 }))
    boardFace.position.z = 0.052
    board.add(boardFace)
    const stand = add(rbox(0.12, 0.6, 0.12, 0.04, std(C.line)))
    stand.position.set(-3.8, top + 0.3, 2.6)
    intro.push({ o: board, at: 0.5, y: board.position.y })
    const courier = person(C.blue, 'walk', -3.0, top, 1.6, 0)
    const carried = rbox(0.3, 0.22, 0.05, 0.02, std(C.orange)) // a folder in the courier's hand
    carried.castShadow = true
    courier.armR.add(carried)
    carried.position.set(0.02, -0.3, 0.1)

    /* ───────── more structure, glass and UI ───────── */
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1,
      thickness: 0.25,
      roughness: 0.26, // frosted
      ior: 1.32,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      attenuationColor: new THREE.Color(0xe9e3ff),
      attenuationDistance: 1.6,
      envMapIntensity: 1.2,
    })
    const clearGlass = glassMat.clone()
    clearGlass.roughness = 0.05
    clearGlass.thickness = 0.12

    /** frosted glass card with crisp UI printed on its face (glassmorphism) */
    const glassCard = (w: number, h: number, tex: THREE.Texture) => {
      const g = new THREE.Group()
      const pane = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.07, 4, 0.06), glassMat)
      pane.castShadow = true
      const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.92), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }))
      face.position.z = 0.042
      face.renderOrder = 2
      g.add(pane, face)
      return g
    }
    const facing = Math.PI / 4 // faces the iso camera

    // job board – frosted glass, standing at the back of the main deck
    const board2 = glassCard(3.1, 1.95, jobBoardTex())
    board2.position.set(2.6, top + 1.4, -2.75)
    board2.rotation.set(-0.06, facing, 0)
    add(board2)
    const boardFoot = add(rbox(1.2, 0.12, 0.4, 0.05, white))
    boardFoot.position.set(2.6, top + 0.06, -2.75)
    boardFoot.rotation.y = facing
    intro.push({ o: board2, at: 0.7, y: board2.position.y }, { o: boardFoot, at: 0.6, y: boardFoot.position.y })

    // verification queue card behind the gate
    const queue = glassCard(1.5, 1.1, queueTex())
    queue.position.set(2.85, top + 1.45, -0.55)
    queue.rotation.set(-0.08, facing, 0)
    add(queue)
    intro.push({ o: queue, at: 0.75, y: queue.position.y })

    // notifications card floating over the company deck
    const notif = glassCard(2.0, 1.35, notifTex())
    notif.position.set(7.3, 2.9, 0.1)
    notif.rotation.set(-0.05, facing, 0)
    add(notif)
    intro.push({ o: notif, at: 0.8, y: notif.position.y })

    // glass railings + partition on the builder deck, stairs down to the main deck
    for (const x of [-3.55, -2.25, -0.95]) {
      const r = add(rbox(1.2, 0.36, 0.035, 0.015, clearGlass))
      r.position.set(x, deckTop + 0.2, 0.32)
      const post = add(rbox(0.05, 0.42, 0.05, 0.02, white))
      post.position.set(x - 0.62, deckTop + 0.21, 0.32)
    }
    const side = add(rbox(0.035, 0.36, 3.1, 0.015, clearGlass))
    side.position.set(-4.27, deckTop + 0.2, -1.4)
    const part = add(rbox(0.035, 0.55, 0.8, 0.015, glassMat))
    part.position.set(-2.22, deckTop + 0.3, -0.45)
    for (let i = 0; i < 4; i++) {
      const hgt = 0.5 - i * 0.125
      const st = add(rbox(0.32, hgt, 1.0, 0.03, white))
      st.position.set(1.08 + i * 0.32, top + hgt / 2, -2.1)
    }

    // pipeline from the builder deck to the apply tower, with data packets flowing through it
    const pipeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.4, deckTop + 0.2, -2.6),
      new THREE.Vector3(0.9, deckTop + 1.5, -2.6),
      new THREE.Vector3(2.6, top + 2.7, -0.6),
      new THREE.Vector3(3.9, top + 2.6, 2.4),
      new THREE.Vector3(3.9, top + 1.75, 3.4),
    ])
    const pipe = add(new THREE.Mesh(new THREE.TubeGeometry(pipeCurve, 120, 0.13, 18, false), clearGlass))
    intro.push({ o: pipe, at: 0.55, y: 0 })
    for (const u of [0.0, 0.25, 0.55, 0.85, 1.0]) {
      const p = pipeCurve.getPointAt(u)
      const tng = pipeCurve.getTangentAt(u)
      const ring = add(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 24), std(C.orange)))
      ring.position.copy(p)
      ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tng)
    }
    const packets = Array.from({ length: 5 }, (_, i) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), new THREE.MeshBasicMaterial({ color: i % 2 ? C.teal : C.violet }))
      world.add(m)
      return m
    })

    // robotic arm lifting cards into the tower
    const arm = new THREE.Group()
    arm.position.set(4.55, top, 2.45)
    const armBase = rbox(0.42, 0.18, 0.42, 0.06, white)
    armBase.position.y = 0.09
    const seg1 = new THREE.Group()
    seg1.position.y = 0.18
    const s1 = rbox(0.14, 0.75, 0.14, 0.05, white)
    s1.position.y = 0.37
    const joint = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), std(C.blue))
    joint.position.y = 0.75
    const seg2 = new THREE.Group()
    seg2.position.y = 0.75
    const s2 = rbox(0.12, 0.6, 0.12, 0.05, white)
    s2.position.y = 0.28
    const claw = rbox(0.24, 0.06, 0.18, 0.03, std(C.orange))
    claw.position.y = 0.6
    seg2.add(s2, claw)
    seg1.add(s1, joint, seg2)
    arm.add(armBase, seg1)
    add(arm)
    intro.push({ o: arm, at: 0.5, y: 0 })

    // server racks with blinking lights
    const leds: THREE.MeshBasicMaterial[] = []
    for (const [x, z] of [[-4.2, 0.6], [-4.2, 1.15]] as const) {
      const rack = add(rbox(0.5, 1.15, 0.45, 0.06, white))
      rack.position.set(x, top + 0.58, z)
      for (let r = 0; r < 4; r++) {
        const mat = new THREE.MeshBasicMaterial({ color: r % 2 ? C.teal : C.blue })
        leds.push(mat)
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.28), mat)
        led.position.set(x + 0.255, top + 0.3 + r * 0.22, z)
        world.add(led)
      }
      intro.push({ o: rack, at: 0.4, y: rack.position.y })
    }

    // glass interview room with two people at a table
    const room = add(new THREE.Mesh(new RoundedBoxGeometry(1.9, 1.0, 1.35, 4, 0.08), clearGlass))
    room.position.set(-1.5, top + 0.5, 3.05)
    room.castShadow = false
    const roomFloor = add(rbox(1.95, 0.05, 1.4, 0.03, std(0xeef0ff)))
    roomFloor.position.set(-1.5, top + 0.025, 3.05)
    const table = add(rbox(0.7, 0.06, 0.5, 0.03, white))
    table.position.set(-1.5, top + 0.42, 3.05)
    const tleg = add(rbox(0.08, 0.4, 0.08, 0.03, std(C.line)))
    tleg.position.set(-1.5, top + 0.2, 3.05)
    intro.push({ o: room, at: 0.65, y: room.position.y })
    const sitter = (shirt: number, x: number, ry: number) => {
      const p = person(shirt, 'talk', x, top - 0.12, 3.05, ry)
      p.legL.rotation.x = -1.4
      p.legR.rotation.x = -1.4
      p.legL.position.z = 0.12
      p.legR.position.z = 0.12
      return p
    }
    sitter(C.teal, -2.05, Math.PI / 2)
    sitter(C.ink, -0.95, -Math.PI / 2)
    const toast = new THREE.Sprite(new THREE.SpriteMaterial({ map: toastTex(), transparent: true, depthTest: false }))
    toast.renderOrder = 10
    toast.scale.set(1.7, 0.42, 1)
    toast.userData.base = [1.7, 0.42]
    toast.position.set(-1.5, top + 1.55, 3.05)
    world.add(toast)
    intro.push({ o: toast, at: 1.2, y: toast.position.y })

    // trees on the company deck
    for (const [x, z, s] of [[6.25, 4.6, 1], [9.1, 4.75, 0.8], [6.3, 1.95, 0.7]] as const) {
      const trunk = add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.4 * s, 10), white))
      trunk.position.set(x, cTop + 0.2 * s, z)
      const crown = add(new THREE.Mesh(new THREE.SphereGeometry(0.32 * s, 24, 18), std(0xbfe6ea, { roughness: 0.4 })))
      crown.position.set(x, cTop + 0.4 * s + 0.26 * s, z)
      intro.push({ o: crown, at: 0.7, y: crown.position.y })
    }

    // glass chips orbiting the apply tower
    const chips = (['check', 'mail', 'phone'] as const).map((k, i) => {
      const g = new THREE.Group()
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.06, 32), glassMat)
      disc.rotation.x = Math.PI / 2
      const icon = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubbleTex(k, [C.green, C.orange, C.violet][i]), transparent: true, depthTest: false }))
      icon.scale.set(0.42, 0.42, 1)
      icon.renderOrder = 9
      g.add(disc, icon)
      world.add(g)
      return g
    })

    animators.push((T) => {
      board2.position.y = top + 1.4 + Math.sin(T * 0.9) * 0.05
      queue.position.y = top + 1.45 + Math.sin(T * 1.1 + 1) * 0.05
      notif.position.y = 2.9 + Math.sin(T * 0.8 + 2) * 0.07
      toast.position.y = top + 1.55 + Math.sin(T * 1.3) * 0.05
      packets.forEach((m, i) => m.position.copy(pipeCurve.getPointAt((T * 0.16 + i / packets.length) % 1)))
      // arm: lean down to the belt, lift up to the tower mouth
      const a = (Math.sin(T * 1.2) + 1) / 2
      seg1.rotation.z = 0.25 + a * 0.5
      seg2.rotation.z = -0.9 + a * 0.8
      arm.rotation.y = -0.6 + a * 0.9
      leds.forEach((m, i) => m.color.setHex(Math.sin(T * 3 + i * 1.7) > 0.2 ? (i % 2 ? C.teal : C.blue) : 0xc7cedb))
      chips.forEach((g, i) => {
        const ang = T * 0.6 + (i * Math.PI * 2) / chips.length
        g.position.set(3.9 + Math.cos(ang) * 1.05, top + 2.15 + Math.sin(T * 1.5 + i) * 0.08, 3.55 + Math.sin(ang) * 1.05)
        g.rotation.y = facing
      })
    })

    /* station labels */
    const label = (n: number, text: string, color: number, x: number, y: number, z: number) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex(n, text, color), depthTest: false, transparent: true }))
      s.scale.set(1.9, 0.475, 1)
      s.userData.base = [1.9, 0.475]
      s.position.set(x, y, z)
      s.renderOrder = 10
      world.add(s)
      intro.push({ o: s, at: 0.9 + n * 0.08, y })
      return s
    }
    label(1, 'Build resume', C.violet, -2.2, 2.75, -1.5)
    label(2, 'Verify', C.teal, GATE_X, 2.95, 0.9)
    label(3, 'Apply', C.blue, 3.9, 3.05, 3.55)
    label(4, 'Contact', C.orange, 7.6, 3.15, 3.2)

    /* moving things: cards on the belt, envelopes in flight, bubbles */
    const cardGeo = new THREE.BoxGeometry(0.46, 0.035, 0.33)
    const edge = std(C.white)
    const cardMat = new THREE.MeshStandardMaterial({ map: cardTex(false), roughness: 0.5 })
    const cardOk = new THREE.MeshStandardMaterial({ map: cardTex(true), roughness: 0.5 })
    const N = 6
    const cards = Array.from({ length: N }, () => {
      const m = new THREE.Mesh(cardGeo, [edge, edge, cardMat, edge, edge, edge])
      m.castShadow = true
      world.add(m)
      return m
    })
    const envMat = std(C.white)
    const envFlap = std(C.orange)
    const envelopes = Array.from({ length: 3 }, () => {
      const g = new THREE.Group()
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.24), envMat)
      const f = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.032, 0.08), envFlap)
      f.position.z = -0.08
      g.add(b, f)
      g.visible = false
      world.add(g)
      return { g, t: -1, target: 0 }
    })
    const bubbles = (['check', 'phone', 'mail'] as const).map((k, i) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubbleTex(k, [C.green, C.violet, C.orange][i]), transparent: true, depthTest: false }))
      s.renderOrder = 11
      s.scale.set(0, 0, 1)
      world.add(s)
      return { s, t: -1 }
    })
    const pop = (b: { s: THREE.Sprite; t: number }, pos: THREE.Vector3) => {
      b.s.position.copy(pos)
      b.t = 0
    }

    /* camera framing */
    const VIEW = 14.2 // world units shown vertically
    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      renderer.setSize(w, h, false)
      const a = w / h
      const v = a < 1.1 ? VIEW * 1.35 : VIEW
      Object.assign(camera, { left: (-v * a) / 2, right: (v * a) / 2, top: v / 2, bottom: -v / 2 })
      camera.setViewOffset(w, h, w > 900 ? -w * 0.235 : 0, w > 900 ? -h * 0.02 : 0, w, h)
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    // gentle parallax with the pointer
    let px = 0
    let py = 0
    const onMove = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth - 0.5) * 2
      py = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    /* loop */
    let raf = 0
    let last = performance.now()
    let time = 0
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)
    const easeOut = (x: number) => 1 - (1 - x) ** 3
    let launches = 0
    const gateU = (GATE_X - BELT[0].x) / beltLen

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
      last = now
      if (!visible) return
      time += reduce ? 0 : dt
      const T = reduce ? 99 : time

      // pop-in on load
      for (const it of intro) {
        const k = Math.min(1, Math.max(0, (T - it.at) / 0.55))
        const e = easeOut(k)
        const base = it.o.userData.base as [number, number] | undefined
        if (base) it.o.scale.set(base[0] * (0.001 + e), base[1] * (0.001 + e), 1)
        else it.o.scale.setScalar(0.001 + e * 0.999)
        if (!(it.o instanceof THREE.Sprite)) it.o.position.y = it.y + (1 - e) * 0.6
      }

      // belt texture flow
      beltTexs.forEach((t) => (t.offset.x -= dt * 0.9))
      scanMat.opacity = 0.18 + 0.12 * Math.sin(T * 4)

      // cards along the belt; verified after the gate; launched at the end
      cards.forEach((c, i) => {
        const raw = (T * 0.11 + i / N) % 1
        const u = raw
        const p = beltCurve.getPointAt(u)
        c.position.set(p.x, top + 0.11, p.z)
        c.rotation.y = u > (BELT[1].x - BELT[0].x) / beltLen ? Math.PI / 2 : 0
        const passed = u > gateU
        ;(c.material as THREE.Material[])[2] = passed ? cardOk : cardMat
        c.visible = T > 1.3 && u < 0.985
        // just crossed the gate → tick bubble over the gate
        const key = `g${i}`
        const flag = (c.userData[key] as boolean) ?? false
        if (passed && !flag && T > 1.3) pop(bubbles[0], new THREE.Vector3(GATE_X, top + 1.7, 0.9))
        c.userData[key] = passed
        // reached the tower → an envelope flies to the next company
        const endKey = 'end'
        const atEnd = u > 0.975
        if (atEnd && !c.userData[endKey] && T > 1.3) {
          const env = envelopes.find((e) => e.t < 0)
          if (env) {
            env.t = 0
            env.target = launches++ % BUILDINGS.length
            env.g.visible = true
          }
        }
        c.userData[endKey] = atEnd
      })

      envelopes.forEach((e) => {
        if (e.t < 0) return
        e.t += dt / 1.5
        const b = BUILDINGS[e.target]
        const a = new THREE.Vector3(3.9, top + 1.8, 3.55)
        const z = new THREE.Vector3(b.x, cTop + b.h + 0.15, b.z)
        const mid = a.clone().lerp(z, 0.5).add(new THREE.Vector3(0, 1.6, 0))
        const k = Math.min(1, e.t)
        const q = new THREE.QuadraticBezierCurve3(a, mid, z).getPoint(k)
        e.g.position.copy(q)
        e.g.rotation.y = T * 3
        if (k >= 1) {
          e.t = -1
          e.g.visible = false
          pop(bubbles[e.target % 2 === 0 ? 1 : 2], z.clone().add(new THREE.Vector3(0, 0.6, 0)))
        }
      })

      bubbles.forEach((b) => {
        if (b.t < 0) return
        b.t += dt
        const k = b.t < 0.25 ? b.t / 0.25 : b.t > 1.3 ? Math.max(0, 1 - (b.t - 1.3) / 0.3) : 1
        const s = 0.55 * (b.t < 0.25 ? easeOut(k) * 1.1 : k)
        b.s.scale.set(s, s, 1)
        b.s.position.y += dt * 0.25
        if (b.t > 1.6) b.t = -1
      })

      // people
      for (const { p, role, phase } of people) {
        const t = T * 1 + phase
        if (role === 'type') {
          p.armL.rotation.x = -1.1 + Math.sin(t * 14) * 0.18
          p.armR.rotation.x = -1.1 + Math.sin(t * 14 + 1.4) * 0.18
          p.body.rotation.x = 0.08
          p.body.position.y = Math.sin(t * 2) * 0.01
        } else if (role === 'stamp') {
          const s = Math.max(0, Math.sin(t * 3.2))
          p.armR.rotation.x = -0.4 - s * 1.4
          p.armL.rotation.x = -0.3
          p.body.rotation.x = s * 0.12
        } else if (role === 'push') {
          p.armR.rotation.x = -1.2 + Math.sin(t * 2.6) * 0.3
          p.body.position.y = Math.abs(Math.sin(t * 2.6)) * 0.02
        } else if (role === 'phone') {
          p.armR.rotation.x = -2.6
          p.armR.rotation.z = 0.5
          p.armL.rotation.x = Math.sin(t * 2) * 0.4 - 0.3
          p.body.rotation.y = Math.sin(t * 0.9) * 0.35
        } else if (role === 'talk') {
          // seated in the interview room, gesturing as they speak
          p.armL.rotation.x = -0.9 + Math.sin(t * 2.2) * 0.25
          p.armR.rotation.x = -0.7 + Math.sin(t * 1.7 + 1) * 0.3
          p.body.rotation.y = Math.sin(t * 0.8) * 0.12
        } else if (role === 'walk') {
          // stroll between the status board and the gate, carrying a folder
          const cyc = (t * 0.16) % 2
          const fwd = cyc < 1
          const k = fwd ? cyc : 2 - cyc
          const e = k * k * (3 - 2 * k)
          const ax = -3.0
          const az = 1.75
          const bx = 0.6
          const bz = 1.75
          p.root.position.set(ax + (bx - ax) * e, top, az + (bz - az) * e)
          p.root.rotation.y = fwd ? Math.PI / 2 : -Math.PI / 2
          const moving = k > 0.02 && k < 0.98
          const sw = moving ? Math.sin(t * 9) * 0.5 : 0
          p.legL.rotation.x = sw
          p.legR.rotation.x = -sw
          p.armL.rotation.x = -sw * 0.8
          p.armR.rotation.x = -0.9
          p.body.position.y = moving ? Math.abs(Math.sin(t * 9)) * 0.025 : 0
        }
      }

      animators.forEach((f) => f(T))

      // parallax
      world.rotation.y += ((px * 0.05) - world.rotation.y) * 0.05
      world.position.y += ((-py * 0.15) - world.position.y) * 0.05

      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      renderer.dispose()
      pmrem.dispose()
      env.dispose()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        const list = Array.isArray(mat) ? mat : mat ? [mat] : []
        list.forEach((x) => {
          ;(x as THREE.MeshStandardMaterial).map?.dispose()
          x.dispose()
        })
      })
      renderer.domElement.remove()
    }
  }, [])

  return (
    <section className="hero-factory" aria-label="Placement Portal IIT Bombay" data-chapter="Intro">
      <div ref={host} className="hb-canvas" aria-hidden="true" />
      <div className="ht-stage hf-stage">
        <div className="hero-copy ht-copy" style={{ left: 150, top: 300 }}>
          <div className="hero-logos hero-in" style={{ animationDelay: '0.05s' }}>
            <img src={asset('f1/iitb-logo.png')} alt="IIT Bombay logo" width={88} height={86} />
            <span className="hero-ipt">
              <img src={asset('f1/ipt-logo.png')} alt="iPt logo" width={62} height={62} />
            </span>
          </div>
          <h1 className="tx hero-title hero-in" style={{ animationDelay: '0.15s' }}>
            Placement Portal
          </h1>
          <p className="tx hero-sub hero-in" style={{ animationDelay: '0.28s' }}>
            IIT Bombay
          </p>
          <p className="tx hf-lede hero-in" style={{ animationDelay: '0.4s' }}>
            One line from resume to offer – built, verified, applied and followed up.
          </p>
        </div>
      </div>
    </section>
  )
}
