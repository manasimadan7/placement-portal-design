import { useEffect, type RefObject } from 'react'

/**
 * Scroll-linked zoom for a band of a frame: as the band scrolls through the viewport,
 * every `.sz` image inside it scales up and spreads outward from the band's centre
 * (like a camera flying into the collage), and the picture inside each frame zooms in too.
 *
 * All geometry is in design-canvas units (the frame is 1728px wide before CSS zoom).
 */
export function useScrollZoom(
  frame: RefObject<HTMLElement>,
  band: { top: number; bottom: number; centerX?: number; centerY?: number },
  amount = { from: 0.88, to: 1.32, inner: 0.28 },
) {
  useEffect(() => {
    const el = frame.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // direct children, or children of a `.shift` layer (offsets are then in Figma px)
    const items = Array.from(el.querySelectorAll<HTMLElement>(':scope > .sz, :scope > .shift > .sz')).map((node) => ({
      node,
      cx: node.offsetLeft + node.offsetWidth / 2,
      cy: node.offsetTop + node.offsetHeight / 2,
    }))
    const cx = band.centerX ?? 864
    const cy = band.centerY ?? (band.top + band.bottom) / 2

    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const k = r.height / el.offsetHeight // design units → viewport px (accounts for CSS zoom)
      const top = r.top + band.top * k
      const height = (band.bottom - band.top) * k
      // 0 as the band enters at the bottom of the screen → 1 as it leaves at the top
      const p = Math.min(1, Math.max(0, (window.innerHeight - top) / (window.innerHeight + height)))
      const eased = p * p * (3 - 2 * p)
      const z = amount.from + (amount.to - amount.from) * eased
      const iz = 1 + amount.inner * eased
      for (const it of items) {
        const s = it.node.style
        s.setProperty('--z', z.toFixed(4))
        s.setProperty('--zx', `${((it.cx - cx) * (z - 1)).toFixed(1)}px`)
        s.setProperty('--zy', `${((it.cy - cy) * (z - 1)).toFixed(1)}px`)
        s.setProperty('--iz', iz.toFixed(4))
      }
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
  }, [frame, band.top, band.bottom, band.centerX, band.centerY, amount.from, amount.to, amount.inner])
}
