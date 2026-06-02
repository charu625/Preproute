import { Link } from 'react-router-dom'
import { TEST_TYPE_LABELS } from '../../constants/testSummary'
import type { TestSummaryCardProps } from '../../types/components'

function formatType(type: string) {
  return TEST_TYPE_LABELS[type] ?? type
}

function formatDifficulty(d: string) {
  return d.charAt(0).toUpperCase() + d.slice(1)
}

export function TestSummaryCard({ test, questionCount, editHref }: TestSummaryCardProps) {
  const qCount = questionCount ?? test.total_questions ?? test.questions?.length ?? 0

  return (
    <div className="relative rounded-xl border border-border bg-white p-5 shadow-sm">
      {editHref && (
        <Link
          to={editHref}
          className="absolute right-4 top-4 text-brand-500 hover:text-brand-600"
          aria-label="Edit test"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </Link>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-brand-700 px-3 py-0.5 text-xs font-medium text-white">
          {formatType(test.type)}
        </span>
        <span className="rounded-full bg-success-bg px-3 py-0.5 text-xs font-medium text-green-700">
          {formatDifficulty(test.difficulty)}
        </span>
      </div>

      <h2 className="mt-3 flex items-center gap-2 text-xl font-bold text-slate-900">
        <span aria-hidden="true">📖</span>
        {test.name}
      </h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted">Subject</p>
          <p className="text-sm font-medium text-slate-800">{test.subject}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Topic</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {(test.topics?.length ? test.topics : ['—']).map((t) => (
              <span
                key={t}
                className="rounded-full border border-warning-border bg-warning-pill px-2.5 py-0.5 text-xs text-amber-900"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted">Sub Topic</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {(test.sub_topics?.length ? test.sub_topics : ['—']).map((st) => (
              <span
                key={st}
                className="rounded-full border border-warning-border bg-warning-pill px-2.5 py-0.5 text-xs text-amber-900"
              >
                {st}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <div className="flex gap-4 rounded-lg bg-slate-50 px-4 py-2 text-sm text-slate-600">
          <span>{test.total_time} Min</span>
          <span>{qCount} Q&apos;s</span>
          <span>{test.total_marks} Marks</span>
        </div>
      </div>
    </div>
  )
}
