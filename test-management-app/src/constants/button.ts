import type { ButtonVariant } from '../types/ui'

export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500 disabled:bg-brand-200',
  secondary: 'bg-slate-700 text-white hover:bg-slate-800 focus:ring-slate-500',
  soft: 'bg-brand-100 text-brand-600 hover:bg-brand-200 focus:ring-brand-500',
  outline:
    'border border-border bg-white text-brand-600 hover:bg-brand-50 focus:ring-brand-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  coral: 'bg-coral text-white hover:bg-coral-hover focus:ring-coral',
  ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
}
