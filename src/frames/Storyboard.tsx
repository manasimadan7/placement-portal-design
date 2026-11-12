import { useRef, type ReactNode } from 'react'
import { T } from '../ui'
import { usePinProgress } from '../usePin'

/** One storyboard frame; art/captions are positioned relative to the frame's box. */
export type Panel = { w: number; h: number; n: string; nc?: string; nl: number; nt: number; art?: ReactNode; caption: ReactNode }

const GAP = 90
const PAD = 149

/**
 * Pinned storyboard: the section sticks to the screen while its frames slide horizontally
 * as you scroll down (1px of scroll â‰ˆ 1px of horizontal travel).
 */
export function Storyboard({ label, heading, panels, accent }: { label: string; heading: ReactNode; panels: Panel[]; accent: string }) {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const trackW = PAD * 2 + panels.reduce((s, p) => s + p.w, 0) + GAP * (panels.length - 1)
  const travel = Math.max(0, trackW - 1728) // design units the track slides left

  usePinProgress(section, (p) => {
    if (track.current) track.current.style.transform = `translate3d(${(-p * travel).toFixed(1)}px,0,0)`
    if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`
  })

  return (
    <section ref={section} className="pin" style={{ height: `calc(100vh + ${travel}px * var(--s))` }} aria-label={label} data-chapter={label}>
      <div className="pin-sticky">
        <div className="pin-stage">
          <div className="pin-canvas" style={{ height: 640 }}>
            <T l={149} t={0} wt={500} nw>{heading}</T>
            <div ref={track} className="hs-track" style={{ top: 60, width: trackW, paddingLeft: PAD, paddingRight: PAD, gap: GAP }}>
              {panels.map((p) => (
                <div key={p.n} className="hs-panel" style={{ width: p.w, height: 480 }}>
                  <div className="a hs-box" style={{ left: 0, top: 0, width: p.w, height: p.h }} />
                  {p.art}
                  <T l={p.nl} t={p.nt} s={24} c={p.nc} nw>{p.n}</T>
                  {p.caption}
                </div>
              ))}
            </div>
            <div className="hs-progress" style={{ left: 149, top: 600, width: 1430 }}>
              <span ref={bar} style={{ background: accent }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
