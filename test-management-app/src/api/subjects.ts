import type { ApiResponse, Subject, SubTopic, Topic } from '../types/api'
import { apiClient } from './client'

export async function getSubjects() {
  const { data } = await apiClient.get<ApiResponse<Subject[]>>('/subjects')
  return data
}

export async function getTopicsBySubject(subjectId: string) {
  const { data } = await apiClient.get<ApiResponse<Topic[]>>(
    `/topics/subject/${subjectId}`,
  )
  return data
}

export async function getSubTopicsByTopic(topicId: string) {
  const { data } = await apiClient.get<ApiResponse<SubTopic[]>>(
    `/sub-topics/topic/${topicId}`,
  )
  return data
}

export async function getSubTopicsByTopics(topicIds: string[]) {
  const { data } = await apiClient.post<ApiResponse<SubTopic[]>>(
    '/sub-topics/multi-topics',
    { topicIds },
  )
  return data
}

export async function getSubTopicsForTopics(topicIds: string[]): Promise<SubTopic[]> {
  if (topicIds.length === 0) return []

  const multiResponse = await getSubTopicsByTopics(topicIds)
  let loaded = multiResponse.data ?? []

  if (loaded.length === 0) {
    const perTopic = await Promise.all(
      topicIds.map((topicId) => getSubTopicsByTopic(topicId).then((res) => res.data ?? [])),
    )
    const seen = new Set<string>()
    loaded = perTopic.flat().filter((st) => {
      if (seen.has(st.id)) return false
      seen.add(st.id)
      return true
    })
  }

  return loaded
}
