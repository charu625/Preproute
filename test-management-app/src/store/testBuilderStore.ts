import { create } from 'zustand'
import type { QuestionPayload } from '../types/api'

interface TestBuilderState {
  pendingQuestions: QuestionPayload[]
  addPendingQuestion: (question: QuestionPayload) => void
  updatePendingQuestion: (index: number, question: QuestionPayload) => void
  removePendingQuestion: (index: number) => void
  clearPendingQuestions: () => void
}

export const useTestBuilderStore = create<TestBuilderState>((set) => ({
  pendingQuestions: [],
  addPendingQuestion: (question) =>
    set((state) => ({ pendingQuestions: [...state.pendingQuestions, question] })),
  updatePendingQuestion: (index, question) =>
    set((state) => {
      const next = [...state.pendingQuestions]
      next[index] = question
      return { pendingQuestions: next }
    }),
  removePendingQuestion: (index) =>
    set((state) => ({
      pendingQuestions: state.pendingQuestions.filter((_, i) => i !== index),
    })),
  clearPendingQuestions: () => set({ pendingQuestions: [] }),
}))
