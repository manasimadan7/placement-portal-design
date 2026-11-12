import { useRef, useState, type ReactNode } from 'react'
import { asset, Chapter } from '../ui'
import { usePinProgress } from '../usePin'
import { Prototype, type Step } from './Prototype'
import { splitWords, Words } from './Words'

/**
 * Placement Team – V2 (Figma 406:3990, y 14473 →).
 * For each V1 flow: what testers struggled with (V1 screen + numbered hotspots), then the V2
 * click-through built from the live app (localhost:5173, captured into /assets/tv2 and /assets/tv2m).
 * Then the expert review (pinned, word by word), the phone version, and what's next.
 * Every prototype starts on Home.
 */

const D = 'tv2'
const img = (n: string) => asset(`${D}/${n}`)

/* sidebar of the desktop app (screen px) */
const NAV = { resume: [74, 309] as const, companies: [71, 511] as const }

/* ───────────── 1 · progress (home, interactive numbers) ───────────── */
const PROGRESS_V2: Step[] = [
  {
    screen: 'home',
    caption: 'Added labels – every ring and every funnel step now says what it counts. Hover them to read the numbers.',
    cursor: [470, 640],
    focus: [194, 365, 646, 355],
    zoom: [150, 320, 740, 440],
  },
  {
    screen: 'home',
    caption: 'The side section is My Companies – search, labelled filter chips, and a List / Kanban switch, right next to the numbers.',
    cursor: [1250, 236],
    focus: [879, 114, 804, 944],
  },
  {
    screen: 'home',
    caption: 'I removed the profile-like company buttons as they were confusing, and fixed the visual hierarchy – company, latest update, stage, then actions.',
    cursor: [1100, 330],
    focus: [887, 283, 766, 390],
    zoom: [860, 220, 840, 520],
  },
]

const RINGS = [
  { x: 266, label: 'Uncontacted', value: '54%' },
  { x: 432, label: 'IAF Filled', value: '104' },
  { x: 606, label: 'Self allotment', value: '25' },
  { x: 774, label: 'Resumes verified', value: '84%' },
]
const FUNNEL = [
  { x: 194, top: 566, label: 'Alloted companies', v: 150 },
  { x: 303, top: 605, label: 'Companies contacted', v: 100 },
  { x: 411, top: 624, label: 'IAF filled', v: 60 },
  { x: 520, top: 640, label: 'Shortlist released', v: 20 },
  { x: 628, top: 655, label: 'Interviews conducted', v: 0 },
  { x: 737, top: 655, label: 'Offers released', v: 0 },
]

/** hover targets laid over the home screenshot (screen px) – the numbers become readable on hover */
function ProgressViz() {
  const [hot, setHot] = useState<string | null>(null)
  return (
    <div className="pv" onPointerLeave={() => setHot(null)}>
      {RINGS.map((r) => {
        const k = `r${r.x}`
        return (
          <div key={k} className={`pv-ring${hot === k ? ' hot' : ''}`} style={{ left: r.x - 66, top: 431 - 66 }} onPointerEnter={() => setHot(k)}>
            {hot === k && (
              <span className="pv-tip">
                <b>{r.value}</b> {r.label}
              </span>
            )}
          </div>
        )
      })}
      {FUNNEL.map((f, i) => {
        const k = `f${i}`
        const prev = FUNNEL[i - 1]
        const pct = prev && prev.v ? Math.round((f.v / prev.v) * 100) : null
        return (
          <div key={k} className={`pv-bar${hot === k ? ' hot' : ''}`} style={{ left: f.x, top: f.top, width: 103, height: 718 - f.top }} onPointerEnter={() => setHot(k)}>
            {hot === k && (
              <span className="pv-tip up">
                <b>{f.v}</b> {f.label}
                {pct !== null && <small>{pct}% of {prev.label.toLowerCase()}</small>}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ───────────── 2 · updating comments (Companies page) ───────────── */
const NEW_NOTE = 'Called HR – shortlist extended to 15'
const UPDATES_V2: Step[] = [
  {
    screen: 'home',
    caption: 'Updates now live on the Companies page – open it from the sidebar.',
    cursor: [NAV.companies[0], NAV.companies[1]],
    click: true,
    focus: [47, 487, 48, 48],
    zoom: [0, 360, 640, 320],
  },
  {
    screen: 'co-all',
    caption: 'Switch to Assigned – the companies you own.',
    cursor: [1298, 97],
    click: true,
    focus: [1229, 76, 138, 43],
    zoom: [1080, 30, 648, 280],
  },
  {
    screen: 'co-assigned',
    caption: 'Each row shows its latest update, with call, mail and edit right on the line.',
    cursor: [800, 343],
    focus: [242, 273, 1322, 140],
  },
  {
    screen: 'co-assigned',
    caption: 'Click the pencil…',
    cursor: [1452, 343],
    click: true,
    focus: [1434, 325, 37, 37],
    zoom: [1120, 230, 600, 320],
  },
  {
    screen: 'co-assigned',
    caption: '…and type the update straight into the row – nothing expands, no modal.',
    cursor: [700, 349],
    focus: [242, 273, 1322, 140],
    zoom: [220, 220, 1000, 330],
    type: { box: [262, 337, 620, 24], text: NEW_NOTE, size: 16 },
  },
  {
    screen: 'co-assigned',
    caption: 'Enter – it becomes the row’s latest update, dated today and logged on the company’s timeline.',
    cursor: [760, 380],
    focus: [242, 273, 1322, 140],
    zoom: [220, 220, 1000, 330],
  },
  {
    screen: 'co-assigned',
    caption: 'Now reach out – click the mail icon on the same row.',
    cursor: [1399, 343],
    click: true,
    focus: [1376, 321, 46, 45],
    zoom: [1120, 230, 600, 320],
  },
  {
    screen: 'co-mail1',
    caption: 'The composer opens with the invite, while the agent reads the company’s history and drafts…',
    cursor: [1250, 800],
    focus: [664, 531, 871, 539],
  },
  {
    screen: 'co-mail2',
    caption: '…and flags what matters before you send.',
    cursor: [800, 960],
    focus: [664, 866, 290, 203],
    zoom: [560, 520, 1060, 597],
    aside: <AgentAside />,
  },
  {
    screen: 'co-mail2',
    caption: 'Send.',
    cursor: [1021, 1038],
    click: true,
    focus: [982, 1018, 78, 40],
    zoom: [860, 840, 600, 277],
  },
  {
    screen: 'co-sent-log',
    caption: 'Sent – a toast confirms it, and the mail is written to BCG’s timeline automatically, so the next coordinator knows exactly what went out.',
    cursor: [700, 615],
    focus: [352, 590, 600, 48],
  },
]
/** the AI agent, cut out of the composer screen, with why it is there */
function AgentAside() {
  return (
    <div className="agent-aside">
      <img src={img('agent-card.png')} alt="AI agent card: New POC is assigned – advisable to send invite again for fresh context" width={260} />
      <p>
        <b>The agent boosts optimisation.</b> It drafts the invite from the company’s history, notices changes like a new POC, and tells the coordinator what to do next – no blank e-mails, no digging through old threads.
      </p>
    </div>
  )
}
const ADDED_FROM = UPDATES_V2.findIndex((s) => s.caption.startsWith('Enter'))
function updatesOverlay(step: number) {
  // once the update is added it stays as BCG's latest line on every later screen
  if (step < ADDED_FROM || UPDATES_V2[step]?.screen === 'co-sent-log') return null
  return (
    <div className="upd-patch" style={{ left: 262, top: 334, width: 660, height: 50 }}>
      <span>{NEW_NOTE}</span>
      <small>12/11/2026 · logged to the timeline</small>
    </div>
  )
}

/* ───────────── new feature · self allot ───────────── */
const SELF_ALLOT_V2: Step[] = [
  {
    screen: 'home',
    caption: 'Open Companies from the sidebar.',
    cursor: [NAV.companies[0], NAV.companies[1]],
    click: true,
    focus: [47, 487, 48, 48],
    zoom: [0, 360, 640, 320],
  },
  {
    screen: 'co-all',
    caption: 'Self Allot is a new tab of open roles the pipeline has already scouted.',
    cursor: [1463, 97],
    click: true,
    focus: [1397, 76, 133, 43],
    zoom: [1080, 30, 648, 280],
  },
  {
    screen: 'self1',
    caption: 'Each row is a company, the categories it is hiring for, and a Source link to where the role was found.',
    cursor: [900, 330],
    focus: [242, 259, 1322, 525],
  },
  {
    screen: 'self1',
    caption: 'Filter by category – Design, Consult, Mechanical, Software, Quant…',
    cursor: [1000, 217],
    focus: [754, 197, 906, 41],
    zoom: [700, 140, 1028, 260],
  },
  {
    screen: 'self1',
    caption: 'Expand a company…',
    cursor: [1522, 307],
    click: true,
    focus: [1494, 279, 57, 57],
    zoom: [1180, 200, 548, 300],
  },
  {
    screen: 'sa-expand',
    caption: '…to read the role descriptions with their source, and the POCs already found – phone and e-mail ready.',
    cursor: [700, 520],
    focus: [243, 261, 1320, 341],
  },
  {
    screen: 'self1',
    caption: 'Tag a teammate who should take it…',
    cursor: [1198, 305],
    click: true,
    focus: [1151, 288, 95, 34],
    zoom: [960, 200, 640, 360],
  },
  {
    screen: 'sa-tag',
    caption: '…straight from the team list…',
    cursor: [1165, 435],
    click: true,
    focus: [1082, 331, 257, 260],
    zoom: [940, 240, 600, 420],
  },
  {
    screen: 'self1',
    caption: '…or claim it yourself.',
    cursor: [1333, 305],
    click: true,
    focus: [1286, 288, 95, 34],
    zoom: [960, 200, 640, 360],
  },
  {
    screen: 'sa-claim',
    caption: 'Claimed – the row is marked, so nobody picks the same company up twice.',
    cursor: [1333, 330],
    focus: [1286, 288, 95, 34],
    zoom: [960, 200, 640, 360],
  },
]

/* ───────────── 3 · resume verification ───────────── */
const RESUME_V2: Step[] = [
  {
    screen: 'home',
    caption: 'Open Resume from the sidebar.',
    cursor: [NAV.resume[0], NAV.resume[1]],
    click: true,
    focus: [50, 285, 48, 48],
    zoom: [0, 160, 640, 320],
  },
  {
    screen: 'rv1',
    caption: 'Assigned students sit on the left; the counter tracks how many of the 150 are fully verified.',
    cursor: [270, 300],
    focus: [161, 154, 222, 893],
  },
  {
    screen: 'rv1',
    caption: 'Approved pointers carry one clear green tick – one icon, one meaning.',
    cursor: [966, 258],
    focus: [452, 231, 544, 265],
    zoom: [400, 180, 680, 380],
  },
  {
    screen: 'rv1',
    caption: 'The proof opens right beside the pointer – nothing to download, no tabs to cross-check.',
    cursor: [1300, 600],
    focus: [1017, 226, 615, 790],
  },
  {
    screen: 'rv1',
    caption: 'Feedback and Approve are labelled buttons on the selected pointer – the edit control is no longer buried.',
    cursor: [777, 654],
    click: true,
    focus: [716, 637, 229, 34],
    zoom: [430, 480, 620, 330],
  },
  {
    screen: 'rv-fb',
    caption: 'Feedback opens inline, under the pointer it is about.',
    cursor: [700, 730],
    focus: [476, 682, 496, 131],
    zoom: [430, 480, 620, 420],
  },
  {
    screen: 'rv-fb2',
    caption: 'Say what is missing and send – the student sees it against that exact pointer.',
    cursor: [948, 788],
    click: true,
    focus: [930, 770, 36, 36],
    zoom: [430, 480, 620, 420],
  },
]

/* ───────────── miscellaneous features (fresh captures in /assets/tv2x) ───────────── */
const NOTES_V2: Step[] = [
  {
    screen: 'm-home',
    caption: 'Notes sit on the home – a running to-do list, one line per company.',
    cursor: [500, 900],
    focus: [194, 764, 646, 294],
    zoom: [150, 690, 740, 420],
  },
  {
    screen: 'm-home',
    caption: 'Add one with the +…',
    cursor: [796, 811],
    click: true,
    focus: [770, 785, 52, 52],
    zoom: [430, 690, 520, 300],
  },
  {
    screen: 'n-form',
    caption: '…the company, and what needs doing…',
    cursor: [560, 874],
    focus: [228, 850, 516, 48],
    zoom: [150, 690, 740, 420],
  },
  {
    screen: 'n-typed',
    caption: '…press Enter to save it.',
    cursor: [600, 874],
    focus: [228, 850, 516, 48],
    zoom: [150, 690, 740, 420],
  },
  {
    screen: 'n-added',
    caption: 'It lands at the top of the list. Tick it off when it is done…',
    cursor: [792, 874],
    click: true,
    focus: [774, 856, 36, 36],
    zoom: [150, 690, 740, 420],
  },
  {
    screen: 'n-done',
    caption: '…and it clears away.',
    cursor: [600, 900],
    focus: [194, 764, 646, 294],
    zoom: [150, 690, 740, 420],
  },
]
const CHAT_V2: Step[] = [
  {
    screen: 'm-home',
    caption: 'In-app chat lives in the corner of every page – no more hunting through WhatsApp groups.',
    cursor: [1682, 1071],
    click: true,
    focus: [1648, 1037, 68, 68],
    zoom: [1228, 760, 500, 357],
  },
  {
    screen: 'c-open',
    caption: 'Team channels and every coordinator in one list, unread conversations on top.',
    cursor: [1503, 672],
    click: true,
    focus: [1303, 411, 400, 616],
    zoom: [1050, 380, 678, 680],
  },
  {
    screen: 'c-thread',
    caption: 'Type a reply…',
    cursor: [1478, 993],
    focus: [1316, 972, 374, 42],
    zoom: [1050, 380, 678, 680],
    type: { box: [1322, 978, 300, 30], text: 'On it – sharing the BCG shortlist sheet now', size: 13 },
  },
  {
    screen: 'c-sent',
    caption: '…and it is sent – conversations stay next to the companies they are about.',
    cursor: [1560, 880],
    focus: [1303, 411, 400, 616],
    zoom: [1050, 380, 678, 680],
  },
]
const KANBAN_V2: Step[] = [
  {
    screen: 'm-home',
    caption: 'For the whole outreach pipeline, switch My Companies to Kanban.',
    cursor: [1448, 171],
    click: true,
    focus: [1404, 157, 88, 28],
    zoom: [1180, 90, 520, 300],
  },
  {
    screen: 'k-board',
    caption: 'Each outreach stage is a column with a live count – “where am I in the journey?” at a glance.',
    cursor: [960, 320],
    focus: [193, 270, 1535, 90],
  },
  {
    screen: 'k-board',
    caption: 'Pick a company to read its story without leaving the board.',
    cursor: [252, 414],
    click: true,
    focus: [220, 382, 66, 76],
    zoom: [150, 240, 720, 480],
  },
  {
    screen: 'k-detail',
    caption: 'Its dated timeline and remarks open in a drawer under the board.',
    cursor: [720, 900],
    focus: [193, 741, 1502, 344],
  },
  {
    screen: 'k-board',
    caption: 'To progress a company, hover it and use Move…',
    cursor: [253, 474],
    click: true,
    focus: [220, 382, 66, 100],
    zoom: [150, 240, 720, 480],
  },
  {
    screen: 'k-move',
    caption: '…pick the next stage – every option shows how many companies are already there…',
    cursor: [864, 445],
    click: true,
    focus: [694, 421, 340, 48],
    zoom: [600, 280, 540, 560],
  },
  {
    screen: 'k-moved',
    caption: '…and BCG lands in IAF Filled, both counts update and a toast confirms it.',
    cursor: [576, 420],
    focus: [517, 256, 361, 798],
  },
]

function Misc() {
  const tabs = [
    { key: 'notes', label: 'Notes', steps: NOTES_V2, blurb: 'A to-do list on the home, so follow-ups never live in a notebook again.' },
    { key: 'chat', label: 'In-app chat', steps: CHAT_V2, blurb: 'Team conversations inside the portal, instead of scattered WhatsApp threads.' },
    { key: 'kanban', label: 'Kanban', steps: KANBAN_V2, blurb: 'The outreach pipeline as a board – move a company to its next stage in two clicks.' },
  ]
  const [t, setT] = useState(0)
  return (
    <section className="frame tv2-frame misc" aria-label="Placement Team – miscellaneous features">
      <Chapter t={40} name="More features" />
      <div className="tv2">
        <h3 className="tv2-h">
          Miscellaneous <span>features</span>
        </h3>
        <p className="tv2-intro">Smaller pieces that came out of the testing – each one replaces something the team was doing outside the portal.</p>
        <div className="journeys misc-tabs" role="tablist" aria-label="Features">
          {tabs.map((x, i) => (
            <button key={x.key} type="button" role="tab" aria-selected={i === t} className={i === t ? 'on' : ''} onClick={() => setT(i)}>
              {x.label}
            </button>
          ))}
        </div>
        <p className="tv2-lede">{tabs[t].blurb}</p>
        <div className="tv2-proto" key={tabs[t].key}>
          <Prototype l={0} t={0} w={1452} h={620} steps={tabs[t].steps} intro="Home" dir="tv2x" label={`Prototype: ${tabs[t].label}`} />
        </div>
      </div>
    </section>
  )
}

/* ───────────── dark purple blow-up into the expert review ───────────── */
function BlowUp() {
  const section = useRef<HTMLElement>(null)
  const circle = useRef<HTMLDivElement>(null)
  const text = useRef<HTMLParagraphElement>(null)
  usePinProgress(section, (p) => {
    const cover = (Math.hypot(window.innerWidth, window.innerHeight) / 60) * 1.08 // diameter 60px → covers the screen
    const e = p < 0.8 ? 1 - Math.pow(1 - p / 0.8, 3) : 1
    if (circle.current) circle.current.style.transform = `translate(-50%, -50%) scale(${(0.15 + e * cover).toFixed(3)})`
    if (text.current) text.current.style.opacity = String(Math.max(0, Math.min(1, (p - 0.55) / 0.25)))
  })
  return (
    <section ref={section} className="pin blowup" style={{ height: 'calc(100vh + 140vh)' }} aria-label="Into the expert review">
      <div className="pin-sticky blowup-sticky">
        <div ref={circle} className="blowup-circle" aria-hidden="true" />
        <p ref={text} className="blowup-text">
          Then, the experts.
        </p>
      </div>
    </section>
  )
}

/* ───────────── V1 critique: screen + numbered hotspots ───────────── */
type Spot = { x: number; y: number; w: number; h: number } // % of the image
function Critique({ shots, notes, spots, side }: { shots: { src: string; w: number }[]; notes: string[]; spots: (Spot & { n: number; img?: number })[]; side?: ReactNode }) {
  const [hot, setHot] = useState<number | null>(null)
  return (
    <div className="tv2-crit" onPointerLeave={() => setHot(null)}>
      <div className="tv2-shots">
        {shots.map((s, i) => (
          <div key={s.src} className="tv2-shot" style={{ width: s.w }}>
            <img src={img(s.src)} alt="" width={s.w} loading="lazy" decoding="async" />
            {spots
              .filter((p) => (p.img ?? 0) === i)
              .map((p, k) => (
                <span
                  key={k}
                  className={`tv2-spot${hot === p.n ? ' hot' : ''}`}
                  style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, height: `${p.h}%` }}
                  onPointerEnter={() => setHot(p.n)}
                >
                  <b>{p.n}</b>
                </span>
              ))}
          </div>
        ))}
        {side}
      </div>
      <ol className="tv2-notes">
        {notes.map((n, i) => (
          <li key={n} className={hot === i + 1 ? 'hot' : ''} onPointerEnter={() => setHot(i + 1)} tabIndex={0} onFocus={() => setHot(i + 1)} onBlur={() => setHot(null)}>
            <b>{i + 1}</b>
            {n}
          </li>
        ))}
      </ol>
    </div>
  )
}

function Bar({ n, title, tag = 'V1' }: { n?: number; title: string; tag?: string }) {
  return (
    <div className="tv2-bar">
      <span>
        {n ? `${n}. ` : ''}
        {title}
      </span>
      {tag && <em>{tag}</em>}
    </div>
  )
}

function V2Rule({ children }: { children?: ReactNode }) {
  return (
    <div className="tv2-v2">
      <div className="tv2-rule">
        <em>V2</em>
      </div>
      {children && <p className="tv2-lede">{children}</p>}
    </div>
  )
}

function Proto({ steps, intro, label, overlay }: { steps: Step[]; intro: string; label: string; overlay?: (step: number, landed: boolean) => ReactNode }) {
  return (
    <div className="tv2-proto">
      <Prototype l={0} t={0} w={1452} h={620} steps={steps} intro={intro} dir={D} label={label} overlay={overlay} />
    </div>
  )
}

/* ───────────── expert review – pinned, word by word, one illustration at a time ───────────── */
const REVIEW_TEXT =
  'I wanted to get an expert validation on these version 2 screens, so I approached the managers of the placement team.\n\nWe conducted a group discussion with 7 other team members.\n\nThe general consensus was that – while the app is easy to navigate and use, we’re going to need a phone version for easy access. So naturally, that was the next step.'
const REVIEW_WORDS = splitWords(REVIEW_TEXT, ['expert validation', 'group discussion', 'phone version'])
const at = (phrase: string) => REVIEW_WORDS.findIndex((w) => w.w.toLowerCase().startsWith(phrase))
const ILLOS = [
  /* background-free versions, ink lightened for the dark theme */
  { src: 'ill-evaluate-dark.png', from: at('expert'), cls: 'ill-a', alt: 'Managers reviewing a checklist' },
  { src: 'ill-motivate.svg', from: at('group'), cls: 'ill-b', alt: 'Team discussing around a laptop' },
  { src: 'ill-phone-dark.png', from: at('phone'), cls: 'ill-c', alt: 'A phone' },
]

function Review() {
  const section = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(0)
  usePinProgress(section, (p) => setShown(Math.min(REVIEW_WORDS.length, Math.ceil((p / 0.7) * REVIEW_WORDS.length))))
  // only the latest illustration is on stage – the previous one fades out as the next comes in
  let active = -1
  ILLOS.forEach((il, i) => shown > il.from && (active = i))
  return (
    <section ref={section} className="pin" style={{ height: 'calc(100vh + 220vh)' }} aria-label="Expert review" data-chapter="Expert review">
      <div className="pin-sticky">
        <div className="pin-stage">
          <div className="pin-canvas review" style={{ height: 640 }}>
            {ILLOS.map((il, i) => (
              <img key={il.src} className={`review-ill a ${il.cls}${i === active ? ' on' : ''}`} src={img(il.src)} alt={il.alt} />
            ))}
            <p className="review-text a" aria-label={REVIEW_TEXT.replace(/\n\n/g, ' ')}>
              <Words words={REVIEW_WORDS} shown={shown} />
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ───────────── phone version + what's next ───────────── */
/* the live portal (built from localhost:5173 into /portal-app) runs inside the phone – fully usable */
type Journey = { key: string; label: string; nav: 'Home' | 'Resume' | 'Companies'; scrollTo?: string; tab?: string; steps: string[] }
const JOURNEYS: Journey[] = [
  { key: 'progress', label: 'Check progress', nav: 'Home', steps: ['Scroll through the labelled rings.', 'Read the allotment funnel – tap a bar.', 'Switch My Companies between List and Kanban.'] },
  { key: 'update', label: 'Log an update', nav: 'Home', scrollTo: '.companies', steps: ['Tap the pencil on a company.', 'Type what happened.', 'Press Enter – it is logged with today’s date.'] },
  { key: 'mail', label: 'Mail a company', nav: 'Home', scrollTo: '.companies', steps: ['Tap the mail icon on a company.', 'Watch the agent draft the invite.', 'Tap Send – it is logged on the timeline.'] },
  { key: 'resume', label: 'Verify a resume', nav: 'Resume', steps: ['Pick a student along the top.', 'Read a pointer, then its proof below.', 'Tap Approve, or Feedback to ask for more.'] },
  { key: 'self', label: 'Self allot', nav: 'Companies', tab: 'Self Allot', steps: ['Filter by category.', 'Expand a company to see roles and POCs.', 'Tag a teammate, or Claim it yourself.'] },
]
const APP_SRC = `${import.meta.env.BASE_URL}portal-app/index.html?embed`

function Phone() {
  const frame = useRef<HTMLIFrameElement>(null)
  const [j, setJ] = useState(() => {
    // same origin as the docs: skip the app's splash inside the phone
    try {
      sessionStorage.setItem('pp-splash-seen', '1')
    } catch {
      /* ignore */
    }
    return 0
  })
  const drive = (journey: Journey) => {
    const win = frame.current?.contentWindow
    const doc = frame.current?.contentDocument
    if (!win || !doc) return
    ;(doc.querySelector(`button[aria-label="${journey.nav}"]`) as HTMLButtonElement | null)?.click()
    win.setTimeout(() => {
      if (journey.tab) [...doc.querySelectorAll<HTMLButtonElement>('.segmented__item')].find((b) => b.textContent?.includes(journey.tab!))?.click()
      const target = journey.scrollTo ? doc.querySelector(journey.scrollTo) : null
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else win.scrollTo({ top: 0, behavior: 'smooth' })
    }, 350)
  }
  const pick = (i: number) => {
    setJ(i)
    drive(JOURNEYS[i])
  }
  const reset = () => {
    try {
      frame.current?.contentWindow?.sessionStorage.setItem('pp-splash-seen', '1')
    } catch {
      /* ignore */
    }
    frame.current?.contentWindow?.location.reload()
  }
  return (
    <section className="frame tv2-frame tv2-phone" aria-label="Placement Team – phone version">
      <Chapter t={40} name="Phone version" />
      <div className="tv2 phone-wrap">
        <div className="phone-copy">
          <h3 className="tv2-h">
            The <span>phone</span> version
          </h3>
          <p className="tv2-intro">This is the real portal running on the phone – use it however you like, or pick a journey and follow the steps.</p>
          <div className="journeys" role="tablist" aria-label="Journeys">
            {JOURNEYS.map((jy, i) => (
              <button key={jy.key} type="button" role="tab" aria-selected={i === j} className={i === j ? 'on' : ''} onClick={() => pick(i)}>
                {jy.label}
              </button>
            ))}
          </div>
          <ol key={JOURNEYS[j].key} className="journey-steps">
            {JOURNEYS[j].steps.map((s, k) => (
              <li key={s} style={{ animationDelay: `${k * 80}ms` }}>
                <b>{String(k + 1).padStart(2, '0')}</b>
                {s}
              </li>
            ))}
          </ol>
          <button type="button" className="journey-reset" onClick={reset}>
            Reset the phone
          </button>
        </div>
        <div className="phone-device">
          <div className="phone-notch" aria-hidden="true" />
          <div className="phone-status" aria-hidden="true">
            <span>9:41</span>
            <span>●●● ▮</span>
          </div>
          <iframe
            ref={frame}
            title="Placement portal – live phone version"
            src={APP_SRC}
            width={390}
            height={770}
            loading="lazy"
            onLoad={() => {
              try {
                frame.current?.contentWindow?.sessionStorage.setItem('pp-splash-seen', '1')
              } catch {
                /* ignore */
              }
            }}
          />
        </div>
      </div>
    </section>
  )
}

function Next() {
  return (
    <section className="frame tv2-frame tv2-next" aria-label="Placement Team – what's next">
      <Chapter t={40} name="What’s next" />
      <div className="tv2">
        <h3 className="tv2-h">
          What’s <span>next</span>
        </h3>
        <div className="next-grid">
          <article className="next-card">
            <i className="next-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26">
                <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0M17 11l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </i>
            <h4>User testing V2 and the phone version</h4>
            <p>Run the same task-based sessions on the V2 desktop screens and the phone version with the placement team, and compare against the V1 results.</p>
          </article>
          <article className="next-card">
            <i className="next-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26">
                <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </i>
            <h4>Developer hand-off</h4>
            <p>Already coded by me – the V2 portal and its phone layout are a working front end, so hand-off is a codebase, not just specs.</p>
          </article>
        </div>
      </div>
    </section>
  )
}

export default function TeamV2() {
  return (
    <>
      <section className="frame tv2-frame" aria-label="Placement Team – V2">
        <Chapter t={40} name="V2 iterations" />
        <div className="tv2">
          <h3 className="tv2-h">
            From V1 to <span>V2</span>
          </h3>
          <p className="tv2-intro">Each V1 flow, what the testers struggled with, and the V2 that came out of it – click through the live screens.</p>

          {/* 1 */}
          <Bar n={1} title="Progress status & Tracking" />
          <Critique
            shots={[{ src: 'v1-progress.png', w: 1100 }]}
            notes={['Users found unlabeled metrics confusing and were drawn to the visual instead of the labels.', 'The labeled filters were going unnoticed, and the profile-like UI for companies was confusing.']}
            spots={[
              { n: 1, x: 10, y: 33, w: 39, h: 33 },
              { n: 2, x: 52, y: 17, w: 45, h: 80 },
            ]}
          />
          <V2Rule>Labelled rings and an allotment funnel – hover the numbers.</V2Rule>
          <Proto steps={PROGRESS_V2} intro="Home" label="V2 prototype: progress status and tracking" overlay={() => <ProgressViz />} />

          {/* 2 */}
          <Bar n={2} title="Updating comments and sending e-mail" />
          <Critique
            shots={[
              { src: 'v1-comments-a.png', w: 560 },
              { src: 'v1-comments-b.png', w: 560 },
            ]}
            side={<img className="tv2-gmail" src={img('gmail.png')} alt="Gmail" width={120} />}
            notes={['Disliked the two-click modal process for editing notes.', 'Took them time to note contacted / uncontacted companies.']}
            spots={[
              { n: 1, x: 76, y: 26, w: 8, h: 70, img: 0 },
              { n: 2, x: 62, y: 26, w: 9, h: 70, img: 0 },
              { n: 1, x: 76, y: 26, w: 8, h: 70, img: 1 },
            ]}
          />
          <V2Rule />
          <Proto steps={UPDATES_V2} intro="Home" label="V2 prototype: updating comments" overlay={updatesOverlay} />

          {/* new feature */}
          <Bar title="Adding a new feature : Self Allot" tag="New" />
          <div className="tv2-two">
            <p>For a lot of coordinators, a lot of time is spent scouting for eligible roles and companies – then finding details for the POC, and finally approaching them.</p>
            <p>This was a time-taking process, so I wanted to build an automated pipeline where plugins like Apollo, ContactOut, Gemini and Claude can do the job of scouting for them.</p>
          </div>
          <Proto steps={SELF_ALLOT_V2} intro="Home" label="V2 prototype: self allot" />

          {/* 3 */}
          <Bar n={3} title="Resume verification" />
          <Critique
            shots={[{ src: 'v1-resume.png', w: 1000 }]}
            notes={['Edit control felt buried.', 'Icon denotation felt confusing.', 'Scroll affordance not visible.']}
            spots={[
              { n: 1, x: 84, y: 22, w: 8, h: 8 },
              { n: 2, x: 52, y: 22, w: 4, h: 76 },
              { n: 3, x: 96.5, y: 20, w: 3, h: 26 },
            ]}
          />
          <V2Rule>Labelled Feedback / Approve buttons, one tick for approved, and inline feedback next to the proof.</V2Rule>
          <Proto steps={RESUME_V2} intro="Home" label="V2 prototype: resume verification" />
        </div>
      </section>
      <Misc />
      <BlowUp />
      {/* from here on the page continues in the dark theme */}
      <div className="dark-zone">
        <Review />
        <Phone />
        <Next />
      </div>
    </>
  )
}
