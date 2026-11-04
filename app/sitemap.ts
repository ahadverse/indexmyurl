import type { MetadataRoute } from 'next'
import { GUIDES } from '@/lib/guides'
import { CONTACT_EMAIL, SITE_URL } from '@/lib/site'

// Only the public pages; everything else needs a login.
// lastModified only where there is a real date (the guides): a made-up one is worse than none.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    '/',
    '/how-it-works',
    '/features',
    '/credits',
    '/docs/api',
    '/guides',
    '/faq',
    '/about',
    ...(CONTACT_EMAIL ? ['/contact'] : []),
    '/login',
    '/register',
    '/privacy',
    '/terms',
  ]
  const guides = GUIDES.map((guide) => ({
    url: `${SITE_URL}/guides/${guide.slug}`,
    lastModified: new Date(guide.modified),
  }))
  return [...pages.map((path) => ({ url: `${SITE_URL}${path === '/' ? '' : path}` })), ...guides]
}
