import { useLayoutEffect, useRef, useState } from 'react'
import { asset, Rot, T } from '../ui'
import { usePinProgress } from '../usePin'

const f = (n: string) => asset(`f2/${n}`)

const COLOR = '#5084a4' // one colour for every stat
const STATS = [
  { value: '88', text: 'felt forced to manually log in and hunt for updates multiple times a day.' },
  { value: '82', text: 'reported getting overwhelmed and confused by scattered updates across WhatsApp, the Blog, and the Portal.' },
  { value: '43', text: 'Were unclear on rules and regulations regarding the placement season and weren’t able to recall.' },
]

const CYCLES = 3 // reel holds 0–9 three times so it can always spin forward
const REEL = Array.from({ length: CYCLES * 10 }, (_, i) => i % 10)

/**
 * One slot-machine reel. On every change it spins forward at least one full turn and
 * lands on the new digit with a little overshoot; later reels start a beat later.
 */
function RollDigit({ digit, delay }: { digit: string; delay: number }) {
  const reel = useRef<HTMLSpanElement>(null)
  const pos = useRef(Number(digit)) // current reel index
  const [first] = useState(Number(digit))

  useLayoutEffect(() => {
    const el = reel.current!
    const d = Number(digit)
    const at = (i: number) => `translateY(${(-i / REEL.length) * 100}%)`
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = pos.current % 10
    if (reduce) {
      el.style.transition = 'none'
      el.style.transform = at(d)
      pos.current = d
      return
    }
    if (start === d && pos.current === d) return // first render
    // jump (invisibly) back to the first cycle, then spin forward to the target
    el.style.transition = 'none'
    el.style.transform = at(start)
    void el.offsetHeight
    const target = start + ((d - start + 10) % 10) + 10
    el.style.transition = `transform 1.15s cubic-bezier(0.2, 0.85, 0.25, 1.08) ${delay}ms`
    el.style.transform = at(target)
    pos.current = target
  }, [digit, delay])

  return (
    <span className="roll">
      <span ref={reel} className="roll-reel" style={{ transform: `translateY(${(-first / REEL.length) * 100}%)` }}>
        {REEL.map((n, i) => (
          <span key={i}>{n}</span>
        ))}
      </span>
    </span>
  )
}

/**
 * "Results of the study" – pinned; everything stays still while the stat rolls
 * 88% → 82% → 43% as you scroll, one number and description at a time.
 */
export default function Results() {
  const section = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)
  usePinProgress(section, (p) => setStep(Math.min(STATS.length - 1, Math.floor(p * STATS.length))))
  const s = STATS[step]

  return (
    <section ref={section} className="pin" style={{ height: `calc(100vh + ${(STATS.length - 1) * 85}vh)` }} aria-label="Results of the study" data-chapter="Results">
      <div className="pin-sticky">
        <div className="pin-stage">
          <div className="pin-canvas" style={{ height: 800 }}>
            <T l={150} t={40} w={250} s={24} wt={500}>Results of the study </T>
            <T l={150} t={117} w={350}>
              <p>I conducted a study among 65 students - </p>
              <p>to understand what is the mismatch in expectations</p>
            </T>

            <Rot l={1136.35} t={0} w={501.298} h={785.526} iw={382} ih={731} tf="rotate(9.84deg)">
              <img className="fill" src={f('vector-curve.svg')} alt="" style={{ objectFit: 'fill' }} />
            </Rot>

            <div className="a res-number" style={{ left: 150, top: 270, color: COLOR }} aria-label={`${s.value}%`}>
              {s.value.split('').map((d, i) => (
                <RollDigit key={i} digit={d} delay={i * 120} />
              ))}
              <span className="res-pct">%</span>
            </div>

            <div key={step} className="a res-desc" style={{ left: 720, top: 350, width: 440 }}>
              <p className="tx" style={{ fontSize: 30, fontWeight: 300, color: 'var(--n600)' }}>{s.text}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
