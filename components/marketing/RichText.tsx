import Link from 'next/link'

// **bold**, `code` and [label](href): the only inline formatting the content files use
const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g

/**
 * Renders a string with a little inline formatting as React nodes (never as raw HTML), so content
 * kept as plain strings can still carry bold text, code and links.
 */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          )
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-800">
              {part.slice(1, -1)}
            </code>
          )
        }
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
        if (link) {
          const [, label, href] = link
          const cls = 'font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700'
          return href.startsWith('/') || href.startsWith('#') ? (
            <Link key={i} href={href} className={cls}>
              {label}
            </Link>
          ) : (
            <a key={i} href={href} className={cls} rel="noopener noreferrer" target="_blank">
              {label}
            </a>
          )
        }
        return part
      })}
    </>
  )
}
