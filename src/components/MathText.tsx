import katex from 'katex'
import 'katex/dist/katex.min.css'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderMath(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, { throwOnError: false, displayMode })
  } catch {
    return escapeHtml(latex)
  }
}

export function MathText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/\$([^$]+)\$/g)
  const html = parts.map((part, i) => (i % 2 === 1 ? renderMath(part, false) : escapeHtml(part))).join('')
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

export function MathBlock({ latex, className }: { latex: string; className?: string }) {
  const html = renderMath(latex, true)
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
