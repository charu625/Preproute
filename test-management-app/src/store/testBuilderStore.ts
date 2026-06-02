import { create } from 'zustand'
import type { TestBuilderState } from '../types/store'

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
