export interface RealAnswer {
  type: 'real'
  value: number
  unit: string
  relTolerance: number
}

export interface ComplexValue {
  re: number
  im: number
}

export interface ComplexAnswer {
  type: 'complex'
  value: ComplexValue
  displayAs: 'rect' | 'polar'
  relTolerance: number
}

export interface SymbolicAnswer {
  type: 'symbolic'
  latex: string
}

export type AnswerValue = RealAnswer | ComplexAnswer | SymbolicAnswer
