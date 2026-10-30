'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Download, Inbox, Plus, RefreshCw, Search, SearchX, TriangleAlert } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/cn'
import { downloadCsv, toCsv } from '@/lib/csv'
import { formatDateTime, timeAgo } from '@/lib/format'
import { useCurrentUser } from '@/lib/hooks'
import type { UrlRow } from '@/lib/types'
import AppShell from '@/components/AppShell'
import StatusBadge, { statusLabel } from '@/components/StatusBadge'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { buttonClass } from '@/components/ui/buttonStyles'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'

type Sort = 'recent' | 'submissions' | 'url'

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const PAGE_SIZE = 25

/**
 * The filter tabs. Each one covers one or more job statuses, so "Pending" means anything
 * still on its way and "Not indexed" means Google has said no (or we gave up).
 */
const GROUPS = [
  { key: 'all', label: 'All', hint: 'Every URL', statuses: [] as string[] },
  { key: 'indexed', label: 'Indexed', hint: 'Confirmed indexed by Google', statuses: ['INDEXED'] },
  {
    key: 'pending',
    label: 'Pending',
    hint: 'Queued, sent to Google or waiting for it, including retries',
    statuses: ['PENDING', 'QUEUED', 'WRAPPER_CREATED', 'API_CALLED', 'WAITING_CRAWL', 'RETRYING'],
  },
  {
    key: 'not_indexed',
    label: 'Not indexed',
    hint: 'Failed, or crawled by Google but not indexed',
    statuses: ['CRAWLED_NOT_INDEXED', 'FAILED'],
  },
] as const

type GroupKey = (typeof GROUPS)[number]['key']

const COLUMNS = 'md:grid-cols-[minmax(0,2.6fr)_minmax(0,1.5fr)_5.5rem_8rem_7.5rem_6.5rem]'

function Times({ n }: { n: number }) {
  return <span className="tabular-nums">{n}×</span>
}

export default function UrlsPage() {
  const toast = useToast()
  const { user } = useCurrentUser()

  const [rows, setRows] = useState<UrlRow[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 })
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState<GroupKey>('all')
  const [sort, setSort] = useState<Sort>('recent')
  const [page, setPage] = useState(1)

  // only the newest request may update the page
  const requestId = useRef(0)

  const query = useCallback(
    (p: number, limit = PAGE_SIZE) => {
      const params = new URLSearchParams({ page: String(p), limit: String(limit), sort })
      if (search) params.set('search', search)
      const statuses = GROUPS.find((g) => g.key === group)!.statuses
      if (statuses.length) params.set('status', statuses.join(','))
      return params
    },
    [search, group, sort]
  )

  const load = useCallback(
    async (quiet = false) => {
      const id = ++requestId.current
      if (!quiet) setLoading(true)
      try {
        const data = await apiFetch(`/api/urls/all?${query(page)}`)
        if (id !== requestId.current) return
        setRows(data.urls)
        setPagination(data.pagination)
        setCounts(data.counts)
        setError('')
      } catch (err) {
        if (id === requestId.current) setError(err instanceof Error ? err.message : 'Failed to load your URLs')
      } finally {
        if (id === requestId.current) setLoading(false)
      }
    },
    [page, query]
  )

  useEffect(() => {
    if (!localStorage.getItem('token')) return
    load()
  }, [load])

  // search as you type, without a request per keystroke
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(id)
  }, [searchInput])

  function chooseGroup(next: GroupKey) {
    setGroup(next)
    setPage(1)
  }

  async function exportCsv() {
    setExporting(true)
    try {
      const all: UrlRow[] = []
      for (let p = 1; ; p++) {
        const data = await apiFetch(`/api/urls/all?${query(p, 100)}`)
        all.push(...(data.urls as UrlRow[]))
        if (p >= data.pagination.totalPages) break
      }
      const csv = toCsv(
        ['URL', 'Domain', 'Status', 'Times submitted', 'Sent to Google', 'Failed API calls', 'Status checks', 'First submitted', 'Last submitted', 'Last checked', 'Indexed at'],
        all.map((r) => [r.url, r.domain, statusLabel(r.status), r.submissions, r.googleSubmissions, r.failedCalls, r.checks, r.firstSubmittedAt, r.lastSubmittedAt, r.lastCheckedAt, r.indexedAt])
      )
      // the file name says what it holds: indexmenow-urls-not-indexed-search-2026-10-30.csv
      const parts = ['indexmenow-urls']
      if (group !== 'all') parts.push(group.replace(/_/g, '-'))
      if (search) parts.push('search')
      parts.push(new Date().toISOString().slice(0, 10))
      downloadCsv(`${parts.join('-')}.csv`, csv)
      toast({
        tone: 'success',
        title: `Exported ${all.length} URL${all.length === 1 ? '' : 's'}`,
        description: filterSummary ? `Only ${filterSummary}` : 'All your URLs',
      })
    } catch (err) {
      toast({ tone: 'error', title: "Couldn't export", description: err instanceof Error ? err.message : undefined })
    } finally {
      setExporting(false)
    }
  }

  const groupCount = (g: (typeof GROUPS)[number]): number =>
    g.statuses.length === 0
      ? Object.values(counts).reduce((a, b) => a + b, 0)
      : g.statuses.reduce((sum, s) => sum + (counts[s] ?? 0), 0)
  const totalUrls = groupCount(GROUPS[0])
  const activeGroup = GROUPS.find((g) => g.key === group)!
  const filtered = search !== '' || group !== 'all'
  // e.g. `Not indexed URLs matching “blog”`, shown on the export button and in its toast
  const filterSummary = [group !== 'all' ? `${activeGroup.label} URLs` : '', search ? `matching “${search}”` : '']
    .filter(Boolean)
    .join(' ')
  const from = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const to = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <AppShell user={user}>
      <PageHeader
        title="All URLs"
        description="Every URL you have submitted, where it stands now, and how many times it has been tried."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={exportCsv}
              loading={exporting}
              disabled={pagination.total === 0 || loading}
              title={filterSummary ? `Exports only ${filterSummary}` : 'Exports all your URLs'}
              leftIcon={<Download className="h-4 w-4" />}
            >
              {filtered ? `Export ${pagination.total} filtered` : 'Export CSV'}
            </Button>
            <Link href="/dashboard" className={buttonClass()}>
              <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" /> Submit URLs
            </Link>
          </>
        }
      />

      {error && <Alert tone="error" title="We couldn't load your URLs" className="mb-6">{error}</Alert>}

      <Card>
        {/* toolbar */}
        <div className="space-y-4 border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search URLs"
                aria-label="Search URLs"
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm shadow-sm placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-500">
              <span className="whitespace-nowrap">Sort by</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as Sort)
                  setPage(1)
                }}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-sm hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
              >
                <option value="recent">Most recent</option>
                <option value="submissions">Most submitted</option>
                <option value="url">URL (A–Z)</option>
              </select>
            </label>
            <Button variant="ghost" onClick={() => load(true)} aria-label="Refresh" leftIcon={<RefreshCw className="h-4 w-4" />} className="hidden sm:inline-flex">
              Refresh
            </Button>
          </div>

          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5" role="tablist" aria-label="Filter by status">
            {GROUPS.map((g) => {
              const active = group === g.key
              return (
                <button
                  key={g.key}
                  role="tab"
                  aria-selected={active}
                  title={g.hint}
                  onClick={() => chooseGroup(g.key)}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                    active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {g.label}
                  <span className={cn('rounded-full px-1.5 text-[11px] tabular-nums', active ? 'bg-white/20' : 'bg-slate-100 text-slate-500')}>{groupCount(g)}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* column headers (wide screens) */}
        <div className={cn('hidden gap-4 border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500 md:grid', COLUMNS)}>
          <span>URL</span>
          <span>Status</span>
          <span title="How many times you submitted this URL">Submitted</span>
          <span title="Requests that reached Google, including re-sends. Failed API calls are listed underneath.">Sent to Google</span>
          <span>Last check</span>
          <span className="text-right">Last submitted</span>
        </div>

        {/* rows */}
        {loading ? (
          <div className="divide-y divide-slate-100" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={cn('grid gap-x-4 gap-y-2 px-5 py-4', COLUMNS)}>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="hidden h-4 w-8 md:block" />
                <Skeleton className="hidden h-4 w-12 md:block" />
                <Skeleton className="hidden h-4 w-16 md:block" />
                <Skeleton className="hidden h-4 w-14 justify-self-end md:block" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          filtered ? (
            <EmptyState
              icon={<SearchX className="h-6 w-6" />}
              title="No URLs match"
              description="Try a different search or status."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchInput('')
                    chooseGroup('all')
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<Inbox className="h-6 w-6" />}
              title="No URLs yet"
              description="Scan and submit URLs from the dashboard and every one of them will be listed here."
              action={
                <Link href="/dashboard" className={buttonClass()}>
                  Submit URLs
                </Link>
              }
            />
          )
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((r) => (
              <li key={r.url} className={cn('grid gap-x-4 gap-y-2.5 px-5 py-4 transition-colors hover:bg-slate-50/70', COLUMNS)}>
                <div className="min-w-0">
                  <Link href={`/jobs/${r.jobId}`} className="block truncate text-sm font-medium text-slate-900 hover:text-brand-700" title={r.url}>
                    {r.url.replace(/^https?:\/\//, '')}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{r.domain}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:block">
                  <StatusBadge status={r.status} />
                </div>

                {/* the three counters: labelled inline on small screens, plain columns on wide ones */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm md:contents">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 md:hidden">Submitted</span>
                    {r.submissions > 1 ? (
                      <Badge tone="warning" className="tabular-nums" >
                        <span title={`Submitted ${r.submissions} times since ${formatDateTime(r.firstSubmittedAt)}`}>
                          <Times n={r.submissions} />
                        </span>
                      </Badge>
                    ) : (
                      <span className="font-medium text-slate-700" title={`Submitted once, ${formatDateTime(r.firstSubmittedAt)}`}>
                        <Times n={r.submissions} />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 md:hidden">Sent to Google</span>
                      <span className={cn('font-medium', r.googleSubmissions === 0 ? 'text-slate-400' : 'text-slate-700')}>
                        <Times n={r.googleSubmissions} />
                      </span>
                    </div>
                    {r.failedCalls > 0 && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-red-600" title="Indexing API calls that failed and were retried">
                        <TriangleAlert className="h-3 w-3 shrink-0" aria-hidden="true" />
                        {r.failedCalls} failed call{r.failedCalls === 1 ? '' : 's'}
                      </p>
                    )}
                  </div>

                  <div className="text-[13px] text-slate-500">
                    <span className="text-xs text-slate-400 md:hidden">Last check </span>
                    {r.lastCheckedAt ? (
                      <>
                        <time dateTime={r.lastCheckedAt} title={formatDateTime(r.lastCheckedAt)}>
                          {timeAgo(r.lastCheckedAt)}
                        </time>
                        <span className="text-slate-400"> · {r.checks}×</span>
                      </>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                </div>

                <time dateTime={r.lastSubmittedAt} title={formatDateTime(r.lastSubmittedAt)} className="text-[13px] text-slate-500 md:text-right">
                  {timeAgo(r.lastSubmittedAt)}
                </time>
              </li>
            ))}
          </ul>
        )}

        {/* pagination */}
        {!loading && pagination.total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 text-sm">
            <span className="text-slate-500">
              <span className="tabular-nums">
                {from}–{to}
              </span>{' '}
              of <span className="tabular-nums">{pagination.total}</span> URL{pagination.total === 1 ? '' : 's'}
            </span>
            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} leftIcon={<ChevronLeft className="h-4 w-4" />}>
                  Previous
                </Button>
                <span className="px-1 text-slate-500 tabular-nums">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button variant="secondary" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} rightIcon={<ChevronRight className="h-4 w-4" />}>
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      <p className="mt-4 text-[13px] leading-relaxed text-slate-500">
        <strong className="font-medium text-slate-600">Submitted</strong> is how many times you added the URL (a failed URL can be submitted again).{' '}
        <strong className="font-medium text-slate-600">Sent to Google</strong> counts the requests that reached Google, including re-sends when a page was crawled but not indexed.
      </p>
    </AppShell>
  )
}
