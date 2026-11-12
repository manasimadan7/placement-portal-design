import { useEffect, useState, type CSSProperties } from 'react'
import { asset } from './ui'

const LINKS = [
  { route: 'student', label: 'Student', dot: '#43aec4' },
  { route: 'placement-team', label: 'Placement Team', dot: '#7759b8' },
  { route: 'hiring-manager', label: 'Hiring Manager', dot: '#999eda' },
] as const

type Chap = { name: string; top: number }

/** In-page chapters: every `[data-chapter]` marker on the current page, with its document offset. */
function useChapters(route: string) {
  const [chaps, setChaps] = useState<Chap[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    let raf = 0
    let list: Chap[] = []
    const measure = () => {
      list = [...document.querySelectorAll<HTMLElement>('main [data-chapter]')]
        .map((n) => ({ name: n.dataset.chapter!, top: n.getBoundingClientRect().top + window.scrollY }))
        .sort((a, b) => a.top - b.top)
      setChaps(list)
      track()
    }
    const track = () => {
      raf = 0
      const y = window.scrollY + window.innerHeight * 0.35
      let k = 0
      list.forEach((c, i) => {
        if (c.top <= y) k = i
      })
      setActive(k)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(track)
    }
    // measure once the page has laid out (and again when images/fonts settle)
    const t1 = window.setTimeout(measure, 60)
    const t2 = window.setTimeout(measure, 900)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [route])

  return { chaps, active }
}

/** Fixed left rail: home + the three counterparts (current one highlighted) + clickable in-page section indicators. */
export default function Nav({ route }: { route: string }) {
  const { chaps, active } = useChapters(route)
  const jump = (c: Chap) => window.scrollTo({ top: Math.max(0, c.top - 24), behavior: 'smooth' })

  const indicators = chaps.length > 1 && (
    <span className="nav-chaps" role="group" aria-label="Sections on this page">
      <span className="nav-chaps-dots">
        {chaps.map((c, k) => (
          <button
            key={`${c.name}-${k}`}
            type="button"
            className={`nav-chap${k === active ? ' on' : k < active ? ' done' : ''}`}
            aria-label={`Go to ${c.name}`}
            aria-current={k === active ? 'location' : undefined}
            onClick={() => jump(c)}
          >
            <span className="nav-chap-tip" title={c.name}>{c.name}</span>
          </button>
        ))}
      </span>
      <span className="nav-chaps-name" aria-live="polite">
        {chaps[active]?.name}
      </span>
    </span>
  )

  return (
    <header className="nav" role="banner">
      <nav className="nav-bar" aria-label="Sections">
        <a className={`nav-home${route === '' ? ' is-active' : ''}`} href="#/" aria-label="Home – Placement Portal IIT Bombay">
          <span className="nav-mark">
            <img src={asset('f1/ipt-logo.png')} alt="" width={22} height={22} />
          </span>
          <span className="nav-home-label">Placement Portal</span>
        </a>
        {route === '' && indicators}
        <span className="nav-sep" aria-hidden="true" />
        {LINKS.map((l) => {
          const active = route === l.route
          return (
            <span key={l.route} className="nav-item">
              <a
                href={`#/${l.route}`}
                className={`nav-link${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
                style={{ '--dot': l.dot } as CSSProperties}
              >
                <i aria-hidden="true" />
                <span>{l.label}</span>
              </a>
              {active && indicators}
            </span>
          )
        })}
      </nav>
    </header>
  )
}
