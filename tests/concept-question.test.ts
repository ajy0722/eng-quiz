import { describe, it } from 'vitest'
import { formulas } from '../src/content/registry'
import { validateConceptQuestions } from './helpers/validateFormula'

describe('content registry', () => {
  it('every concept question has exactly one correct choice', () => {
    for (const formula of formulas) {
      validateConceptQuestions(formula)
    }
  })
})
