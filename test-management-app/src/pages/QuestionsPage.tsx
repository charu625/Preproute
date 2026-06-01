import { zodResolver } from '@hookform/resolvers/zod'

import { useCallback, useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'

import { Link, useNavigate, useParams } from 'react-router-dom'

import { z } from 'zod'

import { bulkCreateQuestions, fetchQuestionsBulk } from '../api/questions'

import { getTestById, updateTest } from '../api/tests'

import { QuestionSidebar } from '../components/test/QuestionSidebar'

import { TestSummaryCard } from '../components/test/TestSummaryCard'

import { Breadcrumbs } from '../components/ui/Breadcrumbs'

import { Button } from '../components/ui/Button'

import { Select } from '../components/ui/Select'

import type { Question, Test } from '../types/api'

import { useTestBuilderStore } from '../store/testBuilderStore'

import { getApiErrorMessage } from '../utils/format'



const questionSchema = z.object({

  question: z.string().min(1, 'Question text is required'),

  option1: z.string().min(1, 'Option 1 is required'),

  option2: z.string().min(1, 'Option 2 is required'),

  option3: z.string().min(1, 'Option 3 is required'),

  option4: z.string().min(1, 'Option 4 is required'),

  correct_option: z.enum(['option1', 'option2', 'option3', 'option4']),

  explanation: z.string().optional(),

  difficulty: z.string().optional(),

  media_url: z.string().optional(),

})



type QuestionFormValues = z.infer<typeof questionSchema>



const OPTION_KEYS = ['option1', 'option2', 'option3', 'option4'] as const



const FORMAT_BUTTONS = ['B', 'I', 'U', 'S', '≡', '•', '1.', '🖼']



export function QuestionsPage() {

  const { id } = useParams<{ id: string }>()

  const navigate = useNavigate()

  const [test, setTest] = useState<Test | null>(null)

  const [savedQuestions, setSavedQuestions] = useState<Question[]>([])

  const [currentIndex, setCurrentIndex] = useState(0)

  const [editingPendingIndex, setEditingPendingIndex] = useState<number | null>(null)

  const [apiError, setApiError] = useState('')

  const [saving, setSaving] = useState(false)



  const { pendingQuestions, addPendingQuestion, updatePendingQuestion, removePendingQuestion, clearPendingQuestions } =

    useTestBuilderStore()



  const totalTarget = test?.total_questions ?? 50



  const {

    register,

    handleSubmit,

    reset,

    watch,

    setValue,

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



  const correctOption = watch('correct_option')



  const loadTest = useCallback(async () => {

    if (!id) return

    try {

      const response = await getTestById(id)

      setTest(response.data)

      if (response.data.questions?.length) {

        const qResponse = await fetchQuestionsBulk(response.data.questions)

        setSavedQuestions(qResponse.data ?? [])

      }

    } catch (err) {

      setApiError(getApiErrorMessage(err))

    }

  }, [id])



  useEffect(() => {

    void loadTest()

  }, [loadTest])



  const completedCount = savedQuestions.length + pendingQuestions.length



  const resetForm = () => {

    reset({

      question: '',

      option1: '',

      option2: '',

      option3: '',

      option4: '',

      correct_option: 'option1',

      explanation: '',

      difficulty: 'easy',

      media_url: '',

    })

    setEditingPendingIndex(null)

  }



  const onSaveQuestion = (values: QuestionFormValues) => {

    if (!id) return

    const payload = {

      type: 'mcq' as const,

      ...values,

      test_id: id,

    }



    if (editingPendingIndex !== null) {

      updatePendingQuestion(editingPendingIndex, payload)

    } else {

      addPendingQuestion(payload)

    }

    resetForm()

    if (currentIndex < totalTarget - 1) {

      setCurrentIndex((i) => i + 1)

    }

  }



  const editPending = (index: number) => {

    const q = pendingQuestions[index]

    reset({

      question: q.question,

      option1: q.option1,

      option2: q.option2,

      option3: q.option3,

      option4: q.option4,

      correct_option: q.correct_option,

      explanation: q.explanation ?? '',

      difficulty: q.difficulty ?? 'easy',

      media_url: q.media_url ?? '',

    })

    setEditingPendingIndex(index)

    setCurrentIndex(savedQuestions.length + index)

  }



  const handleSaveAndContinue = async () => {

    if (!id || !test) return

    const totalQuestions = savedQuestions.length + pendingQuestions.length

    if (totalQuestions < 1) {

      setApiError('Add at least one question before continuing.')

      return

    }



    setSaving(true)

    setApiError('')

    try {

      let questionIds = test.questions ?? []



      if (pendingQuestions.length > 0) {

        const created = await bulkCreateQuestions(pendingQuestions)

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

    <div className="-m-4 flex min-h-[calc(100vh-4rem)] min-w-0 flex-col sm:-m-6 lg:flex-row">

      <QuestionSidebar

        totalQuestions={totalTarget}

        currentIndex={currentIndex}

        completedCount={completedCount}

        onSelectQuestion={setCurrentIndex}

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

          <Button onClick={handleSaveAndContinue} loading={saving} className="shrink-0">

            Publish

          </Button>

        </div>



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

            <div className="flex gap-2">

              <span className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-600">

                + MCQ

              </span>

              <span className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-600">

                CSV

              </span>

            </div>

          </div>



          <div className="rounded-xl border border-border bg-white shadow-sm">

            <div className="flex flex-wrap gap-1 border-b border-border px-3 py-2">

              {FORMAT_BUTTONS.map((btn) => (

                <button

                  key={btn}

                  type="button"

                  className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"

                >

                  {btn}

                </button>

              ))}

            </div>

            <div className="relative p-4">

              <textarea

                className="min-h-[140px] w-full resize-y rounded-lg border-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"

                rows={5}

                placeholder="Type here"

                {...register('question')}

              />

              {errors.question && (

                <p className="mt-1 text-xs text-red-600">{errors.question.message}</p>

              )}

            </div>

          </div>



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

                      onClick={() => setValue(key, '')}

                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"

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

                options={[

                  { value: 'easy', label: 'Easy' },

                  { value: 'medium', label: 'Medium' },

                  { value: 'hard', label: 'Hard' },

                ]}

                {...register('difficulty')}

                value={watch('difficulty')}

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

                        onClick={() => removePendingQuestion(i)}

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

              <Button type="button" onClick={handleSaveAndContinue} loading={saving}>

                Next

              </Button>

            </div>

          </div>

        </form>

      </div>

    </div>

  )

}

