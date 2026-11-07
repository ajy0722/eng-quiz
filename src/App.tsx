import { useState } from 'react'
import { subjects, formulas } from './content/registry'
import { getAllStats } from './storage'
import { Home } from './components/Home'
import { ScopePicker } from './components/ScopePicker'
import { QuizRunner } from './components/QuizRunner'
import { StatsView } from './components/StatsView'
import type { FormulaContent } from './types/content'
import './App.css'

type View =
  | { name: 'home' }
  | { name: 'scope'; initialSubjectId?: string }
  | { name: 'quiz'; quizFormulas: FormulaContent[]; count: number; label: string }
  | { name: 'stats' }

function App() {
  const [view, setView] = useState<View>({ name: 'home' })
  const stats = getAllStats()

  if (view.name === 'scope') {
    return (
      <div className="app">
        <ScopePicker
          subjects={subjects}
          formulas={formulas}
          initialSubjectId={view.initialSubjectId}
          onStart={(fs, label) => setView({ name: 'quiz', quizFormulas: fs, count: Math.max(5, fs.length), label })}
          onBack={() => setView({ name: 'home' })}
        />
      </div>
    )
  }

  if (view.name === 'quiz') {
    return (
      <div className="app">
        <QuizRunner
          formulas={view.quizFormulas}
          count={view.count}
          scopeLabel={view.label}
          onExit={() => setView({ name: 'home' })}
        />
      </div>
    )
  }

  if (view.name === 'stats') {
    return (
      <div className="app">
        <StatsView subjects={subjects} formulas={formulas} stats={stats} onBack={() => setView({ name: 'home' })} />
      </div>
    )
  }

  return (
    <div className="app">
      <Home
        subjects={subjects}
        formulas={formulas}
        stats={stats}
        onStartAll={() => setView({ name: 'quiz', quizFormulas: formulas, count: 5, label: '전체' })}
        onPickSubject={(subjectId) => setView({ name: 'scope', initialSubjectId: subjectId })}
      />
      <button className="stats-link" onClick={() => setView({ name: 'stats' })}>
        기록 보기
      </button>
    </div>
  )
}

export default App
