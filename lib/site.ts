/** Public origin of this site, without a trailing slash. Used in sitemap.xml and robots.txt. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://storewike.store"
).replace(/\/+$/, "");

/** Address shown on the privacy policy and terms for questions and data requests. Optional. */
export const CONTACT_EMAIL = (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "").trim();
