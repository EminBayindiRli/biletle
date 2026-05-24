'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const isFree = searchParams.get('free') === '1'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 max-w-md w-full p-8 text-center">
      <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">🎉</span>
      </div>

      {isFree ? (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Biletiniz Hazır!</h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            QR kodlu biletiniz e-posta adresinize gönderildi.
            Birkaç dakika içinde gelmezse spam klasörünüzü kontrol edin.
          </p>
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-teal-800 mb-1">✅ Biletiniz Gönderildi</p>
            <p className="text-xs text-teal-700 leading-relaxed">
              E-postanızdaki QR kodu etkinlik girişinde göstermeniz yeterli.
            </p>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Alındı!</h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Ödemeniz başarıyla tamamlandı. Siparişiniz inceleniyor,
            biletiniz kısa süre içinde e-posta adresinize gönderilecek.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-amber-800 mb-1">📬 Biletiniz Ne Zaman Gelir?</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Siparişler organizatör tarafından onaylandıktan sonra QR kodlu biletiniz
              e-posta adresinize gönderilir. Bu işlem genellikle birkaç saat sürer.
            </p>
          </div>
        </>
      )}

      <div className="space-y-2">
        <p className="text-xs text-gray-400">
          Spam klasörünüzü de kontrol etmeyi unutmayın.
        </p>
        <Link
          href="/"
          className="inline-block text-sm text-indigo-600 hover:underline"
        >
          biletle.shop ana sayfasına dön
        </Link>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-center text-gray-400">Yükleniyor...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
