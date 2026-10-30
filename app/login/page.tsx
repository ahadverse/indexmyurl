"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { apiFetch, saveAuth } from "@/lib/api";
import AuthShell from "@/components/AuthShell";
import GoogleAccessNotice from "@/components/GoogleAccessNotice";
import GoogleButton from "@/components/GoogleButton";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, PasswordInput } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.replace("/dashboard");
    const err = searchParams.get("error");
    if (err) setError(`Google sign-in failed: ${err}`);
  }, [router, searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveAuth(data.token, data.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);
    try {
      const data = await apiFetch("/api/oauth/google/login-url");
      window.location.href = data.url;
    } catch (err: unknown) {
      setGoogleLoading(false);
      setError(
        err instanceof Error ? err.message : "Failed to get Google login URL",
      );
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to scan and submit your URLs."
      footer={
        <>
          New to IndexMeNow?{" "}
          <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </>
      }
    >
      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4" />}
          required
        />
        <PasswordInput
          label="Password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="h-4 w-4" />}
          required
        />
        <Button type="submit" size="lg" fullWidth loading={loading} className="!mt-6">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleButton onClick={handleGoogleLogin} loading={googleLoading}>
        Continue with Google
      </GoogleButton>
      <GoogleAccessNotice variant="short" />
    </AuthShell>
  );
}

function LoginSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[22rem] space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="mt-8 h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="mt-6 h-12 w-full" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
