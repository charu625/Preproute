import { forwardRef, type InputHTMLAttributes } from 'react'

interface UnderlineInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const UnderlineInput = forwardRef<HTMLInputElement, UnderlineInputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? props.name
    return (
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-800">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  },
)

UnderlineInput.displayName = 'UnderlineInput'
