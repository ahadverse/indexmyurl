import { ImageResponse } from 'next/og'

// Favicon, drawn on request and then cached: the same indigo-to-violet square as the logo, with a magnifier
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'
// Edge runtime: rendered on request (and cached), and it avoids a font-path bug in the Node build of next/og on Windows
export const runtime = 'edge'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 14,
          background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
        }}
      >
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m20 20-4.8-4.8" />
        </svg>
      </div>
    ),
    size
  )
}
