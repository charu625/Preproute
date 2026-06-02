import type { QuestionPayload, User } from './api'

export interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export interface TestBuilderState {
  pendingQuestions: QuestionPayload[]
  addPendingQuestion: (question: QuestionPayload) => void
  updatePendingQuestion: (index: number, question: QuestionPayload) => void
  removePendingQuestion: (index: number) => void
  clearPendingQuestions: () => void
}
