"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch, saveAuth } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.replace("/dashboard");
    const err = searchParams.get("error");
    if (err) setError(`Google login failed: ${err}`);
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
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      const data = await apiFetch("/api/oauth/google/login-url");
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to get Google login URL",
      );
    }
  }

  return (
    <div className='bg-white p-8 rounded-lg shadow border border-gray-200 w-full max-w-md'>
      <h1 className='text-2xl font-bold mb-6'>Login to IndexMeNow</h1>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm'>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium mb-1'>Email</label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>Password</label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
        <button
          type='submit'
          disabled={loading}
          className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium text-sm disabled:opacity-50'
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className='my-4 border-t border-gray-200' />

      <button
        onClick={handleGoogleLogin}
        className='w-full border border-gray-300 hover:bg-gray-50 py-2 rounded font-medium text-sm flex items-center justify-center gap-2'
      >
        <svg className='w-4 h-4' viewBox='0 0 24 24'>
          <path
            fill='#4285F4'
            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
          />
          <path
            fill='#34A853'
            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
          />
          <path
            fill='#FBBC05'
            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
          />
          <path
            fill='#EA4335'
            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
          />
        </svg>
        Login with Google
      </button>

      <p className='text-sm text-center mt-4 text-gray-600'>
        Don&apos;t have an account?{" "}
        <Link href='/register' className='text-blue-600 hover:underline'>
          Register
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <Suspense
        fallback={<div className='text-sm text-gray-400'>Loading...</div>}
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
