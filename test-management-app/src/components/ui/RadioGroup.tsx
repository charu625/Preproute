import type { RadioGroupProps } from '../../types/ui'

export function RadioGroup({ label, name, options, value, onChange }: RadioGroupProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      {label && <legend className="text-sm font-medium text-slate-700">{label}</legend>}
      <div className="flex flex-wrap gap-5 pt-1">
        {options.map((opt) => (
          <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="h-4 w-4 border-slate-300 text-brand-500 focus:ring-brand-500"
            />
            <span className="text-slate-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
