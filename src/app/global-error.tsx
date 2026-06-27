'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[global-error] uncaught:', error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem', padding: '0 1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Something went wrong!
            </h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              An unexpected error occurred.
            </p>
            {error?.message && (
              <pre style={{ textAlign: 'left', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '0.5rem', padding: '1rem', overflow: 'auto', fontSize: '0.75rem', color: '#c00', marginBottom: '1.5rem' }}>
                {error.message}
              </pre>
            )}
            {error?.digest && (
              <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '1.5rem' }}>
                digest: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{ padding: '0.5rem 1.5rem', background: '#0284c7', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
