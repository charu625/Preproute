interface MultiSelectProps {
  label?: string
  options: { value: string; label: string }[]
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  disabled?: boolean
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  error,
  disabled,
}: MultiSelectProps) {
  const toggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      <div
        className={`max-h-40 w-full min-w-0 max-w-full overflow-x-hidden overflow-y-auto rounded-lg border border-slate-300 bg-white p-2 ${disabled ? 'opacity-50' : ''} ${error ? 'border-red-500' : ''}`}
      >
        {options.length === 0 ? (
          <p className="px-2 py-3 text-sm text-slate-500">No options available</p>
        ) : (
          options.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={value.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                disabled={disabled}
                className="rounded border-slate-300 text-brand-500 focus:ring-brand-500"
              />
              <span className="min-w-0 flex-1 break-words text-sm text-slate-700">{opt.label}</span>
            </label>
          ))
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
