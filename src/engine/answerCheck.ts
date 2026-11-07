import type { AnswerValue, ComplexValue } from '../types/answer'

function complexMagnitude(v: ComplexValue): number {
  return Math.hypot(v.re, v.im)
}

function relDiff(a: number, b: number): number {
  const scale = Math.max(Math.abs(a), Math.abs(b), 1e-12)
  return Math.abs(a - b) / scale
}

function normalizeLatex(latex: string): string {
  return latex.replace(/\s+/g, '')
}

export function valuesEqual(a: AnswerValue, b: AnswerValue): boolean {
  if (a.type !== b.type) return false
  if (a.type === 'real' && b.type === 'real') {
    if (a.unit !== b.unit) return false
    const tol = Math.max(a.relTolerance, b.relTolerance)
    return relDiff(a.value, b.value) <= tol
  }
  if (a.type === 'complex' && b.type === 'complex') {
    const tol = Math.max(a.relTolerance, b.relTolerance)
    const scale = Math.max(complexMagnitude(a.value), complexMagnitude(b.value), 1e-12)
    const dist = Math.hypot(a.value.re - b.value.re, a.value.im - b.value.im)
    return dist / scale <= tol
  }
  if (a.type === 'symbolic' && b.type === 'symbolic') {
    return normalizeLatex(a.latex) === normalizeLatex(b.latex)
  }
  return false
}

export function isFiniteAnswer(value: AnswerValue): boolean {
  if (value.type === 'real') return Number.isFinite(value.value)
  if (value.type === 'complex') return Number.isFinite(value.value.re) && Number.isFinite(value.value.im)
  return value.latex.trim().length > 0
}

function formatPlain(n: number): string {
  return Number(n.toPrecision(4)).toString()
}

function formatNumber(n: number): string {
  if (n === 0) return '0'
  const abs = Math.abs(n)
  if (abs >= 1000 || abs < 0.01) {
    const exp = Math.floor(Math.log10(abs))
    const mantissa = n / 10 ** exp
    return `${formatPlain(mantissa)} \\times 10^{${exp}}`
  }
  return formatPlain(n)
}

function formatRect(v: ComplexValue): string {
  const sign = v.im >= 0 ? '+' : '-'
  return `${formatNumber(v.re)} ${sign} j${formatNumber(Math.abs(v.im))}`
}

function formatPolar(v: ComplexValue): string {
  const r = complexMagnitude(v)
  const thetaDeg = (Math.atan2(v.im, v.re) * 180) / Math.PI
  return `${formatNumber(r)} \\angle ${formatNumber(thetaDeg)}^\\circ`
}

const SI_PREFIX_TIERS: Array<{ exp: number; symbol: string }> = [
  { exp: 9, symbol: 'G' },
  { exp: 6, symbol: 'M' },
  { exp: 3, symbol: 'k' },
  { exp: 0, symbol: '' },
  { exp: -3, symbol: 'm' },
  { exp: -6, symbol: 'µ' },
  { exp: -9, symbol: 'n' },
  { exp: -12, symbol: 'p' },
]

const SI_PREFIXABLE_UNITS = new Set(['A', 'V', 'W', 'F', 'H', 'Hz', 'C', 'Ω', 'N', 'Pa', 'J', 's'])

function formatRealValue(value: number, unit: string): string {
  if (!SI_PREFIXABLE_UNITS.has(unit)) {
    return `${formatNumber(value)}\\ \\text{${unit}}`
  }
  if (value === 0) return `0\\ \\text{${unit}}`
  const abs = Math.abs(value)
  const tier = SI_PREFIX_TIERS.find((t) => abs >= 10 ** t.exp) ?? SI_PREFIX_TIERS[SI_PREFIX_TIERS.length - 1]
  const mantissa = value / 10 ** tier.exp
  return `${formatPlain(mantissa)}\\ \\text{${tier.symbol}${unit}}`
}

export function formatChoiceLabel(value: AnswerValue): string {
  if (value.type === 'real') return formatRealValue(value.value, value.unit)
  if (value.type === 'complex') return value.displayAs === 'polar' ? formatPolar(value.value) : formatRect(value.value)
  return value.latex
}
