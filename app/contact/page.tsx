import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Mail } from 'lucide-react'
import { PageHero, PageShell } from '@/components/marketing/PageShell'
import { pageMetadata } from '@/lib/seo'
import { CONTACT_EMAIL } from '@/lib/site'

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description: 'Get in touch with IndexMeNow about your account, credits, a problem with a submission or a data request.',
  path: '/contact',
})

/** Exists only when NEXT_PUBLIC_CONTACT_EMAIL is set: a contact page with no way to contact anyone would only frustrate people. */
export default function ContactPage() {
  if (!CONTACT_EMAIL) notFound()

  return (
    <PageShell path="/contact" crumbs={[{ name: 'Contact', path: '/contact' }]}>
      <PageHero eyebrow="Contact" title="Get in touch" intro="Questions about your account, credits, a submission that looks wrong, or your data? Write to us." />

      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="mt-10 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-shadow hover:shadow-pop"
      >
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Mail className="h-5 w-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm text-slate-500">Email</span>
          <span className="block text-lg font-semibold text-slate-900">{CONTACT_EMAIL}</span>
        </span>
      </a>

      <p className="mt-6 text-[15px] leading-relaxed text-slate-600">
        To help us answer faster, include the email address of your account and, for a submission, the URL and the time you submitted it.
      </p>
    </PageShell>
  )
}
