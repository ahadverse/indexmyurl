/** Questions and answers shown on the home page (the first few) and on /faq (all of them, with FAQPage markup). */
export interface FaqItem {
  q: string
  a: string
}

export interface FaqGroup {
  title: string
  items: FaqItem[]
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    title: 'Getting started',
    items: [
      {
        q: 'What is IndexMeNow?',
        a: 'IndexMeNow checks URLs for the problems that keep pages out of Google, asks Google to look at the ones that pass, and then follows each page in Google Search Console. A credit is used only when Search Console confirms the page is indexed.',
      },
      {
        q: 'Do I need Google Search Console?',
        a: 'Yes. Credits are charged only for pages that are confirmed indexed, and only Search Console can confirm that. You can either connect your Google account, or add our service account as a Full user of your property in Search Console. The address is shown in the dashboard when it is needed.',
      },
      {
        q: 'How many URLs can I submit?',
        a: 'You can scan up to 100 URLs at a time and submit up to 50 in one batch. A daily limit of 50 submissions per account applies.',
      },
      {
        q: 'Can I import URLs from a sitemap?',
        a: 'Yes. Point IndexMeNow at a sitemap or a sitemap index and it loads the pages the sitemap lists, so you can scan them without copying URLs by hand.',
      },
    ],
  },
  {
    title: 'Credits and results',
    items: [
      {
        q: 'Is indexing guaranteed?',
        a: 'No. Google alone decides what to index. IndexMeNow removes the avoidable blockers, asks Google to look at your pages and tells you what happened. Pages Google chooses not to index are not charged.',
      },
      {
        q: 'When is a credit used?',
        a: 'A credit is reserved when you submit a URL and used only when Search Console confirms the page is indexed. If the page is still not indexed after the retries, the credit is refunded.',
      },
      {
        q: 'What happens if my URL is already indexed?',
        a: 'IndexMeNow checks Search Console before it does anything. If Google already has the page, it is marked as indexed straight away and no credit is charged.',
      },
      {
        q: 'How long does indexing take?',
        a: 'It varies and is up to Google. IndexMeNow checks the status about 20 minutes after submitting, every 30 minutes for the first 6 hours, every 2 hours up to 24 hours, and then every 6 hours. A page that is still not indexed is retried up to 3 times, at least 24 hours apart, and the credit is refunded if it is not indexed after 7 days.',
      },
      {
        q: 'How do I get more credits?',
        a: 'Every account starts with 5 free credits. If you need more, get in touch and we will add them to your account.',
      },
    ],
  },
  {
    title: 'Scanning and safety',
    items: [
      {
        q: 'What does the scan check?',
        a: 'HTTP status, noindex in the page or in the headers, robots.txt rules for Googlebot, redirects, the canonical URL and thin content. Sitemaps and private addresses are refused.',
      },
      {
        q: 'How does IndexMeNow use my Google account?',
        a: 'To read your Search Console data (read-only) so it can check indexing status. Google officially supports its Indexing API only for job-posting and livestream pages; IndexMeNow uses it differently, so Google may limit or change this at any time. You can disconnect whenever you like.',
      },
      {
        q: 'Does IndexMeNow change anything in my Search Console?',
        a: 'No. The connection is read-only: it lists your sites and runs URL Inspection. It never edits your property, sitemaps or settings.',
      },
    ],
  },
  {
    title: 'For developers',
    items: [
      {
        q: 'Is there an API?',
        a: 'Yes. Every account has an API key on the profile page. Send it in the x-api-key header to scan, submit and track URLs from your own tools, with the same checks as the dashboard. See the API documentation for the endpoints.',
      },
    ],
  },
]

export const FAQ: FaqItem[] = FAQ_GROUPS.flatMap((group) => group.items)

/** The four questions shown on the home page. */
export const HOME_FAQ: FaqItem[] = [
  FAQ.find((item) => item.q === 'Is indexing guaranteed?')!,
  FAQ.find((item) => item.q === 'When is a credit used?')!,
  FAQ.find((item) => item.q === 'What does the scan check?')!,
  FAQ.find((item) => item.q === 'How does IndexMeNow use my Google account?')!,
]
