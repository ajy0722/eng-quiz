import type { AnswerValue } from './answer'

export interface ChapterInfo {
  id: string
  name: string
}

export interface SubjectInfo {
  id: string
  name: string
  chapters: ChapterInfo[]
}

export interface ConceptChoice {
  id: string
  label: string
  correct: boolean
}

export interface ConceptQuestion {
  id: string
  prompt: string
  choices: ConceptChoice[]
  explanation: string
}

export interface NumericGeneratorSpec<P> {
  randomParams: () => P
  isValid: (params: P) => boolean
  correct: (params: P) => AnswerValue
  mistakes: Array<(params: P) => AnswerValue>
  prompt: (params: P) => string
  explanation: (params: P) => string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyNumericGeneratorSpec = NumericGeneratorSpec<any>

export interface FormulaContent {
  id: string
  subjectId: string
  chapterId: string
  name: string
  latex: string
  conditions: string[]
  conceptQuestions: ConceptQuestion[]
  numericGenerator?: AnyNumericGeneratorSpec
}
