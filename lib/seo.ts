import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, absoluteUrl } from "./site";

interface PageMeta {
  /** Page title without the site name (the layout adds " · IndexMeNow") */
  title: string;
  /** 70–160 characters reads best in search results */
  description: string;
  /** Path of the page, starting with "/" */
  path: string;
  /** Use the title exactly as given, without the site name appended (home page) */
  absoluteTitle?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Metadata every public page needs: title, description, canonical URL, Open Graph and Twitter card.
 * The share image is the site-wide generated one (app/opengraph-image.tsx).
 */
export function pageMetadata(page: PageMeta): Metadata {
  const fullTitle = page.absoluteTitle ? page.title : `${page.title} · ${SITE_NAME}`;
  const image = { url: "/opengraph-image", width: 1200, height: 630, alt: `${SITE_NAME}: scan, submit and track URL indexing` };

  return {
    title: page.absoluteTitle ? { absolute: page.title } : page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      type: page.type ?? "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: page.path,
      title: fullTitle,
      description: page.description,
      images: [image],
      ...(page.type === "article"
        ? { publishedTime: page.publishedTime, modifiedTime: page.modifiedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: page.description,
      images: [image.url],
    },
  };
}

export interface Crumb {
  name: string;
  /** Path starting with "/" */
  path: string;
}

/** BreadcrumbList for a page; "Home" is added in front automatically. */
export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function faqJsonLd(items: ReadonlyArray<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon`,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function softwareJsonLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}
