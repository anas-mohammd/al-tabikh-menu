'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function Error({
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
    <div style={{ minHeight: '100vh', background: '#FBF3E4', color: '#2B1B0E', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }} dir="rtl">
      <div style={{ padding: '2rem' }}>
        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</p>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>تعذّر تحميل الصفحة</h2>
        <p style={{ color: '#7a6a55', marginBottom: '1.5rem', fontSize: '0.9rem' }}>نعتذر عن الإزعاج، يرجى المحاولة مجدداً</p>
        <button
          onClick={unstable_retry}
          style={{ background: '#2B1B0E', color: '#FBF3E4', border: 'none', borderRadius: '8px', padding: '0.75rem 2rem', fontSize: '1rem', cursor: 'pointer' }}
        >
          حاول مجدداً
        </button>
      </div>
    </div>
  )
}
