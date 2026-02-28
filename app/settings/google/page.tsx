"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/Navbar";

interface GoogleAccount {
  id: string;
  googleEmail: string;
  googleAccountId: string;
  gscProperties: string[];
  isActive: boolean;
  propertiesCount: number;
}

function GoogleSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justConnected = searchParams.get("connected") === "true";

  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [hasGoogleConnected, setHasGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStates, setSyncStates] = useState<
    Record<string, "idle" | "syncing" | "done" | "error">
  >({});
  const [disconnectStates, setDisconnectStates] = useState<
    Record<string, boolean>
  >({});
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await apiFetch("/api/oauth/google/accounts");
      setHasGoogleConnected(data.hasGoogleConnected);
      setAccounts(data.accounts || []);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to load accounts",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchAccounts();
  }, [router, fetchAccounts]);

  async function handleSync(accountId: string) {
    setSyncStates((prev) => ({ ...prev, [accountId]: "syncing" }));
    try {
      await apiFetch("/api/oauth/google/sync", { method: "POST" });
      await fetchAccounts();
      setSyncStates((prev) => ({ ...prev, [accountId]: "done" }));
      setTimeout(
        () => setSyncStates((prev) => ({ ...prev, [accountId]: "idle" })),
        2500,
      );
    } catch {
      setSyncStates((prev) => ({ ...prev, [accountId]: "error" }));
    }
  }

  async function handleDisconnect(googleAccountId: string) {
    if (
      !confirm(
        "Disconnect this Google account? Indexing jobs using it may stop working.",
      )
    )
      return;
    setDisconnectStates((prev) => ({ ...prev, [googleAccountId]: true }));
    try {
      await apiFetch(`/api/oauth/google/${googleAccountId}`, {
        method: "DELETE",
      });
      await fetchAccounts();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Disconnect failed");
    } finally {
      setDisconnectStates((prev) => ({ ...prev, [googleAccountId]: false }));
    }
  }

  async function handleConnectAnother() {
    try {
      const data = await apiFetch("/api/oauth/google/connect-url");
      window.location.href = data.url;
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to get connect URL",
      );
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar />

      <div className='max-w-2xl mx-auto px-4 py-8 space-y-5'>
        {/* Breadcrumb */}
        <div className='text-sm text-gray-500 flex items-center gap-2'>
          <Link href='/dashboard' className='hover:text-gray-800'>
            Dashboard
          </Link>
          <span>/</span>
          <span className='text-gray-800'>Google Settings</span>
        </div>

        {/* Success banner */}
        {justConnected && (
          <div className='bg-green-50 border border-green-200 rounded-lg px-5 py-4 flex items-center gap-3'>
            <span className='text-2xl'>✅</span>
            <div>
              <p className='font-semibold text-green-800'>
                Google Account Connected Successfully!
              </p>
              <p className='text-sm text-green-700 mt-0.5'>
                Your GSC properties are listed below. You can sync them anytime.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm'>
            {errorMsg}
          </div>
        )}

        {/* Accounts */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
            <h2 className='font-semibold text-base'>
              Connected Google Accounts
            </h2>
            <button
              onClick={handleConnectAnother}
              className='text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded font-medium'
            >
              + Connect Account
            </button>
          </div>

          {loading ? (
            <div className='px-6 py-10 text-center text-sm text-gray-400'>
              Loading...
            </div>
          ) : !hasGoogleConnected || accounts.length === 0 ? (
            <div className='px-6 py-10 text-center'>
              <p className='text-gray-500 text-sm mb-4'>
                No Google accounts connected yet.
              </p>
              <button
                onClick={handleConnectAnother}
                className='bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-medium'
              >
                Connect Google Account
              </button>
            </div>
          ) : (
            <ul className='divide-y divide-gray-100'>
              {accounts.map((acc) => (
                <li key={acc.id} className='px-6 py-5'>
                  {/* Account header */}
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm uppercase'>
                        {acc.googleEmail?.[0] ?? "G"}
                      </div>
                      <div>
                        <p className='font-medium text-sm'>{acc.googleEmail}</p>
                        <div className='flex items-center gap-2 mt-0.5'>
                          {acc.isActive && (
                            <span className='text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full'>
                              Active
                            </span>
                          )}
                          <span className='text-xs text-gray-400'>
                            {acc.propertiesCount ??
                              acc.gscProperties?.length ??
                              0}{" "}
                            properties
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className='flex items-center gap-2 shrink-0'>
                      <button
                        onClick={() => handleSync(acc.id)}
                        disabled={syncStates[acc.id] === "syncing"}
                        className='text-sm border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded disabled:opacity-50 flex items-center gap-1.5'
                      >
                        {syncStates[acc.id] === "syncing" ? (
                          <>
                            <span className='animate-spin'>↻</span> Syncing...
                          </>
                        ) : syncStates[acc.id] === "done" ? (
                          <>✓ Synced</>
                        ) : (
                          <>↻ Sync Properties</>
                        )}
                      </button>
                      <button
                        onClick={() => handleDisconnect(acc.googleAccountId)}
                        disabled={disconnectStates[acc.googleAccountId]}
                        className='text-sm border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded disabled:opacity-50'
                      >
                        {disconnectStates[acc.googleAccountId]
                          ? "Disconnecting..."
                          : "Disconnect"}
                      </button>
                    </div>
                  </div>

                  {/* GSC Properties */}
                  <div className='mt-4'>
                    <p className='text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide'>
                      GSC Properties
                    </p>
                    {acc.gscProperties && acc.gscProperties.length > 0 ? (
                      <div className='space-y-1'>
                        {acc.gscProperties.map((prop) => (
                          <div
                            key={prop}
                            className='flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 rounded px-3 py-1.5'
                          >
                            <span className='w-2 h-2 rounded-full bg-green-400 shrink-0' />
                            <span className='font-mono text-xs text-gray-700 break-all'>
                              {prop}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-sm text-gray-400 italic'>
                        No properties found. Try syncing.
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Go to Dashboard */}
        <div className='flex justify-end'>
          <Link
            href='/dashboard'
            className='bg-gray-900 hover:bg-gray-700 text-white px-5 py-2 rounded text-sm font-medium'
          >
            Go to Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function GoogleSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-gray-50'>
          <div className='max-w-2xl mx-auto px-4 py-8 text-sm text-gray-400'>
            Loading...
          </div>
        </div>
      }
    >
      <GoogleSettingsContent />
    </Suspense>
  );
}
