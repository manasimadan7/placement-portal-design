import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { asset } from '../ui'

/*
 * Hero: title + logos, and a 3D "Placement Command Center":
 *   • a dashboard panel with live-counting stats
 *   • a ring of glass cards (the counterparts + the drive's key steps) orbiting the panel;
 *     it pauses when you hover a card, and the three counterpart cards open their pages
 *   • a floating "Placement Workflow" card with flowing connector lines
 *   • the whole scene leans toward the cursor
 * Built with CSS 3D (preserve-3d), so cards really pass in front of and behind the panel.
 */

type RingCard = { lines: string[]; href?: string; blob?: string; icon?: keyof typeof ICONS }

const RING: RingCard[] = [
  { lines: ['Student'], href: '#/student', blob: '#43aec4' },
  { lines: ['Resume', 'Verified'], icon: 'resume' },
  { lines: ['Placement', 'Team'], href: '#/placement-team', blob: '#7759b8' },
  { lines: ['Interview', 'Slots'], icon: 'calendar' },
  { lines: ['Hiring', 'Manager'], href: '#/hiring-manager', blob: '#85bfce' },
  { lines: ['Offers', 'Rolled out'], icon: 'offer' },
  { lines: ['Job', 'Applications'], icon: 'jobs' },
  { lines: ['Company', 'Outreach'], icon: 'outreach' },
]
const RADIUS = 400
const STEP = 360 / RING.length

const ICONS = {
  resume: 'M7 4h7l4 4v12H7z M14 4v4h4 M10 13l1.6 1.6L15 11',
  calendar: 'M5 6h14v14H5z M5 10h14 M9 4v4 M15 4v4 M9 14h2 M13 14h2 M9 17h2',
  offer: 'M12 4l2.3 4.7 5.2.8-3.8 3.6.9 5.1L12 15.8 7.4 18.2l.9-5.1L4.5 9.5l5.2-.8z',
  jobs: 'M4 8h16v11H4z M9 8V6h6v2 M4 13h16',
  outreach: 'M4 12h9 M9 7l5 5-5 5 M17 5v14',
  check: 'M5 12.5l4.2 4.2L19 7',
  doc: 'M7 4h7l4 4v12H7z M14 4v4h4',
  send: 'M4 12l16-7-7 16-2-7z',
  chat: 'M5 6h14v10H9l-4 3z',
}
function Icon({ name, size = 30 }: { name: keyof typeof ICONS; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

/** Counts up to `to` once, shortly after load. */
function useCountUp(to: number, delay = 500, ms = 1600) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setV(to)
      return
    }
    let raf = 0
    const t0 = performance.now() + delay
    const tick = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - t0) / ms))
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, delay, ms])
  return v
}

function Stat({ label, value, delay }: { label: string; value: number; delay: number }) {
  const v = useCountUp(value, delay)
  return (
    <div className="cc-stat">
      <span className="cc-stat-label">{label}</span>
      <span className="cc-stat-value">{v.toLocaleString('en-US')}</span>
    </div>
  )
}

const Sparkle = ({ size, style }: { size: number; style: CSSProperties }) => (
  <svg className="cc-sparkle" width={size} height={size} viewBox="0 0 40 40" style={style} aria-hidden="true">
    <defs>
      <linearGradient id="spk" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#b9a4ff" />
        <stop offset="1" stopColor="#6f76ca" />
      </linearGradient>
    </defs>
    <path d="M20 0C21.5 11 29 18.5 40 20 29 21.5 21.5 29 20 40 18.5 29 11 21.5 0 20 11 18.5 18.5 11 20 0z" fill="url(#spk)" />
  </svg>
)

export default function Hero() {
  const root = useRef<HTMLDivElement>(null)
  const world = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  // ring orbit: slows to a stop while a card is hovered
  useEffect(() => {
    const el = ring.current!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let angle = -STEP / 2
    let speed = reduce ? 0 : 9 // deg / s
    let hovering = false
    let raf = 0
    let last = performance.now()
    const set = () => (el.style.transform = `rotateX(-10deg) rotateZ(-6deg) rotateY(${angle.toFixed(2)}deg)`)
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const target = reduce || hovering ? 0 : 9
      speed += (target - speed) * Math.min(1, dt * 4)
      angle -= speed * dt
      set()
      raf = requestAnimationFrame(tick)
    }
    set()
    if (!reduce) raf = requestAnimationFrame(tick)
    const over = (e: PointerEvent) => (hovering = !!(e.target as Element).closest('.cc-card'))
    const out = () => (hovering = false)
    el.addEventListener('pointerover', over)
    el.addEventListener('pointerleave', out)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointerover', over)
      el.removeEventListener('pointerleave', out)
    }
  }, [])

  // the scene leans toward the cursor
  useEffect(() => {
    const el = root.current!
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      world.current!.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
      world.current!.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
    }
    const onLeave = () => {
      world.current!.style.setProperty('--mx', '0')
      world.current!.style.setProperty('--my', '0')
    }
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={root} className="a hero" data-noreveal style={{ left: 0, top: 0, width: 1728, height: 1000 }}>
      <div className="hero-wash" aria-hidden="true" />

      <div className="hero-copy" style={{ left: 150, top: 330 }}>
        <div className="hero-logos hero-in" style={{ animationDelay: '0.05s' }}>
          <img src={asset('f1/iitb-logo.png')} alt="IIT Bombay logo" width={88} height={86} />
          <span className="hero-ipt">
            <img src={asset('f1/ipt-logo.png')} alt="iPt logo" width={62} height={62} />
          </span>
        </div>
        <h1 className="tx hero-title hero-in" style={{ animationDelay: '0.15s' }}>Placement Portal</h1>
        <p className="tx hero-sub hero-in" style={{ animationDelay: '0.28s' }}>IIT Bombay</p>
      </div>

      <Sparkle size={64} style={{ left: 1560, top: 150, animationDelay: '0s' }} />
      <Sparkle size={34} style={{ left: 1640, top: 112, animationDelay: '-1.4s' }} />

      <div className="cc-scene" style={{ left: 880, top: 70, width: 820, height: 880 }}>
        <div ref={world} className="cc-world">
          {/* dashboard */}
          <div className="cc-panel">
            <div className="cc-head">
              <span className="cc-title">Placement Command Center</span>
              <span className="cc-pill">Season 2026</span>
            </div>
            <div className="cc-stats">
              <Stat label="Students registered" value={2037} delay={500} />
              <Stat label="Companies onboarded" value={312} delay={650} />
              <Stat label="Offers made" value={1184} delay={800} />
            </div>
            <div className="cc-grid">
              <div className="cc-box">
                <span className="cc-box-title">Placement rate</span>
                <div className="cc-donut" style={{ '--p': 86 } as CSSProperties}>
                  <span>
                    <small>Overall</small>86%
                  </span>
                </div>
              </div>
              <div className="cc-box">
                <span className="cc-box-title">Top recruiters</span>
                {[
                  ['Day 1 slots', 'High'],
                  ['Core companies', 'High'],
                  ['Startups', 'Medium'],
                  ['Consulting', 'Medium'],
                ].map(([name, level]) => (
                  <div key={name} className="cc-list-row">
                    <i />
                    <span>{name}</span>
                    <b className={level === 'High' ? 'hi' : 'mid'}>{level}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ring of glass cards */}
          <div ref={ring} className="cc-ring">
            {RING.map((c, i) => {
              const Tag = c.href ? 'a' : 'div'
              return (
                <Tag
                  key={c.lines.join(' ')}
                  className={`cc-card${c.href ? ' is-link' : ''}`}
                  style={{ '--a': `${i * STEP}deg`, '--r': `${RADIUS}px` } as CSSProperties}
                  {...(c.href ? { href: c.href, 'aria-label': `Open ${c.lines.join(' ')}` } : {})}
                >
                  <span className="cc-face">
                    <span className="cc-ava">
                      {c.blob ? <span className="cc-blob" style={{ '--c': c.blob } as CSSProperties} /> : <Icon name={c.icon!} size={34} />}
                    </span>
                    <span className="cc-label">
                      {c.lines.map((l) => (
                        <span key={l}>{l}</span>
                      ))}
                    </span>
                  </span>
                  <span className="cc-back" />
                </Tag>
              )
            })}
          </div>

          {/* floating workflow card */}
          <div className="cc-flow">
            <span className="cc-flow-title">Placement Workflow</span>
            {[
              ['doc', 'Resume', 'Verified'],
              ['send', 'Applications', 'Open'],
              ['chat', 'Interviews', 'Scheduled'],
            ].map(([icon, label, state], i) => (
              <div key={label} className="cc-flow-row" style={{ top: 60 + i * 84 }}>
                <span className="cc-flow-icon">
                  <Icon name={icon as keyof typeof ICONS} size={26} />
                </span>
                <span className="cc-flow-label">{label}</span>
                <span className="cc-flow-state">{state}</span>
                <i className="cc-flow-dot" />
              </div>
            ))}
            {/* connectors leave each row on the right and loop into the next (row centres: 92 / 176 / 260) */}
            <svg className="cc-flow-lines" width="160" height="300" viewBox="0 0 160 300" aria-hidden="true">
              <path d="M0 92 H70 Q90 92 90 112 V156 Q90 176 70 176 H40" />
              <path d="M0 176 H110 Q130 176 130 196 V240 Q130 260 110 260 H40" />
              <path className="chev" d="M54 168 l-8 8 8 8 M66 168 l-8 8 8 8" />
              <path className="chev" d="M54 252 l-8 8 8 8 M66 252 l-8 8 8 8" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
