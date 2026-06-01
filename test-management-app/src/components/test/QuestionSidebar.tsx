interface QuestionSidebarProps {
  totalQuestions: number
  currentIndex: number
  completedCount: number
  onSelectQuestion: (index: number) => void
}

export function QuestionSidebar({
  totalQuestions,
  currentIndex,
  completedCount,
  onSelectQuestion,
}: QuestionSidebarProps) {
  const items = Array.from({ length: Math.max(totalQuestions, 1) }, (_, i) => i)

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-white">
      <div className="border-b border-border px-4 py-4">
        <h2 className="text-sm font-semibold text-slate-800">Question creation</h2>
        <p className="mt-1 text-xs text-muted">Total Questions: {totalQuestions}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-2">
          {items.map((i) => {
            const isComplete = i < completedCount
            const isActive = i === currentIndex
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => onSelectQuestion(i)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200'
                      : isComplete
                        ? 'bg-success-bg/60 text-green-800'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-medium">Question {i + 1}</span>
                  <span className="flex items-center gap-1">
                    {isComplete && (
                      <svg className="h-4 w-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
