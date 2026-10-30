/** "just now", "5m ago", "3h ago", "2d ago", then a plain date. */
export function timeAgo(value: string | Date, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - new Date(value).getTime()) / 1000))
  if (seconds < 45) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function initials(firstName?: string, lastName?: string, fallback = '?'): string {
  const letters = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
  return letters || fallback.slice(0, 1).toUpperCase()
}

export function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)}s`
}
