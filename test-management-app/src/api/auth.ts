import type { ApiResponse, LoginResponse } from '../types/api'
import { apiClient } from './client'

export async function login(userId: string, password: string) {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
    userId,
    password,
  })
  return data
}
