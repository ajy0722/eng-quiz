import type { FormulaContent, NumericGeneratorSpec } from '../../src/types/content'
import type { RealAnswer } from '../../src/types/answer'

interface PointChargeParams {
  q: number
  r: number
}

const EPS0 = 8.854e-12

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function real(value: number): RealAnswer {
  return { type: 'real', value, unit: 'N/C', relTolerance: 0.02 }
}

const numericGenerator: NumericGeneratorSpec<PointChargeParams> = {
  randomParams: () => ({
    q: randomInRange(1, 100),
    r: randomInRange(0.01, 2),
  }),

  isValid: (p) => p.q > 0 && p.r > 0,

  correct: (p) => real((p.q * 1e-6) / (4 * Math.PI * EPS0 * p.r * p.r)),

  mistakes: [
    (p) => real((p.q * 1e-6) / (EPS0 * p.r * p.r)),
    (p) => real((p.q * 1e-6) / (4 * Math.PI * EPS0 * p.r)),
    (p) => real(p.q / (4 * Math.PI * EPS0 * p.r * p.r)),
  ],

  prompt: (p) => `점전하 $q=${p.q.toFixed(1)}\\mu C$ 로부터 거리 $r=${p.r.toFixed(2)}m$ 떨어진 지점의 전계 크기 $E$는?`,

  explanation: (p) => {
    const e = (p.q * 1e-6) / (4 * Math.PI * EPS0 * p.r * p.r)
    return (
      `$E = \\dfrac{q}{4\\pi\\varepsilon_0 r^2}$\n` +
      `$= \\dfrac{${p.q.toFixed(1)}\\times10^{-6}}{4\\pi(8.854\\times10^{-12})(${p.r.toFixed(2)})^2}$\n` +
      `$\\approx ${e.toExponential(3)}\\ N/C$`
    )
  },
}

const formula: FormulaContent = {
  id: 'fixture-point-charge-field',
  subjectId: 'fixture',
  chapterId: 'fixture',
  name: '점전하 전계 (fixture)',
  latex: 'E = \\frac{q}{4\\pi\\varepsilon_0 r^2}',
  conditions: ['진공(또는 공기) 중의 점전하, 자유공간 유전율 사용'],
  conceptQuestions: [],
  numericGenerator,
}

export default formula
