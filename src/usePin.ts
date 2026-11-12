import { useEffect, useRef, type RefObject } from 'react'

/**
 * Progress (0 → 1) through a pinned section: 0 when its top reaches the top of the screen,
 * 1 when its sticky content is about to scroll away. `onProgress` runs at most once per frame.
 */
export function usePinProgress(section: RefObject<HTMLElement>, onProgress: (p: number) => void) {
  const cb = useRef(onProgress)
  cb.current = onProgress

  useEffect(() => {
    const el = section.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const travel = r.height - window.innerHeight
      cb.current(travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [section])
}
