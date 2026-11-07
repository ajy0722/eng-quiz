import { applyResult, initLeitnerState, type LeitnerState } from './engine/leitner'

const STORAGE_KEY = 'eng-quiz:v1'

export interface FormulaStats {
  subjectId: string
  attempts: number
  correctCount: number
  leitner: LeitnerState
}

interface StorageData {
  version: 1
  formulas: Record<string, FormulaStats>
}

function emptyData(): StorageData {
  return { version: 1, formulas: {} }
}

function readAll(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as StorageData
    if (parsed.version !== 1 || !parsed.formulas) return emptyData()
    return parsed
  } catch {
    return emptyData()
  }
}

function writeAll(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage unavailable (private mode / quota) — state just won't persist
  }
}

function emptyStats(subjectId: string): FormulaStats {
  return { subjectId, attempts: 0, correctCount: 0, leitner: initLeitnerState() }
}

export function getFormulaStats(formulaId: string, subjectId: string): FormulaStats {
  return readAll().formulas[formulaId] ?? emptyStats(subjectId)
}

export function getAllStats(): Record<string, FormulaStats> {
  return readAll().formulas
}

export function recordAttempt(formulaId: string, subjectId: string, correct: boolean): FormulaStats {
  const data = readAll()
  const prev = data.formulas[formulaId] ?? emptyStats(subjectId)
  const next: FormulaStats = {
    subjectId,
    attempts: prev.attempts + 1,
    correctCount: prev.correctCount + (correct ? 1 : 0),
    leitner: applyResult(prev.leitner, correct),
  }
  data.formulas[formulaId] = next
  writeAll(data)
  return next
}

export function resetAllStats(): void {
  writeAll(emptyData())
}
