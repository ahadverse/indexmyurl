'use client'
import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button, ButtonVariant } from '@/components/ui/Button'

/** Copies `value` to the clipboard and shows a tick for a moment. */
export function CopyButton({
  value,
  label = 'Copy',
  variant = 'secondary',
  onCopied,
}: {
  value: string
  label?: string
  variant?: ButtonVariant
  onCopied?: () => void
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(id)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      onCopied?.()
    } catch {
      /* clipboard blocked (insecure origin / permissions): nothing useful to do */
    }
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={copy}
      leftIcon={copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
    >
      {copied ? 'Copied' : label}
    </Button>
  )
}
