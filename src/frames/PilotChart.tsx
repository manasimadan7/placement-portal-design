import { useEffect, useRef, useState } from 'react'

/**
 * Pilot study / user testing — time-trial results as a line graph.
 * Two series across the three core student tasks: previous portal (dashed, hollow markers)
 * vs. redesigned portal (solid, filled markers); the band between them is the time saved.
 * Hovering a task (in the chart or in the list) shows its details.
 * Data from the Figma table (381:20618 › Frame 19).
 */

type Task = { name: string; short: [string, string]; prev: number; next: number; failed?: boolean }

const TASKS: Task[] = [
  { name: 'Find job description & stipend', short: ['Find JD &', 'stipend'], prev: 40, next: 18 },
  { name: 'Check application status', short: ['Check', 'status'], prev: 80, next: 37, failed: true },
  { name: 'Submit resume with proof', short: ['Submit resume', 'with proof'], prev: 45, next: 22 },
]

const PREV = '#8b8f99'
const NEXT = '#5084a4'

// chart geometry (design px inside the 744×307 card)
const W = 456
const H = 307
const X0 = 70
const X1 = 376
const Y0 = 232 // 0 s
const Y1 = 34 // 90 s
const MAX = 90
const xs = TASKS.map((_, i) => X0 + ((X1 - X0) * i) / (TASKS.length - 1))
const y = (v: number) => Y0 - ((Y0 - Y1) * v) / MAX
const line = (k: 'prev' | 'next') => TASKS.map((t, i) => `${i ? 'L' : 'M'} ${xs[i]} ${y(t[k])}`).join(' ')
const band = `${line('prev')} ${[...TASKS].reverse().map((t, j) => `L ${xs[TASKS.length - 1 - j]} ${y(t.next)}`).join(' ')} Z`

const saved = (t: Task) => (t.failed ? null : Math.round(((t.prev - t.next) / t.prev) * 100))

export function PilotChart({ l, t }: { l: number; t: number }) {
  const [hot, setHot] = useState<number | null>(null)
  const [shown, setShown] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShown(true), io.disconnect()), { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const tip = hot === null ? null : TASKS[hot]

  return (
    <div ref={root} className={`pilot a${shown ? ' shown' : ''}`} style={{ left: l, top: t, width: 744, height: 307 }} onPointerLeave={() => setHot(null)}>
      {/* ── line graph ── */}
      <svg className="pilot-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Task completion time in seconds, previous portal versus redesigned portal">
        {/* recessive grid + y labels */}
        {[0, 30, 60, 90].map((v) => (
          <g key={v}>
            <line x1={X0 - 28} x2={X1 + 26} y1={y(v)} y2={y(v)} className="pilot-grid" />
            <text x={X0 - 36} y={y(v) + 4} className="pilot-axis" textAnchor="end">{v}s</text>
          </g>
        ))}

        <defs>
          <clipPath id="pilot-reveal">
            <rect className="pilot-reveal" x={X0 - 12} y={0} width={X1 - X0 + 24} height={H} />
          </clipPath>
        </defs>

        <path d={band} className="pilot-band" />

        {/* crosshair */}
        {hot !== null && <line x1={xs[hot]} x2={xs[hot]} y1={Y1 - 10} y2={Y0} className="pilot-cross" />}

        {/* lines draw in left → right */}
        <g clipPath="url(#pilot-reveal)">
          <path d={line('prev')} className="pilot-line prev" />
          <path d={line('next')} className="pilot-line next" />
        </g>

        {TASKS.map((tk, i) => (
          <g key={tk.name} className={`pilot-pt${hot === i ? ' hot' : ''}`} style={{ transitionDelay: `${0.5 + i * 0.15}s` }}>
            <circle cx={xs[i]} cy={y(tk.prev)} r={6.5} className="pilot-dot prev" />
            {tk.failed && (
              <text x={xs[i]} y={y(tk.prev) - 14} className="pilot-fail" textAnchor="middle">failed</text>
            )}
            <circle cx={xs[i]} cy={y(tk.next)} r={6.5} className="pilot-dot next" />
            <text x={xs[i]} y={Y0 + 26} className="pilot-axis task" textAnchor="middle">
              <tspan x={xs[i]}>{tk.short[0]}</tspan>
              <tspan x={xs[i]} dy={17}>{tk.short[1]}</tspan>
            </text>
            {/* generous hit target per task column */}
            <rect x={xs[i] - 70} y={Y1 - 20} width={140} height={Y0 - Y1 + 70} className="pilot-hit" onPointerEnter={() => setHot(i)} onFocus={() => setHot(i)} />
          </g>
        ))}

        {/* direct series labels at the right end */}
        <text x={X1 + 14} y={y(TASKS[2].prev) + 4} className="pilot-series" fill="currentColor">Previous</text>
        <text x={X1 + 14} y={y(TASKS[2].next) + 4} className="pilot-series" fill="currentColor">Redesign</text>
      </svg>

      {/* legend */}
      <div className="pilot-legend" aria-hidden="true">
        <span><i className="prev" />Previous portal</span>
        <span><i className="next" />Redesigned portal</span>
      </div>

      {/* tooltip */}
      {tip && hot !== null && (
        <div className="pilot-tip" style={{ left: hot === TASKS.length - 1 ? xs[hot] - 228 : xs[hot] + 18, top: Math.max(8, y(tip.prev) - 10) }} role="status">
          <b>{tip.name}</b>
          <span><i className="prev" />Previous: {tip.failed ? `failed – finishers needed ${tip.prev}s+` : `${tip.prev}s`}</span>
          <span><i className="next" />Redesign: {tip.next}s</span>
          <em>{tip.failed ? 'Task became completable' : `${tip.prev - tip.next}s faster (−${saved(tip)}%)`}</em>
        </div>
      )}

      {/* time saved — doubles as the table view */}
      <ul className="pilot-list" aria-label="Time saved per task">
        <li className="pilot-list-h" aria-hidden="true">Time saved</li>
        {TASKS.map((tk, i) => (
          <li key={tk.name} className={hot === i ? 'hot' : ''} onPointerEnter={() => setHot(i)} tabIndex={0} onFocus={() => setHot(i)} onBlur={() => setHot(null)}>
            <strong>{tk.failed ? '✓' : `−${saved(tk)}%`}</strong>
            <span>
              {tk.name}
              <small>{tk.failed ? `failed → ${tk.next}s` : `${tk.prev}s → ${tk.next}s`}</small>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
