"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Check, CircleAlert, ExternalLink, RefreshCw, Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatDateTime, timeAgo } from "@/lib/format";
import { useCurrentUser } from "@/lib/hooks";
import AppShell from "@/components/AppShell";
import StatusBadge, { ACTIVE_STATUSES } from "@/components/StatusBadge";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

interface JobDetail {
  id: string;
  originalUrl: string;
  domain: string;
  status: string;
  retryCount: number;
  credentialSource: string;
  createdAt: string;
  queuedAt?: string;
  apiCalledAt?: string;
  indexedAt?: string;
  failedAt?: string;
  latestCheck?: { checkedAt: string; status: string; source: string } | null;
  errors?: { timestamp: string; message: string; step: string; _id: string }[];
}

const CHECK_LABEL: Record<string, string> = {
  INDEXED: "Indexed",
  CRAWLED_NOT_INDEXED: "Crawled, not indexed yet",
  NOT_FOUND: "Not known to Google yet",
  ERROR: "Could not be checked",
};

const SOURCE_LABEL: Record<string, string> = {
  SERVICE_ACCOUNT: "IndexMeNow service account",
  OAUTH: "Your Google account",
};

type StepState = "done" | "current" | "pending" | "failed";

function Timeline({ job }: { job: JobDetail }) {
  const failed = job.status === "FAILED";
  const indexed = job.status === "INDEXED";
  const steps: { label: string; detail: string; at?: string; state: StepState }[] = [
    { label: "Submitted", detail: "Scanned and accepted, credit reserved", at: job.createdAt, state: "done" },
    {
      label: "Queued",
      detail: "Waiting its turn, so requests are spread out",
      at: job.queuedAt,
      state: job.queuedAt ? "done" : failed ? "failed" : "current",
    },
    {
      label: "Sent to Google",
      detail: "Google has been asked to crawl the page",
      at: job.apiCalledAt,
      state: job.apiCalledAt ? "done" : job.queuedAt && !failed ? "current" : failed ? "failed" : "pending",
    },
    indexed
      ? { label: "Indexed", detail: "Confirmed by Search Console. Credit used.", at: job.indexedAt, state: "done" }
      : failed
        ? { label: "Failed", detail: "Not indexed. Credit refunded.", at: job.failedAt, state: "failed" }
        : {
            label: "Waiting for Google",
            detail: "Search Console is checked regularly until the page is indexed",
            state: job.apiCalledAt ? "current" : "pending",
          },
  ];

  return (
    <ol className="relative">
      {steps.map((step, i) => (
        <li key={step.label} className="relative flex gap-4 pb-7 last:pb-0">
          {i < steps.length - 1 && (
            <span
              aria-hidden="true"
              className={cn("absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-0.5", step.state === "done" ? "bg-brand-200" : "bg-slate-200")}
            />
          )}
          <span
            className={cn(
              "relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full ring-4 ring-white",
              step.state === "done" && (step.label === "Indexed" ? "bg-emerald-500 text-white" : "bg-brand-600 text-white"),
              step.state === "current" && "border-2 border-brand-500 bg-white",
              step.state === "pending" && "border-2 border-slate-200 bg-white",
              step.state === "failed" && "bg-red-500 text-white"
            )}
          >
            {step.state === "done" && <Check className="h-4 w-4" aria-hidden="true" />}
            {step.state === "failed" && <CircleAlert className="h-4 w-4" aria-hidden="true" />}
            {step.state === "current" && <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className={cn("text-sm font-medium", step.state === "pending" ? "text-slate-400" : "text-slate-900")}>{step.label}</p>
            <p className={cn("text-[13px]", step.state === "pending" ? "text-slate-400" : "text-slate-500")}>
              {step.detail}
              {step.at && (
                <>
                  {" · "}
                  <time dateTime={step.at} title={formatDateTime(step.at)}>
                    {timeAgo(step.at)}
                  </time>
                </>
              )}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{children}</dd>
    </div>
  );
}

export default function JobDetailPage() {
  const toast = useToast();
  const params = useParams();
  const jobId = params.jobId as string;
  const { user } = useCurrentUser();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const data = await apiFetch(`/api/urls/status/${jobId}`);
      setJob(data.job);
      setLoadError("");
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Failed to load job");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    fetchJob();
  }, [fetchJob]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const data = await apiFetch(`/api/urls/status/${jobId}/refresh`, { method: "POST" });
      toast({ tone: "info", title: data.message || "Status refreshed" });
      await fetchJob();
    } catch (err: unknown) {
      toast({ tone: "error", title: "Refresh failed", description: err instanceof Error ? err.message : undefined });
    } finally {
      setRefreshing(false);
    }
  }

  const active = job ? ACTIVE_STATUSES.includes(job.status) : false;
  const display = job?.originalUrl.replace(/^https?:\/\//, "");

  return (
    <AppShell user={user} narrow>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Job details" }]}
        title={
          loading ? (
            <Skeleton className="h-8 w-72 max-w-full" />
          ) : (
            <span className="block break-all text-xl leading-snug sm:text-2xl">{display ?? "Job not found"}</span>
          )
        }
        description={job ? job.domain : undefined}
        actions={
          job ? (
            <>
              <a
                href={job.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-[13px] font-medium text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Open page
              </a>
              {active && (
                <Button size="sm" loading={refreshing} onClick={handleRefresh} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                  Check now
                </Button>
              )}
            </>
          ) : undefined
        }
      />

      {loadError && !job && <Alert tone="error" title="We couldn't load this job">{loadError}</Alert>}

      {loading ? (
        <div className="space-y-6" aria-hidden="true">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      ) : (
        job && (
          <div className="space-y-6">
            <Card>
              <CardBody>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                  <Fact label="Status">
                    <StatusBadge status={job.status} />
                  </Fact>
                  <Fact label="Retries">{job.retryCount}</Fact>
                  <Fact label="Sent with">{SOURCE_LABEL[job.credentialSource] ?? job.credentialSource ?? "—"}</Fact>
                  <Fact label="Submitted">
                    <time dateTime={job.createdAt} title={formatDateTime(job.createdAt)}>
                      {timeAgo(job.createdAt)}
                    </time>
                  </Fact>
                </dl>
              </CardBody>
            </Card>

            <div className="grid gap-6 md:grid-cols-5">
              <Card className="md:col-span-3">
                <CardHeader title="Progress" description="Where this URL is on its way to being indexed." />
                <CardBody>
                  <Timeline job={job} />
                </CardBody>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader title="Latest check" description="From Google Search Console." />
                <CardBody>
                  {job.latestCheck ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
                          <Search className="h-[18px] w-[18px]" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{CHECK_LABEL[job.latestCheck.status] ?? job.latestCheck.status}</p>
                          <p className="text-[13px] text-slate-500">
                            <time dateTime={job.latestCheck.checkedAt} title={formatDateTime(job.latestCheck.checkedAt)}>
                              {timeAgo(job.latestCheck.checkedAt)}
                            </time>
                          </p>
                        </div>
                      </div>
                      {job.latestCheck.status === "CRAWLED_NOT_INDEXED" && (
                        <p className="text-[13px] leading-relaxed text-slate-500">
                          Google has seen the page but chose not to index it yet. This is usually about the page itself (thin or duplicate content), not something a resubmission fixes.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No check has run yet. The first one happens shortly after the request is sent to Google.</p>
                  )}
                </CardBody>
              </Card>
            </div>

            {job.errors && job.errors.length > 0 && (
              <Card>
                <CardHeader
                  title="Error log"
                  description="The most recent problems while processing this URL."
                  action={<CopyButton value={job.errors.map((e) => `[${e.timestamp}] ${e.step}: ${e.message}`).join("\n")} label="Copy log" />}
                />
                <CardBody>
                  <ul className="space-y-2 rounded-lg bg-slate-900 p-4 font-mono text-xs leading-5 text-slate-200">
                    {job.errors.map((err, i) => (
                      <li key={err._id || i}>
                        <span className="text-slate-500">[{formatDateTime(err.timestamp)}]</span> <span className="font-semibold text-amber-300">{err.step}</span> {err.message}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            )}
          </div>
        )
      )}
    </AppShell>
  );
}
