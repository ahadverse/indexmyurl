import { ImageResponse } from 'next/og'

// Share image for link previews (Open Graph and Twitter), drawn on request and then cached
export const alt = 'IndexMeNow: scan, submit and track URL indexing'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
// Edge runtime: rendered on request (and cached), and it avoids a font-path bug in the Node build of next/og on Windows
export const runtime = 'edge'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          color: '#ffffff',
          background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 55%, #6d28d9 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m20 20-4.8-4.8" />
            </svg>
          </div>
          <div style={{ fontSize: 38, fontWeight: 700 }}>IndexMeNow</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            Know your pages can be indexed before you submit them.
          </div>
          <div style={{ fontSize: 34, color: '#c7d2fe' }}>Scan. Submit what passes. Pay only when Search Console confirms it.</div>
        </div>
      </div>
    ),
    size
  )
}
