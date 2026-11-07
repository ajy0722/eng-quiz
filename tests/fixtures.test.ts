import { describe, it } from 'vitest'
import complexFixture from './fixtures/complex-rlc-impedance'
import realFixture from './fixtures/real-point-charge-field'
import symbolicFixture from './fixtures/symbolic-ztransform-pair'
import { validateNumericGenerator } from './helpers/validateFormula'

describe('answer-type fixtures (sample only — not registered as real content)', () => {
  it.each([
    ['complex', complexFixture],
    ['real', realFixture],
    ['symbolic', symbolicFixture],
  ] as const)('%s answer type works end-to-end over 1000 runs', (_label, formula) => {
    validateNumericGenerator(formula)
  })
})
