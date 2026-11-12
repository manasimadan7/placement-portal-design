import { useEffect, useId, useRef, useState } from 'react'

/**
 * Scroll-drawn arrow: the exported Figma arrow is revealed along its route as you scroll,
 * with a chevron riding at the tip toward the target. Scrolling back retracts it.
 *
 * Figma exports arrows as filled outlines, so the reveal is a stroked mask that follows the
 * arrow's route:
 *   • elbow connectors → pass `route` (points in the SVG's own coordinates, start → target)
 *   • dashed curves    → route is worked out from the dash pieces (start dot → … → arrowhead)
 */

type Pt = [number, number]
type Parsed = { w: number; h: number; d: string; fill: string; fillOpacity: number; route: Pt[] }

const cache = new Map<string, Promise<Parsed>>()

function load(src: string, route?: Pt[]): Promise<Parsed> {
  const key = src + (route ? JSON.stringify(route) : '')
  if (!cache.has(key)) {
    cache.set(
      key,
      fetch(src)
        .then((r) => r.text())
        .then((text) => {
          const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
          const svg = doc.querySelector('svg')!
          const path = doc.querySelector('path')!
          const [, , w, h] = (svg.getAttribute('viewBox') || '0 0 100 100').split(/\s+/).map(Number)
          const d = path.getAttribute('d') || ''
          return {
            w,
            h,
            d,
            fill: path.getAttribute('fill') || '#a6a6a6',
            fillOpacity: Number(path.getAttribute('fill-opacity') ?? 1),
            route: route ?? autoRoute(d),
          }
        }),
    )
  }
  return cache.get(key)!
}

/** Chain the dash pieces from the start dot to the arrowhead (Figma puts those two last). */
function autoRoute(d: string): Pt[] {
  const parts = d.split(/(?=M)/).filter((s) => s.trim())
  const ns = 'http://www.w3.org/2000/svg'
  const probe = document.createElementNS(ns, 'svg')
  probe.setAttribute('width', '0')
  probe.setAttribute('height', '0')
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none'
  document.body.appendChild(probe)
  const boxes = parts.map((p) => {
    const el = document.createElementNS(ns, 'path')
    el.setAttribute('d', p)
    probe.appendChild(el)
    return el.getBBox()
  })
  probe.remove()
  const c = (b: DOMRect): Pt => [b.x + b.width / 2, b.y + b.height / 2]
  const start = c(boxes[boxes.length - 2])
  const end = c(boxes[boxes.length - 1])
  const pending = boxes.slice(0, -2).filter((b) => Math.max(b.width, b.height) > 2).map(c)
  const route: Pt[] = [start]
  let cur = start
  while (pending.length) {
    let bi = 0
    let bd = Infinity
    pending.forEach((p, i) => {
      const dd = (p[0] - cur[0]) ** 2 + (p[1] - cur[1]) ** 2
      if (dd < bd) {
        bd = dd
        bi = i
      }
    })
    cur = pending.splice(bi, 1)[0]
    route.push(cur)
  }
  route.push(end)
  return route
}

function measure(route: Pt[]) {
  const seg: number[] = []
  let total = 0
  for (let i = 1; i < route.length; i++) {
    const l = Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1])
    seg.push(l)
    total += l
  }
  return { seg, total }
}

function pointAt(route: Pt[], seg: number[], total: number, t: number) {
  let dist = t * total
  for (let i = 0; i < seg.length; i++) {
    if (dist <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? Math.min(1, dist / seg[i]) : 0
      const [x0, y0] = route[i]
      const [x1, y1] = route[i + 1]
      return { x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k, a: Math.atan2(y1 - y0, x1 - x0) }
    }
    dist -= seg[i]
  }
  return { x: route[0][0], y: route[0][1], a: 0 }
}

type ArrowProps = {
  src: string
  l?: number
  t?: number
  w?: number
  h?: number
  /** Figma stroke-bleed inset, as for <Vec> */
  inset?: string
  /** elbow connectors: route in SVG coordinates, start → target */
  route?: Pt[]
  /** width of the reveal brush, in SVG units */
  brush?: number
  /** stroke width of the riding chevron */
  rider?: number
  /** size of the riding chevron (1 = 14 SVG units tall) */
  riderScale?: number
  /** start drawing when the arrow's START point is this far down the screen (fraction, default 0.95) */
  startAt?: number
  /** be fully drawn when the arrow's TARGET point is this far down the screen (fraction, default 0.7) */
  doneAt?: number
  /** play on its own (timed) once the start point reaches `startAt`, instead of following the scroll */
  auto?: boolean
  /** auto mode: draw time in ms */
  duration?: number
}

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)

export function Arrow({ src, l, t, w, h, inset, route, brush = 14, rider = 2.4, riderScale = 1, startAt = 0.95, doneAt = 0.7, auto = false, duration = 1100 }: ArrowProps) {
  const id = useId().replace(/:/g, '')
  const host = useRef<HTMLDivElement>(null)
  const brushRef = useRef<SVGPathElement>(null)
  const riderRef = useRef<SVGPathElement>(null)
  // invisible markers on the real start / target points, so timing follows the line itself
  // (not its bounding box), whatever rotation or zoom the arrow sits in
  const startMark = useRef<SVGCircleElement>(null)
  const endMark = useRef<SVGCircleElement>(null)
  const [data, setData] = useState<Parsed | null>(null)

  useEffect(() => {
    let alive = true
    load(src, route).then((p) => alive && setData(p))
    return () => {
      alive = false
    }
  }, [src, route])

  useEffect(() => {
    if (!data || !host.current) return
    const { seg, total } = measure(data.route)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let played = false
    const mid = (el: SVGCircleElement | null) => {
      const b = el!.getBoundingClientRect()
      return b.top + b.height / 2
    }
    const update = () => {
      raf = 0
      const vh = window.innerHeight
      // both points move up together as you scroll:
      //   untilStart – scroll left before the start point reaches `startAt`
      //   untilDone  – scroll left before the target point reaches `doneAt`
      const untilStart = mid(startMark.current) - vh * startAt
      if (auto) {
        // timed: fire once when the start point comes into view
        if (played) return
        if (reduce) return draw(untilStart <= 0 ? 1 : 0)
        if (untilStart > 0) return draw(0)
        played = true
        const t0 = performance.now()
        const tick = (now: number) => {
          const k = Math.min(1, (now - t0) / duration)
          draw(ease(k))
          if (k < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return
      }
      const untilDone = mid(endMark.current) - vh * doneAt
      const span = Math.max(untilDone - untilStart, vh * 0.35) // always leave some scroll to watch it draw
      draw(reduce ? 1 : Math.min(1, Math.max(0, -untilStart / span)))
    }
    const draw = (p: number) => {
      brushRef.current?.setAttribute('stroke-dashoffset', String(1 - p))
      const tip = pointAt(data.route, seg, total, p)
      const show = p > 0.02 && p < 0.97
      if (riderRef.current) {
        riderRef.current.setAttribute(
          'transform',
          `translate(${tip.x} ${tip.y}) rotate(${(tip.a * 180) / Math.PI}) scale(${riderScale})`,
        )
        riderRef.current.style.opacity = show ? '1' : '0'
      }
    }
    const onScroll = () => {
      if (!raf && !(auto && played)) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [data, riderScale, startAt, doneAt, auto, duration])

  const pts = data?.route.map((p) => p.join(' ')).join(' L ')
  const svg = data && (
    <svg className="vec" viewBox={`0 0 ${data.w} ${data.h}`} preserveAspectRatio="none" overflow="visible" aria-hidden="true">
      <defs>
        <mask id={`m${id}`} maskUnits="userSpaceOnUse" x={-60} y={-60} width={data.w + 120} height={data.h + 120}>
          <path
            ref={brushRef}
            d={`M ${pts}`}
            fill="none"
            stroke="#fff"
            strokeWidth={brush}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1}
          />
        </mask>
      </defs>
      <path d={data.d} fill={data.fill} fillOpacity={data.fillOpacity} mask={`url(#m${id})`} />
      <circle ref={startMark} cx={data.route[0][0]} cy={data.route[0][1]} r={0.5} fill="none" />
      <circle ref={endMark} cx={data.route[data.route.length - 1][0]} cy={data.route[data.route.length - 1][1]} r={0.5} fill="none" />
      <path
        ref={riderRef}
        d="M -7 -6 L 0 0 L -7 6"
        fill="none"
        stroke={data.fill}
        strokeOpacity={Math.min(1, data.fillOpacity + 0.2)}
        strokeWidth={rider / riderScale}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0, transition: 'opacity .2s' }}
      />
    </svg>
  )

  const body = inset ? (
    <div className="a" style={{ inset }}>
      {svg}
    </div>
  ) : (
    svg
  )
  return (
    <div ref={host} className="a" style={l !== undefined ? { left: l, top: t, width: w, height: h } : { inset: 0 }}>
      {body}
    </div>
  )
}
