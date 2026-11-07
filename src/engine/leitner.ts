export const LEITNER_MIN_BOX = 1
export const LEITNER_MAX_BOX = 5

export interface LeitnerState {
  box: number
  lastSeen: number
}

export function initLeitnerState(): LeitnerState {
  return { box: LEITNER_MIN_BOX, lastSeen: 0 }
}

export function applyResult(state: LeitnerState, correct: boolean, now: number = Date.now()): LeitnerState {
  const box = correct ? Math.min(LEITNER_MAX_BOX, state.box + 1) : LEITNER_MIN_BOX
  return { box, lastSeen: now }
}

export function leitnerWeight(state: LeitnerState): number {
  return LEITNER_MAX_BOX - state.box + 1
}

export function weightedChoice<T>(items: T[], weightOf: (item: T) => number): T {
  const weights = items.map(weightOf)
  const total = weights.reduce((sum, w) => sum + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < items.length - 1; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}
