import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type SelectHTMLAttributes,
} from 'react'

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      placeholder,
      className = '',
      id,
      value: valueProp,
      defaultValue,
      onChange,
      onBlur,
      disabled,
      required,
      name,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const selectId = id ?? name ?? generatedId
    const listboxId = `${selectId}-listbox`

    const hiddenSelectRef = useRef<HTMLSelectElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [open, setOpen] = useState(false)

    const resolvedValue =
      valueProp !== undefined && valueProp !== null
        ? String(valueProp)
        : defaultValue !== undefined && defaultValue !== null
          ? String(defaultValue)
          : ''

    const [internalValue, setInternalValue] = useState(resolvedValue)

    useImperativeHandle(ref, () => hiddenSelectRef.current as HTMLSelectElement)

    useEffect(() => {
      if (valueProp !== undefined && valueProp !== null) {
        setInternalValue(String(valueProp))
      }
    }, [valueProp])

    useEffect(() => {
      if (defaultValue !== undefined && valueProp === undefined) {
        setInternalValue(String(defaultValue))
      }
    }, [defaultValue, valueProp])

    const selectedLabel =
      options.find((o) => o.value === internalValue)?.label ??
      (placeholder && !internalValue ? placeholder : 'Select…')

    const commitValue = useCallback(
      (nextValue: string) => {
        const select = hiddenSelectRef.current
        if (!select) return

        select.value = nextValue
        setInternalValue(nextValue)
        setOpen(false)

        onChange?.({
          target: select,
          currentTarget: select,
          type: 'change',
        } as ChangeEvent<HTMLSelectElement>)

        onBlur?.({
          target: select,
          currentTarget: select,
          type: 'blur',
        } as FocusEvent<HTMLSelectElement>)
      },
      [onChange, onBlur],
    )

    useEffect(() => {
      if (!open) return

      const handlePointerDown = (event: MouseEvent | TouchEvent) => {
        if (!containerRef.current?.contains(event.target as Node)) {
          setOpen(false)
        }
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setOpen(false)
      }

      document.addEventListener('mousedown', handlePointerDown)
      document.addEventListener('touchstart', handlePointerDown)
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('mousedown', handlePointerDown)
        document.removeEventListener('touchstart', handlePointerDown)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }, [open])

    return (
      <div ref={containerRef} className="relative flex min-w-0 w-full max-w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}

        {/* Hidden native select for react-hook-form */}
        <select
          ref={hiddenSelectRef}
          id={selectId}
          name={name}
          value={internalValue}
          disabled={disabled}
          required={required}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          id={`${selectId}-trigger`}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          className={`box-border flex w-full min-w-0 max-w-full items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2.5 text-left text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 ${error ? 'border-red-500' : ''} ${!internalValue && placeholder ? 'text-slate-400' : 'text-slate-900'} ${className}`}
        >
          <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
          <svg
            className={`h-4 w-4 shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {open && (
          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={`${selectId}-trigger`}
            className="absolute top-full z-50 mt-1 max-h-48 w-full min-w-0 overflow-x-hidden overflow-y-auto rounded-lg border border-slate-300 bg-white py-1 shadow-lg"
          >
            {placeholder && !options.some((o) => o.value === '') && (
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={internalValue === ''}
                  onClick={() => commitValue('')}
                  className={`w-full min-w-0 px-3 py-2.5 text-left text-sm break-words hover:bg-slate-50 ${internalValue === '' ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-700'}`}
                >
                  {placeholder}
                </button>
              </li>
            )}
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={internalValue === opt.value}
                  onClick={() => commitValue(opt.value)}
                  className={`w-full min-w-0 px-3 py-2.5 text-left text-sm break-words hover:bg-slate-50 ${internalValue === opt.value ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-700'}`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  },
)

Select.displayName = 'Select'
