"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clearAuth } from "@/lib/api";

export default function Navbar({ userName }: { userName?: string }) {
  const router = useRouter();

  function logout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <nav className='bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between'>
      <div className='flex items-center gap-6'>
        <Link href='/dashboard' className='font-bold text-lg text-blue-600'>
          IndexMeNow
        </Link>
        <Link
          href='/dashboard'
          className='text-sm text-gray-600 hover:text-gray-900'
        >
          Dashboard
        </Link>
        <Link
          href='/profile'
          className='text-sm text-gray-600 hover:text-gray-900'
        >
          Profile
        </Link>
        <Link
          href='/settings/google'
          className='text-sm text-gray-600 hover:text-gray-900'
        >
          Google Settings
        </Link>
      </div>
      <div className='flex items-center gap-4'>
        {userName && <span className='text-sm text-gray-600'>{userName}</span>}
        <button
          onClick={logout}
          className='text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded'
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
