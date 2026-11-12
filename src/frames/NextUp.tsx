/** End-of-page hand-off to the next counterpart's redesign. */
export default function NextUp({ href, label }: { href: string; label: string }) {
  return (
    <section className="next-up" aria-label={`Next: ${label}`} data-chapter="Up next">
      <div>
        <small>Up next</small>
        <h2>
          Moving onto
          <b>{label}</b>
        </h2>
        <a href={href} onClick={() => window.scrollTo({ top: 0 })}>
          See the {label.toLowerCase()} <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  )
}
