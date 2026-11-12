import { useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { Arrow } from '../arrows'
import { createPortal } from 'react-dom'
import TeamTesting from './TeamTesting'
import TeamV2 from './TeamV2'
import { SketchCalls, SketchReview, SketchScrape, SketchVerify } from './Sketches'
import { splitWords, Words } from './Words'
import { asset, Blank, Chapter, Crop, FillImg, Pic, Pill, Rot, S, T, Vec } from '../ui'
import { usePinProgress } from '../usePin'
import { DIALOGUE_STEPS, PROGRESS_STEPS, Prototype, RECORDS_STEPS, RESUME_STEPS } from './Prototype'
import { Storyboard, type Panel } from './Storyboard'

const f = (n: string) => asset(`f3/${n}`)
const PRIMARY = 'var(--primary)'

/*
 * MacBook Pro 16" – 3 · Placement Team
 * Split like the Student page:
 *   1. intro (0–3540)                               – regular canvas
 *   2. scenario storyboard                          – pinned, slides horizontally
 *   3. responsibilities + pain points (4100–6600)   – canvas shifted up by 4100
 *   4. key insights                                 – pinned, keywords turn purple one card at a time
 *   5. personas → prototype (7200→)                 – canvas shifted up by 7200
 */
const FRAME_H = 13780 // V1 panel (top 10513 + 3118) plus bottom breathing room
const MID_FROM = 4100
const MID_TO = 6600
const REST_FROM = 7200

/** Contextual-inquiry focus card (white, lilac border). */
function Focus({ l, t, w, h, tl, tt, tw, center, children }: { l: number; t: number; w: number; h: number; tl?: number; tt?: number; tw: number; center?: boolean; children: ReactNode }) {
  return (
    <div className={`a clip${center ? ' rc' : ''}`} style={{ left: l, top: t, width: w, height: h, background: '#fff', border: '5px solid var(--la-l)', borderRadius: 20 }}>
      {center ? (
        <p className="tx" style={{ width: tw, fontSize: 20, fontWeight: 400, color: 'var(--n600)' }}>{children}</p>
      ) : (
        <T l={tl} t={tt} w={tw} s={20} wt={400}>{children}</T>
      )}
    </div>
  )
}

function Chip({ l, t, children }: { l: number; t: number; children: string }) {
  return (
    <div className="chip" style={{ left: l, top: t }}>
      <p className="tx" style={{ fontSize: 16, fontWeight: 500, color: 'var(--n600)', whiteSpace: 'nowrap' }}>{children}</p>
    </div>
  )
}

/* ───────────── key responsibilities: dark cards with a 3D tilt on hover ───────────── */
function tilt(e: PointerEvent<HTMLDivElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width
  const y = (e.clientY - r.top) / r.height
  el.style.setProperty('--ry', `${((x - 0.5) * 18).toFixed(2)}deg`)
  el.style.setProperty('--rx', `${((0.5 - y) * 14).toFixed(2)}deg`)
  el.style.setProperty('--px', ((x - 0.5) * 2).toFixed(3))
  el.style.setProperty('--py', ((y - 0.5) * 2).toFixed(3))
  el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`)
  el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`)
}
function untilt(e: PointerEvent<HTMLDivElement>) {
  const s = e.currentTarget.style
  for (const k of ['--ry', '--rx', '--px', '--py']) s.removeProperty(k)
}

function Duty({ children, tl, tt, tw, title, desc, titleW, descPre }: { children: ReactNode; tl: number; tt: number; tw?: number; title: ReactNode; desc: string; titleW?: number; descPre?: boolean }) {
  return (
    <div className="duty" onPointerMove={tilt} onPointerLeave={untilt}>
      <div className="a duty-art" style={{ inset: 0 }}>{children}</div>
      <div className="a clip duty-text" style={{ left: tl, top: tt, width: tw, display: 'flex', flexDirection: 'column', gap: 10.646, alignItems: 'flex-start', wordBreak: 'break-word' }}>
        <div className="manrope" style={{ width: titleW ?? '100%', fontSize: 20, fontWeight: 700, lineHeight: 1.32, letterSpacing: -0.4, color: 'var(--la-l)' }}>{title}</div>
        <p className="manrope" style={{ margin: 0, width: '100%', fontSize: 15.969, lineHeight: 1.34, letterSpacing: -0.0798, color: 'var(--n300)', whiteSpace: descPre ? 'pre-wrap' : undefined }}>{desc}</p>
      </div>
      <span className="duty-glare" aria-hidden="true" />
    </div>
  )
}

/* ───────────── pain-point metrics (Figma frames 27–33, which sit on the canvas over this frame) ───────────── */
function Metric({ l, t, w, h, value, unit, valueSize, chipW, chipH = 63, color = '#6f76ca', text, textSize, textW, gap = 10, padL = 10, nowrap, pre }: {
  l: number; t: number; w: number; h: number; value: string; unit?: string; valueSize: number; chipW?: number; chipH?: number; color?: string
  text: string; textSize: number; textW?: number; gap?: number; padL?: number; nowrap?: boolean; pre?: boolean
}) {
  return (
    <div className="a metric" style={{ left: l, top: t, width: w, height: h, gap, paddingLeft: padL }}>
      <span className="metric-chip" style={{ width: chipW, height: chipH }}>
        <span className="manrope" style={{ color, fontSize: valueSize }}>
          {value}
          {unit && <span style={{ fontSize: valueSize * 0.66 }}> {unit}</span>}
        </span>
      </span>
      <p className="manrope metric-text" style={{ fontSize: textSize, width: textW, whiteSpace: nowrap ? 'nowrap' : pre ? 'pre-wrap' : undefined }}>{text}</p>
    </div>
  )
}

/* ───────────── 1 · intro ───────────── */
function Intro() {
  return (
    <section className="frame" style={{ height: 3540 }} data-node-id="406:3990" aria-label="Placement Team" data-chapter="Intro">
      <div className="a" style={{ left: 148, top: 1432, width: 1434, height: 947, borderRadius: 40, background: 'var(--la-l)' }} />
      <Rot l={165} t={1515} w={903.907} h={379.896} iw={892.143} ih={348.578} tf="rotate(2.03deg)" style={{ mixBlendMode: 'luminosity' }}>
        <FillImg src={f('gemini-affinity.png')} alt="Contextual inquiry illustration" />
      </Rot>

      <Rot l={406} t={251} w={899.711} h={648.116} iw={815.948} ih={386.665} tf="rotate(-20.52deg)">
        <div className="a" style={{ inset: '0.49% 21.26% 42.14% 43.15%' }}>
          <img className="vec" src={f('rectangle6.png')} alt="" />
        </div>
      </Rot>
      <Rot l={-591.21} t={695.89} w={1308.136} h={942.329} iw={1186.349} ih={562.192} tf="rotate(-20.52deg)">
        <div className="a" style={{ inset: '0.49% 21.26% 42.14% 43.15%' }}>
          <img className="vec" src={f('rectangle7.png')} alt="" />
        </div>
      </Rot>

      <T l={788} t={162} w={237} s={20} pw>
        <p>The IIT Bombay placement drive is a high-stakes, fast-paced event where hundreds of companies hire across strict timelines. </p>
        <Blank />
        <p>Behind which lies a massive operational load carried by the student placement team and faculty coordinators.</p>
      </T>

      <T l={162} t={2600} s={24} wt={500} c="var(--n700)" nw>Affinity Mapping </T>

      <T l={149} t={421} w={491} h={86} s={96} c="var(--la-l)" lh={1}>Placement Team</T>
      <Arrow l={283} t={479} w={944} h={437} src={f('vector1.svg')} inset="-1.42% -0.16% -0.34% -0.63%" />
      <Rot l={113} t={916} w={339.201} h={111.698} iw={333.153} ih={81.823} tf="rotate(-5.2deg)" inner={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 10 }}>
        <p className="tx" style={{ width: 320.222, fontSize: 24, fontWeight: 500, color: PRIMARY }}>What are Placement Team goals &amp; Pain points?</p>
      </Rot>

      <T l={148} t={1045} w={295}>
        <Blank />
        <p>I created a survey with the objective to thoroughly understand processes conducted by the team . the why and how of it . To find the goal and pain points of the engine of this operation.</p>
      </T>
      <T l={502} t={2587} w={495}>
        <Blank />
        <p>Employing a bottom to top approach , i went through the record of all the interview to identify clusters that talk about diffrent issues in the system </p>
      </T>
      <T l={1087} t={2587} w={495}>
        <Blank />
        <p>This helped me find patterns and allocate , priority and hierarchy to all the detected issues and find the key insights.</p>
      </T>
      <T l={1105} t={1637} w={329} pw>
        <p>Conducting this quantitative study via the survey helped me understand the overall pain points . </p>
        <Blank />
        <p>
          But to get the nuances of this operation a <S wt={500} c={PRIMARY}>contextual inquiry </S>was required
        </p>
        <Blank />
        <p style={{ fontSize: 24 }}>Focus of my contextual inquiry</p>
      </T>

      {/* Focus of contextual inquiry */}
      <Focus l={186} t={2008} w={431} h={123} tl={46} tt={43} tw={344}>{'What tools they use to Facilitate the organizational processes and why '}</Focus>
      <Focus l={650} t={2004} w={430} h={128} tl={46} tt={40} tw={344}>{'Throughout the drive , what are their roles and responsibilities '}</Focus>
      <Focus l={1113} t={2004} w={431} h={128} tl={46} tt={45} tw={351}>What processes have they tried automating . did it work , why / why not ?</Focus>
      <Focus l={896} t={2172} w={573} h={142} tw={468} center>{"What are the exhausting operational hurdles and crunch periods faced during a coordinator's term."}</Focus>
      <Focus l={282} t={2172} w={573} h={142} tw={468} center>How does the knowledge transfer work . what are the tools used to document and why?</Focus>

      {/* Header card */}
      <div className="a clip" style={{ left: 150, top: 150, width: 612, height: 270, borderRadius: 30, background: 'rgba(218,172,255,0.22)' }}>
        <Vec l={27} t={-149} w={544} h={544} src={f('team-brainstorming.svg')} />
        <Pill l={696} t={176} w={247} h={58} bg="#9d84d4" shade="#8a38f5" label="Placement Team" />
      </div>

      {/* Survey screenshots */}
      <Rot l={1188} t={780} w={432.611} h={457.321} iw={361.449} ih={393.112} tf="rotate(11.51deg)">
        <FillImg src={f('shot-225634.png')} r={10} alt="Survey screenshot" />
      </Rot>
      <Rot l={796} t={744} w={506.019} h={422.871} iw={456} ih={356} tf="rotate(-8.99deg)">
        <FillImg src={f('shot-225712.png')} r={10} alt="Survey screenshot" />
      </Rot>
      <Pic l={955} t={972} w={465} h={355} r={10} src={f('shot-225746.png')} alt="Survey screenshot" />

      <Arrow l={996} t={1684} w={481} h={248} src={f('vector9.svg')} inset="-2.15% -0.2% -0.4% -1.48%" />
      <Pic l={146} t={2679} w={1436} h={723} r={30} src={f('image38.png')} alt="Affinity map" />
    </section>
  )
}

/* ───────────── 2 · scenario storyboard ───────────── */
const TEAM_PANELS: Panel[] = [
  {
    w: 546, h: 316, n: '1.', nl: 22, nt: 18,
    art: (
      <>
        <Crop l={47} t={50} w={153} h={189} src={f('notes.png')} img={[392.93, 452.13, -83.78, -0.06]} blend="hard-light" />
        <SketchCalls />
      </>
    ),
    caption: (
      <T l={0} t={344} w={546}>
        <p>
          <S wt={600}>Ravi Hari</S>
          <br aria-hidden />
          Has just been appointed role of Internship Coordinator.
        </p>
        <p>His first job is to get Knowledge transfer from the team last year , via calls.</p>
      </T>
    ),
  },
  {
    w: 826, h: 316, n: '2.', nl: 19, nt: 18,
    art: (
      <>
        <SketchScrape />
        <Rot l={201.35} t={33} w={603.296} h={267.009} iw={596} ih={249} tf="rotate(1.74deg)" inner={{ border: '1px solid rgba(0,0,0,0.25)', borderRadius: 3 }}>
          <FillImg src={f('image6.png')} r={3} alt="Spreadsheet log" />
        </Rot>
      </>
    ),
    caption: (
      <>
        <T l={0} t={363} w={382}>He now scraps data from old emails , linkdin , intershala etc to create a data base of companies and their POCs.</T>
        <T l={400} t={363} w={426}>He’s required to store this data in an excel sheet , where the progress of the whole team will be tracked.</T>
      </>
    ),
  },
  {
    w: 826, h: 316, n: '3.', nl: 27, nt: 31,
    art: <SketchVerify />,
    caption: (
      <>
        <T l={4} t={373} w={364}>Meanwhile , he’s verifying 150 resumes , making sure that all pointers are legit by checking the proof.</T>
        <T l={404} t={373} w={422} pw>{'Checking if pointers match the pdf submitted, giving feedback where necessary. Repeating this when a resubmission happens  '}</T>
      </>
    ),
  },
  {
    w: 546, h: 316, n: '4.', nl: 31, nt: 21,
    art: <SketchReview />,
    caption: (
      <T l={0} t={363} w={546}>
        Alas, Review meeting with managers has arrived. He has been using notes and WhatsApp to maintain logs and now he has to transfer everything to excel.
      </T>
    ),
  },
]

/* ───────────── 3 · responsibilities + pain points ───────────── */
function Middle() {
  return (
    <section className="frame" style={{ height: MID_TO - MID_FROM }} aria-label="Placement Team – responsibilities and pain points">
      <div className="shift" data-noreveal style={{ top: -MID_FROM, height: FRAME_H }}>
        <Chapter t={4300} name="Responsibilities" />
        <Chapter t={5560} name="Pain points" />
        {/* pain-point venn */}
        <Rot l={140.15} t={5605} w={814} h={814} iw={720.834} ih={720.834} tf="rotate(97.99deg)">
          <Vec src={f('ellipse4.svg')} inset="-13.87%" />
        </Rot>
        <Rot l={808.35} t={5646.11} w={732.3} h={732.3} iw={720.834} ih={720.834} tf="rotate(-179.08deg)">
          <Vec src={f('ellipse3.svg')} inset="-13.87%" />
        </Rot>

        <div className="a" style={{ left: 148, top: 4731, width: 1433, height: 655, borderRadius: 30, background: 'var(--da-d)' }} />

        {/* storyboard → key responsibilities */}
        <Rot l={226.29} t={3731.72} w={1508.952} h={1468.579} iw={1153.813} ih={1062.359} tf="rotate(26.81deg)">
          <Arrow src={f('vector3.svg')} inset="-0.21% -0.13% -0.14% -0.74%" />
        </Rot>

        <T l={185} t={4786} s={24} wt={500} c="var(--n300)" nw>
          <p style={{ whiteSpace: 'pre' }}>{'Pinpointing the '}</p>
          <p style={{ whiteSpace: 'pre' }}>
            <S c="#fff">key responsibilities</S> of the team
          </p>
        </T>
        <T l={150} t={5643} w={310} s={24} wt={500}>
          Deducing the <S c={PRIMARY}>pain points </S>from the study{' '}
        </T>

        {/* Key responsibilities */}
        <div className="a" style={{ left: 170, top: 4875, display: 'flex', gap: 15, alignItems: 'center' }}>
          <Duty tl={46} tt={299} tw={244.694} title="Corporate Outreach & Scouting" desc="Proactively scout and engage potential hiring partners, building strategic industry relationships.">
            <Vec l={51} t={104} w={60} h={68} src={f('vector4.svg')} inset="-2.76% -2.62% -2.73% -3.03%" />
            <Rot l={220.99} t={119.02} w={70.36} h={76.93} iw={60} ih={68} tf="rotate(9.46deg) scaleX(-1)">
              <Vec src={f('vector5.svg')} inset="-2.76% -2.62% -2.73% -3.03%" />
            </Rot>
            <Rot l={136.62} t={49} w={84.97} h={88.75} iw={60.38} ih={68.91} tf="rotate(-26.88deg) scaleX(-1)">
              <Vec src={f('vector6.svg')} inset="-2.73% -2.6% -2.69% -3.01%" />
            </Rot>
            <Vec l={122.8} t={161} w={88} h={88} src={f('ellipse1.svg')} inset="-0.82% -2.72% -1.26% -0.89%" />
            <Rot l={121} t={161} w={86.628} h={86.628} iw={80} ih={80} tf="rotate(-85.03deg)">
              <Vec src={f('ellipse2.svg')} inset="-0.91% -3% -1.38% -0.98%" />
            </Rot>
            <Vec l={152.8} t={199} w={34} h={14} src={f('iitb-text.svg')} inset="-9.39% -1.92% -3.97% -7.35%" />
          </Duty>
          <Duty tl={42} tt={302} tw={251} title="Schedule & Slot Management" desc="Design  recruitment timelines, coordinating evaluation slots and interview schedules" descPre>
            <div className="a clip" style={{ left: 28, top: 37, width: 265, height: 265 }}>
              <div className="a" style={{ inset: '30.56% 3.53% 21.78% 37.58%' }}><img className="vec" src={f('calendar.svg')} alt="" /></div>
              <div className="a" style={{ inset: '56.41% 50.96% 35.73% 37.44%' }}><img className="vec" src={f('date.svg')} alt="" /></div>
              <div className="a" style={{ inset: '21.83% 61.28% 45.61% 3.54%' }}><img className="vec" src={f('sale.svg')} alt="" /></div>
            </div>
          </Duty>
          <Duty tl={58} tt={303} tw={244.694} title={<><p style={{ margin: 0 }}>Communication</p><p style={{ margin: 0 }}>{'​'}</p></>} desc=" Serve as the primary communication bridge between companies and students">
            <Vec l={58} t={55} w={223} h={223} src={f('listening-to-feedback.svg')} />
          </Duty>
          <Duty tl={38} tt={301} titleW={260.164} title="On-Ground Operations & Logistics" desc="Oversee drive execution, managing venue logistics, technical setups, and candidate flow">
            <Vec l={56} t={43} w={247} h={247} src={f('team-building.svg')} />
          </Duty>
        </div>

        <T l={441} t={5793} s={20} wt={500} c="rgba(153,158,218,0.6)" nw>Operational Inefficiency</T>
        <T l={1103} t={5800} s={20} wt={500} c="var(--la-d)" nw>Communication</T>

        {/* pain-point metrics */}
        <Metric l={167} t={5894} w={467} h={83} value="89%" valueSize={20} text="Said manual data entry (spreadsheets) as impractical." textSize={16} nowrap />
        <Metric l={95} t={6018} w={362} h={73} value="100%" valueSize={14} chipW={51} chipH={53} text="Coordinators agree manual tracking consumes an unsustainable amount of time." textSize={14} textW={275} />
        <Metric l={679} t={5921} w={415} h={83} value="78%" valueSize={20} text=" of coordinators reported handoffs are informal" textSize={16} nowrap />
        <Metric l={496} t={6039} w={311} h={83} value="2" unit="hrs" valueSize={24} gap={22} text="weekly searching for past contacts/notes." textSize={20} textW={201} />
        <Metric l={1160} t={5904} w={328} h={73} value="45" unit="mins" valueSize={14} chipW={51} chipH={53} color="#b488e1" text=" daily manually updating status columns" textSize={14} textW={241} />
        <Metric l={1299} t={6028} w={362} h={73} value="83%" valueSize={14} chipW={51} chipH={53} color="#b488e1" text=" of coordinators  requested automated email/communication integration" textSize={14} textW={275} pre />
        <Metric l={860} t={6063} w={399} h={95} value="61%" valueSize={14} chipW={51} chipH={53} color="#b488e1" gap={17} padL={24} text="of coordinators rely on emergency calls to former team members as critical contact history lives on personal phones, not in a shared system." textSize={12} textW={291} />
      </div>
    </section>
  )
}

/* ───────────── 4 · key insights (pinned) ───────────── */
/** Key phrase: dark grey until its card lights up, then purple (colour transitions in CSS). */
function Kw({ on, children }: { on: boolean; children: ReactNode }) {
  return <span className={`kw${on ? ' on' : ''}`}>{children}</span>
}

type InsightDef = { l: number; t: number; w: number; angle: number; stops: [number, number, number]; tl: number; tw: number; pw?: boolean; body: (on: boolean) => ReactNode }

const INSIGHTS: InsightDef[] = [
  {
    l: 150, t: 91.17, w: 445, angle: 151.07, stops: [56.094, 89.062, 100], tl: 51, tw: 344,
    body: (on) => <>Finding <Kw on={on}>new corporate leads</Kw> and executing cold outreach consumes an <Kw on={on}>unsustainable amount of time</Kw></>,
  },
  {
    l: 641, t: 91.17, w: 445, angle: -42.3, stops: [0.9705, 73.961, 98.821], tl: 51, tw: 344,
    body: (on) => <>Keeping<Kw on={on}> tabs on recruitment meetings </Kw>and scheduling updates manually creates massive <Kw on={on}>administrative drag</Kw></>,
  },
  {
    l: 1132, t: 91.17, w: 445, angle: 41.39, stops: [6.1019, 69.998, 91.198], tl: 51, tw: 344,
    body: (on) => <>Because recruitment decisions, corporate negotiations, involve high-stakes, <Kw on={on}>sensitive operations, the team requires mandatory human oversight</Kw></>,
  },
  {
    l: 150, t: 333, w: 714, angle: -29.56, stops: [0.9705, 73.961, 98.821], tl: 51, tw: 581,
    body: (on) => <>Company information, contact (POC) details, and <Kw on={on}>conversation histories are haphazardly distributed </Kw>across personal chat logs, scattered spreadsheets, and individual email drafts.</>,
  },
  {
    l: 900, t: 333, w: 677, angle: 30.08, stops: [6.1019, 69.998, 91.198], tl: 34, tw: 613, pw: true,
    body: (on) => (
      <>
        <p>
          The <Kw on={on}>manual verification loop</Kw> - checking PDF resumes against individual pointers, cross - referencing claims, and re-checking updates
        </p>
        <p>
          {' '}<Kw on={on}>burns significant team bandwidth.</Kw>
        </p>
      </>
    ),
  },
]

/**
 * Key Insights – the section pauses (pins) while each card's key phrases turn from dark grey
 * to purple, one card at a time, as you scroll.
 */
function KeyInsights() {
  const section = useRef<HTMLElement>(null)
  const [lit, setLit] = useState(0)
  // n cards light up over the first 5/6 of the pin; the last 1/6 holds them all lit
  usePinProgress(section, (p) => setLit(Math.min(INSIGHTS.length, Math.floor(p * (INSIGHTS.length + 1)))))

  return (
    <section ref={section} className="pin" style={{ height: 'calc(100vh + 150vh)' }} aria-label="Key Insights" data-chapter="Key insights">
      <div className="pin-sticky">
        <div className="pin-stage">
          <div className="pin-canvas" style={{ height: 560 }}>
            <T l={150} t={0} w={310} s={24} wt={500}>Key Insights</T>
            {INSIGHTS.map((c, i) => {
              const on = i < lit
              const bg = `linear-gradient(90deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.7) 100%), linear-gradient(${c.angle}deg, rgb(238, 237, 252) ${c.stops[0]}%, rgb(207, 203, 255) ${c.stops[1]}%, rgba(207, 203, 255,0.4) ${c.stops[2]}%)`
              return (
                <div key={i} className={`card insight${on ? ' on' : ''}`} style={{ left: c.l, top: c.t, width: c.w, height: 206, backgroundImage: bg }}>
                  <T l={c.tl} t={65} w={c.tw} s={20} wt={400} c="#a3a3a8" center pw={c.pw}>{c.body(on)}</T>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ───────────── 5 · personas → prototype ───────────── */
/* rapid prototyping – frames from the AI-built prototypes (Figma screen recordings 588:69–71); click to enlarge */
const AI_PROTOS = [
  { l: 137, t: 9166, w: 485, h: 218, src: 'tv2/rec1.png', name: 'Code-based resume builder' },
  { l: 636, t: 9167, w: 421, h: 217, src: 'tv2/rec2.png', name: 'Coordinator home' },
  { l: 1071, t: 9166, w: 516, h: 218, src: 'tv2/rec3.png', name: 'Student / team profile entry' },
]
function AiProtos() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <>
      {AI_PROTOS.map((p, i) => (
        <button key={p.src} type="button" className="ai-proto a" style={{ left: p.l, top: p.t, width: p.w, height: p.h }} onClick={() => setOpen(i)} aria-label={`AI prototype: ${p.name} – enlarge`}>
          <img src={asset(p.src)} alt="" loading="lazy" />
          <span className="ai-proto-tag">AI prototype · {p.name}</span>
        </button>
      ))}
      {open !== null &&
        createPortal(
        <div className="ai-lightbox" role="dialog" aria-label={AI_PROTOS[open].name} onClick={() => setOpen(null)}>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={asset(AI_PROTOS[open].src)} alt={`AI prototype: ${AI_PROTOS[open].name}`} />
            <figcaption>
              AI prototype · {AI_PROTOS[open].name}
              <button type="button" onClick={() => setOpen(null)} aria-label="Close">✕</button>
            </figcaption>
          </figure>
        </div>,
          document.body,
        )}
    </>
  )
}

/* the HMW statement (Figma 8356–8600) gets its own pinned section between the two halves */
const HMW_FROM = 8300
const HMW_TO = 8660

function Rest({ part }: { part: 'a' | 'b' }) {
  const a = part === 'a'
  const from = a ? REST_FROM : HMW_TO
  const to = a ? HMW_FROM : FRAME_H
  return (
    <section className="frame" style={{ height: to - from }} aria-label={a ? 'Placement Team – personas' : 'Placement Team – prototyping'}>
      <div className="shift" data-noreveal style={{ top: -from, height: FRAME_H }}>
        {a ? <Chapter t={7300} name="Personas" /> : (
          <>
            <Chapter t={8940} name="Prototyping" />
            <Chapter t={9770} name="Info architecture" />
            <Chapter t={10490} name="V1 prototype" />
          </>
        )}
        <Rot l={501} t={8108} w={737.527} h={710.713} iw={352.087} ih={673.757} tf="rotate(48.38deg)">
          <img className="fill" src={f('vector-curve.svg')} alt="" style={{ objectFit: 'fill' }} />
        </Rot>

        {a && (
          <>
        {/* key insights → personas */}
        <Rot l={368.8} t={6959} w={1094.7} h={914.618} iw={950.885} ih={545.776} tf="rotate(153.32deg) scaleY(-1)">
          <Arrow src={f('vector2.svg')} inset="-1.47% -0.16% -0.27% -0.62%" />
        </Rot>

        <T l={150} t={7311.17} w={323} s={20}>From these key takeaways i started developing Personas</T>
        <T l={1479} t={7462.17} s={24} wt={500} nw>Personas</T>
          </>
        )}
        {!a && (
          <>
        <T l={150} t={8969} s={24} wt={500} nw>Rapid prototyping</T>
        <T l={150} t={9793} s={24} wt={500} nw>
          <p style={{ whiteSpace: 'pre' }}>{'Information architecture '}</p>
          <p style={{ whiteSpace: 'pre' }}>{'& conceptual model'}</p>
        </T>

        {/* Idea graveyard chips */}
        <Chip l={137} t={9438}>{'Code based resume '}</Chip>
        <Chip l={137} t={9504}>Eliminating PDFs from the system</Chip>
        <Chip l={424} t={9504}>Visualizing Outreach process</Chip>
        <Chip l={334} t={9438}>Plugin for outreach</Chip>
        <Chip l={525} t={9438}>Pipeline Kanban stages</Chip>
        <Chip l={1022} t={9438}>Gamified XP points for cold email outreach</Chip>
        <Chip l={1300} t={9504}>Auto-converting all meeting to notes</Chip>
        <Chip l={1073} t={9504}>AI voice calling company</Chip>
        <Chip l={1379} t={9438}>Chatbot for student FAQ</Chip>
        <Chip l={744} t={9438}>historical company handoff logs</Chip>
        <Chip l={682} t={9504}>Tinder-style swipe interface for resume pointers</Chip>
        <T l={151} t={9013} w={488} c="var(--n700)" balance pw>
          <p>Instead of building conceptual models and info arch ; i started with prototyping.</p>
          <Blank />
          <p>from the identified goals and pain points i had a graveyard full of design ideas - using ai i was able to build prototypes to tst them out and get a clearer idea of where the design solution should head.</p>
        </T>
          </>
        )}

        {a && (
          <>
        {/* Personas */}
        <div className="card" style={{ left: 150, top: 7607, width: 704, height: 349, background: 'rgba(0,0,0,0.05)' }}>
          <div className="a clip" style={{ left: 40, top: 45, width: 114, height: 114, borderRadius: 80, background: '#fff' }}>
            <Vec l={-24} t={11} w={166} h={166} src={f('trophy.svg')} />
          </div>
          <T l={190} t={59} s={20} wt={600} c="var(--n700)" nw>Kabir</T>
          <T l={50} t={202} wt={600} c="var(--n700)" nw>Profile</T>
          <T l={358} t={202} wt={600} c="var(--n700)" nw>Goals</T>
          <T l={190} t={84} s={20} wt={500} c="var(--n300)" nw>Company Coordinator</T>
          <T l={50} t={227} w={338} c="var(--n700)" balance>Responsible for cold calls, bringing new companies on board, and managing relationships with hiring partners.</T>
          <T l={358} t={227} w={338} c="var(--n700)" balance>Discover and onboard high-tier corporate leads quickly, track ongoing outreach and avoid redundant or double-contacting with existing recruiter accounts.</T>
        </div>
        <div className="card" style={{ left: 899, top: 7607, width: 679, height: 349, background: 'rgba(0,0,0,0.05)' }}>
          <Vec l={40} t={45} w={114} h={114} src={f('frame14.svg')} />
          <T l={190} t={59} s={20} wt={600} c="var(--n700)" nw>Malikaa Arora</T>
          <T l={50} t={202} wt={600} c="var(--n700)" nw>Profile</T>
          <T l={365} t={201} wt={600} c="var(--n700)" nw>Goals</T>
          <T l={190} t={84} w={242} s={20} wt={500} c="var(--n300)">Associate Placement Coordinator</T>
          <T l={50} t={227} w={295} c="var(--n700)" balance>In charge of authenticating student resume pointers, checking official proof documents</T>
          <T l={365} t={226} w={295} c="var(--n700)" balance pw>{'Quickly verify as many resumes as possible without having to crosscheck between pointers and pdf  multiple times'}</T>
        </div>

          </>
        )}

        {!a && (
          <>
        {/* Screen recordings (video placeholders in Figma) */}
        <AiProtos />

        <Crop l={134} t={9875} w={1444} h={531} src={f('image39.png')} img={[100.08, 104.2, -0.04, -4.2]} alt="Information architecture & conceptual model" />

        {/* V1 prototype panel */}
        <div className="card" style={{ left: 134, top: 10513, width: 1430, height: 3118, background: '#fff' }}>
          <T l={53} t={79} s={24} wt={500} nw>
            <S c={PRIMARY}>V1 </S>Prototype
          </T>
          <T l={951} t={79} w={442} h={79} s={24} wt={500} c="var(--tert-l)" pw>
            <p>Checking progress status </p>
            <p>where am i in the journey of conversion ?</p>
          </T>
          <T l={1183} t={886} w={243} s={24} wt={500} c="var(--tert-l)">{'Updating dialogue with a company '}</T>
          <T l={1053} t={1652} w={329} s={24} wt={500} c="var(--tert-l)" style={{ textAlign: 'right' }}>Updating company records</T>
          <T l={1053} t={2419} w={329} s={24} wt={500} c="var(--tert-l)" style={{ textAlign: 'right' }}>Verifying a resume</T>
          <Prototype l={53} t={177} w={1329} h={587} steps={PROGRESS_STEPS} intro="Home" label="Prototype: checking progress status and the journey of conversion" />
          <Prototype l={53} t={964} w={1329} h={587} steps={DIALOGUE_STEPS} intro="My Companies" label="Prototype: updating dialogue with a company" />
          <Prototype l={53} t={1724} w={1329} h={587} steps={RECORDS_STEPS} intro="All Companies" label="Prototype: updating company records" />
          <Prototype l={53} t={2484} w={1329} h={587} steps={RESUME_STEPS} intro="Resume verification" label="Prototype: verifying a resume" />
          <div className="a" style={{ inset: 0, borderRadius: 'inherit', pointerEvents: 'none', boxShadow: 'inset -1px -1px 4px 0 rgba(207, 203, 255,0.4), inset 2px 4px 10px 5px rgba(0,0,0,0.13)' }} />
        </div>
          </>
        )}
      </div>
    </section>
  )
}

/* ───────────── How might we – pinned, word by word ───────────── */
const HMW_TEXT =
  'How might we optimize team operations and data management so coordinators can effortlessly manage corporate outreach, track recruiter interactions, and maintain a single source of truth without operational burnout?'
const HMW_WORDS = splitWords(HMW_TEXT, ['How might we optimize team operations', 'single source of truth'])

/** The scroll pauses here until every word of the HMW statement has appeared. */
function Hmw() {
  const section = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(0)
  // all words are in by 80% of the pin; the rest holds the finished statement
  usePinProgress(section, (p) => setShown(Math.min(HMW_WORDS.length, Math.ceil((p / 0.8) * HMW_WORDS.length))))
  return (
    <section ref={section} className="pin" style={{ height: 'calc(100vh + 160vh)' }} aria-label="How might we" data-chapter="How might we">
      <div className="pin-sticky">
        <div className="pin-stage">
          <div className="pin-canvas hmw" style={{ height: 420 }}>
            <span className="hmw-q a" style={{ left: 214, top: -10 }} aria-hidden="true">“</span>
            <p className="hmw-text a" style={{ left: 289, top: 40, width: 1150 }} aria-label={HMW_TEXT}>
              <Words words={HMW_WORDS} shown={shown} />
            </p>
            <span className={`hmw-q a${shown >= HMW_WORDS.length ? ' on' : ''}`} style={{ left: 1452, top: 300 }} aria-hidden="true">”</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Frame3() {
  return (
    <>
      <Intro />
      <Storyboard
        label="Scenario"
        heading={
          <>
            Lets understand results through a <S c={PRIMARY}>scenario</S>
          </>
        }
        panels={TEAM_PANELS}
        accent="var(--primary)"
      />
      <Middle />
      <KeyInsights />
      <Rest part="a" />
      <Hmw />
      <Rest part="b" />
      <TeamTesting />
      <TeamV2 />
    </>
  )
}

