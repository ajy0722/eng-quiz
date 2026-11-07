import type { FormulaContent } from '../../src/types/content'
import { generateNumericQuestion } from '../../src/engine/numericGenerator'
import { valuesEqual, isFiniteAnswer } from '../../src/engine/answerCheck'

const ITERATIONS = 1000

export function validateNumericGenerator(formula: FormulaContent): void {
  const gen = formula.numericGenerator
  if (!gen) return

  for (let i = 0; i < ITERATIONS; i++) {
    const question = generateNumericQuestion(gen)

    if (!gen.isValid(question.params)) {
      throw new Error(`[${formula.id}] generated params fail isValid(): ${JSON.stringify(question.params)}`)
    }

    if (!isFiniteAnswer(question.correct)) {
      throw new Error(`[${formula.id}] correct() produced a non-finite answer`)
    }

    const recomputed = gen.correct(question.params)
    if (!valuesEqual(question.correct, recomputed)) {
      throw new Error(`[${formula.id}] correct() is not deterministic for identical params`)
    }

    const correctMatches = question.choices.filter((c) => c.id === question.correctChoiceId)
    if (correctMatches.length !== 1) {
      throw new Error(`[${formula.id}] expected exactly one choice flagged correct, found ${correctMatches.length}`)
    }

    for (let a = 0; a < question.choices.length; a++) {
      if (!isFiniteAnswer(question.choices[a].value)) {
        throw new Error(`[${formula.id}] choice ${question.choices[a].id} is not finite`)
      }
      for (let b = a + 1; b < question.choices.length; b++) {
        if (valuesEqual(question.choices[a].value, question.choices[b].value)) {
          throw new Error(
            `[${formula.id}] choices ${question.choices[a].id} and ${question.choices[b].id} are indistinguishable`,
          )
        }
      }
    }
  }
}

export function validateConceptQuestions(formula: FormulaContent): void {
  for (const q of formula.conceptQuestions) {
    const correctCount = q.choices.filter((c) => c.correct).length
    if (correctCount !== 1) {
      throw new Error(`[${formula.id}/${q.id}] expected exactly 1 correct choice, found ${correctCount}`)
    }
  }
}
