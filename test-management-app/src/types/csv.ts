import type { QuestionPayload } from './api'

export interface CsvParseResult {
  questions: Omit<QuestionPayload, 'type'>[]
  errors: string[]
}
