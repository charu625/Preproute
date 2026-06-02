import type { ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import type { Test } from './api'

export interface TestSummaryCardProps {
  test: Test
  questionCount?: number
  editHref?: string
}

export interface QuestionSidebarProps {
  totalQuestions: number
  currentIndex: number
  completedCount: number
  onSelectQuestion: (index: number) => void
}

export interface QuestionRichEditorProps {
  registration: UseFormRegisterReturn<'question'>
  onQuestionChange: (value: string) => void
  error?: string
  mediaUrl?: string
  onMediaUrl?: (url: string) => void
}

export type QuestionRichEditorHandle = {
  focus: () => void
}

export interface SidebarNavProps {
  pathname: string
  onNavigate?: () => void
}

export interface NavItem {
  to: string
  label: string
  isActive: (path: string) => boolean
  icon: ReactNode
}
