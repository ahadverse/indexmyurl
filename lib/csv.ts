/** One CSV cell: quoted when needed, and guarded against spreadsheet formula injection. */
function cell(value: unknown): string {
  let s = value === null || value === undefined ? '' : String(value)
  // a URL or text starting with = + - @ would be run as a formula by Excel / Sheets
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(header: string[], rows: unknown[][]): string {
  return [header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n')
}

export function downloadCsv(filename: string, csv: string): void {
  // the BOM makes Excel read the file as UTF-8
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
