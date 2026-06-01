export type ApiStatus = 'success' | 'error'

export interface ApiResponse<T> {
  status: ApiStatus
  message: string
  data: T
}

export interface User {
  id: string
  userId: string
  name: string
  role: string
  subrole: string
  phone?: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface Subject {
  id: string
  name: string
  created_at?: string
  updated_at?: string
}

export interface Topic {
  id: string
  name: string
  subject_id: string
}

export interface SubTopic {
  id: string
  name: string
  topic_id: string
}

export type TestStatus = 'draft' | 'live' | null
export type TestDifficulty = 'easy' | 'medium' | 'hard'
export type TestType = 'practice' | 'chapterwise' | 'mock' | 'full_length'
export type QuestionType = 'mcq'
export type CorrectOption = 'option1' | 'option2' | 'option3' | 'option4'

export interface Test {
  id: string
  name: string
  type: TestType | string
  subject: string
  topics: string[]
  sub_topics: string[]
  questions: string[] | null
  correct_marks: number
  wrong_marks: number
  unattempt_marks: number
  difficulty: TestDifficulty | string
  total_marks: number
  total_time: number
  total_questions: number
  status: TestStatus
  created_at: string
  updated_at?: string | null
}

export interface CreateTestPayload {
  name: string
  type: string
  subject: string
  topics: string[]
  sub_topics: string[]
  correct_marks: number
  wrong_marks: number
  unattempt_marks: number
  difficulty: string
  total_time: number
  total_marks: number
  total_questions: number
  status?: string | null
}

export interface UpdateTestPayload {
  name?: string
  type?: string
  subject?: string
  topics?: string[]
  sub_topics?: string[]
  questions?: string[]
  correct_marks?: number
  wrong_marks?: number
  unattempt_marks?: number
  difficulty?: string
  total_time?: number
  total_marks?: number
  total_questions?: number
  status?: string | null
}

export interface QuestionPayload {
  type: QuestionType
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct_option: CorrectOption
  explanation?: string
  difficulty?: string
  test_id: string
  topic?: string
  sub_topic?: string
  media_url?: string
}

export interface Question extends QuestionPayload {
  id: string
}
