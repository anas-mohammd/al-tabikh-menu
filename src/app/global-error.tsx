'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, background: '#FBF3E4', color: '#2B1B0E', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
        <div style={{ padding: '2rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</p>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>حدث خطأ غير متوقع</h2>
          <p style={{ color: '#7a6a55', marginBottom: '1.5rem', fontSize: '0.9rem' }}>نعتذر عن الإزعاج، يرجى المحاولة مجدداً</p>
          <button
            onClick={unstable_retry}
            style={{ background: '#2B1B0E', color: '#FBF3E4', border: 'none', borderRadius: '8px', padding: '0.75rem 2rem', fontSize: '1rem', cursor: 'pointer' }}
          >
            حاول مجدداً
          </button>
        </div>
      </body>
    </html>
  )
}
