import type { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'
import { ContentSection, CtaBand, PageHero, PageShell } from '@/components/marketing/PageShell'
import { RichText } from '@/components/marketing/RichText'
import { API_BASE } from '@/lib/api'
import { pageMetadata } from '@/lib/seo'
import { SITE_NAME, absoluteUrl } from '@/lib/site'

export const metadata: Metadata = pageMetadata({
  title: 'URL indexing API: scan, submit and track URLs with an API key',
  description:
    'Use the IndexMeNow API to scan URLs for indexing problems, submit them to Google and track each one until Search Console confirms it. Endpoints, authentication, examples and job statuses.',
  path: '/docs/api',
})

const ENDPOINTS = [
  ['POST', '`/api/urls/preflight`', 'Scan up to 100 URLs for indexing blockers. Streams progress as Server-Sent Events.'],
  ['POST', '`/api/urls/submit`', 'Submit one URL.'],
  ['POST', '`/api/urls/submit/bulk`', 'Submit up to 50 URLs. Streams one result per URL as Server-Sent Events.'],
  ['GET', '`/api/urls/jobs`', 'List your jobs. Filter with `?status=INDEXED`; paginate with `page` and `limit`.'],
  ['GET', '`/api/urls/status/:jobId`', 'Get one job and its latest Search Console check.'],
  ['POST', '`/api/urls/status/:jobId/refresh`', 'Run a live Search Console check for one job now.'],
]

const STATUSES = [
  ['PENDING', 'The job was created and is about to be queued.'],
  ['QUEUED', 'Waiting in the queue for its turn.'],
  ['WRAPPER_CREATED', 'Prepared and about to be sent to Google.'],
  ['WAITING_CRAWL', 'Sent to Google. Waiting for it to crawl and index the page.'],
  ['CRAWLED_NOT_INDEXED', 'Google crawled the page but has not indexed it (yet).'],
  ['RETRYING', 'Being submitted again.'],
  ['INDEXED', 'Search Console confirms the page is indexed. The credit is used.'],
  ['FAILED', 'Not indexed after the retries, or rejected. The credit is refunded.'],
]

const ERRORS = [
  ['400', 'The request was invalid or cannot be accepted: a missing `url`, no credits left, the daily limit reached, or no Search Console access (`code: "NO_SEARCH_CONSOLE"`).'],
  ['401', 'The API key is missing or wrong.'],
  ['422', 'The pre-flight scan found a blocker such as a 404 or a noindex tag (`code: "PREFLIGHT_BLOCKED"`). The `issues` list says what.'],
  ['429', 'Too many requests. Wait and try again.'],
]

function Code({ children, label }: { children: string; label?: string }) {
  return (
    <figure>
      {label && <figcaption className="mb-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">{label}</figcaption>}
      <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-[13px] leading-relaxed text-slate-100">
        <code>{children}</code>
      </pre>
    </figure>
  )
}

function Table({ headers, rows, mono = 0 }: { headers: string[]; rows: string[][]; mono?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            {headers.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.join('|')}>
              {row.map((cell, i) => (
                <td key={i} className={`px-4 py-3 align-top ${i === mono ? 'whitespace-nowrap font-mono text-[13px] font-medium text-slate-900' : ''}`}>
                  <RichText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ApiDocsPage() {
  const path = '/docs/api'
  return (
    <PageShell
      path={path}
      crumbs={[{ name: 'API documentation', path }]}
      width="max-w-4xl"
    >
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: `${SITE_NAME} API documentation`,
          url: absoluteUrl(path),
          description: metadata.description,
          inLanguage: 'en',
        }}
      />
      <PageHero
        eyebrow="API"
        title="Scan, submit and track URLs from your own tools"
        intro="The API does everything the dashboard does, with the same checks and the same credit rules. Every account has an API key on its profile page."
      />

      <ContentSection title="Authentication">
        <p>
          Send your API key in the <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em]">x-api-key</code> header. Keep it secret: anyone who has it can use your credits. You can generate a new key from your profile at any time.
        </p>
        <Code label="Base URL">{API_BASE}</Code>
      </ContentSection>

      <ContentSection title="Endpoints">
        <Table headers={['Method', 'Path', 'What it does']} rows={ENDPOINTS} />
      </ContentSection>

      <ContentSection title="Submit a URL">
        <Code label="Request">{`curl -X POST ${API_BASE}/api/urls/submit \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com/blog/my-post"}'`}</Code>
        <Code label="Response (201)">{`{
  "success": true,
  "jobId": "6540f3c2a1b2c3d4e5f60718",
  "status": "QUEUED",
  "message": "URL submitted. Indexing started."
}`}</Code>
        <p>
          If Search Console already shows the page as indexed, the response is <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em]">200</code> with <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em]">alreadyIndexed: true</code> and no credit is charged.
        </p>
      </ContentSection>

      <ContentSection title="Check a job">
        <Code label="Request">{`curl ${API_BASE}/api/urls/status/6540f3c2a1b2c3d4e5f60718 \\
  -H "x-api-key: YOUR_API_KEY"`}</Code>
        <Code label="Response">{`{
  "success": true,
  "job": {
    "id": "6540f3c2a1b2c3d4e5f60718",
    "originalUrl": "https://example.com/blog/my-post",
    "status": "WAITING_CRAWL",
    "retryCount": 0,
    "latestCheck": { "status": "NOT_FOUND", "source": "GSC_API" }
  }
}`}</Code>
        <p>Poll this endpoint, or the job list, until the status is <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em]">INDEXED</code> or <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em]">FAILED</code>. Checks run on a schedule, so polling more than every few minutes brings nothing new.</p>
      </ContentSection>

      <ContentSection title="Bulk submit and scan">
        <p>
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em]">/api/urls/preflight</code> and <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em]">/api/urls/submit/bulk</code> take a JSON body with a <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em]">urls</code> array and answer with a Server-Sent Events stream: a <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em]">start</code> event, one <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em]">result</code> event per URL as soon as it is ready, and a final <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em]">done</code> event with the totals. Read the stream with <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em]">fetch</code>, not <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em]">EventSource</code>, because you need to send a POST body and a header.
        </p>
      </ContentSection>

      <ContentSection title="Job statuses">
        <Table headers={['Status', 'Meaning']} rows={STATUSES} />
      </ContentSection>

      <ContentSection title="Errors">
        <Table headers={['HTTP status', 'Meaning']} rows={ERRORS} />
        <p>Every error response has <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em]">success: false</code> and a human-readable <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em]">message</code>.</p>
      </ContentSection>

      <CtaBand title="Get your API key" body="Create an account, then open your profile to copy your key. Every account starts with 5 free credits." />
    </PageShell>
  )
}
