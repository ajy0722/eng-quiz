import type { SubjectInfo, FormulaContent } from '../types/content'
import type { FormulaStats } from '../storage'

interface Props {
  subjects: SubjectInfo[]
  formulas: FormulaContent[]
  stats: Record<string, FormulaStats>
  onStartAll: () => void
  onPickSubject: (subjectId: string) => void
  onOpenNotes: (subjectId: string) => void
}

function subjectAccuracy(
  subjectId: string,
  formulas: FormulaContent[],
  stats: Record<string, FormulaStats>,
): number | null {
  const agg = formulas
    .filter((f) => f.subjectId === subjectId)
    .reduce(
      (acc, f) => {
        const s = stats[f.id]
        return { attempts: acc.attempts + (s?.attempts ?? 0), correct: acc.correct + (s?.correctCount ?? 0) }
      },
      { attempts: 0, correct: 0 },
    )
  if (agg.attempts === 0) return null
  return Math.round((agg.correct / agg.attempts) * 100)
}

export function Home({ subjects, formulas, stats, onStartAll, onPickSubject, onOpenNotes }: Props) {
  return (
    <div className="home">
      <h1>공학 암기 퀴즈</h1>
      <button type="button" className="primary-button shuffle-button" onClick={onStartAll}>
        전체 섞어서 5문항
      </button>
      <div className="subject-list">
        {subjects.map((subject) => {
          const count = formulas.filter((f) => f.subjectId === subject.id).length
          const accuracy = subjectAccuracy(subject.id, formulas, stats)
          return (
            <div key={subject.id} className="subject-card">
              <button type="button" className="subject-card-main" onClick={() => onPickSubject(subject.id)}>
                <span className="subject-name">{subject.name}</span>
                <span className="subject-meta">
                  식 {count}개{accuracy !== null ? ` · 정답률 ${accuracy}%` : ''}
                </span>
              </button>
              <button
                type="button"
                className="subject-notes-button"
                onClick={() => onOpenNotes(subject.id)}
                aria-label={`${subject.name} 메모`}
              >
                메모
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
