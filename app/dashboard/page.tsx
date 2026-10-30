'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ChevronLeft, ChevronRight, CircleAlert, Clock, Inbox, Plug, RefreshCw, Zap } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/cn'
import { timeAgo, formatDateTime } from '@/lib/format'
import { useCurrentUser } from '@/lib/hooks'
import type { GoogleAccount, Job } from '@/lib/types'
import AppShell from '@/components/AppShell'
import StatusBadge, { ACTIVE_STATUSES } from '@/components/StatusBadge'
import UrlScanner from '@/components/UrlScanner'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { buttonClass } from '@/components/ui/buttonStyles'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton, SkeletonRows, SkeletonStat } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface Stats {
  total: number
  indexed: number
  failed: number
  active: number
}

const FILTERS = [
  { key: 'All', label: 'All' },
  { key: 'INDEXED', label: 'Indexed' },
  { key: 'QUEUED', label: 'Queued' },
  { key: 'WAITING_CRAWL', label: 'Waiting' },
  { key: 'RETRYING', label: 'Retrying' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'FAILED', label: 'Failed' },
]

const POLL_MS = 20_000

function StatCard({ label, value, hint, icon, tone }: { label: string; value: React.ReactNode; hint: string; icon: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={cn('grid h-8 w-8 place-items-center rounded-lg', tone)}>{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-[13px] text-slate-500">{hint}</p>
    </div>
  )
}

export default function DashboardPage() {
  const toast = useToast()
  const { user, loading: userLoading, error: userError, refresh: refreshUser } = useCurrentUser()

  const [accounts, setAccounts] = useState<GoogleAccount[] | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [stats, setStats] = useState<Stats | null>(null)
  const [filter, setFilter] = useState('All')
  const [jobsLoading, setJobsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({})
  const [connecting, setConnecting] = useState(false)

  const fetchJobs = useCallback(
    async (page = 1, status = filter, quiet = false) => {
      if (!quiet) setJobsLoading(true)
      try {
        const params = new URLSearchParams({ page: String(page), limit: '20' })
        if (status !== 'All') params.set('status', status)
        const data = await apiFetch(`/api/urls/jobs?${params}`)
        setJobs(data.jobs)
        setPagination(data.pagination)
      } catch (err) {
        if (!quiet) toast({ tone: 'error', title: "Couldn't load your jobs", description: err instanceof Error ? err.message : undefined })
      } finally {
        setJobsLoading(false)
      }
    },
    [filter, toast]
  )

  const fetchStats = useCallback(async () => {
    const count = (status?: string) =>
      apiFetch(`/api/urls/jobs?limit=1${status ? `&status=${status}` : ''}`).then((d) => d.pagination.total as number)
    try {
      const [total, indexed, failed] = await Promise.all([count(), count('INDEXED'), count('FAILED')])
      setStats({ total, indexed, failed, active: Math.max(0, total - indexed - failed) })
    } catch {
      /* the stat cards simply keep their previous numbers */
    }
  }, [])

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await apiFetch('/api/oauth/google/accounts')
      setAccounts(data.accounts ?? [])
    } catch {
      setAccounts([])
    }
  }, [])

  // first load
  useEffect(() => {
    if (!localStorage.getItem('token')) return
    fetchJobs(1, 'All')
    fetchStats()
    fetchAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // keep in-progress jobs fresh while the tab is open
  const hasActive = jobs.some((j) => ACTIVE_STATUSES.includes(j.status))
  useEffect(() => {
    if (!hasActive) return
    const id = setInterval(() => {
      if (document.visibilityState !== 'visible') return
      fetchJobs(pagination.page, filter, true)
      fetchStats()
    }, POLL_MS)
    return () => clearInterval(id)
  }, [hasActive, fetchJobs, fetchStats, pagination.page, filter])

  async function afterSubmit() {
    await Promise.all([fetchJobs(1, filter, true), fetchStats(), refreshUser().catch(() => undefined)])
  }

  function changeFilter(next: string) {
    setFilter(next)
    fetchJobs(1, next)
  }

  async function refreshJob(id: string) {
    setRefreshing((prev) => ({ ...prev, [id]: true }))
    try {
      const data = await apiFetch(`/api/urls/status/${id}/refresh`, { method: 'POST' })
      toast({ tone: 'info', title: data.message || 'Status refreshed' })
      fetchJobs(pagination.page, filter, true)
      fetchStats()
    } catch (err) {
      toast({ tone: 'error', title: 'Refresh failed', description: err instanceof Error ? err.message : undefined })
    } finally {
      setRefreshing((prev) => ({ ...prev, [id]: false }))
    }
  }

  async function connectGoogle() {
    setConnecting(true)
    try {
      const data = await apiFetch('/api/oauth/google/connect-url')
      window.location.href = data.url
    } catch (err) {
      setConnecting(false)
      toast({ tone: 'error', title: "Couldn't start Google sign-in", description: err instanceof Error ? err.message : undefined })
    }
  }

  const credits = user ? user.availableCredits ?? user.credits : undefined
  const firstName = user?.firstName

  return (
    <AppShell user={user}>
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : 'Dashboard'}
        description="Scan your pages, send the ones Google can index, and follow them until Search Console confirms."
      />

      {userError && !user && (
        <Alert tone="error" title="We couldn't load your account" className="mb-6">
          {userError}
        </Alert>
      )}

      {/* stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {userLoading && !user ? (
          Array.from({ length: 4 }, (_, i) => <SkeletonStat key={i} />)
        ) : (
          <>
            <StatCard label="Credits" value={credits ?? '—'} hint="Used only when a URL is indexed" icon={<Zap className="h-4 w-4" />} tone="bg-brand-50 text-brand-600" />
            <StatCard label="Indexed" value={stats?.indexed ?? '—'} hint="Confirmed by Search Console" icon={<CheckCircle2 className="h-4 w-4" />} tone="bg-emerald-50 text-emerald-600" />
            <StatCard label="In progress" value={stats?.active ?? '—'} hint="Queued or waiting for Google" icon={<Clock className="h-4 w-4" />} tone="bg-amber-50 text-amber-600" />
            <StatCard label="Failed" value={stats?.failed ?? '—'} hint="Credit refunded" icon={<CircleAlert className="h-4 w-4" />} tone="bg-red-50 text-red-600" />
          </>
        )}
      </div>

      {/* scanner + google */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UrlScanner availableCredits={credits ?? 0} onSubmitted={afterSubmit} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              icon={<Plug className="h-[18px] w-[18px]" />}
              title="Google Search Console"
              description="Used to check whether pages are indexed."
            />
            <CardBody>
              {accounts === null ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-9 w-32" />
                </div>
              ) : accounts.length === 0 ? (
                <div className="space-y-4">
                  <Alert tone="warning" title="Not connected">
                    Connect a Google account so indexing can be verified.
                  </Alert>
                  <Button onClick={connectGoogle} loading={connecting} fullWidth leftIcon={<Plug className="h-4 w-4" />}>
                    Connect Google
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <ul className="space-y-2.5">
                    {accounts.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">{a.googleEmail}</p>
                          <p className="text-xs text-slate-500">
                            {a.propertiesCount ?? a.gscProperties?.length ?? 0} propert{(a.propertiesCount ?? a.gscProperties?.length ?? 0) === 1 ? 'y' : 'ies'}
                          </p>
                        </div>
                        {a.isActive && (
                          <Badge tone="success" dot>
                            Active
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Link href="/settings/google" className={buttonClass({ variant: 'secondary', fullWidth: true })}>
                    Manage accounts
                  </Link>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">How credits work</p>
              <ul className="space-y-2 leading-relaxed">
                <li className="flex gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-700">1</span>
                  A credit is reserved when you submit a URL.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-700">2</span>
                  It is used only once Search Console confirms the page is indexed.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-700">3</span>
                  If it is not indexed after the retries, the credit is refunded.
                </li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* jobs */}
      <Card className="mt-6">
        <CardHeader
          title="Indexing jobs"
          description={jobsLoading && jobs.length === 0 ? 'Loading…' : `${pagination.total} total`}
          action={
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => { fetchJobs(pagination.page, filter, true); fetchStats() }} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                Refresh
              </Button>
              <Link href="/urls" className={buttonClass({ variant: 'secondary', size: 'sm' })}>
                View all URLs
              </Link>
            </div>
          }
        />
        <div className="flex gap-1.5 overflow-x-auto border-b border-slate-100 px-5 py-3 sm:px-6" role="tablist" aria-label="Filter jobs">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => changeFilter(f.key)}
              className={cn(
                'whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                filter === f.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {jobsLoading ? (
          <SkeletonRows rows={5} />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title={filter === 'All' ? 'No jobs yet' : `No ${FILTERS.find((f) => f.key === filter)?.label.toLowerCase()} jobs`}
            description={filter === 'All' ? 'Scan and submit URLs above and they will show up here, with their status updating automatically.' : 'Try another filter.'}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {jobs.map((job) => {
              const active = ACTIVE_STATUSES.includes(job.status)
              return (
                <li key={job._id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 transition-colors hover:bg-slate-50/70 sm:px-6">
                  <div className="min-w-0 flex-1 basis-64">
                    <Link href={`/jobs/${job._id}`} className="block truncate text-sm font-medium text-slate-900 hover:text-brand-700" title={job.originalUrl}>
                      {job.originalUrl.replace(/^https?:\/\//, '')}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">{job.domain}</p>
                  </div>
                  <StatusBadge status={job.status} />
                  <time dateTime={job.createdAt} title={formatDateTime(job.createdAt)} className="w-20 text-right text-[13px] text-slate-500">
                    {timeAgo(job.createdAt)}
                  </time>
                  <div className="flex items-center gap-2">
                    {active && (
                      <Button variant="secondary" size="sm" loading={refreshing[job._id]} onClick={() => refreshJob(job._id)} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                        Check
                      </Button>
                    )}
                    <Link href={`/jobs/${job._id}`} className={buttonClass({ variant: 'ghost', size: 'sm' })}>
                      Details
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 text-sm sm:px-6">
            <span className="text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={pagination.page <= 1} onClick={() => fetchJobs(pagination.page - 1)} leftIcon={<ChevronLeft className="h-4 w-4" />}>
                Previous
              </Button>
              <Button variant="secondary" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchJobs(pagination.page + 1)} rightIcon={<ChevronRight className="h-4 w-4" />}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </AppShell>
  )
}
