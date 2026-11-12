import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { asset } from '../ui'

/** Screen-space box in Figma px of a 1728×1117 MacBook frame: [x, y, w, h]. */
type Box = readonly [number, number, number, number]
type Pt = readonly [number, number]

export type Step = {
  /** file in /assets/v1 (without .png) */
  screen: string
  caption: string
  /** where the cursor ends up (it passes through `via` first, e.g. for a drag) */
  cursor: Pt
  via?: readonly Pt[]
  /** show a click ripple when the cursor lands */
  click?: boolean
  /** spotlight ring around what matters on this step */
  focus?: Box
  /** camera zoom region (omit = whole screen) */
  zoom?: Box
  /** text typed into a box once the cursor lands */
  type?: { box: Box; text: string; size?: number; bg?: string; wrap?: boolean }
  /** names of prototype `masks` to keep painted over the screen on this step (they fade out when dropped) */
  hide?: string[]
  /** extra visual under the caption in the side panel */
  aside?: ReactNode
  /** open on the whole screen first, then zoom into `zoom` */
  wideFirst?: boolean
}

/** Patches that paint over part of a screen (e.g. a popup that should only appear on a later step). */
export type Masks = Record<string, { box: Box; bg: string; r?: string }[]>

const MOVE = 700 // ms per cursor leg
const MAX_Z = 2.6
const WIDE_HOLD = 1300 // ms a `wideFirst` step shows the full screen before zooming

function camera(zoom: Box | undefined, SW: number, SH: number) {
  if (!zoom) return { z: 1, tx: 0, ty: 0 }
  const [x, y, w, h] = zoom
  const z = Math.min(MAX_Z, SW / w, SH / h)
  const cx = x + w / 2
  const cy = y + h / 2
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
  return { z, tx: clamp(SW / 2 - z * cx, SW - SW * z, 0), ty: clamp(SH / 2 - z * cy, SH - SH * z, 0) }
}

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Click-through prototype of V1 screens: screens cross-fade, a cursor glides to
 * the hotspot (and clicks / types), a spotlight marks it and the camera zooms in
 * where the detail matters. Prev / Next (or ← →) steps through.
 */
export function Prototype({ l, t, w, h, steps: flow, label, intro, dir = 'tv1', theme, masks, overlay, sw: SW = 1728, sh: SH = 1117, layout = 'side' }: {
  l: number
  t: number
  w: number
  h: number
  steps: Step[]
  label: string
  dir?: string
  theme?: 'teal'
  masks?: Masks
  /** live UI drawn over the screen in screen coordinates (walkthrough step index – -1 on the overview – and whether the cursor has landed) */
  overlay?: (step: number, landed: boolean) => ReactNode
  /** step 0 caption – the name of the page the prototype opens on */
  intro?: string
  /** screen size in design px (default: 1728×1117 MacBook frame) */
  sw?: number
  sh?: number
  /** 'side' = narration beside the screen · 'stacked' = full-width screen, narration bar underneath */
  layout?: 'side' | 'stacked' | 'center'
}) {
  const [i, setI] = useState(0)
  const [awake, setAwake] = useState(false) // first step plays once it scrolls into view
  const [cur, setCur] = useState<Pt>([SW * 0.62, SH * 0.78])
  const [clickKey, setClickKey] = useState(0)
  const [typed, setTyped] = useState('')
  const [landed, setLanded] = useState(false)
  const [wide, setWide] = useState(false) // `wideFirst` steps open on the whole screen, then zoom in
  const root = useRef<HTMLDivElement>(null)

  // step 0 is always the whole first screen, no zoom or spotlight – the walkthrough starts at 1
  const steps = useMemo<Step[]>(
    () => [{ screen: flow[0].screen, caption: intro ?? 'Overview', cursor: [SW * 0.62, SH * 0.78] }, ...flow],
    [flow, intro, SW, SH],
  )
  const step = steps[i]
  const screens = [...new Set(steps.map((s) => s.screen))]

  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setAwake(true), io.disconnect()), { threshold: 0.45 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // choreography for the current step: cursor legs → land → click / type
  // (layout effect, so a `wideFirst` step never paints one zoomed frame before its hold)
  useLayoutEffect(() => {
    if (!awake) return
    const timers: number[] = []
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms))
    const quick = reduced()
    const legs = [...(step.via ?? []), step.cursor]
    setLanded(false)
    setTyped('')
    // hold the full screen for a beat, then let the camera zoom in before the cursor moves
    const hold = step.wideFirst && !quick ? WIDE_HOLD : 0
    setWide(hold > 0)
    if (hold) at(hold, () => setWide(false))
    const t0 = hold ? hold + 500 : 120
    legs.forEach((p, k) => at(quick ? 0 : t0 + k * MOVE, () => setCur(p)))
    const land = quick ? 0 : t0 + legs.length * MOVE
    at(land, () => {
      setLanded(true)
      if (step.click) setClickKey((n) => n + 1)
    })
    if (step.type) {
      const txt = step.type.text
      if (quick) at(0, () => setTyped(txt))
      else for (let c = 1; c <= txt.length; c++) at(land + 250 + c * 38, () => setTyped(txt.slice(0, c)))
    }
    return () => timers.forEach(clearTimeout)
  }, [i, awake, step])

  const go = (d: number) => setI((n) => (n + d + steps.length) % steps.length)
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') (e.preventDefault(), go(1))
    if (e.key === 'ArrowLeft' && i > 0) (e.preventDefault(), go(-1))
  }

  const { z, tx, ty } = camera(wide || (!awake && step.wideFirst) ? undefined : step.zoom, SW, SH)
  const last = i === steps.length - 1
  const stacked = layout === 'stacked'
  const centered = layout === 'center' // e.g. a phone: screen in the middle of the slot, narration to its right
  const vpW = stacked ? w - 48 : Math.round(((h - 48) * SW) / SH)
  const vpH = stacked ? Math.round((vpW * SH) / SW) : h - 48
  const fit = vpW / SW
  const vpL = centered ? Math.round((w - vpW) / 2) : 24

  return (
    <div className={`proto a${theme ? ` ${theme}` : ''}${stacked ? ' stacked' : ''}`} ref={root} style={{ left: l, top: t, width: w, height: h }} onKeyDown={onKey} role="group" aria-roledescription="prototype" aria-label={label}>
      {/* the screen */}
      <div className="proto-vp" style={{ left: vpL, width: vpW, height: vpH }}>
        <div className="proto-fit" style={{ scale: String(fit), width: SW, height: SH }}>
          <div className="proto-cam" style={{ '--z': z, '--cs': (0.966 / fit).toFixed(3), transform: `translate(${tx}px, ${ty}px) scale(${z})` } as CSSProperties}>
            {screens.map((s) => (
              <img key={s} className={`proto-shot${s === step.screen ? ' on' : ''}`} src={asset(`${dir}/${s}.png`)} alt="" width={SW} height={SH} style={{ width: SW, height: SH }} loading="lazy" decoding="async" draggable={false} />
            ))}

            {masks &&
              Object.entries(masks).map(([name, parts]) => (
                <div key={name} className={`proto-mask${step.hide?.includes(name) ? ' on' : ''}`} aria-hidden="true">
                  {parts.map((p, k) => (
                    <i key={k} style={box(p.box, { background: p.bg, borderRadius: p.r })} />
                  ))}
                </div>
              ))}

            {awake && overlay?.(i - 1, i > 0 && landed)}

            {step.type && (
              <div className={`proto-type${step.type.wrap ? ' wrap' : ''}`} style={box(step.type.box, { fontSize: step.type.size ?? 15, background: step.type.bg })} aria-hidden="true">
                {typed}
                <i className={landed ? 'blink' : ''} />
              </div>
            )}

            {step.focus && (
              <button
                type="button"
                className={`proto-focus${landed ? ' on' : ''}${step.click ? ' hot' : ''}`}
                style={box(step.focus)}
                onClick={() => step.click && !last && go(1)}
                tabIndex={-1}
                aria-hidden="true"
              />
            )}

            {clickKey > 0 && <span key={clickKey} className="proto-ripple" style={{ left: cur[0], top: cur[1] }} />}

            <svg className="proto-cursor" style={{ translate: `${cur[0]}px ${cur[1]}px` }} width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 2.2 20 11.4l-7.6 1.9 4.3 7.7-3 1.6-4.3-7.7L4.2 20Z" fill="#1c1630" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* narration + controls */}
      <div className={`proto-side${stacked ? ' stacked' : ''}`} style={stacked ? { left: 24, top: vpH + 48, width: w - 48, bottom: 24 } : { left: vpL + vpW + 48, width: w - vpL - vpW - 48 - 40 }}>
        <div className="proto-count" aria-hidden="true">
          <b>{String(i).padStart(2, '0')}</b> / {String(steps.length - 1).padStart(2, '0')}
        </div>
        <p key={i} className="proto-cap" aria-live="polite">
          {step.caption}
        </p>
        {step.aside && (
          <div key={`a${i}`} className="proto-aside">
            {step.aside}
          </div>
        )}
        <div className="proto-dots" role="tablist" aria-label="Steps">
          {steps.map((_, k) => (
            <button key={k} type="button" role="tab" aria-selected={k === i} aria-label={k ? `Step ${k}` : 'Overview'} className={k === i ? 'on' : k < i ? 'done' : ''} onClick={() => setI(k)} />
          ))}
        </div>
        <div className="proto-ctrl">
          <button type="button" className="proto-btn" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous step">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Prev
          </button>
          <button type="button" className="proto-btn primary" onClick={() => go(1)} aria-label={last ? 'Restart prototype' : 'Next step'}>
            {last ? 'Restart' : 'Next'}
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              {last ? (
                <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

const box = ([x, y, w, h]: Box, extra?: CSSProperties): CSSProperties => ({ left: x, top: y, width: w, height: h, ...extra })

/* ───────────── the four V1 tasks (coordinates in Figma frame px, 1728×1117) ─────────────
   Screens come only from the V1 TEAM section (131:507), in /assets/tv1:
   home (133:651) · My companies mc1–mc4 (139:1349/1522/1750/1902) · pipeline rev1–rev3
   (139:2340/2678/3016) · All companies ac1–ac7 (139:3600 … 139:4456) · Resume rv1–rv3
   (133:909, 148:1267, 194:1666). */

export const PROGRESS_STEPS: Step[] = [
  {
    screen: 'home',
    caption: 'The coordinator lands on a home page built around their own pipeline – no spreadsheets to open.',
    cursor: [600, 250],
    focus: [194, 114, 646, 244],
  },
  {
    screen: 'home',
    caption: 'Dynamic allotment shows how many companies sit at each stage, so progress is readable in one glance.',
    cursor: [430, 448],
    focus: [194, 387, 642, 106],
    zoom: [170, 330, 700, 420],
  },
  {
    screen: 'home',
    caption: 'Four rings track what still needs work – uncontacted companies, IAFs filled, self-allotment and resumes verified.',
    cursor: [612, 640],
    focus: [200, 548, 640, 180],
    zoom: [170, 470, 700, 330],
  },
  {
    screen: 'home',
    caption: 'Notes surface the next follow-up for each company, right where the day starts.',
    cursor: [690, 930],
    focus: [218, 836, 594, 182],
    zoom: [180, 740, 700, 330],
  },
  {
    screen: 'home',
    caption: 'To see where every company stands, open My Companies.',
    cursor: [1653, 174],
    click: true,
    focus: [1632, 152, 44, 44],
    zoom: [1180, 110, 520, 300],
  },
  {
    screen: 'mc1',
    caption: 'All my companies in one grid. Switch to the pipeline view to answer “where am I in the journey of conversion?”',
    cursor: [1655, 140],
    click: true,
    focus: [1631, 115, 48, 48],
    zoom: [1180, 90, 540, 300],
  },
  {
    screen: 'rev1',
    caption: 'The pipeline lays the conversion journey out as stages – Contacted → IAF Filled → IAF Opened → IAF Closed → Shortlist.',
    cursor: [700, 320],
    focus: [193, 256, 1535, 100],
  },
  {
    screen: 'rev2',
    caption: 'Scroll along to the end of the funnel – interviews conducted and selections out.',
    via: [[650, 1081]],
    cursor: [1250, 1081],
    focus: [1050, 256, 640, 800],
  },
  {
    screen: 'rev3',
    caption: 'Clicking a company opens its timeline and remarks beneath the pipeline – context without leaving the board.',
    via: [[900, 1081], [252, 506]],
    cursor: [252, 506],
    click: true,
    focus: [193, 742, 1502, 342],
    zoom: [190, 730, 1510, 360],
  },
]

export const DIALOGUE_STEPS: Step[] = [
  {
    screen: 'mc1',
    caption: 'From My Companies, switch to the list view.',
    cursor: [1588, 140],
    click: true,
    focus: [1565, 115, 46, 46],
    zoom: [1180, 90, 540, 300],
  },
  {
    screen: 'mc2',
    caption: 'The list puts the latest update from every company on one line, with its stage and quick actions.',
    cursor: [1130, 470],
    focus: [237, 318, 1301, 430],
  },
  {
    screen: 'mc2',
    caption: 'Filter down to the companies you are actively talking to – Contacted.',
    cursor: [316, 252],
    click: true,
    focus: [257, 231, 140, 42],
    zoom: [200, 190, 800, 300],
  },
  {
    screen: 'mc3',
    caption: 'Only contacted companies remain. Expand Accenture to open its dialogue log.',
    cursor: [1481, 579],
    click: true,
    focus: [237, 526, 1301, 106],
    zoom: [220, 300, 1330, 460],
  },
  {
    screen: 'mc4',
    caption: 'Every exchange is logged against a date – nobody has to dig through chats to know what was said.',
    cursor: [730, 690],
    focus: [383, 582, 440, 180],
    zoom: [330, 530, 760, 300],
  },
  {
    screen: 'mc4',
    caption: 'Add today’s update in one line. It is timestamped and visible to the whole team instantly.',
    cursor: [670, 792],
    click: true,
    focus: [514, 776, 303, 32],
    zoom: [360, 692, 620, 160],
    type: { box: [520, 779, 294, 26], text: 'HR shared the JD – IAF due Friday', size: 14 },
  },
]

export const RECORDS_STEPS: Step[] = [
  {
    screen: 'ac1',
    caption: 'All Companies holds every recruiter the cell has ever worked with – not just the ones assigned to you.',
    cursor: [311, 145],
    focus: [202, 126, 218, 38],
    zoom: [180, 100, 760, 300],
  },
  {
    screen: 'ac1',
    caption: 'Switch to the list view to see each company’s latest status.',
    cursor: [1588, 140],
    click: true,
    focus: [1565, 115, 46, 46],
    zoom: [1180, 90, 540, 300],
  },
  {
    screen: 'ac2',
    caption: 'Open Accenture to see its records.',
    cursor: [468, 882],
    click: true,
    focus: [237, 856, 1301, 106],
    zoom: [220, 640, 1330, 400],
  },
  {
    screen: 'ac3',
    caption: 'The company page shows year-on-year hiring, last season’s dialogue log and the key notes that applied.',
    cursor: [760, 440],
    focus: [212, 320, 1472, 236],
  },
  {
    screen: 'ac3',
    caption: 'Starting a new season? Pick the year from the drop-down.',
    cursor: [358, 676],
    click: true,
    focus: [265, 652, 126, 48],
    zoom: [230, 610, 700, 400],
  },
  {
    screen: 'ac4',
    caption: 'Every past season is one click away – no handover documents when coordinators change.',
    cursor: [314, 676],
    click: true,
    focus: [262, 648, 140, 256],
    zoom: [230, 610, 700, 400],
  },
  {
    screen: 'ac5',
    caption: 'Key notes for 2026 come pre-filled with last year’s eligibility criteria, ready to edit.',
    cursor: [790, 790],
    click: true,
    focus: [767, 768, 849, 164],
    zoom: [740, 640, 900, 380],
  },
  {
    screen: 'ac6',
    caption: 'Update selections, slot and criteria, then save.',
    cursor: [1554, 947],
    click: true,
    focus: [1501, 925, 107, 44],
    zoom: [740, 640, 900, 380],
  },
  {
    screen: 'ac7',
    caption: 'The 2026 season joins the hiring history straight away – the next coordinator inherits it all.',
    cursor: [1656, 470],
    focus: [1630, 386, 56, 175],
    zoom: [880, 250, 848, 380],
  },
]

export const RESUME_STEPS: Step[] = [
  {
    screen: 'rv1',
    caption: 'Resume verification starts from the coordinator’s list of assigned students.',
    cursor: [229, 257],
    click: true,
    focus: [161, 241, 131, 32],
    zoom: [130, 60, 820, 520],
  },
  {
    screen: 'rv1',
    caption: 'Every resume point carries three actions – verify, view its proof, give feedback.',
    cursor: [926, 320],
    focus: [908, 268, 36, 100],
    zoom: [350, 220, 700, 330],
  },
  {
    screen: 'rv3',
    caption: 'Opening the proof loads it right beside the resume, labelled with the point it belongs to – no switching between PDFs and the portal.',
    cursor: [1124, 274],
    click: true,
    focus: [1036, 237, 639, 820],
  },
  {
    screen: 'rv3',
    caption: 'Proof checks out? A single tick verifies the point.',
    cursor: [926, 287],
    click: true,
    focus: [911, 272, 30, 30],
    zoom: [350, 220, 700, 330],
  },
  {
    screen: 'rv2',
    caption: 'Something missing? Leave feedback on the document itself instead of chasing the student separately.',
    cursor: [1478, 269],
    click: true,
    focus: [1464, 293, 190, 226],
    zoom: [1030, 230, 680, 320],
    type: { box: [1484, 338, 150, 60], text: 'Need more than acceptance letter , attach emals', size: 12.5, bg: '#f8f4fb', wrap: true },
  },
  {
    screen: 'rv2',
    caption: 'The counter tracks how many of the 150 assigned resumes are done, so progress is never a guess.',
    cursor: [1622, 90],
    focus: [1572, 60, 103, 60],
    zoom: [1180, 30, 548, 300],
  },
]

