import type { FormulaContent, NumericGeneratorSpec } from '../../src/types/content'
import type { ComplexAnswer } from '../../src/types/answer'

interface RlcParams {
  r: number
  l: number
  c: number
  omega: number
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function complex(re: number, im: number): ComplexAnswer {
  return { type: 'complex', value: { re, im }, displayAs: 'rect', relTolerance: 0.02 }
}

const numericGenerator: NumericGeneratorSpec<RlcParams> = {
  randomParams: () => ({
    r: randomInRange(10, 1000),
    l: randomInRange(1e-3, 100e-3),
    c: randomInRange(1e-6, 100e-6),
    omega: randomInRange(100, 20000),
  }),

  isValid: (p) => p.r > 0 && p.l > 0 && p.c > 0 && p.omega > 0,

  correct: (p) => complex(p.r, p.omega * p.l - 1 / (p.omega * p.c)),

  mistakes: [
    (p) => complex(p.r, -(p.omega * p.l - 1 / (p.omega * p.c))),
    (p) => complex(p.r, p.omega * p.l + 1 / (p.omega * p.c)),
    (p) => complex(0, p.omega * p.l - 1 / (p.omega * p.c)),
  ],

  prompt: (p) =>
    `직렬 RLC 회로: $R=${p.r.toFixed(1)}\\Omega$, $L=${(p.l * 1e3).toFixed(2)}mH$, ` +
    `$C=${(p.c * 1e6).toFixed(2)}\\mu F$, $\\omega=${p.omega.toFixed(0)}\\ rad/s$ 일 때 임피던스 $Z$는?`,

  explanation: (p) => {
    const x = p.omega * p.l - 1 / (p.omega * p.c)
    return (
      `$Z = R + j(\\omega L - \\dfrac{1}{\\omega C})$\n` +
      `$= ${p.r.toFixed(1)} + j(${x.toFixed(1)})\\ \\Omega$`
    )
  },
}

const formula: FormulaContent = {
  id: 'fixture-rlc-series-impedance',
  subjectId: 'fixture',
  chapterId: 'fixture',
  name: '직렬 RLC 임피던스 (fixture)',
  latex: 'Z = R + j\\left(\\omega L - \\frac{1}{\\omega C}\\right)',
  conditions: ['정상상태 사인파 구동, 직렬 연결'],
  conceptQuestions: [],
  numericGenerator,
}

export default formula
