import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbJsonLd, type Crumb } from '@/lib/seo'

/** Visible breadcrumb trail plus its BreadcrumbList structured data. "Home" is added in front. */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>
          </li>
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1
            return (
              <li key={crumb.path} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
                {last ? (
                  <span aria-current="page" className="text-slate-700">
                    {crumb.name}
                  </span>
                ) : (
                  <Link href={crumb.path} className="hover:text-slate-900">
                    {crumb.name}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
