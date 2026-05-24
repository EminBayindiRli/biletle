'use client'

import { useEffect, useRef, useState } from 'react'

type ScanResult = {
  valid: boolean
  reason?: string
  ticket_number?: string
  attendee?: { name: string; email: string } | null
  event_title?: string
  checked_in_at?: string
}

export default function QRScanner({ eventId }: { eventId: string }) {
  const scannerRef = useRef<any>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let stopped = false

    async function startScanner() {
      const { Html5Qrcode } = await import('html5-qrcode')

      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 260, height: 260 },
            aspectRatio: 1.0,
          },
          async (decodedText: string) => {
            if (stopped) return
            stopped = true
            await scanner.pause(true)
            setScanning(false)
            await verifyToken(decodedText)
          },
          () => {}
        )
        if (!stopped) setScanning(true)
      } catch {
        setError('Kamera açılamadı. Lütfen kamera iznini kontrol edin.')
      }
    }

    startScanner()

    return () => {
      stopped = true
      scannerRef.current?.stop().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function verifyToken(token: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/tickets/verify?token=${encodeURIComponent(token)}`)
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ valid: false, reason: 'Sunucuya bağlanılamadı.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleRescan() {
    setResult(null)
    setLoading(false)
    if (scannerRef.current) {
      try {
        await scannerRef.current.resume()
      } catch {
        window.location.reload()
      }
    }
  }

  // Result screen
  if (result) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: result.valid
          ? 'linear-gradient(135deg, #064e3b, #065f46)'
          : 'linear-gradient(135deg, #7f1d1d, #991b1b)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '32px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>
          {result.valid ? '✅' : '❌'}
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-1px', marginBottom: '8px' }}>
          {result.valid ? 'GEÇERLİ BİLET' : 'GEÇERSİZ BİLET'}
        </h2>

        {result.valid ? (
          <div style={{ marginTop: '8px' }}>
            {result.attendee && (
              <div style={{ fontSize: '20px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>{result.attendee.name}</div>
            )}
            {result.attendee && (
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>{result.attendee.email}</div>
            )}
            {result.ticket_number && (
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '8px', fontFamily: 'monospace', letterSpacing: '1px' }}>{result.ticket_number}</div>
            )}
          </div>
        ) : (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)' }}>{result.reason}</div>
            {result.checked_in_at && (
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '8px' }}>
                Giriş yapıldı: {new Date(result.checked_in_at).toLocaleTimeString('tr-TR')}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleRescan}
          style={{
            marginTop: '40px',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: 'white', padding: '14px 40px', borderRadius: '14px',
            fontSize: '16px', fontWeight: 600, cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          Tekrar Tara
        </button>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#0a0a1f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Bilet doğrulanıyor...</div>
        </div>
      </div>
    )
  }

  // Camera view
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000' }}>
      <div id="qr-reader" style={{ width: '100%', height: '100%' }} />

      {/* Error */}
      {error && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#0a0a1f',
        }}>
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📷</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>{error}</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>Tarayıcı ayarlarından kamera iznini açın.</div>
          </div>
        </div>
      )}

      {/* Scan frame overlay */}
      {scanning && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ position: 'relative', width: '256px', height: '256px' }}>
            {/* Corners */}
            {[
              { top: 0, left: 0, borderTop: '3px solid white', borderLeft: '3px solid white', borderRadius: '4px 0 0 0' },
              { top: 0, right: 0, borderTop: '3px solid white', borderRight: '3px solid white', borderRadius: '0 4px 0 0' },
              { bottom: 0, left: 0, borderBottom: '3px solid white', borderLeft: '3px solid white', borderRadius: '0 0 0 4px' },
              { bottom: 0, right: 0, borderBottom: '3px solid white', borderRight: '3px solid white', borderRadius: '0 0 4px 0' },
            ].map((style, i) => (
              <div key={i} style={{ position: 'absolute', width: '32px', height: '32px', ...style }} />
            ))}
          </div>
          <div style={{ marginTop: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
            QR kodu çerçeve içine al
          </div>
        </div>
      )}
    </div>
  )
}
