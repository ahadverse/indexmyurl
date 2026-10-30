import { Info, ShieldAlert } from "lucide-react";

export type PublishCredentialMode = "platform" | "platform_first" | "user_first";

function publishLine(mode?: PublishCredentialMode): string {
  switch (mode) {
    case "platform":
      return "Indexing requests are sent from IndexMeNow's own Google service accounts. Your Google account is never used to call the Indexing API.";
    case "platform_first":
      return "Indexing requests are sent from IndexMeNow's own Google service accounts first. Your Google account is used for them only when none of ours is available.";
    case "user_first":
      return "Indexing requests are sent using your connected Google account, so any restriction Google applies to this kind of use can affect that account.";
    default:
      return "Depending on how this service is configured, indexing requests are sent from IndexMeNow's service accounts or from your connected Google account.";
  }
}

export default function GoogleAccessNotice({
  mode,
  variant = "full",
}: {
  mode?: PublishCredentialMode;
  variant?: "full" | "short";
}) {
  if (variant === "short") {
    return (
      <p className='mt-4 flex gap-2 text-xs leading-relaxed text-slate-500'>
        <Info className='mt-0.5 h-3.5 w-3.5 shrink-0' aria-hidden='true' />
        <span>
          Signing in with Google lets IndexMeNow read your Search Console data
          to check indexing status. Indexing is not guaranteed and relies on a
          Google API used outside its documented purpose. Details are in
          Settings → Google.
        </span>
      </p>
    );
  }

  return (
    <div className='rounded-xl border border-amber-200 bg-amber-50/70 px-5 py-4 text-sm text-amber-950'>
      <p className='flex items-center gap-2 font-semibold'>
        <ShieldAlert className='h-4 w-4 text-amber-600' aria-hidden='true' />
        How IndexMeNow uses Google — please read
      </p>
      <ul className='mt-3 list-disc space-y-1.5 pl-6 leading-relaxed marker:text-amber-400'>
        <li>
          Your Google account is used to read your Search Console data
          (read-only), so we can check whether your URLs are indexed.
        </li>
        <li>{publishLine(mode)}</li>
        <li>
          Google officially supports its Indexing API only for job-posting and
          livestream pages. IndexMeNow uses it differently, so Google may limit
          or change this at any time, and indexing is not guaranteed.
        </li>
        <li>
          You can disconnect below at any time, and revoke access under Google
          Account → Security → Third-party apps with account access.
        </li>
      </ul>
    </div>
  );
}
