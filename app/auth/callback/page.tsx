"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      localStorage.setItem("token", token);
      // Fetch user info
      apiFetch("/api/auth/me")
        .then((data) => {
          localStorage.setItem("user", JSON.stringify(data.user));
          setStatus("Login successful! Redirecting...");
          router.push("/dashboard");
        })
        .catch(() => {
          // Token saved even if me fetch fails
          router.push("/dashboard");
        });
    } else if (error) {
      setStatus(`Login failed: ${error}`);
      setTimeout(
        () => router.push("/login?error=" + encodeURIComponent(error)),
        2000,
      );
    } else {
      router.push("/login");
    }
  }, [searchParams, router]);

  return <div className='text-gray-600'>{status}</div>;
}

export default function AuthCallbackPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='bg-white p-8 rounded-lg shadow border border-gray-200 text-center'>
        <Suspense fallback={<div className='text-gray-600'>Processing...</div>}>
          <CallbackHandler />
        </Suspense>
      </div>
    </div>
  );
}
