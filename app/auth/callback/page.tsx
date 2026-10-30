"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleAlert, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Logo } from "@/components/ui/Logo";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      localStorage.setItem("token", token);
      // Fetch user info
      apiFetch("/api/auth/me")
        .then((data) => {
          localStorage.setItem("user", JSON.stringify(data.user));
          router.push("/dashboard");
        })
        .catch(() => {
          // Token saved even if me fetch fails
          router.push("/dashboard");
        });
    } else if (error) {
      setFailure(error);
      setTimeout(
        () => router.push("/login?error=" + encodeURIComponent(error)),
        2500,
      );
    } else {
      router.push("/login");
    }
  }, [searchParams, router]);

  if (failure) {
    return (
      <>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-600">
          <CircleAlert className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-lg font-semibold text-slate-900">Sign-in failed</h1>
        <p className="mt-1.5 max-w-xs text-sm text-slate-500">{failure}</p>
        <p className="mt-4 text-xs text-slate-400">Taking you back to the sign-in page…</p>
      </>
    );
  }

  return <Working />;
}

function Working() {
  return (
    <>
      <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-lg font-semibold text-slate-900">Signing you in</h1>
      <p className="mt-1.5 text-sm text-slate-500">Just a moment…</p>
    </>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <Logo href="/" />
      <div
        className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-card"
        role="status"
        aria-live="polite"
      >
        <Suspense fallback={<Working />}>
          <CallbackHandler />
        </Suspense>
      </div>
    </div>
  );
}
