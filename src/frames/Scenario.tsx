import { asset, Crop, Pic, S, T } from '../ui'
import { Storyboard, type Panel } from './Storyboard'

const f = (n: string) => asset(`f2/${n}`)
const TEAL = 'var(--teal)'

/* Student storyboard panels, from the Figma storyboard (positions are relative to each panel's box). */

const notes = (l: number, t: number, w: number, h: number, img: [number, number, number, number]) => (
  <Crop l={l} t={t} w={w} h={h} src={f('notes.png')} img={img} blend="hard-light" />
)
const Badge = ({ l, t }: { l: number; t: number }) => (
  <div className="a" style={{ left: l, top: t, width: 39, height: 39 }}>
    <div className="a" style={{ inset: 0, borderRadius: 80, background: 'var(--da-l)' }} />
    <Pic l={10} t={10} w={20} h={20} src={f('ipt-logo.png')} alt="Portal" />
  </div>
)

const PANELS: Panel[] = [
  {
    w: 826, h: 285, n: '0. ', nl: 22, nt: 23,
    art: (
      <>
        <Pic l={95} t={20} w={299} h={250} src={f('scenario-2.png')} blend="hard-light" fit="fill" pos="bottom" />
        <Pic l={463} t={40} w={294} h={215} src={f('scenario-3.png')} blend="hard-light" fit="fill" pos="bottom" />
      </>
    ),
    caption: (
      <T l={0} t={329} w={600} c="var(--n500)" pw>
        <p>
          <S c={TEAL}>Students at IITB</S> are preparing their resume for the upcoming placement drive.
        </p>
        <p>Part of preparing these resumes is also keeping in mind the different companies that might be coming and constructing the contents accordingly.</p>
        <p>
          After that they have to <S c={TEAL}>submit their resume on the portal</S> and <S c={TEAL}>with relevant proof attach to each pointer</S> , be it a internship experience or a position of responsibility.
        </p>
      </T>
    ),
  },
  {
    w: 546, h: 316, n: '1.', nl: 22, nt: 18,
    art: (
      <>
        {notes(187, 18, 314, 280, [392.93, 622.98, -0.21, -18.89])}
        {notes(47, 50, 153, 189, [392.93, 452.13, -83.78, -0.06])}
        <Pic l={489} t={257} w={46} h={46} src={f('whatsapp.png')} alt="WhatsApp" />
      </>
    ),
    caption: (
      <T l={0} t={344} w={546} c="var(--n500)" pw>
        <p style={{ fontWeight: 500 }}>Srishti Shinde</p>
        <p>Has a packed college schedule and doesn't spend much time online.</p>
        <p>
          She <S wt={400} c={TEAL}>almost missed</S> an important <S wt={400} c={TEAL}>WhatsApp update regarding  job application</S>.
        </p>
      </T>
    ),
  },
  {
    w: 826, h: 316, n: '2.', nl: 19, nt: 18,
    art: (
      <>
        {notes(19, 11, 461, 303, [291.47, 627.86, -145.85, -12.61])}
        {notes(539, 71, 251, 226, [574.22, 901.61, -480.17, -58.41])}
        <Badge l={770} t={248} />
      </>
    ),
    caption: (
      <>
        <T l={0} t={363} w={382} c="var(--n500)">
          She logs onto <S wt={400} c={TEAL}>portal</S> but after seeing the<S wt={400} c={TEAL}> job description </S>she's confused whether or not to apply.
        </T>
        <T l={400} t={363} w={426} c="var(--n500)">
          She Talks to some seniors , alumni and even coordinators and reads blogs about the company to get clarity .
        </T>
      </>
    ),
  },
  {
    w: 826, h: 316, n: '3.', nc: 'var(--n500)', nl: 23, nt: 21,
    art: (
      <>
        {notes(32, 30, 745.896, 255, [149.63, 619.68, -6.47, -125.91])}
        <Badge l={764} t={246} />
      </>
    ),
    caption: (
      <>
        <T l={0} t={363} w={382} c="var(--n500)">She is anxious regarding the shortlist publishing.</T>
        <T l={421} t={363} w={382} c="var(--n500)">Due to this coordinators are receiving many queries from students like her.</T>
      </>
    ),
  },
  {
    w: 546, h: 316, n: '4.', nc: 'var(--n500)', nl: 31, nt: 21,
    art: (
      <>
        {notes(136, 36, 273, 244, [392.93, 622.98, -296.65, -122.43])}
        <Crop l={468} t={217} w={75} h={78} src={f('blog-icon.png')} img={[104, 100, 0, 0]} alt="Blog" />
      </>
    ),
    caption: (
      <T l={0} t={363} w={546} c="var(--n500)">
        <p>
          She is <S wt={400} c={TEAL}>notified on WhatsApp regarding shortlist </S>being out.
        </p>
        <p>
          She then has to go on <S wt={400} c={TEAL}>Blog</S> and find her name <S wt={400} c={TEAL}>among 30 other students</S>
        </p>
      </T>
    ),
  },
]

/** "Lets understand that through a scenario" – student storyboard, slides horizontally. */
export default function Scenario() {
  return <Storyboard label="Scenario" heading="Lets understand that through a scenario" panels={PANELS} accent="var(--teal)" />
}
