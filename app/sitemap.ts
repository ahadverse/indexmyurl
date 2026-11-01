import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Only the public pages; everything else needs a login.
// No lastModified on purpose: these pages have no real modification date, and a made-up one is worse than none.
export default function sitemap(): MetadataRoute.Sitemap {
  return [`${SITE_URL}/`, `${SITE_URL}/login`, `${SITE_URL}/register`].map((url) => ({ url }))
}
