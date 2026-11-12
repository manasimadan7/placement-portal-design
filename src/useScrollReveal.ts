import { useEffect } from 'react'

const DESIGN_WIDTH = 1728

/** Scale the 1728px Figma canvas to the current viewport width. */
export function applyScale() {
  const w = document.documentElement.clientWidth || window.innerWidth
  document.documentElement.style.setProperty('--s', String(w / DESIGN_WIDTH))
}

/**
 * Fade + rise every layer of every frame as it scrolls into view.
 * Layers that enter together are staggered slightly so a section "builds up".
 */
export function useScrollReveal(rescanKey?: unknown) {
  useEffect(() => {
    applyScale()
    window.addEventListener('resize', applyScale)

    // Re-scans whenever `rescanKey` changes (e.g. a counterpart section is opened);
    // layers that are already revealed are left as they are.
    const layers = Array.from(
      document.querySelectorAll<HTMLElement>('.frame > :not([data-noreveal]), .frame > .shift > :not([data-noreveal])'),
    ).filter(
      (el) => !el.classList.contains('in'),
    )
    layers.forEach((el) => el.classList.add('r'))

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) {
      layers.forEach((el) => el.classList.add('in'))
      return () => window.removeEventListener('resize', applyScale)
    }

    const pending = new Set(layers)

    const reveal = (els: HTMLElement[]) => {
      els
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .sort((a, b) => a.r.top - b.r.top || a.r.left - b.r.left)
        .forEach(({ el }, i) => {
          el.style.transitionDelay = `${Math.min(i * 70, 490)}ms`
          el.classList.add('in')
          pending.delete(el)
          io.unobserve(el)
        })
    }

    const io = new IntersectionObserver(
      (entries) => reveal(entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement)),
      { rootMargin: '0px 0px -10% 0px', threshold: 0 },
    )
    layers.forEach((el) => io.observe(el))

    // Safety net: on fast flings / jump-scrolls a layer can cross the viewport between two
    // observer checks. Reveal anything that has already been scrolled past.
    let raf = 0
    const sweep = () => {
      raf = 0
      const limit = window.innerHeight * 0.9
      const passed = [...pending].filter((el) => el.getBoundingClientRect().top < limit)
      if (passed.length) reveal(passed)
    }
    const onScroll = () => {
      if (!raf && pending.size) raf = requestAnimationFrame(sweep)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', applyScale)
    }
  }, [rescanKey])
}
