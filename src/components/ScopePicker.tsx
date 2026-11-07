import { useState } from 'react'
import type { SubjectInfo, FormulaContent } from '../types/content'

interface Props {
  subjects: SubjectInfo[]
  formulas: FormulaContent[]
  initialSubjectId?: string
  onStart: (formulas: FormulaContent[], label: string) => void
  onBack: () => void
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="scope-header">
      <button type="button" className="back-button" onClick={onBack} aria-label="뒤로">
        ‹
      </button>
      <h2>{title}</h2>
    </div>
  )
}

export function ScopePicker({ subjects, formulas, initialSubjectId, onStart, onBack }: Props) {
  const [subjectId, setSubjectId] = useState<string | null>(initialSubjectId ?? null)
  const [chapterId, setChapterId] = useState<string | null>(null)

  if (!subjectId) {
    return (
      <div className="scope-picker">
        <Header title="과목 선택" onBack={onBack} />
        <div className="option-list">
          {subjects.map((s) => (
            <button key={s.id} type="button" className="option-button" onClick={() => setSubjectId(s.id)}>
              {s.name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const subject = subjects.find((s) => s.id === subjectId)
  if (!subject) return null
  const subjectFormulas = formulas.filter((f) => f.subjectId === subjectId)

  if (subjectFormulas.length === 0) {
    return (
      <div className="scope-picker">
        <Header title={subject.name} onBack={() => setSubjectId(null)} />
        <p>아직 등록된 식이 없습니다.</p>
      </div>
    )
  }

  if (!chapterId) {
    const chaptersWithContent = subject.chapters.filter((ch) => subjectFormulas.some((f) => f.chapterId === ch.id))
    return (
      <div className="scope-picker">
        <Header title={subject.name} onBack={() => setSubjectId(null)} />
        <button
          type="button"
          className="option-button wide primary-option"
          onClick={() => onStart(subjectFormulas, `${subject.name} 전체`)}
        >
          {subject.name} 전체 풀기
        </button>
        <div className="option-list">
          {chaptersWithContent.map((ch) => (
            <button key={ch.id} type="button" className="option-button" onClick={() => setChapterId(ch.id)}>
              {ch.name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const chapter = subject.chapters.find((c) => c.id === chapterId)
  if (!chapter) return null
  const chapterFormulas = subjectFormulas.filter((f) => f.chapterId === chapterId)

  return (
    <div className="scope-picker">
      <Header title={chapter.name} onBack={() => setChapterId(null)} />
      <button
        type="button"
        className="option-button wide primary-option"
        onClick={() => onStart(chapterFormulas, chapter.name)}
      >
        {chapter.name} 전체 풀기
      </button>
      <div className="option-list">
        {chapterFormulas.map((f) => (
          <button key={f.id} type="button" className="option-button" onClick={() => onStart([f], f.name)}>
            {f.name}
          </button>
        ))}
      </div>
    </div>
  )
}
