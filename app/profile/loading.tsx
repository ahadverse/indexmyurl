import AppShell from '@/components/AppShell'
import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <AppShell narrow>
      <div className="mb-8 space-y-3" aria-hidden="true">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-6" aria-hidden="true">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </AppShell>
  )
}
