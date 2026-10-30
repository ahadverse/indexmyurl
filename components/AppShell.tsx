import Navbar from '@/components/Navbar'
import { cn } from '@/lib/cn'
import type { User } from '@/lib/types'

/** The frame of every signed-in page: sticky navigation and a centred content column. */
export default function AppShell({
  user,
  children,
  narrow,
}: {
  user?: Partial<User> | null
  children: React.ReactNode
  /** a narrower column, for forms and settings */
  narrow?: boolean
}) {
  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <main className={cn('mx-auto px-4 py-8 sm:px-6 sm:py-10', narrow ? 'max-w-3xl' : 'max-w-6xl')}>{children}</main>
    </div>
  )
}
