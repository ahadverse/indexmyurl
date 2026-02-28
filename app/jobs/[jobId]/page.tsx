"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";

interface Job {
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
  latestCheck?: string;
  errors?: { timestamp: string; message: string; step: string; _id: string }[];
}

function DateField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className='flex gap-2 text-sm'>
      <span className='text-gray-500 w-32'>{label}:</span>
      <span>{new Date(value).toLocaleString()}</span>
    </div>
  );
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshMsg, setRefreshMsg] = useState("");

  const fetchJob = useCallback(async () => {
    try {
      const data = await apiFetch(`/api/urls/status/${jobId}`);
      console.log(data);
      setJob(data.job);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to load job");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchJob();
  }, [router, fetchJob]);

  async function handleRefresh() {
    setRefreshMsg("");
    try {
      const data = await apiFetch(`/api/urls/status/${jobId}/refresh`, {
        method: "POST",
      });
      setRefreshMsg(data.message || "Status refreshed");
      fetchJob();
    } catch (err: unknown) {
      setRefreshMsg(err instanceof Error ? err.message : "Refresh failed");
    }
  }

  if (loading)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Loading...
      </div>
    );

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar />
      <div className='max-w-4xl mx-auto px-4 py-6'>
        <div className='mb-4'>
          <Link
            href='/dashboard'
            className='text-sm text-blue-600 hover:underline'
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h1 className='text-xl font-bold'>Job Detail</h1>
            {job && <StatusBadge status={job.status} />}
          </div>

          {job && (
            <div className='space-y-3'>
              <div className='flex gap-2 text-sm'>
                <span className='text-gray-500 w-32'>ID:</span>
                <span className='font-mono text-xs'>{job.id}</span>
              </div>
              <div className='flex gap-2 text-sm'>
                <span className='text-gray-500 w-32'>URL:</span>
                <a
                  href={job.originalUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:underline break-all'
                >
                  {job.originalUrl}
                </a>
              </div>
              <div className='flex gap-2 text-sm'>
                <span className='text-gray-500 w-32'>Domain:</span>
                <span>{job.domain}</span>
              </div>
              <div className='flex gap-2 text-sm'>
                <span className='text-gray-500 w-32'>Status:</span>
                <StatusBadge status={job.status} />
              </div>
              <div className='flex gap-2 text-sm'>
                <span className='text-gray-500 w-32'>Retry Count:</span>
                <span>{job.retryCount}</span>
              </div>
              <div className='flex gap-2 text-sm'>
                <span className='text-gray-500 w-32'>Credential:</span>
                <span>{job.credentialSource}</span>
              </div>

              <div className='border-t border-gray-100 pt-3 mt-3 space-y-2'>
                <DateField label='Created At' value={job.createdAt} />
                <DateField label='Queued At' value={job.queuedAt} />
                <DateField label='API Called' value={job.apiCalledAt} />
                <DateField label='Indexed At' value={job.indexedAt} />
                <DateField label='Failed At' value={job.failedAt} />
                <DateField label='Latest Check' value={job.latestCheck} />
              </div>

              {job.errors && job.errors.length > 0 && (
                <div className='mt-4'>
                  <h3 className='font-medium text-sm mb-2 text-red-700'>
                    Error Log
                  </h3>
                  <div className='bg-red-50 border border-red-200 rounded p-3 space-y-1'>
                    {job.errors.map((err, i) => (
                      <div
                        key={err._id || i}
                        className='text-xs font-mono text-red-800'
                      >
                        <span className='text-red-500'>
                          [{new Date(err.timestamp).toLocaleString()}]
                        </span>{" "}
                        <span className='font-semibold'>{err.step}:</span>{" "}
                        {err.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className='pt-4 flex items-center gap-4'>
                {!["INDEXED", "FAILED"].includes(job.status) && (
                  <button
                    onClick={handleRefresh}
                    className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium'
                  >
                    Refresh Status
                  </button>
                )}
                {refreshMsg && (
                  <span className='text-sm text-gray-600'>{refreshMsg}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
