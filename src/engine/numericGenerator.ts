import type { NumericGeneratorSpec } from '../types/content'
import type { AnswerValue } from '../types/answer'
import { valuesEqual } from './answerCheck'

export interface NumericChoice {
  id: string
  value: AnswerValue
}

export interface GeneratedNumericQuestion<P> {
  params: P
  correct: AnswerValue
  choices: NumericChoice[]
  correctChoiceId: string
  prompt: string
  explanation: string
}

const MAX_PARAM_ATTEMPTS = 1000
const MAX_DEDUP_ATTEMPTS = 50

export function pickValidParams<P>(gen: NumericGeneratorSpec<P>): P {
  for (let i = 0; i < MAX_PARAM_ATTEMPTS; i++) {
    const params = gen.randomParams()
    if (gen.isValid(params)) return params
  }
  throw new Error('numericGenerator: could not produce params satisfying isValid() within attempt limit')
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function generateNumericQuestion<P>(gen: NumericGeneratorSpec<P>): GeneratedNumericQuestion<P> {
  for (let attempt = 0; attempt < MAX_DEDUP_ATTEMPTS; attempt++) {
    const params = pickValidParams(gen)
    const correct = gen.correct(params)
    const seen: AnswerValue[] = [correct]
    const wrongValues: AnswerValue[] = []
    for (const mistake of gen.mistakes) {
      const candidate = mistake(params)
      if (seen.some((v) => valuesEqual(v, candidate))) continue
      seen.push(candidate)
      wrongValues.push(candidate)
    }
    if (wrongValues.length === 0) continue

    const choices = shuffle([
      { id: 'correct', value: correct },
      ...wrongValues.map((value, i) => ({ id: `wrong-${i}`, value })),
    ])

    return {
      params,
      correct,
      choices,
      correctChoiceId: 'correct',
      prompt: gen.prompt(params),
      explanation: gen.explanation(params),
    }
  }
  throw new Error('numericGenerator: could not produce distinct choices within attempt limit')
}
