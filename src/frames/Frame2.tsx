import type { ReactNode } from 'react'
import { Arrow } from '../arrows'
import { Highlight } from '../Highlight'
import { asset, Blank, Chapter, Crop, FillImg, Pic, Rot, S, T, Vec } from '../ui'
import { PilotChart } from './PilotChart'
import { Prototype } from './Prototype'
import { JOB_V1_STEPS, jobV1Overlay, PHONE, RESUME_V1_STEPS } from './StudentV1'
import { STUDENT_V2_STEPS, studentV2Overlay } from './StudentV2'
import Results from './Results'
import Scenario from './Scenario'
import NextUp from './NextUp'

const f = (n: string) => asset(`f2/${n}`)
const TEAL = 'var(--teal)'

/*
 * MacBook Pro 16" – 2 · Students
 * The Figma frame is split into four parts:
 *   1. intro (0–1480)                          – regular canvas
 *   2. scenario storyboard                     – pinned, frames slide horizontally   (Scenario.tsx)
 *   3. results of the study                    – pinned, number flips per scroll     (Results.tsx)
 *   4. everything from Key Takeaways (3780→)   – regular canvas, shifted up by 3780
 * Arrows draw toward their target as you scroll (arrows.tsx).
 */

const REST_FROM = 3780
const FRAME_H = 13444
/* the V2 resume prototype is laid out larger than the Figma slot (661 tall), so what follows it moves down */
const V2_PROTO_H = 741 // wider than the 1430 column (60 → 1668) so the screen grows to 1072×693 with text on the right
const DY = V2_PROTO_H - 661
/* the V1 phone prototype gets a taller slot (587 → 587 + P1) so the phone can be big and centred */
const P1 = 150 // keeps the phone within one screen height

/* routes for the elbow connectors, in each SVG's own coordinates (start dot → arrowhead) */
const R3: [number, number][] = [[2.67, 93.68], [123.05, 93.68], [123.05, 3.68], [448.7, 3.68]]
const R4: [number, number][] = [[2.67, 2.67], [123.04, 2.67], [123.04, 66.67], [445.67, 66.67], [445.67, 54.5]]
const R5: [number, number][] = [[2.67, 409.68], [897.67, 409.68], [897.67, 3.68], [859.2, 3.68]]
const R6: [number, number][] = [[41, 600.18], [0.5, 600.18], [0.5, 3.68], [51.5, 3.68]]
const R7: [number, number][] = [[54.83, 600.68], [0.5, 600.68], [0.5, 3.68], [55.5, 3.68]]
/* elbow connectors play on their own once in view (timed), rather than crawling with the scroll */
const CONNECTOR = { brush: 10, rider: 1.2, riderScale: 0.55, auto: true, startAt: 0.85, duration: 1000 }

const glassBar = {
  border: '1px solid rgba(104,204,229,0.36)',
  borderRadius: 40,
  backgroundImage:
    'linear-gradient(90deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.6) 100%), linear-gradient(180deg, rgba(248,254,255,0.16) 0%, rgba(133,191,206,0.22) 100%)',
} as const

function Bar({ t, w = 1430, h }: { t: number; w?: number; h: number }) {
  return <div className="a" style={{ left: 150, top: t, width: w, height: h, ...glassBar }} />
}

function Takeaway({ bg, children }: { bg: string; children: ReactNode }) {
  return (
    <div className="clip" style={{ position: 'relative', flexShrink: 0, width: 445, height: 206, borderRadius: 20, backgroundImage: bg }}>
      <T l={51} t={65} w={344} s={20} wt={400} center>{children}</T>
    </div>
  )
}

type PersonaProps = { l: number; avatar: ReactNode; name: string; role: string; profile: string; goals: string }
function Persona({ l, avatar, name, role, profile, goals }: PersonaProps) {
  return (
    <div className="card" style={{ left: l, top: 4425, width: 452, height: 476, background: 'rgba(0,0,0,0.05)' }}>
      {avatar}
      <T l={190} t={59} s={20} wt={600} c="var(--n700)" nw>{name}</T>
      <T l={50} t={202} wt={600} c="var(--n700)" nw>Profile</T>
      <T l={50} t={306} wt={600} c="var(--n700)" nw>Goals</T>
      <T l={190} t={84} s={20} wt={500} c="var(--n300)" nw>{role}</T>
      <T l={50} t={227} w={295} c="var(--n700)" balance pw>{profile}</T>
      <T l={50} t={331} w={295} c="var(--n700)" balance>{goals}</T>
    </div>
  )
}

const TrophyAvatar = (
  <div className="a clip" style={{ left: 40, top: 45, width: 114, height: 114, borderRadius: 80, background: '#fff' }}>
    <Vec l={-24} t={11} w={166} h={166} src={f('trophy.svg')} />
  </div>
)

function Finding({ l, t, w, start, children }: { l: number; t: number; w: number; start: number; children: ReactNode }) {
  return (
    <T l={l} t={t} w={w}>
      <ol start={start}>
        <li style={{ marginInlineStart: 24 }}>{children}</li>
      </ol>
    </T>
  )
}

const Strong = ({ children }: { children: ReactNode }) => <S wt={500} c="var(--n700)">{children}</S>

/* ───────────── 1 · intro ───────────── */
function Intro() {
  return (
    <section className="frame" style={{ height: 1480 }} data-node-id="381:20618" aria-label="Students" data-chapter="Intro">
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

      <div className="a clip" style={{ left: 150, top: 141, width: 598, height: 270, borderRadius: 30, background: 'rgba(104,204,229,0.12)' }}>
        <Vec l={-19} t={-95} w={617} h={617} src={f('work-from-home.svg')} />
      </div>

      <T l={788} t={150} w={237} h={407} s={20} pw>
        <p>The IIT Bombay placement drive is a high-stakes, fast-paced event where hundreds of companies hire across strict timelines. </p>
        <Blank />
        <p>For students, missing an update or delaying an application by even a few minutes can result in lost job opportunities.</p>
      </T>

      <T l={149} t={421} w={413} h={86} s={96} c="rgba(104,204,229,0.12)">Students</T>
      <Arrow l={283} t={479} w={944} h={437} src={f('vector1.svg')} inset="-1.42% -0.16% -0.34% -0.63%" />
      <Rot l={113} t={916} w={339.201} h={111.698} iw={333.153} ih={81.823} tf="rotate(-5.2deg)" inner={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 10 }}>
        <div className="tx" style={{ fontSize: 24, fontWeight: 500, color: TEAL, whiteSpace: 'pre' }}>
          <p>{'What are Student goals '}</p>
          <p>{'& Pain points?'}</p>
        </div>
      </Rot>

      <Rot l={770.55} t={787.1} w={442.902} h={388.805} iw={408} ih={347} tf="rotate(-6.16deg)">
        <FillImg src={f('shot-164751.png')} r={7} alt="Survey screenshot" />
      </Rot>
      <Rot l={1162} t={870} w={435.353} h={332.542} iw={405} ih={288} tf="rotate(6.58deg)">
        <FillImg src={f('shot-164812.png')} r={7} alt="Survey screenshot" />
      </Rot>
      <Rot l={928.3} t={950.48} w={418.403} h={431.041} iw={407} ih={420} tf="rotate(1.58deg)">
        <FillImg src={f('shot-164737.png')} r={7} alt="Survey screenshot" />
      </Rot>

      <T l={157} t={1061} w={295}>
        <Blank />
        <p>I created a survey with the objective to qualitatively assess their behavior regarding resume submission , job application and communication</p>
      </T>
    </section>
  )
}

/* ───────────── 4 · from Key Takeaways onward ───────────── */
function Rest() {
  return (
    <section className="frame" style={{ height: FRAME_H - REST_FROM + DY + P1 }} aria-label="Students – research and design">
      <div className="shift" data-noreveal style={{ top: -REST_FROM, height: FRAME_H }}>
        <Chapter t={3800} name="Key takeaways" />
        <Chapter t={4270} name="Personas" />
        <Chapter t={5250} name="How might we" />
        <Chapter t={5860} name="Ideation" />
        <Chapter t={7170} name="V1 prototype" />
        <Chapter t={8830 + P1} name="Pilot study" />
        <Chapter t={9440 + P1} name="Resume submission" />
        {/* Pilot study panel */}
        <div className="card" style={{ left: 150, top: 8858 + P1, width: 1430, height: 458, background: 'var(--student)' }}>
          <T l={60} t={147} w={364} h={240} c="var(--n100)" pw>
            <p>The next step was to conduct user testing to ground all design decision.</p>
            <Blank /><Blank /><Blank />
            <p>
              During usability testing, we conducted <S wt={500} c="#fff">time-trial comparisons </S>between the old
              portal and the redesigned version.{' '}
            </p>
            <Blank />
            <p>
              Participants <S wt={500} c="#fff">voiced their thought processes</S> i as I measured exact task completion
              times for core student actions.
            </p>
          </T>
          <T l={60} t={60} s={24} wt={500} c="#fff" nw>Pilot Study/ User testing</T>
          <PilotChart l={598} t={77} />
        </div>

        <Bar t={9468 + P1} w={1431} h={87} />
        <Bar t={10354 + P1} h={14} />

        <Pic l={-370} t={10270 + P1} w={771} h={787} blur={50} opacity={0.21} src={f('image26.png')} />

        {/* Key takeaways → personas */}
        <Rot l={368.8} t={3812.83} w={1094.7} h={914.618} iw={950.885} ih={545.776} tf="rotate(153.32deg) scaleY(-1)">
          <Arrow src={f('vector2.svg')} inset="-1.47% -0.16% -0.27% -0.62%" />
        </Rot>

        <T l={149} t={7035} w={687} h={39}>
          To turn my research into a functional app, I started by mapping out the entire system using Information
          Architecture and mind maps to structure the user flow. From there, I sketched wireframes to bring the screens
          and layout hierarchy to life.
        </T>

        {/* Testing findings */}
        <Finding l={150} t={10094 + P1} w={478} start={3}>
          82% of students expressed a <Strong>strong need for greater agency over their resume's visual appearance </Strong>
          in terms of font , font size , color , spacing , layout etc. to better fit their personal branding.
        </Finding>
        <Finding l={150} t={9949 + P1} w={478} start={1}>
          Visibility of <Strong>selected pointer’s felt too ambiguous</Strong> and 32% of the users failed to derive
          correlation between the pointers and the resume visual.
        </Finding>
        <Finding l={150} t={10036 + P1} w={455} start={2}>
          <Strong>Proof states felt unclear</Strong> - whether its submitted or not and what the adequate proof is.
        </Finding>

        <T l={905} t={7035} w={675} h={39} pw>
          <p>Throughout this process, I used AI as a collaborative partner for rapid ideation, getting immediate critiques on my design choices, generating synthetic test data, and quickly exploring different </p>
          <p>UX solutions.</p>
        </T>

        <T l={150} t={3838} w={250} s={24} wt={500}>Key Takeaways</T>

        {/* HMW */}
        <T l={577} t={5331} w={546} s={24} wt={400} italic center pw>
          <p>How might we streamline resume submissions and application tracking so students can effortlessly discover opportunities via a single, proactive </p>
          <p>source of truth?</p>
        </T>
        <T l={150} t={4165} w={323} s={20}>From these key takeaways i started developing Personas</T>
        <T l={150} t={5995} s={20} nw>System Mapping</T>
        <T l={150} t={6606} s={20} nw>Info Arch</T>
        <T l={924} t={6606} s={20} nw>Ai prototypes</T>
        <T l={924} t={5995} s={20} nw>Wireframes</T>
        <T l={1479} t={4306} s={24} wt={500} nw>Personas</T>
        <T l={150} t={5884} w={510} s={24} wt={500}>
          Keeping the research and the personas in mind I started <S c={TEAL}>brainstorming &amp; Ideation</S>
        </T>
        <T l={358} t={5281} s={96} wt={500} nw>“</T>
        <T l={1284} t={5452} s={96} wt={500} nw>“</T>

        {/* Takeaway cards */}
        <div className="a" style={{ left: 150, top: 3929, display: 'flex', gap: 46, alignItems: 'center' }}>
          <Takeaway bg="linear-gradient(90deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.7) 100%), linear-gradient(152.67deg, rgba(104,204,229,0.28) 26.908%, rgba(187,219,227,0.31) 48.754%, rgb(133,191,206) 81.791%, rgba(104,204,229,0.12) 100%)">
            Students found resume proof guidelines to be inconsistent and noted that its <S c={TEAL}>tedious to receive feedback .</S>
          </Takeaway>
          <Takeaway bg="linear-gradient(90deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.7) 100%), linear-gradient(-10.73deg, rgb(248,254,255) 6.4002%, rgb(133,191,206) 75.652%, rgba(104,204,229,0.12) 98.629%)">
            61% of students reported that they require to <S c={TEAL}>manually monitor</S> and check for updates rather than notifications reaching them.
          </Takeaway>
          <Takeaway bg="linear-gradient(90deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.7) 100%), linear-gradient(-18.17deg, rgba(213,244,252,0.31) 16.601%, rgb(133,191,206) 93.974%, rgba(133,191,206,0.22) 119.65%)">
            Students struggled with <S c={TEAL}>fragmented updates </S>across WhatsApp, the placement blog, and the portal, making a single source of truth essential.
          </Takeaway>
        </div>

        {/* Personas */}
        <Persona
          l={143}
          avatar={TrophyAvatar}
          name="Kabir"
          role="Final year"
          profile="Final-year student prepping for  Day 1 placement ."
          goals="Wants a lightning-fast job discovery view where stipends, JDs, and clear eligibility tags are instantly scannable."
        />
        <Persona
          l={641}
          avatar={<Vec l={40} t={45} w={114} h={114} src={f('frame14.svg')} />}
          name="Malikaa Arora"
          role="Dual degree"
          profile="Takes part in side projects and hackathons all the time and wants to include that in her resume."
          goals="Wants a clear, standardized guideline and an effortless upload flow so her resume points get verified without guesswork."
        />
        <Persona
          l={1132}
          avatar={<Vec l={40} t={45} w={114} h={114} src={f('frame15.svg')} />}
          name="Rohan Sharma"
          role="Dual degree"
          profile="Final-year B.Tech student applying to multiple tech roles."
          goals="Wants application statuses and updates pushed directly to him instantly, without having to hunt across fragmented platforms."
        />

        {/* Ideation sketches */}
        <Rot l={1289.6} t={5884} w={294.413} h={444.06} iw={279.119} ih={434.395} tf="rotate(2.04deg)">
          <Crop l={0} t={0} w={279.119} h={434.395} r={5} src={f('sketch-153cdc0f.png')} img={[100.08, 114.33, -0.04, -8.97]} alt="Ideation sketch" />
        </Rot>
        <Rot l={1097.86} t={5952.45} w={332.095} h={416.485} iw={303.847} ih={395.205} tf="rotate(-4.22deg)">
          <Crop l={0} t={0} w={303.847} h={395.205} r={5} src={f('sketch-26039598.png')} img={[100, 136.68, 0, -18.34]} alt="Ideation sketch" />
        </Rot>
        <Rot l={946} t={6067} w={356.262} h={380.729} iw={285.913} ih={319.849} tf="rotate(-14.35deg)">
          <Crop l={0} t={0} w={285.913} h={319.849} r={5} src={f('sketch-db7cc164.png')} img={[110.98, 176.36, -4.45, -20.54]} alt="Ideation sketch" />
        </Rot>

        <Pic l={150} t={6673} w={643} h={290} src={f('image2.png')} alt="Information architecture" />
        <Pic l={924} t={6638} w={456} h={247} r={20} shadow src={f('shot-003123.png')} alt="AI prototype" />
        <Pic l={1243} t={6752} w={313} h={211} r={20} shadow src={f('shot-003746.png')} alt="AI prototype" />
        <Pic l={150} t={6009} w={643} h={536} src={f('image3.png')} alt="System map" />

        {/* V1 prototype panel */}
        <div className="card" style={{ left: 150, top: 7195, width: 1430, height: 1575 + P1, background: '#fff' }}>
          <T l={53} t={79} s={24} wt={500} nw>
            <S c={TEAL}>V1 </S>Prototype
          </T>
          <T l={1150} t={79} w={243} s={24} wt={500} c="var(--tert-l)">Applying to a job and and checking status</T>
          <T l={1150} t={886 + P1} w={243} s={24} wt={500} c="var(--tert-l)">Submitting Resume</T>
          <Prototype
            l={53}
            t={177}
            w={1329}
            h={587 + P1}
            layout="center"
            {...PHONE}
            dir="sv1"
            theme="teal"
            steps={JOB_V1_STEPS}
            overlay={jobV1Overlay}
            intro="Home"
            label="Prototype: V1 – applying to a job and checking status"
          />
          <Prototype
            l={53}
            t={934 + P1}
            w={1329}
            h={587}
            dir="sv1"
            theme="teal"
            steps={RESUME_V1_STEPS}
            intro="Resume"
            label="Prototype: V1 – submitting a resume"
          />
          <div className="a" style={{ inset: 0, borderRadius: 'inherit', pointerEvents: 'none', boxShadow: 'inset -1px -1px 4px 0 rgba(104,204,229,0.12), inset 2px 4px 4px 0 rgba(46,155,176,0.2)' }} />
        </div>

        {/* Iteration headers */}
        <T l={159} t={9506 + P1} w={250} s={24} wt={500}>
          <ol start={1}><li style={{ marginInlineStart: 36 }}>Resume submission</li></ol>
        </T>
        <T l={1522} t={9504 + P1} w={36} s={24} wt={500} c="var(--tert-d)">V1</T>
        <T l={1533} t={10324 + P1} w={36} s={24} wt={500} c="var(--tert-d)">V2</T>

        {/* HMW highlight: sweeps across "source of truth?" on scroll */}
        <Highlight l={756} t={5414} w={190} h={28} color="rgba(67,174,196,0.3)" />


        {/* V1 → V2 resume submission */}
        <Pic l={153} t={9585 + P1} w={478} h={309} r={10} border="2px solid rgba(71,133,171,0.2)" src={f('image18.png')} alt="Resume submission V1" />
        <Pic l={664} t={9585 + P1} w={916} h={592} r={20} border="2px solid rgba(187,219,227,0.31)" src={f('image20.png')} alt="Resume submission V1 screen" />
        <Arrow l={635} t={9864 + P1} w={446} h={90} src={f('vector3.svg')} inset="-4.09% -0.11% -2.96% -0.6%" route={R3} {...CONNECTOR} />
        <Arrow l={635} t={9718 + P1} w={895} h={406} src={f('vector5.svg')} inset="-0.91% 0 -0.66% -0.3%" route={R5} {...CONNECTOR} />
        <Arrow l={636} t={10044 + P1} w={443} h={64} src={f('vector4.svg')} inset="-4.17% -0.83% -0.78% -0.6%" route={R4} {...CONNECTOR} />
        {/* V2 resume submission – click-through prototype (replaces the static screen + side crops) */}
        <Prototype
          l={60}
          t={10392 + P1}
          w={1608}
          h={V2_PROTO_H}
          dir="sv2"
          theme="teal"
          steps={STUDENT_V2_STEPS}
          intro="Resume"
          overlay={studentV2Overlay}
          label="Prototype: resume submission V2 – proof states, the proof-checking agent, adding points and the visual view"
        />
      </div>

      {/* everything below the (enlarged) V2 prototype: same Figma coordinates, pushed down by DY */}
      <div className="shift" data-noreveal style={{ top: -REST_FROM + DY + P1, height: FRAME_H }}>
        <Chapter t={11390} name="Job application" />
        <Chapter t={12540} name="Home redesign" />
        <Bar t={11420} w={1452} h={87} />
        <Bar t={12458} h={14} />
        <T l={1522} t={11455} w={36} s={24} wt={500} c="var(--tert-d)">V1</T>
        <T l={1533} t={12418} w={36} s={24} wt={500} c="var(--tert-d)">V2</T>
        <T l={176} t={11455} w={345} s={24} wt={500}>
          <ol start={1}><li style={{ marginInlineStart: 36 }}>Job application &amp; Tracking</li></ol>
        </T>

        {/* Job application flow (mobile) */}
        <Arrow l={95.5} t={11610} w={51} h={596.5} src={f('vector6.svg')} inset="-0.62% -0.98% -0.45% -0.98%" route={R6} {...CONNECTOR} />
        <Pic l={1324} t={11559} w={269} h={553} r={22} border="2px solid rgba(187,219,227,0.31)" shadow="0 5px 7px rgba(0,0,0,0.4)" src={f('image30.png')} alt="Job application screen" />
        <Pic l={518} t={11559} w={269} h={553} r={22} border="2px solid rgba(187,219,227,0.31)" shadow="0 5px 7px rgba(0,0,0,0.4)" src={f('image31.png')} alt="Job application screen" />
        <Pic l={917} t={11559} w={269} h={554} r={22} border="2px solid rgba(187,219,227,0.31)" shadow="0 5px 7px rgba(0,0,0,0.4)" src={f('image32.png')} alt="Job application screen" />
        <Pic l={153} t={11559} w={269} h={554} r={22} border="2px solid rgba(187,219,227,0.31)" shadow="0 5px 7px rgba(0,0,0,0.4)" src={f('image33.png')} alt="Job application screen" />
        <Rot l={1600} t={11610} w={55} h={597} iw={55} ih={597} tf="rotate(180deg) scaleY(-1)">
          <Arrow src={f('vector7.svg')} inset="-0.62% -3.63% -0.45% -0.91%" route={R7} {...CONNECTOR} />
        </Rot>

        <Pic l={1270} t={12575} w={319.292} h={656} r={20} border="4px solid rgba(187,219,227,0.31)" src={f('image37.png')} alt="Redesigned home page for tracking application status" />
        <T l={150} t={12591} w={592} s={20} wt={400} tr={-0.3} pw>
          <p>In the redesign i wanted the home page to feel more like the habitat for tracking status instead of the jobs page.</p>
          <Blank />
          <Blank />
          <p>for that i made some ui changes.</p>
        </T>

        {/* Status-card iterations (exports include the date tab that overhangs each card's top edge) */}
        <T l={151} t={12777} w={125} s={20} wt={500} tr={-0.3} nw>Iterations:</T>
        {([
          ['iter-6', 150, 12830, 73, 'Iteration: Google card with stage chip and pending status'],
          ['iter-2', 546, 12818, 66, 'Iteration: Microsoft card with date tab and applicant count'],
          ['iter-3', 150, 12942, 46, 'Iteration: single-row Microsoft card with date, tag and count'],
          ['iter-4', 546, 12943, 46, 'Iteration: compact single-row Microsoft card'],
          ['iter-1', 150, 13013, 87, 'Iteration: Microsoft card with date tab, pending status and count'],
          ['iter-5', 546, 13030, 70, 'Iteration: Microsoft card with date tab and count'],
        ] as const).map(([src, l, t, h, alt]) => (
          <img key={src} className="a iter-card" src={f(`${src}.png`)} alt={alt} style={{ left: l, top: t, width: 349, height: h }} loading="lazy" decoding="async" />
        ))}
      </div>
    </section>
  )
}

export default function Frame2() {
  return (
    <>
      <Intro />
      <Scenario />
      <Results />
      <Rest />
      <NextUp href="#/placement-team" label="Placement Team redesign" />
    </>
  )
}
