'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  RotateCcw,
  ScanSearch,
  Send,
  XCircle,
} from 'lucide-react'
import { apiFetch, apiStream } from '@/lib/api'
import { cn } from '@/lib/cn'
import { formatDuration } from '@/lib/format'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

// ─── API shapes ────────────────────────────────────────────────────────

type Severity = 'blocker' | 'warning' | 'info'
type Verdict = 'ok' | 'warn' | 'blocked'

interface Issue {
  code: string
  severity: Severity
  message: string
}

interface ScanResult {
  url: string
  verdict: Verdict
  status: number | null
  finalUrl: string | null
  redirects: number
  title: string | null
  structuredData: string[]
  ms: number
  issues: Issue[]
}

type ScanEvent =
  | { type: 'start'; total: number; duplicates: number; urls: string[] }
  | { type: 'result'; index: number; done: number; total: number; result: ScanResult }
  | { type: 'done'; total: number; ok: number; warn: number; blocked: number; elapsedMs: number }
  | { type: 'error'; message: string }

type SubmitEvent =
  | { type: 'start'; total: number }
  | { type: 'result'; index: number; done: number; total: number; url: string; success: boolean; message: string; alreadyIndexed?: boolean; code?: string }
  | { type: 'done'; total: number; submitted: number; alreadyIndexed: number; failed: number; elapsedMs: number }
  | { type: 'error'; message: string }

type SitemapEvent =
  | { type: 'start' }
  | { type: 'progress'; filesRead: number; filesTotal: number; found: number }
  | { type: 'done'; urls: string[]; found: number; truncated: boolean; sitemaps: number; hosts: Record<string, number> }
  | { type: 'error'; message: string }

interface Row {
  url: string
  scan?: ScanResult
  selected: boolean
  submit?: { success: boolean; message: string; alreadyIndexed?: boolean }
}

type Phase = 'idle' | 'scanning' | 'scanned' | 'submitting' | 'submitted'

// keep in step with the backend limits (PREFLIGHT_MAX_URLS per request, bulk submit max, sitemap import max)
const SCAN_REQUEST_SIZE = 100
const MAX_SCAN_TOTAL = 500
const SUBMIT_REQUEST_SIZE = 50

// ─── helpers ───────────────────────────────────────────────────────────

/** Split pasted text into unique, valid http(s) URLs; report what was dropped. */
function parseInput(text: string) {
  const seen = new Set<string>()
  const valid: string[] = []
  const invalid: string[] = []
  let duplicates = 0
  for (const token of text.split(/[\s,]+/).filter(Boolean)) {
    let key: string
    try {
      const u = new URL(token)
      if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('scheme')
      u.hash = ''
      key = u.href.replace(/\/$/, '')
    } catch {
      invalid.push(token)
      continue
    }
    if (seen.has(key)) {
      duplicates++
      continue
    }
    seen.add(key)
    valid.push(token)
  }
  return { valid, invalid, duplicates }
}

const looksLikeSitemap = (url: string): boolean => {
  try {
    const path = new URL(url).pathname.toLowerCase()
    return /sitemap/.test(path) || /\.xml(\.gz)?$/.test(path)
  } catch {
    return false
  }
}

const ISSUE_STYLE: Record<Severity, { Icon: typeof XCircle; cls: string }> = {
  blocker: { Icon: XCircle, cls: 'text-red-700' },
  warning: { Icon: AlertTriangle, cls: 'text-amber-700' },
  info: { Icon: CheckCircle2, cls: 'text-slate-500' },
}

function HttpChip({ status }: { status: number | null }) {
  if (status === null) return <span className="text-slate-300">—</span>
  const cls = status < 300 ? 'text-emerald-700 bg-emerald-50' : status < 400 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'
  return <span className={cn('rounded-md px-1.5 py-0.5 font-mono text-xs font-medium tabular-nums', cls)}>{status}</span>
}

// ─── progress ──────────────────────────────────────────────────────────

function Progress({
  label,
  done,
  total,
  elapsedMs,
  children,
}: {
  label: string
  done: number
  total: number
  elapsedMs: number
  children?: React.ReactNode
}) {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
  const rate = elapsedMs > 0 && done > 0 ? done / (elapsedMs / 1000) : 0
  const etaMs = rate > 0 ? ((total - done) / rate) * 1000 : null
  return (
    <div aria-live="polite">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Loader2 className="h-4 w-4 animate-spin text-brand-600" aria-hidden="true" />
            {label} URLs
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
            {done}
            <span className="text-xl font-medium text-slate-400"> / {total}</span>
          </p>
        </div>
        <div className="text-right text-xs tabular-nums text-slate-500">
          <p className="text-2xl font-semibold text-brand-600">{pct}%</p>
          <p className="mt-1">
            {rate > 0 && `${rate.toFixed(1)} URLs/s`}
            {etaMs !== null && done < total && ` · ~${formatDuration(etaMs)} left`}
            {rate === 0 && 'starting…'}
          </p>
        </div>
      </div>
      <div
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80"
      >
        <div
          className="progress-stripes h-full animate-stripes rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-[width] duration-300 ease-out"
          style={{ width: `${Math.max(pct, done > 0 ? 2 : 0)}%` }}
        />
      </div>
      {children}
    </div>
  )
}

// ─── component ─────────────────────────────────────────────────────────

export default function UrlScanner({ availableCredits, onSubmitted }: { availableCredits: number; onSubmitted: () => void }) {
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [rows, setRows] = useState<Row[]>([])
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [duplicatesDropped, setDuplicatesDropped] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [clock, setClock] = useState({ start: 0, now: 0 })
  const [sitemapUrl, setSitemapUrl] = useState('')
  const [sitemapOpen, setSitemapOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState<{ filesRead: number; filesTotal: number; found: number } | null>(null)
  const [importNote, setImportNote] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const busy = phase === 'scanning' || phase === 'submitting'
  const inputStage = rows.length === 0 || phase === 'idle'
  const parsed = useMemo(() => parseInput(text), [text])
  const overLimit = parsed.valid.length > MAX_SCAN_TOTAL
  const sitemapLike = useMemo(() => parsed.valid.find(looksLikeSitemap), [parsed.valid])

  // tick while working so elapsed time / ETA keep moving between server events
  useEffect(() => {
    if (!busy) return
    const id = setInterval(() => setClock((c) => ({ ...c, now: Date.now() })), 200)
    return () => clearInterval(id)
  }, [busy])

  // leaving the page cancels an in-flight scan
  useEffect(() => () => abortRef.current?.abort(), [])

  const elapsedMs = clock.now - clock.start

  const counts = useMemo(() => {
    const c = { ok: 0, warn: 0, blocked: 0, pending: 0 }
    for (const r of rows) {
      if (r.scan) c[r.scan.verdict]++
      else c.pending++
    }
    return c
  }, [rows])

  const selectable = (r: Row) => !!r.scan && r.scan.verdict !== 'blocked' && !r.submit?.success
  const selectedUrls = rows.filter((r) => r.selected && selectable(r)).map((r) => r.url)
  const lacksCredits = selectedUrls.length > availableCredits

  function begin(nextPhase: Phase, total: number) {
    const now = Date.now()
    setClock({ start: now, now })
    setProgress({ done: 0, total })
    setPhase(nextPhase)
  }

  // ─── sitemap import ──────────────────────────────────────────────────

  /** Replace the box with the page URLs listed in a sitemap, showing how far the import has got. */
  async function importSitemap(url: string) {
    setImporting(true)
    setImportNote(null)
    setImportProgress({ filesRead: 0, filesTotal: 1, found: 0 })
    const controller = new AbortController()
    abortRef.current = controller
    let finished = false
    try {
      await apiStream<SitemapEvent>(
        '/api/urls/sitemap',
        { url },
        (event) => {
          if (event.type === 'progress') {
            setImportProgress({ filesRead: event.filesRead, filesTotal: event.filesTotal, found: event.found })
          } else if (event.type === 'done') {
            finished = true
            setText(event.urls.join('\n'))
            setRows([])
            setPhase('idle')
            setError(null)
            setSummary(null)
            setSitemapOpen(false)
            setSitemapUrl('')
            const n = event.urls.length
            const more = event.truncated ? ` The sitemap has more; the first ${n} were loaded.` : ''
            const sites = Object.keys(event.hosts).join(', ')
            setImportNote({ tone: 'success', text: `Loaded ${n} URL${n === 1 ? '' : 's'} from the sitemap${sites ? ` (${sites})` : ''}.${more}` })
          } else if (event.type === 'error') {
            finished = true
            setImportNote({ tone: 'error', text: event.message })
          }
        },
        controller.signal
      )
      if (!finished && !controller.signal.aborted) setImportNote({ tone: 'error', text: 'The sitemap import ended unexpectedly. Try again.' })
    } catch (err) {
      if (!controller.signal.aborted) setImportNote({ tone: 'error', text: err instanceof Error ? err.message : 'Could not read the sitemap' })
    } finally {
      setImporting(false)
      setImportProgress(null)
    }
  }

  // ─── scan ────────────────────────────────────────────────────────────

  async function handleScan() {
    const urls = parsed.valid.slice(0, MAX_SCAN_TOTAL)
    if (urls.length === 0 || busy) return
    setError(null)
    setSummary(null)
    setImportNote(null)
    setRows(urls.map((url) => ({ url, selected: false })))
    setDuplicatesDropped(parsed.duplicates)
    begin('scanning', urls.length)

    const controller = new AbortController()
    abortRef.current = controller
    let completed = 0
    try {
      // one request per 100 URLs; the server streams each result back as soon as it is ready
      for (let offset = 0; offset < urls.length; offset += SCAN_REQUEST_SIZE) {
        const chunk = urls.slice(offset, offset + SCAN_REQUEST_SIZE)
        const before = completed
        await apiStream<ScanEvent>(
          '/api/urls/preflight',
          { urls: chunk },
          (event) => {
            if (event.type === 'result') {
              completed = before + event.done
              setProgress({ done: completed, total: urls.length })
              setRows((prev) =>
                prev.map((r) => (r.url === event.result.url ? { ...r, scan: event.result, selected: event.result.verdict === 'ok' } : r))
              )
            } else if (event.type === 'error') {
              setError(event.message)
            }
          },
          controller.signal
        )
        completed = Math.max(completed, before + chunk.length)
      }
      setPhase('scanned')
    } catch (err) {
      if (controller.signal.aborted) setPhase('scanned')
      else {
        setError(err instanceof Error ? err.message : 'Scan failed')
        setPhase(completed > 0 ? 'scanned' : 'idle')
        if (completed === 0) setRows([])
      }
    } finally {
      setClock((c) => ({ ...c, now: Date.now() }))
    }
  }

  // ─── submit ──────────────────────────────────────────────────────────

  async function handleSubmit() {
    const urls = selectedUrls
    if (urls.length === 0 || busy) return
    setError(null)
    setSummary(null)
    begin('submitting', urls.length)

    const controller = new AbortController()
    abortRef.current = controller
    const totals = { submitted: 0, alreadyIndexed: 0, failed: 0 }
    try {
      for (let offset = 0; offset < urls.length; offset += SUBMIT_REQUEST_SIZE) {
        const batch = urls.slice(offset, offset + SUBMIT_REQUEST_SIZE)
        await apiStream<SubmitEvent>(
          '/api/urls/submit/bulk',
          { urls: batch },
          (event) => {
            if (event.type === 'result') {
              setProgress({ done: offset + event.done, total: urls.length })
              setRows((prev) =>
                prev.map((r) =>
                  r.url === event.url
                    ? { ...r, selected: false, submit: { success: event.success, message: event.message, alreadyIndexed: event.alreadyIndexed } }
                    : r
                )
              )
            } else if (event.type === 'done') {
              totals.submitted += event.submitted
              totals.alreadyIndexed += event.alreadyIndexed
              totals.failed += event.failed
            } else if (event.type === 'error') {
              setError(event.message)
            }
          },
          controller.signal
        )
      }
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Submit failed')
    } finally {
      setSummary(
        `Queued ${totals.submitted}` +
          (totals.alreadyIndexed ? ` · already indexed ${totals.alreadyIndexed}` : '') +
          (totals.failed ? ` · not submitted ${totals.failed}` : '')
      )
      setPhase('submitted')
      onSubmitted()
    }
  }

  // ─── selection / reset ───────────────────────────────────────────────

  function selectWhere(pick: (r: Row) => boolean) {
    setRows((prev) => prev.map((r) => ({ ...r, selected: selectable(r) && pick(r) })))
  }

  function reset() {
    abortRef.current?.abort()
    setRows([])
    setText('')
    setPhase('idle')
    setError(null)
    setSummary(null)
    setImportNote(null)
  }

  // ─── render ──────────────────────────────────────────────────────────

  return (
    <Card>
      <CardHeader
        icon={<ScanSearch className="h-[18px] w-[18px]" />}
        title="Submit URLs for indexing"
        description="Every page is checked first — status, noindex, robots.txt, redirects, canonical — and only pages Google can index are sent."
        action={
          !inputStage && !busy ? (
            <Button variant="ghost" size="sm" onClick={reset} leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>
              New batch
            </Button>
          ) : undefined
        }
      />
      <CardBody className="space-y-5">
        {/* ── input ── */}
        {inputStage && (
          <div className="space-y-3">
            <div>
              <label htmlFor="urls" className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-700">
                <span>URLs</span>
                <button
                  type="button"
                  onClick={() => setSitemapOpen((o) => !o)}
                  className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[13px] font-medium text-brand-600 hover:bg-brand-50"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  Import from a sitemap
                </button>
              </label>

              {sitemapOpen && (
                <form
                  className="mb-3 flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (sitemapUrl.trim()) importSitemap(sitemapUrl.trim())
                  }}
                >
                  <input
                    value={sitemapUrl}
                    onChange={(e) => setSitemapUrl(e.target.value)}
                    placeholder="https://example.com/sitemap.xml"
                    aria-label="Sitemap URL"
                    className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
                  />
                  <Button type="submit" loading={importing} disabled={!sitemapUrl.trim()}>
                    Load URLs
                  </Button>
                </form>
              )}

              <textarea
                id="urls"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                spellCheck={false}
                placeholder={'https://example.com/blog/first-post\nhttps://example.com/blog/second-post\nhttps://example.com/pricing'}
                className="block w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-3 font-mono text-[13px] leading-6 text-slate-900 shadow-sm placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
              />
            </div>

            {importing && importProgress && (
              <div className="rounded-xl border border-brand-100 bg-gradient-to-b from-brand-50/70 to-white p-4" aria-live="polite">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Loader2 className="h-4 w-4 animate-spin text-brand-600" aria-hidden="true" />
                      Reading sitemap…
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
                      {importProgress.found.toLocaleString()}
                      <span className="text-base font-medium text-slate-400"> URL{importProgress.found === 1 ? '' : 's'} found</span>
                    </p>
                  </div>
                  <div className="text-right text-xs tabular-nums text-slate-500">
                    <p>
                      file {Math.min(importProgress.filesRead + 1, importProgress.filesTotal)} of {importProgress.filesTotal}
                    </p>
                    <button type="button" onClick={() => abortRef.current?.abort()} className="mt-1 font-medium text-slate-600 underline-offset-2 hover:underline">
                      Cancel
                    </button>
                  </div>
                </div>
                <div
                  role="progressbar"
                  aria-label="Sitemap import progress"
                  aria-valuemin={0}
                  aria-valuemax={importProgress.filesTotal}
                  aria-valuenow={importProgress.filesRead}
                  className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200/80"
                >
                  <div
                    className="progress-stripes h-full animate-stripes rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-[width] duration-300 ease-out"
                    style={{ width: `${Math.max(8, Math.round((importProgress.filesRead / importProgress.filesTotal) * 100))}%` }}
                  />
                </div>
              </div>
            )}

            {importNote && <Alert tone={importNote.tone} onClose={() => setImportNote(null)}>{importNote.text}</Alert>}

            {sitemapLike && !importing && (
              <Alert tone="info" title="That looks like a sitemap">
                <p>A sitemap is a list of pages, not a page, so there is nothing to index at that address.</p>
                <button
                  type="button"
                  onClick={() => importSitemap(sitemapLike)}
                  className="mt-1.5 inline-flex items-center gap-1 font-medium text-sky-700 underline-offset-2 hover:underline"
                >
                  Load the pages it lists <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </Alert>
            )}

            {error && <Alert tone="error">{error}</Alert>}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-slate-500" aria-live="polite">
                <span className="font-medium tabular-nums text-slate-700">{parsed.valid.length}</span> URL{parsed.valid.length === 1 ? '' : 's'}
                {parsed.duplicates > 0 && ` · ${parsed.duplicates} duplicate${parsed.duplicates === 1 ? '' : 's'} ignored`}
                {parsed.invalid.length > 0 && (
                  <span className="text-red-600"> · {parsed.invalid.length} invalid (must start with http:// or https://)</span>
                )}
                {overLimit && <span className="text-amber-700"> · only the first {MAX_SCAN_TOTAL} are scanned per batch</span>}
              </p>
              <Button onClick={handleScan} disabled={parsed.valid.length === 0 || busy} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Scan {parsed.valid.length > 0 ? Math.min(parsed.valid.length, MAX_SCAN_TOTAL) : ''} URL{parsed.valid.length === 1 ? '' : 's'}
              </Button>
            </div>
          </div>
        )}

        {/* ── progress ── */}
        {busy && (
          <div className="rounded-xl border border-brand-100 bg-gradient-to-b from-brand-50/70 to-white p-5">
            <Progress label={phase === 'scanning' ? 'Scanning' : 'Submitting'} done={progress.done} total={progress.total} elapsedMs={elapsedMs}>
              {phase === 'scanning' && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="success">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> {counts.ok} ready
                    </Badge>
                    <Badge tone="warning">
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" /> {counts.warn} to check
                    </Badge>
                    <Badge tone="danger">
                      <XCircle className="h-3 w-3" aria-hidden="true" /> {counts.blocked} blocked
                    </Badge>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => abortRef.current?.abort()}>
                    Cancel
                  </Button>
                </div>
              )}
            </Progress>
          </div>
        )}

        {/* ── summary ── */}
        {!inputStage && !busy && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> {counts.ok} ready
              </Badge>
              <Badge tone="warning">
                <AlertTriangle className="h-3 w-3" aria-hidden="true" /> {counts.warn} to check
              </Badge>
              <Badge tone="danger">
                <XCircle className="h-3 w-3" aria-hidden="true" /> {counts.blocked} blocked
              </Badge>
              {counts.pending > 0 && <Badge>{counts.pending} not scanned</Badge>}
              <span className="text-xs text-slate-500">
                {formatDuration(elapsedMs)}
                {duplicatesDropped > 0 && ` · ${duplicatesDropped} duplicate${duplicatesDropped === 1 ? '' : 's'} removed`}
              </span>
            </div>
            {phase === 'scanned' && (
              <div className="flex items-center gap-1 text-[13px]">
                <button onClick={() => selectWhere((r) => r.scan!.verdict === 'ok')} className="rounded-md px-2 py-1 font-medium text-brand-600 hover:bg-brand-50">
                  Select ready
                </button>
                <button onClick={() => selectWhere(() => true)} className="rounded-md px-2 py-1 font-medium text-brand-600 hover:bg-brand-50">
                  Ready + to check
                </button>
                <button onClick={() => selectWhere(() => false)} className="rounded-md px-2 py-1 font-medium text-slate-500 hover:bg-slate-100">
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {summary && <Alert tone="success">{summary}</Alert>}
        {!inputStage && error && <Alert tone="error">{error}</Alert>}

        {/* ── results ── */}
        {!inputStage && (
          <div className="-mx-5 overflow-hidden border-y border-slate-200 sm:mx-0 sm:rounded-xl sm:border">
            <div className="max-h-[30rem] overflow-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <tr className="border-b border-slate-200">
                    <th className="w-10 py-2.5 pl-4" />
                    <th className="px-3 py-2.5">URL</th>
                    <th className="px-3 py-2.5">HTTP</th>
                    <th className="px-3 py-2.5">Result</th>
                    <th className="px-3 py-2.5 pr-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => {
                    const scan = row.scan
                    const checked = row.selected && selectable(row)
                    return (
                      <tr key={row.url} className={cn('align-top transition-colors', checked ? 'bg-brand-50/40' : 'hover:bg-slate-50/70')}>
                        <td className="py-3 pl-4">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!selectable(row) || busy}
                            onChange={(e) => setRows((prev) => prev.map((r) => (r.url === row.url ? { ...r, selected: e.target.checked } : r)))}
                            aria-label={`Select ${row.url}`}
                            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 disabled:opacity-40"
                          />
                        </td>
                        <td className="max-w-[18rem] px-3 py-3">
                          <div className="truncate font-medium text-slate-800" title={row.url}>
                            {row.url.replace(/^https?:\/\//, '')}
                          </div>
                          {scan?.title && (
                            <div className="truncate text-xs text-slate-500" title={scan.title}>
                              {scan.title}
                            </div>
                          )}
                          {scan && scan.redirects > 0 && scan.finalUrl && (
                            <div className="truncate text-xs text-slate-500" title={scan.finalUrl}>
                              → {scan.finalUrl.replace(/^https?:\/\//, '')}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3">{scan ? <HttpChip status={scan.status} /> : <Skeleton className="h-5 w-9" />}</td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {row.submit ? (
                            <Badge tone={row.submit.success ? (row.submit.alreadyIndexed ? 'info' : 'success') : 'danger'} dot>
                              {row.submit.success ? (row.submit.alreadyIndexed ? 'Already indexed' : 'Queued') : 'Not submitted'}
                            </Badge>
                          ) : scan ? (
                            <Badge tone={scan.verdict === 'ok' ? 'success' : scan.verdict === 'warn' ? 'warning' : 'danger'} dot>
                              {scan.verdict === 'ok' ? 'Ready' : scan.verdict === 'warn' ? 'To check' : 'Blocked'}
                            </Badge>
                          ) : phase === 'scanning' ? (
                            <Skeleton className="h-6 w-20 rounded-full" />
                          ) : (
                            <Badge>Not scanned</Badge>
                          )}
                        </td>
                        <td className="px-3 py-3 pr-4">
                          {row.submit && <p className={cn('text-xs', row.submit.success ? 'text-slate-600' : 'text-red-700')}>{row.submit.message}</p>}
                          {!row.submit && scan && (
                            <ul className="space-y-1">
                              {scan.issues.length === 0 && <li className="text-xs text-slate-400">No problems found</li>}
                              {scan.issues.map((issue) => {
                                const { Icon, cls } = ISSUE_STYLE[issue.severity]
                                return (
                                  <li key={issue.code} className={cn('flex items-start gap-1.5 text-xs leading-5', cls)}>
                                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                    <span>
                                      {issue.message}
                                      {issue.code === 'SITEMAP_NOT_A_PAGE' && (
                                        <button
                                          type="button"
                                          onClick={() => importSitemap(row.url)}
                                          className="ml-1.5 font-medium text-brand-600 underline-offset-2 hover:underline"
                                        >
                                          Load its pages
                                        </button>
                                      )}
                                    </span>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                          {!row.submit && !scan && <Skeleton className="h-4 w-40" />}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── submit ── */}
        {phase === 'scanned' && rows.some(selectable) && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3.5">
            <p className="text-[13px] leading-5 text-slate-600">
              <span className="font-semibold tabular-nums text-slate-900">{selectedUrls.length}</span> selected ·{' '}
              <span className="tabular-nums">{availableCredits}</span> credit{availableCredits === 1 ? '' : 's'} available. A credit is only used once a URL is confirmed indexed.
              {lacksCredits && <span className="text-amber-700"> Not enough credits for all selected URLs; the rest will be refused.</span>}
            </p>
            <Button onClick={handleSubmit} disabled={selectedUrls.length === 0} leftIcon={<Send className="h-4 w-4" />}>
              Submit {selectedUrls.length} URL{selectedUrls.length === 1 ? '' : 's'} to Google
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
