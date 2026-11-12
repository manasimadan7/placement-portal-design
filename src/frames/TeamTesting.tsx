import { useEffect, useRef, useState } from 'react'
import { Chapter } from '../ui'

/**
 * Placement Team – user testing of the V1 prototype (N = 10 coordinators).
 * Circle charts (participants, completion, SUS), a line chart (time on task vs target)
 * and a bar graph (legacy vs V1 time) – all hover-interactive, animated in on scroll.
 */

const VIOLET = '#6457cf'
const TEAL = '#43aec4'
const CORAL = '#e0784a'
const GREY = '#a3a6ad'

/* ── data (placement_team_user_testing_results) ── */
const ROLES = [
  { name: 'Outreach leads', n: 4, c: VIOLET },
  { name: 'Resume verification leads', n: 3, c: TEAL },
  { name: 'Schedule & logistics leads', n: 3, c: CORAL },
]

/* tasks are named after the V1 prototype flows they were tested on */
const TASKS = [
  { id: 'A', name: 'Updating dialogue', full: 'Updating dialogue with a company', target: 3.5, result: 1.8, note: 'Live collision pop-ups prevented 100% of duplicate company contacts.' },
  { id: 'B', name: 'Verifying a resume', full: 'Verifying a resume', target: 5.0, result: 2.2, note: 'Batch mode cut per-pointer verification time by 56%.' },
  { id: 'C', name: 'Checking progress', full: 'Checking progress status', target: 4.0, result: 1.4, note: 'Stage changes showed up live – no timeline sheet to update by hand.' },
]

const MODULES = [
  {
    name: 'Updating dialogue with a company',
    legacy: 12, v1: 1.8, unit: 'min', legacyLabel: '12 min (spreadsheet)', v1Label: '1.8 min',
    ok: 10, feedback: 'Loved the live indicator showing when a teammate is viewing or emailing the same POC.',
  },
  {
    name: 'Verifying a resume',
    legacy: 8, v1: 2.2, unit: 'min / student', legacyLabel: '8 min / student', v1Label: '2.2 min',
    ok: 9, feedback: 'Side-by-side pointer + proof viewer removed tab-switching fatigue. 1 miss: a misidentified proof.',
  },
  {
    name: 'Updating company records',
    legacy: 45, v1: 0, unit: 'min / day', legacyLabel: '45 min / day', v1Label: 'automated',
    ok: 10, feedback: 'The auto-generated timeline replaced personal WhatsApp histories as the record.',
  },
]


/* ── helpers ── */
function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, on] as const
}

function useCount(to: number, on: boolean, ms = 1400) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!on) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setV(to)
    let raf = 0
    const t0 = performance.now()
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms)
      setV(to * (1 - Math.pow(1 - k, 3)))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [to, on, ms])
  return v
}

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}
const annulus = (cx: number, cy: number, R: number, r: number, a0: number, a1: number) => {
  const big = a1 - a0 > 180 ? 1 : 0
  const [x0, y0] = polar(cx, cy, R, a0)
  const [x1, y1] = polar(cx, cy, R, a1)
  const [x2, y2] = polar(cx, cy, r, a1)
  const [x3, y3] = polar(cx, cy, r, a0)
  return `M${x0} ${y0} A${R} ${R} 0 ${big} 1 ${x1} ${y1} L${x2} ${y2} A${r} ${r} 0 ${big} 0 ${x3} ${y3} Z`
}
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const [x0, y0] = polar(cx, cy, r, a0)
  const [x1, y1] = polar(cx, cy, r, a1)
  return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`
}

/* ── 1. participants donut: one segment per coordinator ── */
function Participants({ on }: { on: boolean }) {
  const [hot, setHot] = useState<number | null>(null)
  const segs: { role: number; i: number }[] = []
  ROLES.forEach((r, role) => {
    for (let k = 0; k < r.n; k++) segs.push({ role, i: segs.length })
  })
  const per = 360 / segs.length
  const r = hot === null ? null : ROLES[hot]
  return (
    <div className="ut-card ut-parts" onPointerLeave={() => setHot(null)}>
      <h4>Who tested it</h4>
      <div className="ut-parts-body">
        <svg viewBox="0 0 220 220" width={220} height={220} role="img" aria-label="10 coordinators: 4 outreach, 3 verification, 3 schedule and logistics leads">
          {segs.map((s) => (
            <path
              key={s.i}
              d={annulus(110, 110, 100, 70, s.i * per + 2, (s.i + 1) * per - 2)}
              fill={ROLES[s.role].c}
              className={`ut-seg${hot !== null && hot !== s.role ? ' dim' : ''}${hot === s.role ? ' hot' : ''}`}
              style={{ transitionDelay: on ? `${s.i * 70}ms` : '0ms', opacity: on ? undefined : 0 }}
              onPointerEnter={() => setHot(s.role)}
            />
          ))}
          <text x={110} y={108} textAnchor="middle" className="ut-big">{r ? r.n : 10}</text>
          <text x={110} y={134} textAnchor="middle" className="ut-small">{r ? (r.n === 1 ? 'coordinator' : 'coordinators') : 'coordinators'}</text>
        </svg>
        <ul className="ut-legend">
          {ROLES.map((ro, i) => (
            <li key={ro.name} className={hot === i ? 'hot' : ''} onPointerEnter={() => setHot(i)} tabIndex={0} onFocus={() => setHot(i)} onBlur={() => setHot(null)}>
              <i style={{ background: ro.c }} />
              <span>{ro.name}</span>
              <b>{ro.n}</b>
            </li>
          ))}
          <li className="ut-legend-meta">45-min task-based sessions + SUS questionnaire</li>
        </ul>
      </div>
    </div>
  )
}

/* ── 2. completion ring ── */
function Completion({ on }: { on: boolean }) {
  const [hot, setHot] = useState(false)
  const v = useCount(92, on)
  const C = 2 * Math.PI * 78
  const [tx0, ty0] = polar(100, 100, 62, 0.85 * 360)
  const [tx1, ty1] = polar(100, 100, 96, 0.85 * 360)
  return (
    <div className="ut-card ut-ring" onPointerEnter={() => setHot(true)} onPointerLeave={() => setHot(false)} tabIndex={0} onFocus={() => setHot(true)} onBlur={() => setHot(false)}>
      <h4>Task completion</h4>
      <svg viewBox="0 0 200 200" width={200} height={200} role="img" aria-label="Overall task completion 92 percent, target above 85 percent">
        <circle cx={100} cy={100} r={78} className="ut-track" />
        <circle
          cx={100} cy={100} r={78}
          className="ut-prog"
          stroke={VIOLET}
          strokeDasharray={C}
          strokeDashoffset={on ? C * (1 - 0.92) : C}
          transform="rotate(-90 100 100)"
        />
        <line x1={tx0} y1={ty0} x2={tx1} y2={ty1} className="ut-tick" />
        <text x={100} y={106} textAnchor="middle" className="ut-big">{Math.round(v)}%</text>
        <text x={100} y={130} textAnchor="middle" className="ut-small">overall</text>
      </svg>
      <p className={`ut-ring-note${hot ? ' hot' : ''}`}>
        {hot ? <>Target &gt;85% · <b>+7 pts</b> above. Minor friction only on edge-case dispute resolution.</> : <>Target &gt;85% <span className="ut-tick-key" /></>}
      </p>
    </div>
  )
}

/* ── 3. SUS gauge ── */
function Sus({ on }: { on: boolean }) {
  const [hot, setHot] = useState(false)
  const v = useCount(84.5, on)
  const A0 = -120
  const A1 = 120
  const at = (x: number) => A0 + ((A1 - A0) * x) / 100
  const len = (2 * Math.PI * 78 * (A1 - A0)) / 360
  const [tx0, ty0] = polar(100, 104, 62, at(75))
  const [tx1, ty1] = polar(100, 104, 96, at(75))
  return (
    <div className="ut-card ut-ring" onPointerEnter={() => setHot(true)} onPointerLeave={() => setHot(false)} tabIndex={0} onFocus={() => setHot(true)} onBlur={() => setHot(false)}>
      <h4>System Usability Scale</h4>
      <svg viewBox="0 0 200 200" width={200} height={200} role="img" aria-label="SUS score 84.5 out of 100, target above 75">
        <path d={arc(100, 104, 78, A0, A1)} className="ut-track" />
        <path d={arc(100, 104, 78, at(80), A1)} className="ut-zone" />
        <path
          d={arc(100, 104, 78, A0, A1)}
          className="ut-prog"
          stroke={TEAL}
          strokeDasharray={len}
          strokeDashoffset={on ? len * (1 - 0.845) : len}
        />
        <line x1={tx0} y1={ty0} x2={tx1} y2={ty1} className="ut-tick" />
        <text x={100} y={110} textAnchor="middle" className="ut-big">{v.toFixed(1)}</text>
        <text x={100} y={134} textAnchor="middle" className="ut-small">out of 100</text>
        <text x={34} y={190} textAnchor="middle" className="ut-axis">0</text>
        <text x={166} y={190} textAnchor="middle" className="ut-axis">100</text>
      </svg>
      <p className={`ut-ring-note${hot ? ' hot' : ''}`}>
        {hot ? <>Target &gt;75 · scores above <b>80</b> (shaded) mean high usability and a strong fit for the team.</> : <>Target &gt;75 <span className="ut-tick-key" /></>}
      </p>
    </div>
  )
}

/* ── 4. line chart: time on task vs target ── */
const LW = 760
const LH = 400
const X0 = 110
const X1 = 610
const Y0 = 330 // 0 min
const Y1 = 40 // 6 min
const lx = TASKS.map((_, i) => X0 + ((X1 - X0) * i) / (TASKS.length - 1))
const ly = (v: number) => Y0 - ((Y0 - Y1) * v) / 6
const lpath = (k: 'target' | 'result') => TASKS.map((t, i) => `${i ? 'L' : 'M'}${lx[i]} ${ly(t[k])}`).join(' ')
const lband = `${lpath('target')} ${[...TASKS].reverse().map((t, j) => `L${lx[TASKS.length - 1 - j]} ${ly(t.result)}`).join(' ')} Z`

function TimeOnTask({ on }: { on: boolean }) {
  const [hot, setHot] = useState<number | null>(null)
  const tk = hot === null ? null : TASKS[hot]
  return (
    <div className={`ut-card ut-line${on ? ' on' : ''}`} onPointerLeave={() => setHot(null)}>
      <h4>Time on task <small>minutes · lower is better</small></h4>
      <div className="ut-key">
        <span><i className="dash" />Target ceiling</span>
        <span><i style={{ borderColor: VIOLET }} />V1 result</span>
      </div>
      <svg viewBox={`0 0 ${LW} ${LH}`} width={LW} height={LH} role="img" aria-label="Minutes per task: target versus V1 result for outreach, verification and scheduling">
        {[0, 2, 4, 6].map((m) => (
          <g key={m}>
            <line x1={X0 - 40} x2={X1 + 40} y1={ly(m)} y2={ly(m)} className="ut-grid" />
            <text x={X0 - 52} y={ly(m) + 4} textAnchor="end" className="ut-axis">{m}m</text>
          </g>
        ))}
        <defs>
          <clipPath id="ut-reveal">
            <rect className="ut-reveal" x={X0 - 14} y={0} width={X1 - X0 + 28} height={LH} />
          </clipPath>
        </defs>
        <path d={lband} className="ut-band" />
        {hot !== null && <line x1={lx[hot]} x2={lx[hot]} y1={Y1 - 10} y2={Y0} className="ut-cross" />}
        <g clipPath="url(#ut-reveal)">
          <path d={lpath('target')} className="ut-ln target" />
          <path d={lpath('result')} className="ut-ln result" stroke={VIOLET} />
        </g>
        {TASKS.map((t, i) => (
          <g key={t.id} className={`ut-pt${hot === i ? ' hot' : ''}`} style={{ transitionDelay: `${0.6 + i * 0.15}s` }}>
            <circle cx={lx[i]} cy={ly(t.target)} r={6} className="ut-dot target" />
            <circle cx={lx[i]} cy={ly(t.result)} r={6.5} className="ut-dot result" fill={VIOLET} />
            <text x={lx[i]} y={ly(t.result) + 26} textAnchor="middle" className="ut-val">{t.result}m</text>
            <text x={lx[i]} y={Y0 + 30} textAnchor="middle" className="ut-axis task">
              {t.name}
            </text>
            <rect x={lx[i] - 120} y={Y1 - 24} width={240} height={Y0 - Y1 + 64} className="ut-hit" onPointerEnter={() => setHot(i)} />
          </g>
        ))}
        <text x={X1 + 18} y={ly(TASKS[2].target) + 4} className="ut-series">Target</text>
        <text x={X1 + 18} y={ly(TASKS[2].result) + 4} className="ut-series">V1</text>
      </svg>
      {tk && hot !== null && (
        <div className="ut-tip" style={{ left: hot === TASKS.length - 1 ? lx[hot] - 250 : lx[hot] + 26, top: 84 + ly(tk.target) * 0.6 }} role="status">
          <b>{tk.full}</b>
          <span><i className="dash" />Target: under {tk.target} min</span>
          <span><i style={{ borderColor: VIOLET }} />V1: {tk.result} min</span>
          <em>{Math.round((1 - tk.result / tk.target) * 100)}% under target</em>
          <small>{tk.note}</small>
        </div>
      )}
    </div>
  )
}

/* ── 5. bar graph: legacy vs V1 time, with success dots ── */
const BMAX = 45
const BW = 330
function Before({ on }: { on: boolean }) {
  const [hot, setHot] = useState(0)
  const m = MODULES[hot]
  return (
    <div className={`ut-card ut-bars${on ? ' on' : ''}`}>
      <h4>Legacy vs V1 <small>time per job</small></h4>
      <div className="ut-key">
        <span><i className="sq legacy" />Legacy process</span>
        <span><i className="sq" style={{ background: VIOLET }} />V1 portal</span>
      </div>
      <ul className="ut-bar-list">
        {MODULES.map((mo, i) => (
          <li key={mo.name} className={hot === i ? 'hot' : ''} onPointerEnter={() => setHot(i)} tabIndex={0} onFocus={() => setHot(i)}>
            <div className="ut-bar-h">
              <span>{mo.name}</span>
              <span className="ut-dots" aria-label={`${mo.ok} of 10 completed`}>
                {Array.from({ length: 10 }, (_, k) => <i key={k} className={k < mo.ok ? 'ok' : ''} />)}
              </span>
            </div>
            <div className="ut-bar-row">
              <div className="ut-bar legacy" style={{ width: (BW * mo.legacy) / BMAX, transitionDelay: `${i * 0.12}s` }} />
              <em>{mo.legacyLabel}</em>
            </div>
            <div className="ut-bar-row">
              {mo.v1 > 0 ? (
                <div className="ut-bar" style={{ width: Math.max(6, (BW * mo.v1) / BMAX), background: VIOLET, transitionDelay: `${0.3 + i * 0.12}s` }} />
              ) : (
                <div className="ut-bar auto" />
              )}
              <em className="v1">{mo.v1Label}</em>
            </div>
          </li>
        ))}
      </ul>
      <div className="ut-detail" role="status">
        <b>{m.ok}/10 completed without help</b>
        <span>{m.feedback}</span>
      </div>
    </div>
  )
}

export default function TeamTesting() {
  const [r1, on1] = useInView<HTMLDivElement>(0.3)
  const [r2, on2] = useInView<HTMLDivElement>(0.3)
  return (
    <section className="frame ut-frame" style={{ height: 1180 }} aria-label="Placement Team – user testing of the V1 prototype" data-noreveal>
      <Chapter t={40} name="User testing" />
      <div className="ut-glow" aria-hidden="true">
        <i style={{ left: 120, top: 260, background: VIOLET }} />
        <i style={{ left: 1180, top: 380, background: TEAL }} />
        <i style={{ left: 640, top: 900, background: CORAL }} />
      </div>
      <div className="ut a" style={{ left: 134, top: 60, width: 1460 }}>
        <header className="ut-head">
          <h3>
            Putting <span>V1</span> in front of the placement team
          </h3>
          <p className="ut-lede">10 coordinators ran 4 live tests on the V1 prototype – checking progress status, updating dialogue with a company, updating company records and verifying a resume.</p>
        </header>

        <div ref={r1} className="ut-row ut-row1">
          <Participants on={on1} />
          <Completion on={on1} />
          <Sus on={on1} />
        </div>

        <div ref={r2} className="ut-row ut-row2">
          <TimeOnTask on={on2} />
          <Before on={on2} />
        </div>

      </div>
    </section>
  )
}
