import type { TestFormValues } from '../types/forms'

export const TYPE_TABS = [
  { value: 'chapterwise', label: 'Chapter Wise' },
  { value: 'practice', label: 'PYQ' },
  { value: 'mock', label: 'Mock Test' },
]

export const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Difficult' },
]

export const TEST_FORM_DEFAULTS: TestFormValues = {
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
}
