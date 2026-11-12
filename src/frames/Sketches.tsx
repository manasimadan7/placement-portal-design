import { useId, type ReactNode } from 'react'

/**
 * Pen-sketch illustrations for the Placement Team storyboard, matching the student storyboard's
 * hand-drawn style: loose black ink lines, slightly wobbly (an SVG displacement filter),
 * no fills. Positions are relative to each storyboard panel's box.
 */
function Sketch({ l, t, w, h, children, seed = 3 }: { l: number; t: number; w: number; h: number; children: ReactNode; seed?: number }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className="a sketch" style={{ left: l, top: t }} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <defs>
        <filter id={`wob${id}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={seed} />
          <feDisplacementMap in="SourceGraphic" scale="3.2" />
        </filter>
      </defs>
      <g filter={`url(#wob${id})`} fill="none" stroke="#151515" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  )
}

/** Ravi – short spiky hair, simple face; (x, y) is the top of the head, s the scale */
function Ravi({ x, y, s = 1, mood = 'calm' }: { x: number; y: number; s?: number; mood?: 'calm' | 'stressed' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* hair */}
      <path d="M-30 18 C-34 -2 -18 -14 2 -12 C20 -12 34 0 30 20" />
      <path d="M-26 6 L-22 -8 M-14 -2 L-10 -16 M-2 -4 L2 -18 M10 -2 L16 -14 M22 4 L28 -6" />
      {/* face */}
      <path d="M-28 16 C-30 40 -22 62 0 66 C22 62 30 40 28 16" />
      {/* brows, eyes, nose, mouth */}
      {mood === 'stressed' ? <path d="M-18 24 L-8 28 M18 24 L8 28" /> : <path d="M-18 26 L-8 25 M8 25 L18 26" />}
      <circle cx="-12" cy="34" r="1.6" fill="#151515" />
      <circle cx="12" cy="34" r="1.6" fill="#151515" />
      <path d="M0 36 L-3 46 L2 47" />
      {mood === 'stressed' ? <path d="M-8 56 C-4 52 4 52 8 56" /> : <path d="M-8 53 C-3 57 3 57 8 53" />}
      {/* neck + shoulders */}
      <path d="M-10 66 L-11 76 M10 66 L11 76" />
      <path d="M-11 76 C-34 80 -46 92 -50 112 M11 76 C34 80 46 92 50 112" />
    </g>
  )
}

const Lines = ({ x, y, w, n, gap = 9 }: { x: number; y: number; w: number; n: number; gap?: number }) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <path key={i} d={`M${x} ${y + i * gap} L${x + w * (i % 3 === 2 ? 0.6 : 1)} ${y + i * gap + 1}`} />
    ))}
  </>
)

/* 1 · knowledge transfer over calls */
export function SketchCalls() {
  return (
    <Sketch l={236} t={40} w={290} h={250} seed={4}>
      <Ravi x={86} y={64} s={1.05} />
      {/* phone at his ear */}
      <path d="M118 104 L132 98 L146 132 L132 138 Z" />
      {/* call waves */}
      <path d="M152 92 C160 98 162 108 158 116 M160 82 C172 92 174 110 166 122" />
      {/* speech bubble with the old team */}
      <path d="M180 30 C180 14 270 12 272 30 L272 70 C272 84 236 86 214 84 L198 98 L202 82 C186 80 180 78 180 66 Z" />
      <path d="M196 38 L256 37 M196 50 L248 50 M196 62 L232 61" />
      {/* tiny notepad */}
      <path d="M194 170 L262 164 L268 236 L200 242 Z" />
      <Lines x={206} y={184} w={48} n={5} gap={10} />
    </Sketch>
  )
}

/* 2 · scraping emails, LinkedIn, Internshala */
export function SketchScrape() {
  return (
    <Sketch l={20} t={60} w={180} h={230} seed={7}>
      {/* envelope */}
      <path d="M14 20 L104 14 L108 74 L18 80 Z" />
      <path d="M14 20 L62 52 L104 14" />
      {/* 'in' badge */}
      <path d="M40 104 C40 96 98 94 100 102 L102 152 C102 160 44 162 42 154 Z" />
      <path d="M56 122 L56 146 M56 112 L56 113 M70 146 L70 124 M70 132 C74 122 88 122 88 132 L88 146" />
      {/* globe */}
      <circle cx="132" cy="186" r="30" />
      <path d="M102 186 L162 186 M132 156 C118 170 118 202 132 216 M132 156 C146 170 146 202 132 216" />
      {/* arrow to the sheet */}
      <path d="M118 52 C150 56 168 70 172 96 M164 88 L172 98 L178 86" />
    </Sketch>
  )
}

/* 3 · verifying 150 resumes against their proof */
export function SketchVerify() {
  return (
    <Sketch l={40} t={36} w={760} h={262} seed={11}>
      {/* stack of resumes */}
      <path d="M40 46 L178 36 L188 214 L50 224 Z" />
      <path d="M32 54 L36 232 L176 222" />
      <path d="M24 62 L28 240 L168 230" />
      <path d="M64 64 L118 60" strokeWidth="3" />
      <Lines x={64} y={84} w={100} n={11} gap={11} />
      <path d="M60 196 C70 186 84 186 90 196 M100 184 L112 204 M118 196 L136 194" />
      <text x="128" y="30" fontFamily="'Caveat', 'Comic Sans MS', cursive" fontSize="26" fill="#151515" stroke="none">150</text>
      {/* magnifier over one pointer */}
      <circle cx="150" cy="134" r="40" />
      <path d="M178 164 L214 202" strokeWidth="5" />
      {/* ⇄ between resume and proof */}
      <path d="M232 98 L318 96 M306 86 L320 96 L306 106" />
      <path d="M318 138 L232 140 M244 128 L230 140 L244 150" />
      {/* proof pdf */}
      <path d="M340 40 L452 34 L474 56 L480 214 L350 222 Z" />
      <path d="M452 34 L454 58 L474 56" />
      <path d="M364 84 C364 74 410 72 412 80 L414 108 C414 116 368 118 366 110 Z" />
      <text x="372" y="104" fontFamily="'Caveat', 'Comic Sans MS', cursive" fontSize="22" fill="#151515" stroke="none">PDF</text>
      <Lines x={366} y={136} w={92} n={6} gap={12} />
      {/* checklist: ticks, a cross and the resubmission loop */}
      <path d="M540 52 L556 66 L584 34" strokeWidth="2.6" />
      <path d="M600 50 L700 48" />
      <path d="M540 108 L556 122 L584 90" strokeWidth="2.6" />
      <path d="M600 106 L690 105" />
      <path d="M542 150 L578 182 M578 150 L542 182" strokeWidth="2.6" />
      <path d="M600 166 L680 165" />
      <path d="M646 210 C620 236 572 232 560 208 M560 208 L556 224 M560 208 L574 214" />
      <path d="M646 210 C660 196 690 196 704 214 M704 214 L708 198 M704 214 L690 210" />
      <text x="612" y="252" fontFamily="'Caveat', 'Comic Sans MS', cursive" fontSize="20" fill="#151515" stroke="none">resubmit</text>
    </Sketch>
  )
}

/* 4 · review meeting – notes and WhatsApp into an excel sheet */
export function SketchReview() {
  return (
    <Sketch l={20} t={30} w={510} h={276} seed={5}>
      <Ravi x={92} y={66} s={1.1} mood="stressed" />
      {/* sweat + worry marks */}
      <path d="M44 70 C40 78 44 84 48 80 C50 76 48 72 44 70 Z M150 58 C146 66 150 72 154 68 C156 64 154 60 150 58 Z" />
      <path d="M36 44 L28 36 M150 34 L158 24 M92 22 L92 12" />
      {/* phone with chat bubbles */}
      <path d="M190 40 L246 36 L252 140 L196 144 Z" />
      <path d="M204 56 C204 50 234 48 236 54 L236 66 C236 72 206 74 206 68 Z" />
      <path d="M212 84 C212 78 240 78 242 84 L242 96 C242 102 214 104 214 98 Z" />
      <path d="M204 112 C204 106 228 104 230 110 L230 120 C230 126 206 128 206 122 Z" />
      {/* sticky notes */}
      <path d="M186 172 L240 166 L246 222 L192 228 Z" />
      <Lines x={198} y={186} w={36} n={3} gap={11} />
      <path d="M150 188 L194 182 L200 236 L156 242 Z" />
      {/* arrow to excel */}
      <path d="M266 130 C300 120 322 124 346 138 M334 128 L348 140 L332 146" />
      {/* spreadsheet grid */}
      <path d="M360 70 L494 62 L500 238 L366 246 Z" />
      <path d="M362 110 L496 102 M364 150 L498 142 M365 190 L499 182" />
      <path d="M404 68 L410 244 M450 64 L456 242" />
      <text x="392" y="56" fontFamily="'Caveat', 'Comic Sans MS', cursive" fontSize="22" fill="#151515" stroke="none">excel</text>
    </Sketch>
  )
}
