import type { SubjectInfo, FormulaContent } from '../types/content'

const subjectModules = import.meta.glob<{ default: SubjectInfo }>('./*/subject.ts', { eager: true })
const formulaModules = import.meta.glob<{ default: FormulaContent }>('./*/*.ts', { eager: true })

export const subjects: SubjectInfo[] = Object.values(subjectModules)
  .map((m) => m.default)
  .sort((a, b) => a.id.localeCompare(b.id))

export const formulas: FormulaContent[] = Object.entries(formulaModules)
  .filter(([path]) => !path.endsWith('/subject.ts'))
  .map(([, m]) => m.default)
  .sort((a, b) => a.id.localeCompare(b.id))

export function getSubject(subjectId: string): SubjectInfo | undefined {
  return subjects.find((s) => s.id === subjectId)
}

export function getFormula(formulaId: string): FormulaContent | undefined {
  return formulas.find((f) => f.id === formulaId)
}

export function getFormulasBySubject(subjectId: string): FormulaContent[] {
  return formulas.filter((f) => f.subjectId === subjectId)
}

export function getFormulasByChapter(subjectId: string, chapterId: string): FormulaContent[] {
  return formulas.filter((f) => f.subjectId === subjectId && f.chapterId === chapterId)
}
