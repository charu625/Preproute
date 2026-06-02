import type { CorrectOption } from '../types/api'

export const REQUIRED_COLUMNS = [
  'question',
  'option1',
  'option2',
  'option3',
  'option4',
  'correct_option',
] as const

export const OPTIONAL_COLUMNS = ['difficulty', 'explanation', 'media_url'] as const

export type CsvColumn = (typeof REQUIRED_COLUMNS)[number] | (typeof OPTIONAL_COLUMNS)[number]

export const CORRECT_OPTION_MAP: Record<string, CorrectOption> = {
  option1: 'option1',
  option2: 'option2',
  option3: 'option3',
  option4: 'option4',
  '1': 'option1',
  '2': 'option2',
  '3': 'option3',
  '4': 'option4',
  a: 'option1',
  b: 'option2',
  c: 'option3',
  d: 'option4',
}

export const HEADER_ALIASES: Record<string, CsvColumn> = {
  question: 'question',
  q: 'question',
  option1: 'option1',
  option_1: 'option1',
  opt1: 'option1',
  a: 'option1',
  option2: 'option2',
  option_2: 'option2',
  opt2: 'option2',
  b: 'option2',
  option3: 'option3',
  option_3: 'option3',
  opt3: 'option3',
  c: 'option3',
  option4: 'option4',
  option_4: 'option4',
  opt4: 'option4',
  d: 'option4',
  correct_option: 'correct_option',
  correctoption: 'correct_option',
  correct: 'correct_option',
  answer: 'correct_option',
  difficulty: 'difficulty',
  level: 'difficulty',
  explanation: 'explanation',
  solution: 'explanation',
  media_url: 'media_url',
  mediaurl: 'media_url',
  media: 'media_url',
  image_url: 'media_url',
}

export const CSV_COLUMN_LABELS: Record<CsvColumn, string> = {
  question: 'question',
  option1: 'option1',
  option2: 'option2',
  option3: 'option3',
  option4: 'option4',
  correct_option: 'correct_option',
  difficulty: 'difficulty',
  explanation: 'explanation',
  media_url: 'media_url',
}

export const QUESTION_CSV_TEMPLATE = `question,option1,option2,option3,option4,correct_option,difficulty,explanation,media_url
"What is 2+2?","3","4","5","6","option2","easy","Because 2+2=4",""`
