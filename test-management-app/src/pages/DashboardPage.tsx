import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTests } from '../api/tests'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import type { Test } from '../types/api'
import { formatDate, formatStatus, getApiErrorMessage } from '../utils/format'

export function DashboardPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const loadTests = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getTests()
      setTests(response.data ?? [])
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTests()
  }, [loadTests])

  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return tests
    return tests.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query) ||
        formatStatus(t.status).toLowerCase().includes(query),
    )
  }, [tests, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Test Tracking</h1>
          <p className="text-sm text-muted">Manage and publish your tests</p>
        </div>
        <Link to="/tests/new">
          <Button>Create New Test</Button>
        </Link>
      </div>

      <div className="max-w-md">
        <Input
          label="Search tests"
          placeholder="Search by name, subject, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white py-16 text-center shadow-sm">
          <p className="text-muted">No tests found.</p>
          <Link to="/tests/new" className="mt-4 inline-block">
            <Button variant="soft">Create your first test</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Subject</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Created</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="transition hover:bg-brand-50/30">
                    <td className="px-4 py-3 font-medium text-slate-900">{test.name}</td>
                    <td className="px-4 py-3 text-slate-600">{test.subject}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          test.status === 'live'
                            ? 'bg-success-bg text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {formatStatus(test.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(test.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link to={`/tests/${test.id}/preview`}>
                          <Button variant="ghost" className="!px-2 !py-1.5 text-xs">
                            View
                          </Button>
                        </Link>
                        <Link to={`/tests/${test.id}/edit`}>
                          <Button variant="soft" className="!px-2 !py-1.5 text-xs">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
