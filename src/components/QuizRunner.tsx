import { useMemo, useState } from 'react'
import type { FormulaContent } from '../types/content'
import { buildQuiz } from '../engine/quizBuilder'
import { getFormulaStats, recordAttempt } from '../storage'
import { QuestionCard } from './QuestionCard'

interface Props {
  formulas: FormulaContent[]
  count: number
  scopeLabel: string
  onExit: () => void
}

export function QuizRunner({ formulas, count, scopeLabel, onExit }: Props) {
  const subjectIdByFormula = useMemo(() => {
    const map = new Map<string, string>()
    for (const f of formulas) map.set(f.id, f.subjectId)
    return map
  }, [formulas])

  const questions = useMemo(
    () => buildQuiz(formulas, count, (id) => getFormulaStats(id, subjectIdByFormula.get(id) ?? '').leitner),
    [formulas, count, subjectIdByFormula],
  )

  const [index, setIndex] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  if (questions.length === 0) {
    return (
      <div className="quiz-runner">
        <p>이 범위에는 아직 풀 수 있는 문제가 없습니다.</p>
        <button type="button" className="primary-button" onClick={onExit}>
          홈으로
        </button>
      </div>
    )
  }

  if (index >= questions.length) {
    return (
      <div className="quiz-runner result-screen">
        <h2>결과</h2>
        <p className="score">
          {correctCount} / {questions.length} 정답
        </p>
        <button type="button" className="primary-button" onClick={onExit}>
          홈으로
        </button>
      </div>
    )
  }

  const question = questions[index]

  function handleSelect(choiceId: string) {
    if (selectedId !== null) return
    setSelectedId(choiceId)
    const choice = question.choices.find((c) => c.id === choiceId)
    const correct = !!choice?.correct
    recordAttempt(question.formulaId, question.subjectId, correct)
    if (correct) setCorrectCount((c) => c + 1)
  }

  function handleNext() {
    setSelectedId(null)
    setIndex((i) => i + 1)
  }

  return (
    <div className="quiz-runner">
      <div className="quiz-header">
        <button type="button" className="back-button" onClick={onExit} aria-label="종료">
          ×
        </button>
        <span className="quiz-progress">
          {scopeLabel} · {index + 1}/{questions.length}
        </span>
      </div>
      <QuestionCard question={question} selectedId={selectedId} onSelect={handleSelect} />
      {selectedId !== null && (
        <button type="button" className="primary-button next-button" onClick={handleNext}>
          {index + 1 < questions.length ? '다음 문제' : '결과 보기'}
        </button>
      )}
    </div>
  )
}
