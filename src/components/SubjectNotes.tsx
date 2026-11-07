import { useState } from 'react'
import { MathText } from './MathText'
import { getSubjectNote, setSubjectNote } from '../storage'

interface Props {
  subjectId: string
  subjectName: string
  onBack: () => void
}

export function SubjectNotes({ subjectId, subjectName, onBack }: Props) {
  const [text, setText] = useState(() => getSubjectNote(subjectId))

  function handleChange(value: string) {
    setText(value)
    setSubjectNote(subjectId, value)
  }

  const lines = text.split('\n')
  const hasContent = text.trim().length > 0

  return (
    <div className="subject-notes">
      <div className="scope-header">
        <button type="button" className="back-button" onClick={onBack} aria-label="뒤로">
          ‹
        </button>
        <h2>{subjectName} 메모</h2>
      </div>
      <p className="notes-hint">
        외우고 싶은 공식이나 내용을 자유롭게 적어두세요. 수식은 <code>$...$</code>로 감싸면 렌더링됩니다. (예: 옴의 법칙{' '}
        <code>$V = IR$</code>)
      </p>
      <textarea
        className="notes-textarea"
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={'예)\n옴의 법칙: $V = IR$\n키르히호프 전류법칙: 들어오는 전류 합 = 나가는 전류 합'}
        rows={8}
      />
      {hasContent && (
        <div className="notes-preview">
          {lines.map((line, i) =>
            line.trim().length === 0 ? (
              <br key={i} />
            ) : (
              <div key={i} className="notes-preview-line">
                <MathText text={line} />
              </div>
            ),
          )}
        </div>
      )}
    </div>
  )
}
