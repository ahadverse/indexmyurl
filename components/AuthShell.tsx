import { CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

const POINTS = [
  'Every URL is scanned for blockers before anything is sent to Google.',
  'Watch results arrive live, whether it is 5 pages or 500.',
  'A credit is only used once Search Console confirms the page is indexed.',
]

/** Split-screen frame for sign in / sign up: brand panel on the left, form on the right. */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 p-12 text-white lg:flex">
        <div className="bg-dots absolute inset-0" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-violet-400/25 blur-3xl" aria-hidden="true" />

        <div className="relative">
          <Logo href="/" invert />
        </div>

        <div className="relative max-w-md">
          <h2 className="text-[32px] font-semibold leading-[1.15] tracking-tight">
            Know your pages can be indexed — before you submit them.
          </h2>
          <ul className="mt-9 space-y-4">
            {POINTS.map((point) => (
              <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-brand-50">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-200" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[13px] text-brand-100/80">Indexing is decided by Google and is never guaranteed.</p>
      </aside>

      <main className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-[22rem]">
          <div className="mb-10 lg:hidden">
            <Logo href="/" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-[15px] text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </main>
    </div>
  )
}
