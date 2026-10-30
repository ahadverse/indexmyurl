import AppShell from '@/components/AppShell'
import { Skeleton, SkeletonRows, SkeletonStat } from '@/components/ui/Skeleton'

/** Shown instantly while the dashboard route loads. */
export default function Loading() {
  return (
    <AppShell>
      <div className="mb-8 space-y-3" aria-hidden="true">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonStat key={i} />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <SkeletonRows rows={5} />
      </div>
    </AppShell>
  )
}
