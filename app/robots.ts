import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Pages behind login: nothing there for Google to index
const PRIVATE_PATHS = ['/dashboard', '/urls', '/jobs/', '/profile', '/settings/', '/auth/']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
