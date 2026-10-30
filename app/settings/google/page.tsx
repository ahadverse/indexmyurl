"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Globe, Plug, Plus, RefreshCw, Unplug } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { initials } from "@/lib/format";
import type { GoogleAccount } from "@/lib/types";
import { useCurrentUser } from "@/lib/hooks";
import AppShell from "@/components/AppShell";
import { GoogleLogo } from "@/components/GoogleButton";
import GoogleAccessNotice, { PublishCredentialMode } from "@/components/GoogleAccessNotice";
import { Alert } from "@/components/ui/Alert";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { buttonClass } from "@/components/ui/buttonStyles";
import { Card, CardHeader } from "@/components/ui/Card";
import { useConfirm } from "@/components/ui/Confirm";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

type SyncState = "idle" | "syncing" | "done";

function GoogleSettingsContent() {
  const toast = useToast();
  const confirm = useConfirm();
  const searchParams = useSearchParams();
  const justConnected = searchParams.get("connected") === "true";
  const { user } = useCurrentUser();

  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [publishMode, setPublishMode] = useState<PublishCredentialMode>();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [syncStates, setSyncStates] = useState<Record<string, SyncState>>({});
  const [disconnecting, setDisconnecting] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await apiFetch("/api/oauth/google/accounts");
      setPublishMode(data.publishCredentialMode);
      setAccounts(data.accounts || []);
      setLoadError("");
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    fetchAccounts();
  }, [fetchAccounts]);

  async function handleSync(accountId: string) {
    setSyncStates((prev) => ({ ...prev, [accountId]: "syncing" }));
    try {
      await apiFetch("/api/oauth/google/sync", { method: "POST" });
      await fetchAccounts();
      setSyncStates((prev) => ({ ...prev, [accountId]: "done" }));
      setTimeout(() => setSyncStates((prev) => ({ ...prev, [accountId]: "idle" })), 2500);
    } catch (err: unknown) {
      setSyncStates((prev) => ({ ...prev, [accountId]: "idle" }));
      toast({ tone: "error", title: "Sync failed", description: err instanceof Error ? err.message : undefined });
    }
  }

  async function handleDisconnect(account: GoogleAccount) {
    const ok = await confirm({
      title: "Disconnect this Google account?",
      description: `${account.googleEmail} will be removed. Indexing jobs that rely on it may stop working until you connect an account again.`,
      confirmLabel: "Disconnect",
      tone: "danger",
    });
    if (!ok) return;
    setDisconnecting((prev) => ({ ...prev, [account.googleAccountId]: true }));
    try {
      await apiFetch(`/api/oauth/google/${account.googleAccountId}`, { method: "DELETE" });
      await fetchAccounts();
      toast({ tone: "success", title: "Google account disconnected" });
    } catch (err: unknown) {
      toast({ tone: "error", title: "Couldn't disconnect", description: err instanceof Error ? err.message : undefined });
    } finally {
      setDisconnecting((prev) => ({ ...prev, [account.googleAccountId]: false }));
    }
  }

  async function handleConnect() {
    setConnecting(true);
    try {
      const data = await apiFetch("/api/oauth/google/connect-url");
      window.location.href = data.url;
    } catch (err: unknown) {
      setConnecting(false);
      toast({ tone: "error", title: "Couldn't start Google sign-in", description: err instanceof Error ? err.message : undefined });
    }
  }

  return (
    <AppShell user={user} narrow>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Google accounts" }]}
        title="Google accounts"
        description="The Google accounts IndexMeNow reads Search Console data from, to check whether your pages are indexed."
        actions={
          accounts.length > 0 ? (
            <Button onClick={handleConnect} loading={connecting} leftIcon={<Plus className="h-4 w-4" />}>
              Connect account
            </Button>
          ) : undefined
        }
      />

      <div className="space-y-6">
        {justConnected && (
          <Alert tone="success" title="Google account connected">
            Your Search Console properties are listed below. You can sync them again at any time.
          </Alert>
        )}
        {loadError && <Alert tone="error">{loadError}</Alert>}

        <GoogleAccessNotice mode={publishMode} />

        <Card>
          <CardHeader
            icon={<Plug className="h-[18px] w-[18px]" />}
            title="Connected accounts"
            description={loading ? "Loading…" : `${accounts.length} connected`}
          />

          {loading ? (
            <div className="space-y-6 p-6" aria-hidden="true">
              {[0, 1].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <EmptyState
              icon={<GoogleLogo className="h-6 w-6" />}
              title="No Google account connected"
              description="Connect an account that owns your sites in Search Console so indexing can be verified."
              action={
                <Button onClick={handleConnect} loading={connecting} leftIcon={<Plug className="h-4 w-4" />}>
                  Connect Google account
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {accounts.map((acc) => {
                const count = acc.propertiesCount ?? acc.gscProperties?.length ?? 0;
                const sync = syncStates[acc.id] ?? "idle";
                return (
                  <li key={acc.id} className="px-5 py-5 sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar label={initials(acc.googleEmail?.[0], "", "G")} seed={acc.googleEmail} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{acc.googleEmail}</p>
                          <div className="mt-0.5 flex items-center gap-2">
                            {acc.isActive && (
                              <Badge tone="success" dot>
                                Active
                              </Badge>
                            )}
                            <span className="text-xs text-slate-500">
                              {count} propert{count === 1 ? "y" : "ies"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={sync === "syncing"}
                          onClick={() => handleSync(acc.id)}
                          leftIcon={sync === "done" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        >
                          {sync === "syncing" ? "Syncing…" : sync === "done" ? "Synced" : "Sync"}
                        </Button>
                        <Button
                          variant="dangerSoft"
                          size="sm"
                          loading={disconnecting[acc.googleAccountId]}
                          onClick={() => handleDisconnect(acc)}
                          leftIcon={<Unplug className="h-3.5 w-3.5" />}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Search Console properties</p>
                      {acc.gscProperties && acc.gscProperties.length > 0 ? (
                        <ul className="flex flex-wrap gap-2">
                          {acc.gscProperties.map((prop) => (
                            <li key={prop} className="flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                              <Globe className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                              <span className="truncate font-mono text-xs text-slate-700">{prop}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-500">No properties found. Try syncing.</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="flex justify-end">
          <Link href="/dashboard" className={buttonClass({ variant: "dark" })}>
            Go to dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function SettingsFallback() {
  return (
    <AppShell narrow>
      <div className="space-y-4" aria-hidden="true">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <Skeleton className="mt-6 h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </AppShell>
  );
}

export default function GoogleSettingsPage() {
  return (
    <Suspense fallback={<SettingsFallback />}>
      <GoogleSettingsContent />
    </Suspense>
  );
}
