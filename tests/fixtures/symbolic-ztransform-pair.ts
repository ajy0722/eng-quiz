import type { FormulaContent, NumericGeneratorSpec } from '../../src/types/content'
import type { SymbolicAnswer } from '../../src/types/answer'

interface ZTransformParams {
  a: number
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function round(n: number, decimals: number): number {
  const f = 10 ** decimals
  return Math.round(n * f) / f
}

function denom(a: number, power: '-1' | 'plain'): string {
  const zTerm = power === '-1' ? 'z^{-1}' : 'z'
  return a >= 0 ? `1 - ${a}${zTerm}` : `1 + ${Math.abs(a)}${zTerm}`
}

function symbolic(latex: string): SymbolicAnswer {
  return { type: 'symbolic', latex }
}

const numericGenerator: NumericGeneratorSpec<ZTransformParams> = {
  randomParams: () => {
    const magnitude = randomInRange(0.05, 0.95)
    const sign = Math.random() < 0.5 ? -1 : 1
    return { a: round(sign * magnitude, 2) }
  },

  isValid: (p) => Math.abs(p.a) > 0.05 && Math.abs(p.a) < 1,

  correct: (p) => symbolic(`\\dfrac{1}{${denom(p.a, '-1')}},\\ |z|>${Math.abs(p.a)}`),

  mistakes: [
    (p) => symbolic(`\\dfrac{1}{${denom(p.a, '-1')}},\\ |z|<${Math.abs(p.a)}`),
    (p) => symbolic(`\\dfrac{1}{${denom(-p.a, '-1')}},\\ |z|>${Math.abs(p.a)}`),
    (p) => symbolic(`\\dfrac{1}{${denom(p.a, 'plain')}},\\ |z|>${Math.abs(p.a)}`),
  ],

  prompt: (p) => `시퀀스 $a^n u[n]$, $a=${p.a}$ 에 대한 올바른 Z변환과 수렴영역(ROC)은?`,

  explanation: (p) =>
    `$a^n u[n] \\leftrightarrow \\dfrac{1}{1-az^{-1}}$, ROC: $|z|>|a|$. 인과(causal) 시퀀스이므로 ` +
    `ROC는 가장 바깥쪽 극 밖인 영역이다. $a=${p.a}$ 이므로 ROC는 $|z|>${Math.abs(p.a)}$.`,
}

const formula: FormulaContent = {
  id: 'fixture-ztransform-pair',
  subjectId: 'fixture',
  chapterId: 'fixture',
  name: 'Z변환 쌍 (fixture)',
  latex: 'a^n u[n] \\leftrightarrow \\frac{1}{1-az^{-1}},\\ |z|>|a|',
  conditions: ['인과(causal) 시퀀스, |a| < 1 (안정)'],
  conceptQuestions: [],
  numericGenerator,
}

export default formula
