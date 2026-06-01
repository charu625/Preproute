import type { ApiResponse, Question, QuestionPayload } from '../types/api'
import { apiClient } from './client'

export async function bulkCreateQuestions(questions: QuestionPayload[]) {
  const { data } = await apiClient.post<ApiResponse<Question[]>>('/questions/bulk', {
    questions,
  })
  return data
}

export async function fetchQuestionsBulk(questionIds: string[]) {
  const { data } = await apiClient.post<ApiResponse<Question[]>>(
    '/questions/fetchBulk',
    { question_ids: questionIds },
  )
  return data
}
