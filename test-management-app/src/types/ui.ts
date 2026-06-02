import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'soft'
  | 'danger'
  | 'coral'
  | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export interface UnderlineInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export interface MultiSelectProps {
  label?: string
  options: SelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  disabled?: boolean
  emptyMessage?: string
}

export interface NumberStepperProps {
  label: string
  value: number
  onChange: (value: number) => void
  prefix?: string
}

export interface TabOption {
  value: string
  label: string
}

export interface SegmentedTabsProps {
  tabs: TabOption[]
  value: string
  onChange: (value: string) => void
}

export interface RadioOption {
  value: string
  label: string
}

export interface RadioGroupProps {
  label?: string
  name: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
}

export interface BreadcrumbItem {
  label: string
  to?: string
}
