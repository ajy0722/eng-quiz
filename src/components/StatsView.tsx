import type { SubjectInfo, FormulaContent } from '../types/content'
import type { FormulaStats } from '../storage'

interface Props {
  subjects: SubjectInfo[]
  formulas: FormulaContent[]
  stats: Record<string, FormulaStats>
  onBack: () => void
}

function pct(correct: number, attempts: number): string {
  if (attempts === 0) return '-'
  return `${Math.round((correct / attempts) * 100)}%`
}

export function StatsView({ subjects, formulas, stats, onBack }: Props) {
  return (
    <div className="stats-view">
      <div className="scope-header">
        <button type="button" className="back-button" onClick={onBack} aria-label="뒤로">
          ‹
        </button>
        <h2>기록</h2>
      </div>
      {subjects.map((subject) => {
        const subjectFormulas = formulas.filter((f) => f.subjectId === subject.id)
        if (subjectFormulas.length === 0) return null
        const agg = subjectFormulas.reduce(
          (acc, f) => {
            const s = stats[f.id]
            return { attempts: acc.attempts + (s?.attempts ?? 0), correct: acc.correct + (s?.correctCount ?? 0) }
          },
          { attempts: 0, correct: 0 },
        )
        return (
          <div key={subject.id} className="stats-subject">
            <h3>
              {subject.name} <span className="stats-pct">{pct(agg.correct, agg.attempts)}</span>
            </h3>
            <ul className="stats-formula-list">
              {subjectFormulas.map((f) => {
                const s = stats[f.id]
                return (
                  <li key={f.id}>
                    <span>{f.name}</span>
                    <span>
                      {pct(s?.correctCount ?? 0, s?.attempts ?? 0)} ({s?.attempts ?? 0}회)
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
