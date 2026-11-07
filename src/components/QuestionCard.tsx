import { MathText } from './MathText'
import type { RenderableQuestion } from '../engine/quizBuilder'

interface Props {
  question: RenderableQuestion
  selectedId: string | null
  onSelect: (choiceId: string) => void
}

export function QuestionCard({ question, selectedId, onSelect }: Props) {
  const answered = selectedId !== null

  return (
    <div className="question-card">
      <div className="question-prompt">
        <MathText text={question.prompt} />
      </div>
      <div className="choice-list">
        {question.choices.map((choice) => {
          let stateClass = ''
          if (answered) {
            if (choice.id === selectedId) stateClass = choice.correct ? 'correct' : 'wrong'
            else if (choice.correct) stateClass = 'reveal-correct'
          }
          return (
            <button
              key={choice.id}
              type="button"
              className={`choice-button ${stateClass}`}
              disabled={answered}
              onClick={() => onSelect(choice.id)}
            >
              <MathText text={choice.label} />
            </button>
          )
        })}
      </div>
      {answered && (
        <div className="explanation">
          <MathText text={question.explanation} />
        </div>
      )}
    </div>
  )
}
