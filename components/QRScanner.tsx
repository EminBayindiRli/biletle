'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

type ScanResult = {
  valid: boolean
  reason?: string
  ticket_number?: string
  attendee?: { name: string; email: string } | null
  event_title?: string
  checked_in_at?: string
}

export default function QRScanner({ eventId }: { eventId: string }) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' }, // arka kamera
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        // QR okundu — taramayı durdur
        await scanner.pause()
        setScanning(false)
        await verifyToken(decodedText)
      },
      () => {} // tarama hatalarını görmezden gel
    )
      .then(() => setScanning(true))
      .catch(() => setError('Kamera açılamadı. Lütfen kamera iznini kontrol edin.'))

    return () => {
      scanner.stop().catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function verifyToken(token: string) {
    const res = await fetch(`/api/tickets/verify?token=${encodeURIComponent(token)}`)
    const data = await res.json()
    setResult(data)
  }

  async function handleRescan() {
    setResult(null)
    if (scannerRef.current) {
      await scannerRef.current.resume()
      setScanning(true)
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-900 flex flex-col">

      {/* Kamera alanı */}
      <div className={`flex-1 relative ${result ? 'hidden' : 'block'}`}>
        <div id="qr-reader" className="w-full h-full" />
        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-white rounded-2xl w-64 h-64 opacity-60" />
            <p className="absolute bottom-24 text-white text-sm opacity-75">QR kodu çerçeve içine al</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center px-6">
              <p className="text-4xl mb-4">📷</p>
              <p className="text-white font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Sonuç ekranı */}
      {result && (
        <div className={`flex-1 flex flex-col items-center justify-center px-6 py-12 ${
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
      )}
    </div>
  )
}
