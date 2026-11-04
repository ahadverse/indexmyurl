import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalContact, LegalLayout, LegalList, LegalSection } from '@/components/LegalLayout'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'What IndexMeNow collects, how it uses your Google data, who it shares it with, and how to delete it.',
  path: '/privacy',
})

export default function PrivacyPage() {
  return (
    <LegalLayout
      path="/privacy"
      title="Privacy Policy"
      updated="1 November 2026"
      intro="IndexMeNow scans web pages for indexing problems, asks Google to look at the ones that pass, and checks in Search Console whether they were indexed. This policy explains what information we handle to do that, and the choices you have."
    >
      <LegalSection title="Information we collect">
        <p>
          <strong className="font-medium text-slate-800">Account details.</strong> Your first and last name, email address,
          a salted hash of your password (never the password itself), the API key we generate for you, your credit
          balance, your daily submission count and the time you last signed in.
        </p>
        <p>
          <strong className="font-medium text-slate-800">Google sign-in and connection.</strong> When you sign in with
          Google or connect a Google account, Google gives us your Google account ID, name, email address and profile
          picture, the access and refresh tokens that let us act within the permissions you approved, the list of those
          permissions, and the list of Search Console properties your account owns or has full access to.
        </p>
        <p>
          <strong className="font-medium text-slate-800">URLs and results.</strong> The URLs you submit, what our scan
          found, each submission’s status and error messages, the indexing status Search Console reported, and
          timestamps.
        </p>
        <p>
          <strong className="font-medium text-slate-800">Technical data.</strong> Our servers receive your IP address and
          request details. We use them for security, abuse prevention, rate limiting and debugging, and keep them in
          operational logs.
        </p>
      </LegalSection>

      <LegalSection title="How we use your Google data">
        <p>
          We ask Google for read-only access to Search Console (the{' '}
          <span className="font-mono text-[13px] text-slate-700">webmasters.readonly</span> permission), together with
          your basic profile (name, email address and picture). We use the Search Console access only to:
        </p>
        <LegalList>
          <li>list the sites you can access, so we can confirm you are allowed to submit a URL;</li>
          <li>check whether the pages you submitted have been indexed, using Search Console’s URL Inspection.</li>
        </LegalList>
        <p>
          We never use your Google connection to change anything in your Search Console. We do not use Google data for
          advertising, we do not sell it, and we do not transfer it to others except as needed to provide the service,
          to comply with the law, or with your consent. People at IndexMeNow do not read your Google data unless it is
          needed for security or abuse investigations, to comply with the law, or you ask us to.
        </p>
        <p>
          IndexMeNow’s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            className="font-medium text-brand-600 hover:text-brand-700"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
        <p>
          <strong className="font-medium text-slate-800">Service account instead of Google sign-in.</strong> If you do
          not want to connect your Google account, you can add our service account as a Full user of your property in
          Search Console. We then read indexing status for that property with the service account. Removing it in
          Search Console ends that access.
        </p>
      </LegalSection>

      <LegalSection title="Public helper pages">
        <p>
          To ask Google to crawl a URL, we publish a short public page on our own domain that refers to the URL you
          submitted. While it is active it is public and may be listed in our sitemap and RSS feed and crawled by search
          engines. We deactivate it when the job finishes.
        </p>
        <p>
          When you submit a URL, our servers also request that page, your robots.txt and, if you use sitemap import, your
          sitemap, to scan them.
        </p>
      </LegalSection>

      <LegalSection title="How else we use information">
        <p>
          To run your account and credits, show your results, keep the service secure, prevent abuse, answer support
          requests and fix problems. We do not sell your personal information, and we do not show advertising.
        </p>
      </LegalSection>

      <LegalSection title="Who we share it with">
        <p>We use these providers to run the service. They process data only on our behalf:</p>
        <LegalList>
          <li>
            <strong className="font-medium text-slate-800">Google</strong> — sign-in, Search Console and the indexing
            requests described above.
          </li>
          <li>
            <strong className="font-medium text-slate-800">MongoDB Atlas</strong> — hosts our database.
          </li>
          <li>
            <strong className="font-medium text-slate-800">Vercel</strong> — hosts this web app.
          </li>
          <li>
            <strong className="font-medium text-slate-800">Our server host</strong> — runs the API and background jobs.
          </li>
        </LegalList>
        <p>
          We may also disclose information when the law requires it or to protect the service and its users. Your data
          may be processed in countries other than your own.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and local storage">
        <p>
          We do not use advertising or analytics cookies. To keep you signed in, your browser’s local storage holds your
          sign-in token and basic profile details. Signing out removes them.
        </p>
      </LegalSection>

      <LegalSection title="Keeping and deleting your data">
        <p>
          We keep your account details and job history while your account exists. To delete your account, including its
          jobs and Google connections, contact us at <LegalContact />; we will delete it within a reasonable time. Copies in
          backups are removed as the backups expire.
        </p>
        <p>
          You can disconnect a Google account in Settings → Google, which stops us using it. The stored connection record
          stays until you ask us to delete it or delete your account. You can also revoke our access at any time from your{' '}
          <a
            href="https://myaccount.google.com/permissions"
            className="font-medium text-brand-600 hover:text-brand-700"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google Account permissions
          </a>{' '}
          page.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          We store passwords only as salted hashes, serve the site over HTTPS and limit who can reach our systems. No
          system is perfectly secure, so we cannot guarantee absolute security. Please use a strong, unique password and
          keep your API key private; you can generate a new key on your Profile page.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You can view and update your details on your Profile page, and ask us to correct, export or delete your data
          at <LegalContact />. Depending on where you live, you may have further rights under local law, and we will
          honour them.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>IndexMeNow is not intended for anyone under 16, and we do not knowingly collect their information.</p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          If we change this policy, we will update the date above and, for significant changes, tell you in the app or
          by email. Our <Link href="/terms" className="font-medium text-brand-600 hover:text-brand-700">Terms of Service</Link>{' '}
          also apply to your use of IndexMeNow.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about this policy or requests about your data: <LegalContact />.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
