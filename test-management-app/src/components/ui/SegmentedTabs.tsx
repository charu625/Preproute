import type { SegmentedTabsProps } from '../../types/ui'

export function SegmentedTabs({ tabs, value, onChange }: SegmentedTabsProps) {
  return (
    <div className="inline-flex rounded-full bg-slate-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            value === tab.value
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
