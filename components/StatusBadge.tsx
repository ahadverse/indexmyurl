import { Badge, Tone } from '@/components/ui/Badge'

const STATUS: Record<string, { label: string; tone: Tone; pulse?: boolean }> = {
  PENDING: { label: 'Pending', tone: 'neutral' },
  QUEUED: { label: 'Queued', tone: 'info', pulse: true },
  WRAPPER_CREATED: { label: 'Preparing', tone: 'info', pulse: true },
  WAITING_CRAWL: { label: 'Waiting for Google', tone: 'warning', pulse: true },
  CRAWLED_NOT_INDEXED: { label: 'Crawled, not indexed', tone: 'warning' },
  RETRYING: { label: 'Retrying', tone: 'brand', pulse: true },
  INDEXED: { label: 'Indexed', tone: 'success' },
  FAILED: { label: 'Failed', tone: 'danger' },
}

/** Job statuses that will still change on their own. */
export const ACTIVE_STATUSES = ['PENDING', 'QUEUED', 'WRAPPER_CREATED', 'WAITING_CRAWL', 'CRAWLED_NOT_INDEXED', 'RETRYING']

export function statusLabel(status: string): string {
  return STATUS[status]?.label ?? status
}

export default function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, tone: 'neutral' as Tone }
  return (
    <Badge tone={s.tone} dot pulse={s.pulse}>
      {s.label}
    </Badge>
  )
}
