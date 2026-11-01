/** Public origin of this site, without a trailing slash. Used in sitemap.xml and robots.txt. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://storewike.store"
).replace(/\/+$/, "");
