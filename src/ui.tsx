import type { CSSProperties, ReactNode } from 'react'

/** Resolve a file in /public/assets (works with any deploy base path). */
export const asset = (p: string) => `${import.meta.env.BASE_URL}assets/${p}`

/** Figma's standard drop shadow: 0 4 4 rgba(0,0,0,.25) */
export const SHADOW = '0 4px 4px rgba(0,0,0,0.25)'

type Weight = 300 | 400 | 500 | 600

/* ───────────── Text ───────────── */

type TextProps = {
  l?: number
  t?: number
  w?: number
  h?: number
  /** font-size px (default 16) */
  s?: number
  /** font-weight (default 300 / DM Sans Light) */
  wt?: Weight
  /** colour (default neutral/600) */
  c?: string
  /** letter-spacing px (default -0.6909) */
  tr?: number
  lh?: number | string
  nw?: boolean
  pw?: boolean
  center?: boolean
  italic?: boolean
  balance?: boolean
  style?: CSSProperties
  children: ReactNode
}

/** Absolutely positioned DM Sans text block (matches Figma's text-box-trim + opsz 14). */
export function T({
  l, t, w, h, s = 16, wt = 300, c = 'var(--n600)', tr = -0.6909, lh,
  nw, pw, center, italic, balance, style, children,
}: TextProps) {
  return (
    <div
      className="tx t"
      style={{
        left: l, top: t, width: w, height: h,
        fontSize: s, fontWeight: wt, color: c, letterSpacing: tr, lineHeight: lh,
        whiteSpace: nw ? 'nowrap' : pw ? 'pre-wrap' : undefined,
        textAlign: center ? 'center' : undefined,
        fontStyle: italic ? 'italic' : undefined,
        ...(balance ? ({ textWrap: 'balance' } as CSSProperties) : null),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** Inline span with optional colour / weight / size. */
export function S({ c, wt, s, children }: { c?: string; wt?: Weight; s?: number; children: ReactNode }) {
  return <span style={{ color: c, fontWeight: wt, fontSize: s }}>{children}</span>
}

/** Empty paragraph – Figma's blank line (zero-width space). */
export const Blank = () => <p>{'​'}</p>

/* ───────────── Images ───────────── */

type PicProps = {
  l: number
  t: number
  w: number
  h: number
  src: string
  r?: number
  shadow?: boolean | string
  blur?: number
  border?: string
  blend?: CSSProperties['mixBlendMode']
  fit?: CSSProperties['objectFit']
  pos?: string
  alt?: string
  opacity?: number
  /** take part in the section's scroll-linked zoom */
  zoom?: boolean
  style?: CSSProperties
}

/** Absolutely positioned image box (object-fit: cover by default). */
export function Pic({ l, t, w, h, src, r, shadow, blur, border, blend, fit, pos, alt = '', opacity, zoom, style }: PicProps) {
  return (
    <div
      className={zoom ? 'a sz' : 'a'}
      style={{
        left: l, top: t, width: w, height: h, borderRadius: r, border,
        boxShadow: shadow === true ? SHADOW : shadow || undefined,
        filter: blur ? `blur(${blur}px)` : undefined,
        // Blend on the outer (animated) layer so it still blends with the page while fading in.
        mixBlendMode: blend,
        ...style,
      }}
    >
      <img
        className="fill"
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ borderRadius: r, objectFit: fit, objectPosition: pos, opacity }}
      />
    </div>
  )
}

type CropProps = {
  l: number
  t: number
  w: number
  h: number
  src: string
  /** inner image geometry in % of the box: [width, height, left, top] */
  img: [number, number, number, number]
  r?: number
  blend?: CSSProperties['mixBlendMode']
  blur?: number
  shadow?: boolean
  alt?: string
  /** take part in the section's scroll-linked zoom */
  zoom?: boolean
}

/** Image box that shows a cropped region of a larger image (Figma "crop" fill). */
export function Crop({ l, t, w, h, src, img: [iw, ih, il, it], r, blend, blur, shadow, alt = '', zoom }: CropProps) {
  return (
    <div
      className={zoom ? 'a sz' : 'a'}
      style={{
        left: l, top: t, width: w, height: h, borderRadius: r,
        filter: blur ? `blur(${blur}px)` : undefined,
        boxShadow: shadow ? SHADOW : undefined,
        mixBlendMode: blend,
      }}
    >
      <div className="cover clip" style={{ borderRadius: r }}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{ position: 'absolute', maxWidth: 'none', width: `${iw}%`, height: `${ih}%`, left: `${il}%`, top: `${it}%` }}
        />
      </div>
    </div>
  )
}

/** Rotated / flipped node: outer bounding box (l,t,w,h) with a centred inner box (iw×ih) transformed by `tf`. */
export function Rot({
  l, t, w, h, iw, ih, tf, style, inner, children,
}: {
  l: number; t: number; w: number; h: number; iw: number; ih: number; tf: string
  style?: CSSProperties; inner?: CSSProperties; children: ReactNode
}) {
  return (
    <div className="a rc" style={{ left: l, top: t, width: w, height: h, ...style }}>
      <div style={{ flex: 'none', transform: tf }}>
        <div style={{ position: 'relative', width: iw, height: ih, ...inner }}>{children}</div>
      </div>
    </div>
  )
}

/** Vector image (exported SVG). `inset` reproduces Figma's stroke bleed offsets. */
export function Vec({ l, t, w, h, src, inset }: { l?: number; t?: number; w?: number; h?: number; src: string; inset?: string }) {
  const positioned = l !== undefined
  const img = <img className="vec" src={src} alt="" />
  const body = inset ? <div className="a" style={{ inset }}>{img}</div> : img
  return positioned ? (
    <div className="a" style={{ left: l, top: t, width: w, height: h }}>{body}</div>
  ) : (
    body
  )
}

/** Fills its (relative) parent – used inside <Rot>. */
export function FillImg({ src, r, alt = '' }: { src: string; r?: number; alt?: string }) {
  return <img className="fill" src={src} alt={alt} loading="lazy" decoding="async" style={{ borderRadius: r }} />
}

/* ───────────── Pills / chips ───────────── */

type PillProps = {
  l: number
  t: number
  w: number
  h: number
  bg: string
  shade: string
  label: string
  /** When given, the pill renders as a link to that page. */
  href?: string
}

export function Pill({ l, t, w, h, bg, shade, label, href }: PillProps) {
  const style = { left: l, top: t, width: w, height: h, background: bg, '--shade': shade } as CSSProperties
  const text = <span className="tx" style={{ fontSize: 20, fontWeight: 500, color: '#fff', letterSpacing: -0.3, whiteSpace: 'nowrap' }}>{label}</span>
  return href ? (
    <a className="a rc pill pill-btn" style={style} href={href}>
      {text}
    </a>
  ) : (
    <div className="a rc pill" style={style}>{text}</div>
  )
}

/** Invisible marker at a Figma y – the top menu lists these as in-page chapters. */
export function Chapter({ t, name }: { t: number; name: string }) {
  return <i className="chap" data-chapter={name} data-noreveal aria-hidden="true" style={{ top: t }} />
}
