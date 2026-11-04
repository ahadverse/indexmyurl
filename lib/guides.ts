/**
 * Guides: plain-language articles about getting pages indexed. Kept as data so one template renders
 * them all, and the guide list, sitemap and structured data can never disagree with the content.
 * Inline formatting: **bold**, `code` and [label](/path).
 */

export type GuideBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'table'; headers: string[]; rows: string[][] }

export interface GuideSection {
  id: string
  heading: string
  blocks: GuideBlock[]
}

export interface Guide {
  slug: string
  /** <h1> and the title used in search results */
  title: string
  /** 120–160 characters */
  description: string
  /** One or two sentences for the guide list */
  summary: string
  published: string // ISO date
  modified: string // ISO date
  intro: string[]
  sections: GuideSection[]
  related: string[]
}

const p = (text: string): GuideBlock => ({ type: 'p', text })
const ul = (...items: string[]): GuideBlock => ({ type: 'list', items })
const ol = (...items: string[]): GuideBlock => ({ type: 'list', items, ordered: true })

export const GUIDES: Guide[] = [
  {
    slug: 'why-is-my-page-not-indexed',
    title: 'Why isn’t Google indexing my page? 10 causes and how to fix them',
    description:
      'A page can be missing from Google for technical reasons or because Google does not think it is worth indexing. Here are the ten most common causes and how to fix each one.',
    summary: 'The ten most common reasons a page stays out of Google, and how to tell which one applies to yours.',
    published: '2026-11-04',
    modified: '2026-11-04',
    intro: [
      'Google does not index every page it finds. Before a page can appear in search results, Google has to discover it, crawl it, understand it and decide it is worth keeping. A page can fail at any of those steps.',
      'This guide walks through the ten most common causes, starting with the ones that are quickest to check. For each one you will see how to recognize it and what to do.',
    ],
    sections: [
      {
        id: 'check-the-status',
        heading: 'Start by checking what Google says',
        blocks: [
          p('Guessing wastes time. Open Google Search Console, paste the URL into the inspection bar at the top and read the **Page indexing** section. It tells you whether the page is on Google, and if it is not, which reason Google gives.'),
          p('The wording of that reason points straight at one of the causes below. [How to read the URL Inspection tool](/guides/url-inspection-tool-explained) explains every state.'),
        ],
      },
      {
        id: 'error-status',
        heading: '1. The page returns an error',
        blocks: [
          p('A page that answers with 404 (not found), 410 (gone) or a 5xx server error will not be indexed. Google also treats some pages that look empty or say “not found” while returning 200 as **soft 404s**.'),
          ul(
            'Open the URL in a private window and confirm it loads the real content.',
            'Check the HTTP status with your browser’s network tab or `curl -I`.',
            'Fix server errors and broken routes, and return a real 404 or 410 only for pages that should not exist.'
          ),
        ],
      },
      {
        id: 'noindex',
        heading: '2. A noindex directive tells Google to skip it',
        blocks: [
          p('A `noindex` rule in a robots meta tag or in an `X-Robots-Tag` HTTP header is a direct instruction not to index the page. It often arrives by accident: a staging setting that reached production, a CMS option such as “discourage search engines”, or an SEO plugin’s per-page switch.'),
          p('[How to find and fix noindex tags and robots.txt blocks](/guides/fix-noindex-and-robots-txt-blocks) shows where to look.'),
        ],
      },
      {
        id: 'robots-txt',
        heading: '3. robots.txt blocks Googlebot',
        blocks: [
          p('If `robots.txt` disallows the URL, Googlebot will not fetch it. Search Console reports this as **Blocked by robots.txt**. A broad rule such as `Disallow: /` left over from development is a classic cause.'),
        ],
      },
      {
        id: 'canonical',
        heading: '4. The canonical URL points somewhere else',
        blocks: [
          p('A `rel="canonical"` tag tells Google which version of a page is the main one. If it points at a different URL, Google will usually index that one and leave yours out. Search Console shows this as “Alternate page with proper canonical tag” or “Duplicate, Google chose different canonical than user”.'),
          ul(
            'Make sure every indexable page has a canonical that points to itself.',
            'Check that redirects, `http`/`https` and `www`/non-`www` versions agree on one preferred URL.',
            'If Google picked another canonical on its own, the pages are probably too similar. Make them distinct or merge them.'
          ),
        ],
      },
      {
        id: 'low-quality',
        heading: '5. Google crawled it but did not think it was worth indexing',
        blocks: [
          p('Thin, repetitive or near-duplicate pages are often crawled and then left out. Search Console calls this **Crawled – currently not indexed**. It is a judgement about the page, not an error you can switch off.'),
          p('See [Crawled – currently not indexed: what it means and how to fix it](/guides/crawled-currently-not-indexed).'),
        ],
      },
      {
        id: 'not-discovered',
        heading: '6. Google has not found the page yet',
        blocks: [
          p('A page with no internal links and no sitemap entry may simply be unknown to Google. Search Console says **URL is unknown to Google**, or **Discovered – currently not indexed** when Google knows the URL but has not crawled it yet.'),
          ul(
            'Link to the page from pages that are already indexed, such as your home page, a category page or a related article.',
            'List it in your XML sitemap and make sure the sitemap is submitted. See [how to create and submit a sitemap](/guides/how-to-submit-a-sitemap).',
            'Read [Discovered – currently not indexed](/guides/discovered-currently-not-indexed) if Google knows the URL but is not crawling it.'
          ),
        ],
      },
      {
        id: 'rendering',
        heading: '7. The content only appears after JavaScript runs',
        blocks: [
          p('Google can render JavaScript, but rendering is slower and can fail. If the main content is injected by scripts that error, time out or depend on a login, Google may see an empty page.'),
          p('In URL Inspection, use **Test live URL** and then **View tested page** to compare what Google rendered with what you see. Server-side rendering or pre-rendering the important content avoids the problem.'),
        ],
      },
      {
        id: 'blocked-resources',
        heading: '8. Something Google needs is blocked or slow',
        blocks: [
          p('If the scripts or stylesheets a page needs are blocked in `robots.txt`, or the server answers slowly or intermittently, Googlebot may give up early and crawl less. Keep server response times low and let Google fetch the resources your pages depend on.'),
        ],
      },
      {
        id: 'site-level',
        heading: '9. Site-wide problems',
        blocks: [
          p('New sites, sites with little authority and sites with a very large number of low-value URLs get crawled less. Check **Security & Manual Actions** in Search Console for penalties, look for a flood of parameter or faceted URLs that waste crawling, and make sure the site is reachable and stable.'),
        ],
      },
      {
        id: 'time',
        heading: '10. It simply has not been long enough',
        blocks: [
          p('A new page can take days or even weeks to appear, particularly on a young site. If the page is technically sound, linked from somewhere indexed and listed in your sitemap, patience is part of the fix.'),
          p('Pressing **Request indexing** over and over does not speed things up. It has a daily limit and does not override Google’s own judgement about the page.'),
        ],
      },
      {
        id: 'rule-out',
        heading: 'Rule out the technical causes quickly',
        blocks: [
          p('Causes 1 to 4 and 7 are mechanical, so a tool can find them for you. IndexMeNow’s pre-flight scan fetches each URL the way a crawler would and flags error statuses, noindex, robots.txt blocks, redirects, canonical mismatches and thin content before you spend a credit. What it cannot decide is whether Google thinks the content is worth indexing: that part is up to the page.'),
        ],
      },
    ],
    related: ['crawled-currently-not-indexed', 'discovered-currently-not-indexed', 'fix-noindex-and-robots-txt-blocks'],
  },

  {
    slug: 'crawled-currently-not-indexed',
    title: 'Crawled – currently not indexed: what it means and how to fix it',
    description:
      'Google fetched your page but chose not to index it. Learn what “Crawled – currently not indexed” means, the usual causes, and what actually helps.',
    summary: 'Google visited the page and still left it out. What that status means and what to change.',
    published: '2026-11-04',
    modified: '2026-11-04',
    intro: [
      '“Crawled – currently not indexed” is one of the most common statuses in Google Search Console’s page indexing report, and one of the most frustrating. It means Googlebot fetched the page successfully and then decided not to add it to the index, at least for now.',
      'It is not an error code. Nothing is broken on the technical side. It is a decision about the page, so the fix is usually about the page, not about how you submit it.',
    ],
    sections: [
      {
        id: 'what-it-means',
        heading: 'What the status means',
        blocks: [
          p('Google crawled the URL, could read it, and was allowed to index it. After weighing the page against what it already has, it chose not to include it yet. The status can change later without you doing anything, especially for new pages.'),
          p('That is different from [Discovered – currently not indexed](/guides/discovered-currently-not-indexed), where Google has not even fetched the page.'),
        ],
      },
      {
        id: 'causes',
        heading: 'Common causes',
        blocks: [
          ul(
            '**Thin content.** Little text, little that is unique, or mostly boilerplate.',
            '**Duplicate or near-duplicate pages.** Many pages that say almost the same thing, such as location or product pages generated from one template.',
            '**Low perceived value.** The page does not add anything Google cannot already show from other pages.',
            '**Weak internal linking.** The page is linked only from deep, low-priority parts of the site.',
            '**Site-wide quality signals.** On a young or low-authority site Google is more selective about what it keeps.',
            '**Very new content.** Some pages are simply picked up later.'
          ),
        ],
      },
      {
        id: 'fixes',
        heading: 'What to do',
        blocks: [
          ol(
            'Give a new page a little time, usually a week or two, before treating it as a problem.',
            'Improve the page. Add information that is specific, accurate and useful, and make sure it answers what someone searching for it would want.',
            'Link to it from relevant pages that are already indexed, and include it in your XML sitemap.',
            'Consolidate duplicates. Merge near-identical pages, or use redirects or canonical tags so Google has one strong page instead of many weak ones.',
            'Remove or `noindex` pages that have no reason to be in search, so the pages that matter stand out.',
            'Check the technical basics: the canonical points to the page itself and the main content is visible in the rendered HTML.',
            'After a real improvement, request indexing once in URL Inspection.'
          ),
        ],
      },
      {
        id: 'what-not-to-do',
        heading: 'What does not help',
        blocks: [
          ul(
            'Submitting the same URL again and again. Google has already seen it.',
            'Creating more pages that are similar to the one that was left out.',
            'Pointing low-quality links at it. They do not change Google’s opinion of the content.'
          ),
        ],
      },
      {
        id: 'indexmenow',
        heading: 'How IndexMeNow treats this status',
        blocks: [
          p('IndexMeNow reports it as **Crawled, not indexed** and retries the submission up to three times, at least 24 hours apart. Be realistic about it: if Google has already crawled the page and declined it, asking again rarely changes the answer unless the page itself has changed. Improve the page first, then let a retry run. A credit is only used if the page ends up confirmed as indexed.'),
        ],
      },
    ],
    related: ['why-is-my-page-not-indexed', 'discovered-currently-not-indexed', 'url-inspection-tool-explained'],
  },

  {
    slug: 'discovered-currently-not-indexed',
    title: 'Discovered – currently not indexed: why Google has not crawled your page',
    description:
      'Google knows the URL exists but has not crawled it yet. Learn why that happens, how it differs from “URL is unknown to Google”, and how to get the page crawled.',
    summary: 'Google knows the URL but has not crawled it. Why that happens and how to get the page crawled.',
    published: '2026-11-04',
    modified: '2026-11-04',
    intro: [
      '“Discovered – currently not indexed” means Google has found the URL, usually through a sitemap or a link, but has not crawled it yet. Nothing has been judged about the page, because Google has not looked at it.',
      'The usual reason is priority. Google decides how much to crawl on each site, and a page with weak signals can wait a long time.',
    ],
    sections: [
      {
        id: 'meaning',
        heading: 'What it means, and what it does not',
        blocks: [
          p('The status is about crawling, not quality. Compare it with [Crawled – currently not indexed](/guides/crawled-currently-not-indexed), where Google has already read the page and decided against it.'),
          p('It is also different from **URL is unknown to Google**, which means Google has not discovered the URL at all. That is a discovery problem: no links lead to the page and it is not in a sitemap Google has read.'),
        ],
      },
      {
        id: 'why',
        heading: 'Why Google waits',
        blocks: [
          ul(
            '**Crawl priority.** Google spends its crawl effort where it expects the most value. A new or small site, or a page deep in the structure, ranks low.',
            '**A lot of URLs.** Sites that expose thousands of parameter, filter or archive URLs spread the crawling thin.',
            '**Slow or unreliable servers.** If responses are slow or fail now and then, Googlebot backs off.',
            '**Weak signals about the page.** Few internal links and a thin site make a URL look unimportant.'
          ),
        ],
      },
      {
        id: 'fix',
        heading: 'How to get the page crawled',
        blocks: [
          ol(
            'Link to the page from prominent, already indexed pages such as your home page, hub pages and related articles, using descriptive anchor text.',
            'Keep your XML sitemap clean. List only canonical, indexable pages that return 200, and keep `lastmod` accurate. See [how to create and submit a sitemap](/guides/how-to-submit-a-sitemap).',
            'Reduce URL bloat. Stop generating endless parameter, session and faceted URLs, or block the pointless ones.',
            'Improve server speed and stability, and fix recurring 5xx errors.',
            'Raise the value of the site as a whole: fewer thin pages, more pages worth crawling.',
            'Request indexing for the page once, in URL Inspection, after the above.'
          ),
        ],
      },
      {
        id: 'unknown',
        heading: 'If the status is “URL is unknown to Google”',
        blocks: [
          p('Make sure the page is linked from an indexed page and listed in a submitted sitemap. Fetching a page with a crawler, or seeing it once, is not the same as Google knowing about it. Once Google has found it, the status moves to “Discovered” or beyond.'),
        ],
      },
    ],
    related: ['why-is-my-page-not-indexed', 'how-to-submit-a-sitemap', 'url-inspection-tool-explained'],
  },

  {
    slug: 'how-to-check-if-a-url-is-indexed',
    title: 'How to check if a URL is indexed by Google',
    description:
      'Four ways to check whether Google has indexed a page, from the reliable URL Inspection tool to a quick site: search, and what each one can and cannot tell you.',
    summary: 'Four ways to find out whether Google has a page indexed, and which one to trust.',
    published: '2026-11-04',
    modified: '2026-11-04',
    intro: [
      'Before you try to fix an indexing problem you need to know whether there is one. There are several ways to check whether Google has a page in its index. They are not equally reliable.',
    ],
    sections: [
      {
        id: 'url-inspection',
        heading: '1. URL Inspection in Search Console (most reliable)',
        blocks: [
          p('Open Google Search Console, choose your property and paste the full URL into the search bar at the top. The result begins with a verdict: **URL is on Google**, **URL is on Google, but has issues**, or **URL is not on Google**.'),
          p('This is Google’s own record of that exact URL, including when it was last crawled and which URL it chose as the canonical. It only works for properties you have access to. [How to read the results](/guides/url-inspection-tool-explained).'),
        ],
      },
      {
        id: 'page-indexing-report',
        heading: '2. The Page indexing report (many pages at once)',
        blocks: [
          p('Under **Indexing → Pages**, Search Console shows how many URLs are indexed and groups the ones that are not by reason, such as “Crawled – currently not indexed” or “Excluded by ‘noindex’ tag”. Click a reason to see example URLs. It is the best way to spot a pattern across a whole site.'),
        ],
      },
      {
        id: 'site-search',
        heading: '3. A site: search (quick, not authoritative)',
        blocks: [
          p('Search Google for `site:example.com/exact-page-url`. If the page shows up, it is indexed. If it does not, that does not prove it is missing, because `site:` results are incomplete and can lag.'),
          p('Use it for a quick look, not for a decision.'),
        ],
      },
      {
        id: 'exact-search',
        heading: '4. Search for the page title or a distinctive sentence',
        blocks: [
          p('Put a distinctive sentence from the page in quotes, or search for its exact title. A page can be indexed and still not rank for anything you try, so a missing result is only a hint.'),
        ],
      },
      {
        id: 'pitfalls',
        heading: 'Common mistakes',
        blocks: [
          ul(
            '**Indexed is not the same as ranking.** A page can be in the index and still rank on page ten.',
            '**Checking the wrong URL.** `http` versus `https`, `www` versus non-`www`, and trailing slashes are different URLs. Check the canonical one.',
            '**Trusting cached results.** A page removed from the index can still show up for a while.'
          ),
        ],
      },
      {
        id: 'bulk',
        heading: 'Checking many URLs',
        blocks: [
          p('URL Inspection is available through the Search Console API, with a limit of about 2,000 inspections per day for each property. IndexMeNow uses it to follow your submitted pages: it checks first, to avoid spending a credit on a page that is already indexed, then again on a schedule until Search Console confirms the result.'),
        ],
      },
    ],
    related: ['url-inspection-tool-explained', 'why-is-my-page-not-indexed', 'how-to-submit-a-sitemap'],
  },

  {
    slug: 'fix-noindex-and-robots-txt-blocks',
    title: 'How to find and fix noindex tags and robots.txt blocks',
    description:
      'noindex and robots.txt are the two most common ways a page is kept out of Google by accident. Learn how they differ, how to find them and how to fix them.',
    summary: 'The two most common accidental blockers, how they differ, how to find them and how to remove them.',
    published: '2026-11-04',
    modified: '2026-11-04',
    intro: [
      'Two settings cause a large share of “why is my page not in Google?” problems: a `noindex` directive and a `robots.txt` rule. Both are easy to add by accident and easy to miss. They also do different things, and mixing them up can make a problem worse.',
    ],
    sections: [
      {
        id: 'difference',
        heading: 'noindex and robots.txt are not the same thing',
        blocks: [
          ul(
            '**robots.txt** controls **crawling**. A `Disallow` rule asks Googlebot not to fetch the URL.',
            '**noindex** controls **indexing**. Googlebot fetches the page, sees the directive, and leaves the page out of the index.'
          ),
          p('The two interfere with each other. If a page is blocked in `robots.txt`, Google never fetches it and so never sees a `noindex` on it. The URL can even stay in the index, without a description, if other sites link to it. To remove a page from search, **allow** crawling and use `noindex`.'),
        ],
      },
      {
        id: 'find-noindex',
        heading: 'Finding a noindex directive',
        blocks: [
          p('There are three places it can hide:'),
          ol(
            '**A robots meta tag** in the HTML head: `<meta name="robots" content="noindex">`. A `googlebot` meta tag works the same way for Google.',
            '**An X-Robots-Tag HTTP header.** Run `curl -I https://example.com/page` and look for `X-Robots-Tag: noindex`. This also covers PDFs and other files that have no HTML head.',
            '**A CMS or plugin setting.** WordPress has “Discourage search engines from indexing this site” under Settings → Reading, and SEO plugins have a per-page “allow search engines to show this page” switch.'
          ),
          p('In Search Console the result is **Excluded by ‘noindex’ tag**. IndexMeNow’s pre-flight scan reports both the meta tag and the header as a blocker.'),
        ],
      },
      {
        id: 'find-robots',
        heading: 'Finding a robots.txt block',
        blocks: [
          p('Open `https://your-site/robots.txt` and read the rules that apply to Googlebot, or to all crawlers (`User-agent: *`). A line such as `Disallow: /` blocks the whole site, and `Disallow: /blog/` blocks everything under that path.'),
          p('Search Console shows the file Google last fetched in the **robots.txt report** under Settings, and reports affected pages as **Blocked by robots.txt**.'),
        ],
      },
      {
        id: 'fix',
        heading: 'Fixing it',
        blocks: [
          ol(
            'Remove the `noindex` directive or the `Disallow` rule, or narrow it so it no longer covers the page.',
            'Deploy the change and confirm it on the live site, not only in the editor.',
            'In URL Inspection, run **Test live URL**. The result should say crawling and indexing are allowed.',
            'Request indexing once, and give Google time to recrawl.'
          ),
        ],
      },
      {
        id: 'mistakes',
        heading: 'Mistakes that keep happening',
        blocks: [
          ul(
            'Launching with the staging `Disallow: /` still in `robots.txt`.',
            'Setting `noindex` with JavaScript. Google may or may not see it, so use the HTML or the header.',
            'Listing `noindex` pages in your XML sitemap. It sends Google two opposite signals.',
            'Wildcard rules that match more than you meant, such as `Disallow: /*?` blocking every URL with a query string.'
          ),
        ],
      },
    ],
    related: ['why-is-my-page-not-indexed', 'url-inspection-tool-explained', 'how-to-submit-a-sitemap'],
  },

  {
    slug: 'url-inspection-tool-explained',
    title: 'Google Search Console URL Inspection: how to read the results',
    description:
      'What the URL Inspection tool shows, the difference between the indexed version and a live test, and what every common indexing status means and what to do about it.',
    summary: 'What the tool shows, indexed version versus live test, and what each status means.',
    published: '2026-11-04',
    modified: '2026-11-04',
    intro: [
      'The URL Inspection tool in Google Search Console is the closest thing there is to asking Google directly about a single page. It shows what Google has stored, and it can test the live page. Reading it correctly saves a lot of guessing.',
    ],
    sections: [
      {
        id: 'verdicts',
        heading: 'The three verdicts',
        blocks: [
          ul(
            '**URL is on Google.** The page is indexed and can appear in results.',
            '**URL is on Google, but has issues.** It is indexed, but something affects it, such as a problem with structured data or mobile usability.',
            '**URL is not on Google.** The page is not in the index. The reason is shown just below.'
          ),
        ],
      },
      {
        id: 'indexed-vs-live',
        heading: 'Indexed version versus live test',
        blocks: [
          p('By default the tool reports the **indexed version**: what Google saw the last time it crawled the page. That can be days or weeks old. **Test live URL** fetches the page right now and reports whether it could be indexed. The two can disagree, and that is useful: if the live test passes but the indexed version shows a problem, your fix has worked and Google has not recrawled yet.'),
        ],
      },
      {
        id: 'sections',
        heading: 'The fields worth reading',
        blocks: [
          ul(
            '**Discovery.** The sitemaps and referring pages through which Google found the URL.',
            '**Last crawl.** When Googlebot last fetched it, and as which crawler (smartphone or desktop).',
            '**Crawl allowed? / Page fetch.** Whether robots.txt let Googlebot in, and whether the fetch succeeded.',
            '**Indexing allowed?** Whether a `noindex` directive was found.',
            '**User-declared canonical and Google-selected canonical.** If they differ, Google has picked another URL as the main one.'
          ),
        ],
      },
      {
        id: 'states',
        heading: 'Common statuses and what to do',
        blocks: [
          {
            type: 'table',
            headers: ['Status', 'What it means', 'What to do'],
            rows: [
              ['Submitted and indexed', 'Indexed, and listed in a sitemap you submitted.', 'Nothing.'],
              ['Indexed, not submitted in sitemap', 'Indexed, but not in any submitted sitemap.', 'Add it to your sitemap.'],
              ['Crawled – currently not indexed', 'Fetched, but Google chose not to index it.', 'Improve the page. See the [guide](/guides/crawled-currently-not-indexed).'],
              ['Discovered – currently not indexed', 'Known, not crawled yet.', 'Strengthen internal links. See the [guide](/guides/discovered-currently-not-indexed).'],
              ['URL is unknown to Google', 'Google has not found the URL.', 'Link to it and submit a sitemap.'],
              ['Excluded by ‘noindex’ tag', 'A noindex directive was found.', 'Remove it if the page should be indexed.'],
              ['Blocked by robots.txt', 'robots.txt does not let Googlebot fetch it.', 'Change the rule. See the [guide](/guides/fix-noindex-and-robots-txt-blocks).'],
              ['Not found (404)', 'The URL returns 404.', 'Restore the page or leave it out of sitemaps.'],
              ['Page with redirect', 'The URL redirects elsewhere.', 'Index the destination instead.'],
              ['Duplicate, Google chose different canonical', 'Google treats another URL as the main version.', 'Make the pages distinct, or point the canonical correctly.'],
            ],
          },
        ],
      },
      {
        id: 'request-indexing',
        heading: 'What “Request indexing” does',
        blocks: [
          p('It asks Google to put the page in a priority crawl queue. It has a daily limit, it is not a guarantee, and repeating it does not help. Use it once after you fix something real.'),
        ],
      },
    ],
    related: ['how-to-check-if-a-url-is-indexed', 'why-is-my-page-not-indexed', 'fix-noindex-and-robots-txt-blocks'],
  },

  {
    slug: 'how-to-submit-a-sitemap',
    title: 'How to create and submit a sitemap to Google Search Console',
    description:
      'What an XML sitemap should contain, the limits to respect, how to submit it in Google Search Console and how to read the report, plus what a sitemap cannot do.',
    summary: 'What belongs in a sitemap, the limits, how to submit it and how to read the report.',
    published: '2026-11-04',
    modified: '2026-11-04',
    intro: [
      'An XML sitemap is a file that lists the URLs on your site that you want search engines to know about. It helps Google discover pages, especially new ones and ones with few links pointing to them. It does not make Google index them.',
    ],
    sections: [
      {
        id: 'contents',
        heading: 'What belongs in a sitemap',
        blocks: [
          ul(
            'Only **canonical** URLs: the version of each page you want in search.',
            'Only pages that return **200** and can be indexed. Leave out redirects, 404s and `noindex` pages.',
            'The full, absolute URL, with the same protocol and host you use everywhere else.',
            'An accurate `lastmod` date, if you include one. Google uses it only when it has proven reliable, so do not set it to “now” on every build. `changefreq` and `priority` are ignored.'
          ),
        ],
      },
      {
        id: 'limits',
        heading: 'Size limits',
        blocks: [
          p('One sitemap file can hold up to 50,000 URLs or 50 MB uncompressed. For more, split the URLs into several files and list them in a **sitemap index** file, then submit the index.'),
        ],
      },
      {
        id: 'create',
        heading: 'Creating one',
        blocks: [
          p('Most CMSs and frameworks generate a sitemap for you, often at `/sitemap.xml`. If you build it yourself, the format is simple:'),
          p('`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` containing one `<url>` per page, each with a `<loc>` and optionally a `<lastmod>`.'),
        ],
      },
      {
        id: 'submit',
        heading: 'Submitting it',
        blocks: [
          ol(
            'Open Google Search Console and choose your property.',
            'Go to **Indexing → Sitemaps**.',
            'Enter the sitemap’s URL, for example `sitemap.xml`, and press **Submit**.',
            'Also add a line to `robots.txt` so every crawler can find it: `Sitemap: https://example.com/sitemap.xml`.'
          ),
        ],
      },
      {
        id: 'report',
        heading: 'Reading the report',
        blocks: [
          ul(
            '**Success** means Google fetched and parsed the file.',
            '**Couldn’t fetch** means the URL is wrong, blocked or returned an error.',
            '**Discovered URLs** is how many URLs Google found in it. It is not the number indexed. For that, use the Page indexing report.'
          ),
        ],
      },
      {
        id: 'limits-of-sitemaps',
        heading: 'What a sitemap cannot do',
        blocks: [
          p('A sitemap is a hint about what exists. It cannot force indexing, fix a `noindex` tag or a `robots.txt` block, or make a thin page worth indexing. See [why a page is not indexed](/guides/why-is-my-page-not-indexed) for what does decide it.'),
          p('IndexMeNow can import the URLs from a sitemap or a sitemap index, so you can scan them all for indexing problems in one go.'),
        ],
      },
    ],
    related: ['discovered-currently-not-indexed', 'how-to-check-if-a-url-is-indexed', 'why-is-my-page-not-indexed'],
  },
]

export const GUIDE_BY_SLUG = new Map(GUIDES.map((guide) => [guide.slug, guide]))

export function getGuide(slug: string): Guide | undefined {
  return GUIDE_BY_SLUG.get(slug)
}

/** Words of visible text in a guide, for the reading-time estimate. */
export function guideWordCount(guide: Guide): number {
  const text = [
    ...guide.intro,
    ...guide.sections.flatMap((section) => [
      section.heading,
      ...section.blocks.flatMap((block) =>
        block.type === 'p' ? [block.text] : block.type === 'list' ? block.items : [...block.headers, ...block.rows.flat()]
      ),
    ]),
  ].join(' ')
  return text.split(/\s+/).filter(Boolean).length
}

export const readingMinutes = (guide: Guide): number => Math.max(2, Math.round(guideWordCount(guide) / 220))
