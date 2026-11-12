import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Frame1 from './frames/Frame1'
import Frame2 from './frames/Frame2'
import Frame3 from './frames/Frame3'
import Nav from './Nav'
import { T } from './ui'
import { useScrollReveal } from './useScrollReveal'

/** Shown for Hiring Manager until that section is designed in Figma. */
function HiringManager() {
  return (
    <section className="frame" style={{ height: 520 }} aria-label="Hiring Manager">
      <div className="a" style={{ left: 150, top: 80, width: 1428, height: 360, borderRadius: 30, background: 'rgba(153,174,218,0.15)' }} />
      <T l={150} t={190} w={1428} s={48} wt={300} c="var(--n700)" center>Hiring Manager</T>
      <T l={150} t={270} w={1428} s={20} c="var(--n500)" center>This section is coming soon.</T>
    </section>
  )
}

/* Hash routes, so the built site works on any static host (no server rewrites needed). */
const ROUTES = {
  '': { title: 'Placement Portal · IIT Bombay', Page: Frame1 },
  student: { title: 'Students · Placement Portal IIT Bombay', Page: Frame2 },
  'placement-team': { title: 'Placement Team · Placement Portal IIT Bombay', Page: Frame3 },
  'hiring-manager': { title: 'Hiring Manager · Placement Portal IIT Bombay', Page: HiringManager },
} as const
type Route = keyof typeof ROUTES

const readRoute = (): Route => {
  const key = window.location.hash.replace(/^#\/?/, '')
  return key in ROUTES ? (key as Route) : ''
}

export default function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  const homeScroll = useRef(0)

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    const onHash = () => {
      setRoute((prev) => {
        if (prev === '') homeScroll.current = window.scrollY // remember where we left the home page
        return readRoute()
      })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Each page opens at its top (home returns to where you left it), before paint.
  useLayoutEffect(() => {
    document.title = ROUTES[route].title
    window.scrollTo(0, route === '' ? homeScroll.current : 0)
  }, [route])

  useScrollReveal(route)

  const { Page } = ROUTES[route]
  return (
    <>
      <Nav route={route} />
      <main className="page" key={route}>
        <Page />
      </main>
    </>
  )
}
