import { Fragment } from 'react'

/**
 * Scroll-driven word reveal. Text is split into words; `shown` words are fully inked, the rest
 * wait as faint ghosts. Phrases listed in `marks` get a purple highlighter sweep once revealed.
 * A blank line ("\n\n") starts a new paragraph.
 */
export type Word = { w: string; mark: boolean; br: boolean }

export function splitWords(text: string, marks: string[] = []): Word[] {
  const lower = text.toLowerCase()
  const spans = marks.map((m) => {
    const i = lower.indexOf(m.toLowerCase())
    return [i, i + m.length] as const
  })
  const out: Word[] = []
  const re = /(\n\n)|(\S+)/g
  let m: RegExpExecArray | null
  let br = false
  while ((m = re.exec(text))) {
    if (m[1]) {
      br = true
      continue
    }
    const at = m.index
    out.push({ w: m[2], mark: spans.some(([a, b]) => a >= 0 && at >= a && at < b), br })
    br = false
  }
  return out
}

export function Words({ words, shown }: { words: Word[]; shown: number }) {
  return (
    <>
      {words.map((x, i) => (
        <Fragment key={i}>
          {x.br && <span className="wr-br" aria-hidden="true" />}
          {/* inside a highlighted phrase the space belongs to the word, so the marker runs unbroken */}
          {x.mark && words[i + 1]?.mark ? (
            <span className={`wr${i < shown ? ' on' : ''} mk`}>{x.w} </span>
          ) : (
            <>
              <span className={`wr${i < shown ? ' on' : ''}${x.mark ? ' mk' : ''}`}>{x.w}</span>{' '}
            </>
          )}
        </Fragment>
      ))}
    </>
  )
}
