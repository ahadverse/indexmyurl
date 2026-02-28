const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  QUEUED: 'bg-blue-100 text-blue-700',
  WRAPPER_CREATED: 'bg-yellow-100 text-yellow-700',
  WAITING_CRAWL: 'bg-orange-100 text-orange-700',
  CRAWLED_NOT_INDEXED: 'bg-yellow-200 text-yellow-800',
  INDEXED: 'bg-green-100 text-green-700',
  RETRYING: 'bg-purple-100 text-purple-700',
  FAILED: 'bg-red-100 text-red-700',
}

export default function StatusBadge({ status }: { status: string }) {
  const cls = statusColors[status] || 'bg-gray-100 text-gray-700'
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${cls}`}>
      {status}
    </span>
  )
}
