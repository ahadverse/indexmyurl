import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalContact, LegalLayout, LegalList, LegalSection } from '@/components/LegalLayout'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service',
  description:
    'The rules for using IndexMeNow: accounts, credits, acceptable use, and what we can and cannot promise about Google indexing.',
  path: '/terms',
})

export default function TermsPage() {
  return (
    <LegalLayout
      path="/terms"
      title="Terms of Service"
      updated="1 November 2026"
      intro="These terms govern your use of IndexMeNow. By creating an account or using the service you agree to them. If you do not agree, please do not use it."
    >
      <LegalSection title="The service">
        <p>
          IndexMeNow scans the URLs you give it for problems that keep pages out of Google, sends the ones that pass to
          Google, and tracks their status in Search Console. We are not affiliated with or endorsed by Google.
        </p>
        <p>
          <strong className="font-medium text-slate-800">Indexing is never guaranteed.</strong> Google alone decides
          what it crawls and indexes, and when. We remove avoidable blockers and ask Google to look at your pages, but we
          cannot promise any page will be indexed, how fast, or that it will stay indexed or rank.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <LegalList>
          <li>You must be at least 16 and give accurate information.</li>
          <li>You are responsible for your password, your API key and everything done with them. Tell us if you think they were misused.</li>
          <li>One person or business per account. Do not share access or resell the service without our written permission.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Search Console access and your URLs">
        <p>
          To submit a URL you must have Search Console access to its site: connect your Google account, or add our
          service account as a Full user of the property. Only submit URLs of sites you own or are authorised to manage.
        </p>
        <p>
          You allow our servers to request the URLs, robots.txt files and sitemaps you submit, and you allow us to
          publish a public helper page on our domain that refers to each submitted URL (see our{' '}
          <Link href="/privacy" className="font-medium text-brand-600 hover:text-brand-700">
            Privacy Policy
          </Link>
          ).
        </p>
      </LegalSection>

      <LegalSection title="Credits">
        <LegalList>
          <li>New accounts start with free credits.</li>
          <li>A credit is reserved when you submit a URL and used only when Search Console confirms the page is indexed.</li>
          <li>If the page is not indexed after our retries, or the submission fails, the reserved credit is returned to you.</li>
          <li>Credits are part of the service. They have no cash value and cannot be transferred.</li>
          <li>To keep the service fair and within Google’s limits, we may apply daily caps, rate limits and queues.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree not to:</p>
        <LegalList>
          <li>submit URLs that are illegal, deceptive, malicious, infringing, or that host spam, phishing or malware;</li>
          <li>submit sites you have no right to manage, or try to get around the Search Console requirement;</li>
          <li>exceed or evade our limits, overload the service, or probe it for weaknesses without our permission;</li>
          <li>use the service or API in a way that could get our Google access limited or revoked;</li>
          <li>use the service to harass anyone or to break the law.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Google and other third parties">
        <p>
          IndexMeNow depends on Google. Google may change, limit or stop the features we rely on, including the way
          indexing requests are handled, at any time and without notice, and that may change or end parts of our service.
          Your use of your Google account remains subject to Google’s own terms.
        </p>
      </LegalSection>

      <LegalSection title="Availability and changes">
        <p>
          We work to keep the service running but do not promise it will be uninterrupted or error-free. We may change,
          suspend or discontinue features, and we may update these terms. If we make a significant change we will tell
          you in the app or by email, and continuing to use the service afterwards means you accept the new terms.
        </p>
      </LegalSection>

      <LegalSection title="Suspension and ending your account">
        <p>
          You can stop using IndexMeNow at any time and ask us to delete your account. We may suspend or close accounts
          that break these terms or put the service or other users at risk. Sections that by their nature should
          continue, such as the disclaimers and limits below, continue after your account ends.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer">
        <p>
          The service is provided “as is” and “as available”, without warranties of any kind, to the extent the law
          allows. We do not warrant that pages will be indexed, ranked or visible in search results, or that scan
          results will be complete.
        </p>
      </LegalSection>

      <LegalSection title="Limit of liability">
        <p>
          To the extent the law allows, IndexMeNow is not liable for indirect, incidental or consequential damages, or
          for lost traffic, rankings, revenue or profit, including when pages are not indexed or are removed from the
          index. Nothing in these terms limits liability that cannot be limited by law.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about these terms: <LegalContact />.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
