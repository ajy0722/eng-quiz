import type { FormulaContent } from '../types/content'
import type { LeitnerState } from './leitner'
import { generateNumericQuestion } from './numericGenerator'
import { formatChoiceLabel } from './answerCheck'
import { leitnerWeight, weightedChoice } from './leitner'

export interface RenderableChoice {
  id: string
  label: string
  correct: boolean
}

export interface RenderableQuestion {
  formulaId: string
  subjectId: string
  formulaName: string
  prompt: string
  choices: RenderableChoice[]
  explanation: string
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function buildQuestion(formula: FormulaContent): RenderableQuestion {
  const hasNumeric = !!formula.numericGenerator
  const hasConcept = formula.conceptQuestions.length > 0
  const useNumeric = hasNumeric && (!hasConcept || Math.random() < 0.5)

  if (useNumeric && formula.numericGenerator) {
    const q = generateNumericQuestion(formula.numericGenerator)
    return {
      formulaId: formula.id,
      subjectId: formula.subjectId,
      formulaName: formula.name,
      prompt: q.prompt,
      explanation: q.explanation,
      choices: q.choices.map((c) => ({
        id: c.id,
        label: `$${formatChoiceLabel(c.value)}$`,
        correct: c.id === q.correctChoiceId,
      })),
    }
  }

  const cq = pickRandom(formula.conceptQuestions)
  return {
    formulaId: formula.id,
    subjectId: formula.subjectId,
    formulaName: formula.name,
    prompt: cq.prompt,
    explanation: cq.explanation,
    choices: shuffle(cq.choices.map((c) => ({ id: c.id, label: c.label, correct: c.correct }))),
  }
}

export function buildQuiz(
  formulas: FormulaContent[],
  count: number,
  leitnerOf: (formulaId: string) => LeitnerState,
): RenderableQuestion[] {
  const pickable = formulas.filter((f) => f.numericGenerator || f.conceptQuestions.length > 0)
  const questions: RenderableQuestion[] = []
  for (let i = 0; i < count && pickable.length > 0; i++) {
    const formula = weightedChoice(pickable, (f) => leitnerWeight(leitnerOf(f.id)))
    questions.push(buildQuestion(formula))
  }
  return questions
}
