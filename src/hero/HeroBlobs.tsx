import { useEffect, useRef, type ReactNode } from 'react'
import { asset } from '../ui'

/* ───────────── tiny stroke icons ───────────── */
const PATHS = {
  home: 'M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z',
  jobs: 'M4 8h16v11H4z M9 8V6h6v2 M4 13h16',
  resume: 'M7 4h7l4 4v12H7z M14 4v4h4 M10 13h5 M10 16h5',
  companies: 'M5 20V5h9v15 M14 10h5v10 M8 8h3 M8 12h3 M8 16h3',
  activity: 'M3 12h4l2.5-6 4 12 2.5-6H21',
  settings:
    'M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1',
  search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14z M16.5 16.5 21 21',
  apply: 'M7 4h7l4 4v12H7z M14 4v4h4 M12.5 11v6 M9.5 14h6',
  track: 'M6 20v-6 M12 20V8 M18 20V4',
  chevron: 'M9 6l6 6-6 6',
}
function Icon({ name, size = 26 }: { name: keyof typeof PATHS; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}

const NAV: [string, keyof typeof PATHS][] = [
  ['Home', 'home'],
  ['Jobs', 'jobs'],
  ['Resume', 'resume'],
  ['Companies', 'companies'],
  ['Activity', 'activity'],
  ['Settings', 'settings'],
]

function Row({ icon, title, sub, active }: { icon: ReactNode; title: string; sub: string; active?: boolean }) {
  return (
    <div className={`glass-row${active ? ' is-active' : ''}`}>
      <span className="glass-row-icon">{icon}</span>
      <span className="glass-row-text">
        <span className="glass-row-title">{title}</span>
        <span className="glass-row-sub">{sub}</span>
      </span>
      <span className="glass-row-chev">
        <Icon name="chevron" size={22} />
      </span>
    </div>
  )
}

/**
 * Hero: title + logos, and a frosted-glass portal window tilted in 3D with felt blob
 * characters peeking over its top edge. Lives inside the 1728px design canvas.
 */
export default function Hero() {
  const root = useRef<HTMLDivElement>(null)
  const device = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)

  // 3D characters (Three.js is loaded on demand)
  useEffect(() => {
    let cancelled = false
    let dispose = () => {}
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scale = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s')) || 1
    import('./blobs')
      .then(({ createBlobScene }) => {
        if (cancelled) return
        dispose = createBlobScene(stage.current!, root.current!, { reducedMotion, scale })
      })
      .catch((e) => console.warn('Hero characters unavailable', e))
    return () => {
      cancelled = true
      dispose()
    }
  }, [])

  // window tilts toward the cursor
  useEffect(() => {
    const el = root.current!
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      device.current!.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
      device.current!.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
    }
    const onLeave = () => {
      device.current!.style.setProperty('--mx', '0')
      device.current!.style.setProperty('--my', '0')
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

      <div className="hero-device-wrap" style={{ left: 965, top: 330, width: 700, height: 560 }}>
        <div ref={device} className="hero-device">
          <div ref={stage} className="hero-blobs" />

          <div className="glass">
            <aside className="glass-side">
              <span className="glass-mark">
                <img src={asset('f1/ipt-logo.png')} alt="" width={30} height={30} />
              </span>
              <nav className="glass-nav" aria-label="Portal preview">
                {NAV.map(([label, icon], i) => (
                  <span key={label} className={`glass-nav-item${i === 0 ? ' is-active' : ''}`}>
                    <Icon name={icon} size={24} />
                    {label}
                  </span>
                ))}
              </nav>
            </aside>

            <div className="glass-main">
              <div className="glass-search">
                <Icon name="search" size={26} />
                What would you like to do?
              </div>
              <Row icon={<Icon name="apply" size={32} />} title="Apply to jobs" sub="Find roles that fit you" />
              <Row icon={<span className="mini-blob" />} title="Ask the team" sub="Answers from coordinators" active />
              <Row icon={<Icon name="track" size={32} />} title="Track applications" sub="See what's new" />
            </div>
          </div>

          <div className="glass-under" aria-hidden="true">
            <span>Upcoming drives</span>
            <i />
            <i />
          </div>
        </div>
      </div>
    </div>
  )
}
