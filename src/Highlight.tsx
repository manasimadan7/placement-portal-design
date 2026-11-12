import { useEffect, useRef, type CSSProperties } from 'react'

/**
 * Marker-style highlight that sweeps in from the left as it scrolls up the screen
 * (and retracts when scrolling back). Positioned in design-canvas units.
 */
export function Highlight({
  l, t, w, h, color, style,
  from = 0.85, // starts when its top is at 85% of the viewport …
  to = 0.5, // … fully drawn by the time it reaches the middle
}: {
  l: number; t: number; w: number; h: number; color: string; style?: CSSProperties; from?: number; to?: number
}) {
  const host = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const update = () => {
      raf = 0
      const r = host.current!.getBoundingClientRect()
      const vh = window.innerHeight
      const p = reduce ? 1 : Math.min(1, Math.max(0, (vh * from - r.top) / (vh * (from - to))))
      bar.current!.style.transform = `scaleX(${p.toFixed(4)})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [from, to])

  return (
    <div ref={host} className="a" style={{ left: l, top: t, width: w, height: h, ...style }} aria-hidden="true">
      <div ref={bar} className="hl-bar" style={{ background: color }} />
    </div>
  )
}
