import { Link } from 'react-router-dom'
import type { BreadcrumbItem } from '../../types/ui'

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="text-sm text-muted" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={item.label}>
          {i > 0 && <span className="mx-2 text-slate-300">/</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-brand-600">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-700">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
