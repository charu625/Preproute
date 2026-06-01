import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import {
  getSubjects,
  getSubTopicsByTopics,
  getTopicsBySubject,
} from '../api/subjects'
import { createTest, getTestById, updateTest } from '../api/tests'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { MultiSelect } from '../components/ui/MultiSelect'
import { NumberStepper } from '../components/ui/NumberStepper'
import { RadioGroup } from '../components/ui/RadioGroup'
import { SegmentedTabs } from '../components/ui/SegmentedTabs'
import { Select } from '../components/ui/Select'
import type { Subject, SubTopic, Topic } from '../types/api'
import { getApiErrorMessage } from '../utils/format'

const testFormSchema = z.object({
  name: z.string().min(1, 'Test name is required'),
  type: z.string().min(1, 'Test type is required'),
  subject: z.string().min(1, 'Subject is required'),
  topics: z.array(z.string()).min(1, 'Select at least one topic'),
  sub_topics: z.array(z.string()),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  correct_marks: z.number().min(0),
  wrong_marks: z.number(),
  unattempt_marks: z.number(),
  total_time: z.number().min(1, 'Total time must be at least 1 minute'),
  total_marks: z.number().min(1),
  total_questions: z.number().min(1),
})

type TestFormValues = z.infer<typeof testFormSchema>

const TYPE_TABS = [
  { value: 'chapterwise', label: 'Chapter Wise' },
  { value: 'practice', label: 'PYQ' },
  { value: 'mock', label: 'Mock Test' },
]

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Difficult' },
]

export function TestFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [subTopics, setSubTopics] = useState<SubTopic[]>([])
  const [apiError, setApiError] = useState('')
  const [loadingData, setLoadingData] = useState(isEdit)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      name: '',
      type: 'chapterwise',
      subject: '',
      topics: [],
      sub_topics: [],
      difficulty: 'easy',
      correct_marks: 5,
      wrong_marks: -1,
      unattempt_marks: 0,
      total_time: 60,
      total_marks: 250,
      total_questions: 50,
    },
  })

  const selectedSubject = watch('subject')
  const selectedTopics = watch('topics')
  const testType = watch('type')
  const difficulty = watch('difficulty')
  const correctMarks = watch('correct_marks')
  const wrongMarks = watch('wrong_marks')
  const unattemptMarks = watch('unattempt_marks')

  useEffect(() => {
    void getSubjects().then((res) => setSubjects(res.data ?? []))
  }, [])

  useEffect(() => {
    if (!selectedSubject) {
      setTopics([])
      setSubTopics([])
      setValue('topics', [])
      setValue('sub_topics', [])
      return
    }
    void getTopicsBySubject(selectedSubject).then((res) => {
      setTopics(res.data ?? [])
      setValue('topics', [])
      setValue('sub_topics', [])
    })
  }, [selectedSubject, setValue])

  useEffect(() => {
    if (selectedTopics.length === 0) {
      setSubTopics([])
      setValue('sub_topics', [])
      return
    }
    void getSubTopicsByTopics(selectedTopics).then((res) => {
      setSubTopics(res.data ?? [])
    })
  }, [selectedTopics, setValue])

  useEffect(() => {
    if (!isEdit || !id) return
    const loadTest = async () => {
      setLoadingData(true)
      try {
        const response = await getTestById(id)
        const test = response.data
        const subjectMatch = subjects.find((s) => s.name === test.subject)
        reset({
          name: test.name,
          type: test.type,
          subject: subjectMatch?.id ?? '',
          topics: [],
          sub_topics: [],
          difficulty: (test.difficulty as TestFormValues['difficulty']) || 'easy',
          correct_marks: test.correct_marks,
          wrong_marks: test.wrong_marks,
          unattempt_marks: test.unattempt_marks,
          total_time: test.total_time,
          total_marks: test.total_marks,
          total_questions: test.total_questions,
        })
      } catch (err) {
        setApiError(getApiErrorMessage(err))
      } finally {
        setLoadingData(false)
      }
    }
    if (subjects.length > 0) void loadTest()
  }, [id, isEdit, subjects, reset])

  const saveTest = async (values: TestFormValues, asDraft: boolean) => {
    setApiError('')
    const payload = {
      ...values,
      status: asDraft ? null : undefined,
    }

    try {
      if (isEdit && id) {
        await updateTest(id, payload)
        navigate(`/tests/${id}/questions`)
      } else {
        const response = await createTest(payload)
        const newId = response.data.id
        navigate(`/tests/${newId}/questions`)
      }
    } catch (err) {
      setApiError(getApiErrorMessage(err))
    }
  }

  const onSubmit = (values: TestFormValues) => void saveTest(values, false)

  if (loadingData) {
    return (
      <div className="flex justify-center py-16">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl min-w-0 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Test Creation', to: '/tests/new' },
          { label: 'Create Test', to: '/tests/new' },
          { label: TYPE_TABS.find((t) => t.value === testType)?.label ?? 'Chapter Wise' },
        ]}
      />

      <SegmentedTabs tabs={TYPE_TABS} value={testType} onChange={(v) => setValue('type', v)} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full min-w-0 space-y-6 overflow-x-hidden rounded-xl border border-border bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 [&>*]:min-w-0">
          <Select
            label="Subject"
            placeholder="Choose from Drop-down"
            options={subjects.map((s) => ({ value: s.id, label: s.name }))}
            error={errors.subject?.message}
            required
            {...register('subject')}
            value={selectedSubject}
          />
          <Input
            label="Name of Test"
            placeholder="Enter name of Test"
            error={errors.name?.message}
            required
            {...register('name')}
          />
          <MultiSelect
            label="Topic"
            options={topics.map((t) => ({ value: t.id, label: t.name }))}
            value={selectedTopics}
            onChange={(v) => setValue('topics', v, { shouldValidate: true })}
            error={errors.topics?.message}
            disabled={!selectedSubject}
          />
          <MultiSelect
            label="Sub Topic"
            options={subTopics.map((st) => ({ value: st.id, label: st.name }))}
            value={watch('sub_topics')}
            onChange={(v) => setValue('sub_topics', v)}
            disabled={selectedTopics.length === 0}
          />
          <Input
            label="Duration (Minutes)"
            type="number"
            placeholder="Enter the time"
            error={errors.total_time?.message}
            {...register('total_time', { valueAsNumber: true })}
          />
          <div>
            <RadioGroup
              label="Test Difficulty Level"
              name="difficulty"
              options={DIFFICULTIES}
              value={difficulty}
              onChange={(v) => setValue('difficulty', v as TestFormValues['difficulty'])}
            />
            {errors.difficulty && (
              <p className="mt-1 text-xs text-red-600">{errors.difficulty.message}</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Marking Scheme:</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 [&>*]:min-w-0">
            <NumberStepper
              label="Wrong Answer"
              value={wrongMarks}
              onChange={(v) => setValue('wrong_marks', v)}
            />
            <NumberStepper
              label="Unattempted"
              value={unattemptMarks}
              prefix="+"
              onChange={(v) => setValue('unattempt_marks', v)}
            />
            <NumberStepper
              label="Correct Answer"
              value={correctMarks}
              prefix="+"
              onChange={(v) => setValue('correct_marks', v)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 [&>*]:min-w-0">
          <Input
            label="No of Questions"
            type="number"
            placeholder="Ex: 250 Marks"
            error={errors.total_questions?.message}
            {...register('total_questions', { valueAsNumber: true })}
          />
          <Input
            label="Total Marks"
            type="number"
            placeholder="Ex: 250 Marks"
            error={errors.total_marks?.message}
            {...register('total_marks', { valueAsNumber: true })}
          />
        </div>

        {apiError && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{apiError}</div>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
          <Link to="/dashboard">
            <Button type="button" variant="soft">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={isSubmitting}>
            Next
          </Button>
        </div>
      </form>
    </div>
  )
}
