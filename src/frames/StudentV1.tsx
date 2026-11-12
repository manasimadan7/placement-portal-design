import { asset } from '../ui'
import type { Step } from './Prototype'

/*
 * Student V1 prototypes (screens in /assets/sv1, exported 2× from Figma).
 *   Job apply – phone frames from "Student portal | key screens" (48:18366), 440×904 design px:
 *     home 31:3267 (taller, cropped from the top) · role 35:17369 · select 37:18105
 *     (the flow opens on a push notification drawn over the home screen)
 *   Resume – MacBook frames 178:1255 (cards) and 157:1244 (checklist + preview), 1728×1117.
 */

export const PHONE = { sw: 440, sh: 904 } as const

/* ── a push notification about a new job, glass banner sliding in over the home screen ── */
function NewJobNotification() {
  return (
    <div className="phone-notif" style={{ left: 14, top: 22, width: 412, height: 92 }} aria-hidden="true">
      <img src={asset('f1/ipt-logo.png')} alt="" width={40} height={40} />
      <span className="phone-notif-body">
        <span className="phone-notif-top">
          <b>Placement Portal</b>
          <i>now</i>
        </span>
        <span className="phone-notif-title">New job · Boston Consulting Group</span>
        <span className="phone-notif-text">Product Manager – applications close 16 Jun</span>
      </span>
    </div>
  )
}

/** live UI over the phone screens: the notification on the first walkthrough step */
export function jobV1Overlay(step: number) {
  return step === 0 ? <NewJobNotification key="notif" /> : null
}

export const JOB_V1_STEPS: Step[] = [
  {
    screen: 'home',
    caption: 'A new job is posted – a notification lands on the student’s phone.',
    cursor: [220, 74],
    click: true,
    focus: [14, 22, 412, 92],
    zoom: [10, 0, 420, 540],
  },
  {
    screen: 'role',
    caption: 'Tapping it opens the job description directly – dates, the role, the JD as a PDF and the stipend.',
    cursor: [199, 661],
    focus: [40, 290, 380, 510],
    zoom: [30, 270, 380, 560],
  },
  {
    screen: 'role',
    caption: 'Sign up for the role…',
    cursor: [217, 837],
    click: true,
    focus: [141, 816, 152, 43],
    zoom: [97, 640, 240, 264],
  },
  {
    screen: 'select',
    caption: '…pick which resume to send…',
    cursor: [97, 697],
    click: true,
    focus: [44, 627, 107, 140],
    zoom: [0, 480, 240, 420],
  },
  {
    screen: 'select',
    caption: '…and apply.',
    cursor: [217, 848],
    click: true,
    focus: [141, 826, 152, 43],
    zoom: [97, 640, 240, 264],
  },
  {
    screen: 'home',
    caption: 'The application then appears on the profile as Pending – the only place to check where it stands.',
    cursor: [350, 419],
    focus: [44, 363, 348, 72],
    zoom: [38, 200, 360, 400],
  },
]
export const RESUME_V1_STEPS: Step[] = [
  {
    screen: 'resume-cards',
    caption: 'V1 resume: points as cards under section tabs – students could add their own sections, like Achievements.',
    cursor: [817, 195],
    focus: [763, 175, 108, 38],
    zoom: [170, 150, 860, 100],
  },
  {
    screen: 'resume-cards',
    caption: 'Each point had a single Proof button – it looked the same whether or not proof had been submitted.',
    cursor: [1527, 461],
    click: true,
    focus: [1479, 445, 96, 32],
    zoom: [907, 262, 705, 257],
  },
  {
    screen: 'resume-cards',
    caption: 'A + card adds a new point.',
    cursor: [1259, 665],
    click: true,
    focus: [907, 537, 705, 257],
  },
  {
    screen: 'resume-preview',
    caption: 'In the resume view, checkboxes decide which points make it onto the resume…',
    cursor: [829, 790],
    click: true,
    focus: [818, 779, 22, 22],
    zoom: [184, 246, 680, 730],
  },
  {
    screen: 'resume-preview',
    caption: '…next to a fixed-template preview – with no control over font, layout or spacing.',
    cursor: [1286, 560],
    focus: [917, 99, 737, 970],
  },
  {
    screen: 'resume-preview',
    caption: 'New points are added from the + at the bottom of the list.',
    cursor: [224, 1036],
    click: true,
    focus: [183, 995, 82, 82],
    zoom: [150, 780, 760, 330],
  },
]
