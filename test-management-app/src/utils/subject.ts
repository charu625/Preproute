import type { Subject } from '../types/api'

export function resolveSubjectId(subject: string, subjects: Subject[]): string {
  if (!subject) return ''
  const byId = subjects.find((s) => s.id === subject)
  if (byId) return byId.id
  const byName = subjects.find((s) => s.name === subject)
  return byName?.id ?? subject
}
