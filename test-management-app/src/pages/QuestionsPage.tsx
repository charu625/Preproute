import { zodResolver } from '@hookform/resolvers/zod'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useForm, useWatch } from 'react-hook-form'

import { Link, useNavigate, useParams } from 'react-router-dom'

import { bulkCreateQuestions, fetchQuestionsBulk } from '../api/questions'

import { getSubjects } from '../api/subjects'

import { getTestById, updateTest } from '../api/tests'

import { QuestionRichEditor } from '../components/test/QuestionRichEditor'
import { QuestionSidebar } from '../components/test/QuestionSidebar'

import { TestSummaryCard } from '../components/test/TestSummaryCard'

import { Breadcrumbs } from '../components/ui/Breadcrumbs'

import { Button } from '../components/ui/Button'

import { Select } from '../components/ui/Select'

import {
  DIFFICULTY_OPTIONS,
  EMPTY_QUESTION_FORM,
  OPTION_KEYS,
} from '../constants/question'
import { questionSchema } from '../schemas/question'
import { useTestBuilderStore } from '../store/testBuilderStore'
import type { Question, Subject, Test } from '../types/api'
import type { QuestionFormValues } from '../types/forms'
import type { QuestionRichEditorHandle } from '../types/components'
import { getApiErrorMessage } from '../utils/format'
import { parseQuestionsCsv, QUESTION_CSV_TEMPLATE } from '../utils/questionCsv'
import { payloadToFormValues } from '../utils/questionForm'
import { stripEmbeddedQuestionImages } from '../utils/questionText'
import { resolveSubjectId } from '../utils/subject'

export function QuestionsPage() {

  const { id } = useParams<{ id: string }>()

  const navigate = useNavigate()

  const [test, setTest] = useState<Test | null>(null)

  const [subjects, setSubjects] = useState<Subject[]>([])

  const [savedQuestions, setSavedQuestions] = useState<Question[]>([])

  const [currentIndex, setCurrentIndex] = useState(0)

  const [editingPendingIndex, setEditingPendingIndex] = useState<number | null>(null)

  const [apiError, setApiError] = useState('')

  const [notice, setNotice] = useState('')

  const [saving, setSaving] = useState(false)

  const questionEditorRef = useRef<QuestionRichEditorHandle>(null)

  const csvInputRef = useRef<HTMLInputElement>(null)



  const { pendingQuestions, addPendingQuestion, updatePendingQuestion, removePendingQuestion, clearPendingQuestions } =
    useTestBuilderStore()
  const totalTarget = test?.total_questions ?? 50

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    resetField,
    getValues,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correct_option: 'option1',
      explanation: '',
      difficulty: 'easy',
      media_url: '',
    },
  })



  const correctOption = useWatch({ control, name: 'correct_option', defaultValue: 'option1' })
  const questionMediaUrl = useWatch({ control, name: 'media_url', defaultValue: '' })
  const difficulty = useWatch({ control, name: 'difficulty', defaultValue: 'easy' })

  const clearOption = (key: (typeof OPTION_KEYS)[number]) => {
    resetField(key, { defaultValue: '' })
    if (correctOption === key) {
      const values = getValues()
      const fallback =
        OPTION_KEYS.find((k) => k !== key && values[k]?.trim()) ?? 'option1'
      setValue('correct_option', fallback)
    }
  }



  useEffect(() => {
    if (!id) return

    let cancelled = false

    ;(async () => {
      try {
        const response = await getTestById(id)
        if (cancelled) return

        setTest(response.data)
        if (response.data.questions?.length) {
          const qResponse = await fetchQuestionsBulk(response.data.questions)
          if (cancelled) return
          setSavedQuestions(qResponse.data ?? [])
        } else {
          setSavedQuestions([])
        }
      } catch (err) {
        if (!cancelled) setApiError(getApiErrorMessage(err))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [id])



  useEffect(() => {
    void getSubjects().then((res) => setSubjects(res.data ?? []))
  }, [])



  const testSubjectId = test ? resolveSubjectId(test.subject, subjects) : ''



  const completedCount = savedQuestions.length + pendingQuestions.length

  const canPublish = completedCount >= totalTarget && totalTarget > 0

  const questionsRemaining = Math.max(0, totalTarget - completedCount)

  const syncFormAtIndex = useCallback(
    (index: number) => {
      if (index < savedQuestions.length) {
        reset(payloadToFormValues(savedQuestions[index]))
        setEditingPendingIndex(null)
        return
      }

      const pendingIndex = index - savedQuestions.length
      if (pendingIndex >= 0 && pendingIndex < pendingQuestions.length) {
        reset(payloadToFormValues(pendingQuestions[pendingIndex]))
        setEditingPendingIndex(pendingIndex)
        return
      }

      reset(EMPTY_QUESTION_FORM)
      setEditingPendingIndex(null)
    },
    [savedQuestions, pendingQuestions, reset],
  )

  const selectQuestion = useCallback(
    (index: number) => {
      setCurrentIndex(index)
      syncFormAtIndex(index)
    },
    [syncFormAtIndex],
  )

  useEffect(() => {
    const index = currentIndex
    queueMicrotask(() => syncFormAtIndex(index))
  }, [savedQuestions, pendingQuestions, syncFormAtIndex, currentIndex])

  const handleRemovePending = (index: number) => {
    removePendingQuestion(index)
    selectQuestion(currentIndex)
  }

  const onSaveQuestion = (values: QuestionFormValues) => {

    if (!id) return

    if (!testSubjectId) {
      setApiError('Test subject is missing. Edit the test and select a subject first.')
      return
    }



    const payload = {
      type: 'mcq' as const,
      ...values,
      question: stripEmbeddedQuestionImages(values.question),
      test_id: id,

      subject: testSubjectId,

    }



    if (currentIndex < savedQuestions.length) {
      setSavedQuestions((prev) => {
        const next = [...prev]
        next[currentIndex] = { ...next[currentIndex], ...payload }
        return next
      })
    } else if (editingPendingIndex !== null) {
      updatePendingQuestion(editingPendingIndex, payload)
    } else {
      addPendingQuestion(payload)
    }

    setNotice('')
    setApiError('')

    const nextIndex = Math.min(currentIndex + 1, totalTarget - 1)
    if (currentIndex < totalTarget - 1) {
      selectQuestion(nextIndex)
    } else {
      selectQuestion(currentIndex)
    }
  }



  const editPending = (index: number) => {
    selectQuestion(savedQuestions.length + index)
  }



  const handleCsvImport = async (file: File) => {
    if (!id) return

    if (!testSubjectId) {
      setApiError('Test subject is missing. Edit the test and select a subject before importing CSV.')
      return
    }

    setApiError('')
    setNotice('')
    try {
      const text = await file.text()
      const { questions, errors } = parseQuestionsCsv(text, id, testSubjectId)

      if (questions.length === 0) {
        setApiError(errors[0] ?? 'No valid questions found in CSV.')
        return
      }

      const slotsLeft = Math.max(0, totalTarget - savedQuestions.length - pendingQuestions.length)
      const toAdd = questions.slice(0, slotsLeft)
      const skipped = questions.length - toAdd.length

      toAdd.forEach((q) => addPendingQuestion({ type: 'mcq', ...q }))

      const parts: string[] = []
      if (toAdd.length > 0) parts.push(`Imported ${toAdd.length} question(s) from CSV.`)
      if (skipped > 0) parts.push(`${skipped} row(s) skipped (test question limit reached).`)
      if (errors.length > 0) parts.push(`${errors.length} row(s) had errors.`)

      setNotice(parts.join(' '))
      if (errors.length > 0 && toAdd.length === 0) {
        setApiError('CSV import failed. Check column format and download the template.')
      }

      if (toAdd.length > 0) {
        const { pendingQuestions: updatedPending } = useTestBuilderStore.getState()
        const firstEmpty = savedQuestions.length + updatedPending.length
        selectQuestion(firstEmpty < totalTarget ? firstEmpty : totalTarget - 1)
      }
    } catch {
      setApiError('Could not read CSV file.')
    } finally {
      if (csvInputRef.current) csvInputRef.current.value = ''
    }
  }

  const downloadCsvTemplate = () => {
    const blob = new Blob([QUESTION_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'questions-template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleSaveAndContinue = async () => {

    if (!id || !test) return

    if (completedCount < 1) {
      setApiError('Add at least one question before continuing.')
      return
    }

    if (completedCount < totalTarget) {
      setApiError(
        `Add all ${totalTarget} questions before publishing. ${questionsRemaining} remaining.`,
      )
      return
    }

    if (pendingQuestions.length > 0 && !testSubjectId) {
      setApiError('Test subject is missing. Edit the test and select a subject first.')
      return
    }



    setSaving(true)

    setApiError('')

    try {

      let questionIds = test.questions ?? []



      if (pendingQuestions.length > 0) {

        const questionsToCreate = pendingQuestions.map((q) => ({

          ...q,

          subject: q.subject || testSubjectId,

        }))



        const created = await bulkCreateQuestions(questionsToCreate)

        const newIds = (created.data ?? []).map((q) => q.id)

        questionIds = [...(questionIds ?? []), ...newIds]

        clearPendingQuestions()

      }



      await updateTest(id, {

        questions: questionIds,

        total_questions: questionIds.length,

        total_marks: questionIds.length * test.correct_marks,

      })



      navigate(`/tests/${id}/preview`)

    } catch (err) {

      setApiError(getApiErrorMessage(err))

    } finally {

      setSaving(false)

    }

  }



  return (

    <div className="-m-4 flex min-h-[calc(100vh-4rem)] min-w-0 flex-row overflow-hidden sm:-m-6">

      <QuestionSidebar

        totalQuestions={totalTarget}

        currentIndex={currentIndex}

        completedCount={completedCount}

        onSelectQuestion={selectQuestion}

      />



      <div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">

        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">

          <Breadcrumbs

            items={[

              { label: 'Test Creation', to: '/tests/new' },

              { label: 'Create Test' },

              { label: 'Chapter Wise' },

            ]}

          />

          <Button
            onClick={handleSaveAndContinue}
            loading={saving}
            disabled={!canPublish || saving}
            className="shrink-0"
          >
            Publish
          </Button>

        </div>

        {!canPublish && totalTarget > 0 && (
          <p className="text-sm text-amber-700">
            {completedCount === 0
              ? `Add ${totalTarget} question(s) to publish this test.`
              : `${questionsRemaining} more question(s) needed before you can publish.`}
          </p>
        )}



        {test && (

          <TestSummaryCard

            test={test}

            questionCount={completedCount}

            editHref={id ? `/tests/${id}/edit` : undefined}

          />

        )}



        <form onSubmit={handleSubmit(onSaveQuestion)} className="mt-6 space-y-6">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <h2 className="text-lg font-semibold text-slate-900">

              Question {currentIndex + 1}/{totalTarget}

            </h2>

            <div className="flex flex-wrap items-center gap-2">

              <button

                type="button"

                title="Multiple choice question (active)"

                onClick={() => questionEditorRef.current?.focus()}

                className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100"

              >

                + MCQ

              </button>

              <button

                type="button"

                title="Import questions from CSV file"

                onClick={() => csvInputRef.current?.click()}

                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"

              >

                CSV

              </button>

              <button

                type="button"

                title="Download sample CSV template"

                onClick={downloadCsvTemplate}

                className="text-xs text-brand-600 hover:underline"

              >

                Template

              </button>

              <input

                ref={csvInputRef}

                type="file"

                accept=".csv,text/csv"

                className="hidden"

                onChange={(e) => {

                  const file = e.target.files?.[0]

                  if (file) void handleCsvImport(file)

                }}

              />

            </div>

          </div>



          <QuestionRichEditor

            ref={questionEditorRef}

            registration={register('question')}

            onQuestionChange={(value) =>

              setValue('question', value, { shouldValidate: true, shouldDirty: true })

            }

            mediaUrl={questionMediaUrl}
            onMediaUrl={(url) => setValue('media_url', url, { shouldDirty: true })}
            error={errors.question?.message}

          />



          <div>

            <h3 className="mb-3 font-semibold text-slate-900">Type the options below</h3>

            <div className="space-y-3">

              {OPTION_KEYS.map((key, idx) => (

                <div key={key} className="flex items-center gap-3">

                  <input

                    type="radio"

                    name="correct_option"

                    value={key}

                    checked={correctOption === key}

                    onChange={() => setValue('correct_option', key)}

                    className="h-4 w-4 shrink-0 border-brand-500 text-brand-500 focus:ring-brand-500"

                  />

                  <div className="relative min-w-0 flex-1">

                    <input

                      className="w-full rounded-lg border border-border px-3 py-2.5 pr-10 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"

                      placeholder="Type Option here"

                      {...register(key)}

                    />

                    <button

                      type="button"

                      onClick={() => clearOption(key)}

                      className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"

                      aria-label={`Clear option ${idx + 1}`}

                    >

                      🗑

                    </button>

                  </div>

                  {errors[key] && (

                    <p className="absolute text-xs text-red-600">{errors[key]?.message}</p>

                  )}

                </div>

              ))}

            </div>

          </div>



          <div>

            <h3 className="mb-3 font-semibold text-slate-900">Add Solution</h3>

            <div className="relative rounded-xl border border-border bg-white p-4">

              <textarea

                className="min-h-[100px] w-full resize-y border-0 text-sm placeholder:text-slate-400 focus:outline-none"

                rows={4}

                placeholder="Type here"

                {...register('explanation')}

              />

            </div>

          </div>



          <div>

            <h3 className="mb-3 font-semibold text-slate-900">Question settings</h3>

            <div className="grid gap-4 sm:grid-cols-3">

              <Select

                label="Level of Difficulty"

                placeholder="Select from Drop-down"

                options={DIFFICULTY_OPTIONS}

                {...register('difficulty')}

                value={difficulty}

              />

              <Select

                label="Topic"

                placeholder="Select from Drop-down"

                options={[]}

                disabled

              />

              <Select

                label="Sub-topic"

                placeholder="Select from Drop-down"

                options={[]}

                disabled

              />

            </div>

          </div>



          {pendingQuestions.length > 0 && (

            <div className="rounded-lg border border-border bg-slate-50 p-4">

              <p className="mb-2 text-sm font-medium text-slate-700">

                Pending questions ({pendingQuestions.length})

              </p>

              <ul className="space-y-2">

                {pendingQuestions.map((q, i) => (

                  <li

                    key={i}

                    className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"

                  >

                    <span className="truncate">

                      {savedQuestions.length + i + 1}. {q.question}

                    </span>

                    <div className="flex gap-2">

                      <button

                        type="button"

                        onClick={() => editPending(i)}

                        className="text-brand-600 hover:underline"

                      >

                        Edit

                      </button>

                      <button

                        type="button"

                        onClick={() => handleRemovePending(i)}

                        className="text-red-600 hover:underline"

                      >

                        Delete

                      </button>

                    </div>

                  </li>

                ))}

              </ul>

            </div>

          )}



          {notice && (

            <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{notice}</div>

          )}



          {apiError && (

            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{apiError}</div>

          )}



          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">

            <Link to="/dashboard">

              <Button type="button" variant="coral">

                Exit Test Creation

              </Button>

            </Link>

            <div className="flex gap-3">

              <Button type="submit" variant="primary">

                Save Question

              </Button>

              <Button
                type="button"
                onClick={handleSaveAndContinue}
                loading={saving}
                disabled={!canPublish || saving}
              >
                Next
              </Button>

            </div>

          </div>

        </form>

      </div>

    </div>

  )

}

