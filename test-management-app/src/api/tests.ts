import type {
  ApiResponse,
  CreateTestPayload,
  Test,
  UpdateTestPayload,
} from '../types/api'
import { apiClient } from './client'

export async function getTests() {
  const { data } = await apiClient.get<ApiResponse<Test[]>>('/tests')
  return data
}

export async function getTestById(id: string) {
  const { data } = await apiClient.get<ApiResponse<Test>>(`/tests/${id}`)
  return data
}

export async function createTest(payload: CreateTestPayload) {
  const { data } = await apiClient.post<ApiResponse<Test>>('/tests', payload)
  return data
}

export async function updateTest(id: string, payload: UpdateTestPayload) {
  const { data } = await apiClient.put<ApiResponse<Test>>(`/tests/${id}`, payload)
  return data
}

export async function publishTest(id: string) {
  return updateTest(id, { status: 'live' })
}
