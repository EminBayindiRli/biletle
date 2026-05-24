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
      // html5-qrcode sadece client-side çalışır
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
          () => {} // tarama hatalarını görmezden gel
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
        scannerRef.current = scannerRef.current
      } catch {
        // resume başarısız olursa scanner'ı yeniden başlat
        window.location.reload()
      }
    }
  }

  // Sonuç ekranı
  if (result) {
    return (
      <div className={`fixed inset-0 flex flex-col items-center justify-center px-6 ${
        result.valid ? 'bg-teal-600' : 'bg-red-600'
      }`}>
        <div className="text-center">
          <p className="text-8xl mb-6">{result.valid ? '✅' : '❌'}</p>

          <h2 className="text-3xl font-bold text-white mb-2">
            {result.valid ? 'GEÇERLİ BİLET' : 'GEÇERSİZ BİLET'}
          </h2>

          {result.valid ? (
            <div className="mt-4 space-y-1">
              {result.attendee && (
                <p className="text-white text-xl font-medium">{result.attendee.name}</p>
              )}
              {result.attendee && (
                <p className="text-teal-100 text-sm">{result.attendee.email}</p>
              )}
              {result.ticket_number && (
                <p className="text-teal-200 text-sm mt-2 font-mono">{result.ticket_number}</p>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-red-100 text-lg">{result.reason}</p>
              {result.checked_in_at && (
                <p className="text-red-200 text-sm mt-2">
                  Giriş yapıldı: {new Date(result.checked_in_at).toLocaleTimeString('tr-TR')}
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleRescan}
            className="mt-10 bg-white bg-opacity-20 text-white border border-white border-opacity-40 px-8 py-3 rounded-xl font-medium text-lg hover:bg-opacity-30 transition-colors"
          >
            Tekrar Tara
          </button>
        </div>
      </div>
    )
  }

  // Yükleme
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-3">⏳</div>
          <p className="text-white text-sm">Bilet doğrulanıyor...</p>
        </div>
      </div>
    )
  }

  // Kamera ekranı
  return (
    <div className="fixed inset-0 bg-black">
      {/* html5-qrcode buraya kamerayı render eder */}
      <div
        id="qr-reader"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Hata */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center px-6">
            <p className="text-4xl mb-4">📷</p>
            <p className="text-white font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Tarama çerçevesi */}
      {scanning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Köşeler */}
          <div className="relative w-64 h-64">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
            {/* Tarama çizgisi animasyonu */}
            <div className="absolute left-0 right-0 h-0.5 bg-indigo-400 opacity-80 animate-scan" />
          </div>
          <p className="absolute bottom-28 text-white text-sm opacity-75">QR kodu çerçeve içine al</p>
        </div>
      )}
    </div>
  )
}
