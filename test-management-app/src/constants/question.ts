import type { CorrectOption } from '../types/api'
import type { QuestionFormValues } from '../types/forms'

export const OPTION_KEYS = ['option1', 'option2', 'option3', 'option4'] as const

export type OptionKey = (typeof OPTION_KEYS)[number]

export const EMPTY_QUESTION_FORM: QuestionFormValues = {
  question: '',
  option1: '',
  option2: '',
  option3: '',
  option4: '',
  correct_option: 'option1',
  explanation: '',
  difficulty: 'easy',
  media_url: '',
}

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

export const MCQ_OPTION_KEYS: readonly CorrectOption[] = OPTION_KEYS
