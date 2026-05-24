'use client'

import { useState } from 'react'

type Props = {
  eventId: string
  ticketPrice: number
  shopierLink: string | null
  maxCapacity: number
}

export default function TicketForm({ eventId, ticketPrice, shopierLink }: Props) {
  const [step, setStep] = useState<'form' | 'loading' | 'redirect'>('form')
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStep('loading')
    setError('')

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: eventId,
        buyer_name: name,
        buyer_email: email,
        buyer_phone: phone || null,
        quantity: 1,
        attendees_data: [{ name, email }],
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Bir hata oluştu.')
      setStep('form')
      return
    }

    // Ücretsiz etkinlik veya otomatik onay → direkt başarı sayfası
    if (data.auto_approved || !shopierLink || ticketPrice === 0) {
      window.location.href = `/order/success?order_id=${data.order_id}&free=1`
      return
    }

    setStep('redirect')
    sessionStorage.setItem('biletle_order_id', data.order_id)
    sessionStorage.setItem('biletle_buyer_email', email)
    window.location.href = shopierLink
  }

  if (step === 'loading') {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin text-3xl mb-3">⏳</div>
        <p className="text-gray-500 text-sm">Siparişiniz oluşturuluyor...</p>
      </div>
    )
  }

  if (step === 'redirect') {
    return (
      <div className="py-8 text-center">
        <div className="text-3xl mb-3">💳</div>
        <p className="font-medium text-gray-800">Ödeme sayfasına yönlendiriliyorsunuz...</p>
        <p className="text-sm text-gray-500 mt-1">Ödeme sonrası QR kodlu biletiniz e-postanıza gelecek.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Adınız Soyadınız"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="ornek@gmail.com"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-xs text-gray-400 mt-1">Biletiniz bu adrese gönderilecek.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="05xx xxx xx xx"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Fiyat */}
      <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
        <span className="text-sm text-gray-600">1 bilet</span>
        {ticketPrice === 0 ? (
          <span className="font-bold text-teal-600 text-lg">Ücretsiz</span>
        ) : (
          <span className="font-bold text-gray-900 text-lg">{ticketPrice.toLocaleString('tr-TR')} TL</span>
        )}
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm"
      >
        {ticketPrice === 0 ? 'Ücretsiz Bilet Al →' : 'Devam Et → Ödeme Yap'}
      </button>

      {ticketPrice > 0 && (
        <p className="text-xs text-center text-gray-400">
          Ödeme Shopier altyapısı ile güvenli şekilde işlenir.
        </p>
      )}
    </form>
  )
}
