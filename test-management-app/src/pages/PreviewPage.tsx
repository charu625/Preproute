import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchQuestionsBulk } from '../api/questions'
import { getTestById, publishTest } from '../api/tests'
import { TestSummaryCard } from '../components/test/TestSummaryCard'
import { Button } from '../components/ui/Button'
import { RadioGroup } from '../components/ui/RadioGroup'
import type { Question, Test } from '../types/api'
import { getApiErrorMessage } from '../utils/format'

const LIVE_UNTIL_OPTIONS = [
  { value: 'always', label: 'Always Available' },
  { value: '1week', label: '1 Week' },
  { value: '2weeks', label: '2 Weeks' },
  { value: '3weeks', label: '3 Weeks' },
  { value: '1month', label: '1 Month' },
  { value: 'custom', label: 'Custom Duration' },
]

export function PreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [publishTab, setPublishTab] = useState<'now' | 'schedule'>('now')
  const [liveUntil, setLiveUntil] = useState('custom')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')

  const loadData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const testRes = await getTestById(id)
      setTest(testRes.data)
      if (testRes.data.questions?.length) {
        const qRes = await fetchQuestionsBulk(testRes.data.questions)
        setQuestions(qRes.data ?? [])
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handlePublish = async () => {
    if (!id) return
    setPublishing(true)
    setError('')
    try {
      await publishTest(id)
      setSuccess('Test published successfully!')
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    )
  }

  if (!test) {
    return <p className="text-red-600">Test not found.</p>
  }

  const allQuestionsDone =
    questions.length >= (test.total_questions ?? 1) && questions.length > 0

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Test creation</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">Test created</span>
            {allQuestionsDone && (
              <span className="rounded-full bg-success-bg px-3 py-0.5 text-xs font-medium text-green-700">
                All {questions.length} Questions done
              </span>
            )}
          </div>
        </div>
      </div>

      {success && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{success}</div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <TestSummaryCard test={test} questionCount={questions.length} editHref={`/tests/${id}/edit`} />

      {test.status !== 'live' && (
        <>
          <div className="flex gap-6 border-b border-border">
            <button
              type="button"
              onClick={() => setPublishTab('now')}
              className={`pb-3 text-sm font-medium ${
                publishTab === 'now'
                  ? 'border-b-2 border-brand-500 text-brand-600'
                  : 'text-muted hover:text-slate-700'
              }`}
            >
              Publish Now
            </button>
            <button
              type="button"
              onClick={() => setPublishTab('schedule')}
              className={`pb-3 text-sm font-medium ${
                publishTab === 'schedule'
                  ? 'border-b-2 border-brand-500 text-brand-600'
                  : 'text-muted hover:text-slate-700'
              }`}
            >
              Schedule Publish
            </button>
          </div>

          <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Live Until</h2>
            <p className="mt-1 text-sm text-muted">
              Choose how long this test should remain available on the platform.
            </p>

            <div className="mt-6">
              <RadioGroup
                name="liveUntil"
                options={LIVE_UNTIL_OPTIONS}
                value={liveUntil}
                onChange={setLiveUntil}
              />
            </div>

            {liveUntil === 'custom' && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Select End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Select End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Questions Preview</h2>
            {questions.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border py-8 text-center text-muted">
                No questions added yet.
              </p>
            ) : (
              questions.map((q, idx) => (
                <article
                  key={q.id}
                  className="rounded-xl border border-border bg-white p-5 shadow-sm"
                >
                  <p className="font-medium text-slate-900">
                    Q{idx + 1}. {q.question}
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {(['option1', 'option2', 'option3', 'option4'] as const).map((key) => (
                      <li
                        key={key}
                        className={`rounded px-2 py-1 ${
                          q.correct_option === key
                            ? 'bg-success-bg font-medium text-green-800'
                            : 'text-slate-600'
                        }`}
                      >
                        {key.replace('option', 'Option ')}: {q[key]}
                      </li>
                    ))}
                  </ul>
                </article>
              ))
            )}
          </section>

          <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-6">
            <Link to={`/tests/${id}/questions`}>
              <Button variant="soft">Cancel</Button>
            </Link>
            <Button onClick={handlePublish} loading={publishing} disabled={questions.length < 1}>
              Confirm
            </Button>
          </div>
        </>
      )}

      {test.status === 'live' && (
        <div className="rounded-lg bg-success-bg px-4 py-3 text-sm text-green-800">
          This test is already live.
          <Link to="/dashboard" className="ml-2 font-medium text-brand-600 hover:underline">
            Back to dashboard
          </Link>
        </div>
      )}
    </div>
  )
}
