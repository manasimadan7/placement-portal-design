import { useEffect, useState } from 'react'
import { asset } from '../ui'
import type { Step } from './Prototype'

/*
 * Student V2 · resume submission prototype.
 * Screens are captures of the working student app (localhost:5174, laptop mode, 1728×1117 @2x)
 * in /assets/sv2/app-*.png – its layout matches the Figma frames (468:3837, 469:3915) pixel for pixel,
 * so coordinates below are Figma frame px. Two things are drawn live over the screens:
 *   • Microsoft's submitted documents as removable chips (Figma 323:17394 pattern)
 *   • the proof-check agent popup, with its shimmer "checking" state
 */

/* ── small icons ── */
const Upload = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 15V4m0 0-4.5 4.5M12 4l4.5 4.5M4.5 15.5V19a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Tick = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path d="m4.5 12.5 4.8 4.8L19.5 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Cross = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
)
const Mail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#636363" d="M20 8.5V18H4V8l8 5 4.2-2.6a4.5 4.5 0 0 1-1.1-1.6L12 10.8 4 6h10.1a4.5 4.5 0 0 1 .3-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7.9a4.4 4.4 0 0 1-2 .6Z" />
    <circle cx="19" cy="5" r="3" fill="#636363" />
  </svg>
)

/** a submitted document (Figma 323:17394 pattern: "PDF | NAME" pill, with a remove ✕ segment instead of download) */
export function DocChip({ name, l, t, w, mini }: { name: string; l?: number; t?: number; w?: number; mini?: boolean }) {
  return (
    <span className={`docchip${mini ? ' mini' : ''}`} style={l !== undefined ? { position: 'absolute', left: l, top: t, width: w } : undefined}>
      <span className="docchip-name">PDF | {name}</span>
      <span className="docchip-x" title="Remove document">
        <Cross size={mini ? 11 : 14} />
      </span>
    </span>
  )
}

/* ── Microsoft's proof, submitted: multiple documents as removable chips (replaces the ✓ Proof button) ── */
function MicrosoftSubmitted({ dy = 0 }: { dy?: number }) {
  const y = (v: number) => v + dy
  return (
    <>
      <i className="sv2-patch" style={{ left: 200, top: y(398), width: 676, height: 110 }} />
      <div className="sv2-field" style={{ left: 225, top: y(405), width: 629, height: 32 }}>
        <Mail />
        <span>xzy.microsoft.com</span>
      </div>
      <DocChip name="OFFER LETTER" l={225} t={y(452)} w={196} />
      <DocChip name="COMPLETION CERTIFICATE" l={431} t={y(452)} w={262} />
      <span className="docchip-add" style={{ left: 703, top: y(452) }} title="Add another document">
        +
      </span>
      <span className="sv2-done" style={{ left: 747, top: y(452) }}>
        <Tick size={15} /> Submitted
      </span>
    </>
  )
}

/* ── the proof-check agent popup: shimmer "checking" state that resolves into the advice ── */
function AgentPopup({ resolveAfter }: { resolveAfter?: number }) {
  const [done, setDone] = useState(!resolveAfter)
  useEffect(() => {
    if (!resolveAfter) return
    const id = window.setTimeout(() => setDone(true), resolveAfter)
    return () => clearTimeout(id)
  }, [resolveAfter])

  return (
    <div className={`sv2-agent${done ? ' done' : ''}`} style={{ left: 864, top: 714, width: 308, height: 269 }} aria-hidden="true">
      <div className="sv2-agent-head">
        <img className="sv2-orb" src={asset('sv2/agent.svg')} alt="" />
        <span className="sv2-agent-meta">
          <span className="sv2-agent-title">Proof check</span>
          <span className="sv2-agent-status">{done ? 'Needs attention' : 'Checking your upload…'}</span>
        </span>
      </div>

      {done ? (
        <div className="sv2-agent-body">
          <p>
            Proof seems inadequate. For a <em>corporate internship</em>, try submitting:
          </p>
          <ul>
            <li>offer letter</li>
            <li>acceptance mail</li>
            <li>certificate</li>
          </ul>
        </div>
      ) : (
        <div className="sv2-agent-body loading">
          <p>Reading amazon_internship.pdf</p>
          <i style={{ width: '92%' }} />
          <i style={{ width: '78%' }} />
          <i style={{ width: '86%' }} />
          <i style={{ width: '54%' }} />
        </div>
      )}

      <div className="sv2-agent-actions">
        <span className="primary" style={{ left: 26, width: 108 }}>Reupload</span>
        <span style={{ left: 141, width: 141 }}>Submit Anyway</span>
      </div>
    </div>
  )
}

/* ── side-panel visual for step 1: how the proof button evolved ── */
function ButtonEvolution() {
  return (
    <ol className="btnevo" aria-label="Proof button iterations">
      <li>
        <small>Before</small>
        <span className="b old">
          <Upload /> Proof
        </span>
        <em>Same button before and after upload</em>
      </li>
      <li>
        <small>Iteration</small>
        <span className="b mid">
          <Tick /> Proof
        </span>
        <em>Filled once submitted</em>
      </li>
      <li>
        <small>Now</small>
        <span className="btnevo-docs">
          <DocChip name="OFFER LETTER" mini />
          <span className="docchip-add mini">+</span>
        </span>
        <em>Each document shown – remove ✕ or add more</em>
      </li>
    </ol>
  )
}

/* ── the flow: each step + what to draw live over its screen ── */
type Live = { chips?: number /* vertical offset of the Microsoft card */; agent?: 'live' | 'ready'; eyes?: boolean }

/* ── visual view: an eye on each pointer card shows whether it's on the resume (Google is off) ── */
const EYE_ROWS: { y: number; on: boolean; name: string }[] = [
  { y: 273, on: true, name: 'Microsoft' },
  { y: 523, on: false, name: 'Google' },
  { y: 773, on: true, name: 'Amazon' },
  { y: 1024, on: true, name: 'Flipkart' },
]
const EyeOpen = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3.2" fill="currentColor" />
  </svg>
)
const EyeClosed = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 9.5c2.2 2.8 5.3 4.5 9 4.5s6.8-1.7 9-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="m6 13 -1.6 2.3M12 14.6V17M18 13l1.6 2.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)
function EyeMarks() {
  return (
    <>
      {EYE_ROWS.map((r) => (
        <span key={r.name} className={`sv2-eye${r.on ? ' on' : ''}`} style={{ left: 478, top: r.y }} title={r.on ? `${r.name}: on the resume` : `${r.name}: hidden from the resume`}>
          {r.on ? <EyeOpen /> : <EyeClosed />}
        </span>
      ))}
    </>
  )
}
const FLOW: (Step & { live?: Live })[] = [
  /* proof states */
  {
    screen: 'app-list',
    caption: 'Users were confused as to whether a point’s proof was submitted or still yet to submit.',
    aside: <ButtonEvolution />,
    cursor: [719, 468],
    focus: [219, 446, 642, 44],
    zoom: [184, 250, 705, 280],
    live: { chips: 0 },
  },
  {
    screen: 'app-list',
    caption: 'Real-time submission – the moment proof is uploaded, the agent checks it on the spot.',
    cursor: [802, 737],
    click: true,
    focus: [864, 714, 308, 269],
    live: { chips: 0, agent: 'live' },
  },
  {
    screen: 'app-list',
    caption:
      'Students still weren’t clear on what adequate proof was – it acted as a dam wall in the flow. The agent corrects this at the base level, telling them exactly what counts before it ever reaches a coordinator.',
    cursor: [1110, 965],
    focus: [864, 714, 308, 269],
    zoom: [740, 600, 560, 430],
    live: { chips: 0, agent: 'ready' },
  },
  {
    screen: 'app-list',
    caption: 'One tap to re-upload, or submit anyway – feedback lands in seconds instead of a back-and-forth with coordinators.',
    cursor: [944, 938],
    click: true,
    focus: [889, 921, 110, 34],
    zoom: [800, 690, 440, 320],
    live: { chips: 0, agent: 'ready' },
  },

  /* adding a point – straight through, no stops */
  {
    screen: 'app-list',
    caption: 'Adding a point: every section ends with a + card.',
    cursor: [1259, 665],
    click: true,
    focus: [907, 537, 705, 257],
    live: { chips: 0 },
  },
  {
    screen: 'app-form',
    caption: 'Fill it in and submit it directly – organisation, type, dates, what you did and a link, then Save.',
    via: [[1080, 594], [1050, 644], [1180, 690], [1260, 762], [1250, 834]],
    cursor: [1539, 884],
    click: true,
    focus: [907, 537, 705, 404],
    zoom: [890, 520, 740, 440],
    live: { chips: 0 },
  },
  {
    screen: 'app-saved',
    caption: 'The point joins the section as a card, with its own Proof button waiting for a document.',
    cursor: [1525, 725],
    focus: [907, 525, 705, 257],
    zoom: [890, 500, 740, 300],
    live: { chips: -12 },
  },

  /* visual view */
  {
    screen: 'app-saved',
    caption: 'Switch to the visual view with the toggle at the top.',
    cursor: [1580, 108],
    click: true,
    focus: [1554, 82, 53, 53],
    zoom: [1300, 40, 400, 190],
    live: { chips: -12 },
  },
  {
    screen: 'app-visual',
    caption:
      'Students were dissatisfied with the lack of agency over their resume, so I added control over layout, font, size, colour and margins. Pointers stay on the left; a live A4 preview sits on the right.',
    cursor: [1060, 640],
    focus: [744, 163, 868, 920],
    live: { eyes: true },
  },
  {
    screen: 'app-visual',
    caption: 'An eye on every point shows whether it’s on the resume right now – Google is switched off (closed eye), so it’s left out of the preview.',
    cursor: [495, 537],
    focus: [184, 245, 1182, 520],
    zoom: [184, 240, 1182, 560],
    live: { eyes: true },
  },
  {
    screen: 'app-visual',
    caption: 'The point you just added is already on the page – answering the pilot finding that students couldn’t connect pointers to the resume.',
    cursor: [870, 535],
    focus: [778, 519, 556, 42],
    zoom: [744, 440, 622, 180],
    live: { eyes: true },
  },
  {
    screen: 'app-font',
    caption: 'Font: pick a typeface, then set size, bold, italic and colour for each text role – intro, headings, body, dates.',
    cursor: [1430, 226],
    click: true,
    focus: [1390, 254, 193, 228],
    zoom: [1000, 180, 620, 360],
    live: { eyes: true },
  },
  {
    screen: 'app-colour',
    caption: 'Colour: one tap re-tints the accent across the whole page.',
    cursor: [1460, 276],
    click: true,
    focus: [1390, 262, 171, 28],
    zoom: [1000, 180, 620, 360],
    live: { eyes: true },
  },
  {
    screen: 'app-margin',
    caption: 'Margin: step the page margin up or down – here 24 → 36px.',
    cursor: [1502, 320],
    click: true,
    focus: [1390, 312, 125, 28],
    zoom: [1000, 180, 620, 360],
    live: { eyes: true },
  },
  {
    screen: 'app-layout',
    caption: 'Layout: templates, a Customize mode for free-form boxes, and a section order you can drag or hide.',
    cursor: [1434, 376],
    click: true,
    focus: [1390, 404, 193, 399],
    zoom: [1180, 180, 480, 640],
    live: { eyes: true },
  },
  {
    screen: 'app-single',
    caption: 'Pick the two-column template – Education and Skills move into the side column, and the page reflows instantly.',
    cursor: [1429, 478],
    click: true,
    focus: [744, 203, 622, 880],
    live: { eyes: true },
  },
]
export const STUDENT_V2_STEPS: Step[] = FLOW.map(({ live: _live, ...s }) => s)

/** live UI over the screen, per step */
export function studentV2Overlay(step: number, landed: boolean) {
  const live = FLOW[Math.max(0, step)]?.live // the overview (-1) shows the first screen's live UI
  if (!live) return null
  return (
    <>
      {live.chips !== undefined && <MicrosoftSubmitted dy={live.chips} />}
      {live.eyes && <EyeMarks />}
      {live.agent === 'live' && landed && <AgentPopup key="live" resolveAfter={2000} />}
      {live.agent === 'ready' && <AgentPopup key="ready" />}
    </>
  )
}
