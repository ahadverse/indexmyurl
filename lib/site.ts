/** Public origin of this site, without a trailing slash. Used in sitemap.xml, robots.txt, canonicals and JSON-LD. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://storewike.store"
).replace(/\/+$/, "");

export const SITE_NAME = "IndexMeNow";

/** One-sentence description of the product; reused for meta tags and structured data. */
export const SITE_DESCRIPTION =
  "Scan every URL for the problems that keep pages out of Google, submit the ones that pass, and use a credit only when Search Console confirms they are indexed.";

/** Address shown on the privacy policy, terms and contact page for questions and data requests. Optional. */
export const CONTACT_EMAIL = (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "").trim();

/** Absolute URL for a path on this site ("/guides" → "https://example.com/guides"). */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path === "/" ? "" : path}`;
}

/** Main navigation, shared by the header, the mobile menu and the footer. */
export const NAV_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/features", label: "Features" },
  { href: "/credits", label: "Credits" },
  { href: "/guides", label: "Guides" },
  { href: "/faq", label: "FAQ" },
] as const;
