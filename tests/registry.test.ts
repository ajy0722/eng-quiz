import { describe, it } from 'vitest'
import { formulas } from '../src/content/registry'
import { validateNumericGenerator } from './helpers/validateFormula'

describe('content registry', () => {
  it('every numeric generator produces 1000 valid, distinct, finite questions', () => {
    for (const formula of formulas) {
      validateNumericGenerator(formula)
    }
  })
})
