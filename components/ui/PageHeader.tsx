import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}) {
  return (
    <div className="mb-8">
      {breadcrumbs && (
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1 text-sm text-slate-500">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />}
              {crumb.href ? (
                <Link href={crumb.href} className="rounded hover:text-slate-900">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-700">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px] sm:leading-9">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
