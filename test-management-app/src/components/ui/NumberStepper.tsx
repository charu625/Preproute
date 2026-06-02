import type { NumberStepperProps } from '../../types/ui'

export function NumberStepper({ label, value, onChange, prefix = '' }: NumberStepperProps) {
  const display = `${prefix}${value >= 0 && prefix === '+' ? value : value}`

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center overflow-hidden rounded-lg border border-border bg-white">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full min-w-0 flex-1 border-0 px-3 py-2.5 text-sm outline-none"
        />
        <div className="flex flex-col border-l border-border">
          <button
            type="button"
            onClick={() => onChange(value + 1)}
            className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50"
            aria-label={`Increase ${label}`}
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => onChange(value - 1)}
            className="border-t border-border px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50"
            aria-label={`Decrease ${label}`}
          >
            ▼
          </button>
        </div>
      </div>
      <span className="sr-only">{display}</span>
    </div>
  )
}
