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
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>Siparişiniz oluşturuluyor...</div>
      </div>
    )
  }

  if (step === 'redirect') {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>💳</div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>Ödeme sayfasına yönlendiriliyorsunuz...</div>
        <div style={{ fontSize: '13px', color: '#9ca3af' }}>Ödeme sonrası QR kodlu biletiniz e-postanıza gelecek.</div>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '8px',
    padding: '10px 12px', fontSize: '13px', fontFamily: 'Inter, -apple-system, sans-serif',
    color: '#111827', outline: 'none', marginBottom: '12px',
    background: '#f9fafb', boxSizing: 'border-box',
    transition: 'all 0.15s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700, color: '#6b7280',
    marginBottom: '5px', letterSpacing: '0.5px',
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label style={labelStyle}>AD SOYAD *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Adınız Soyadınız"
          required
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>E-POSTA *</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="ornek@gmail.com"
          required
          style={inputStyle}
        />
        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '-8px', marginBottom: '12px' }}>
          Biletiniz bu adrese gönderilecek.
        </div>
      </div>

      <div>
        <label style={labelStyle}>TELEFON</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="05xx xxx xx xx"
          style={inputStyle}
        />
      </div>

      {/* Total row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 0', borderTop: '1.5px dashed #e5e7eb', borderBottom: '1.5px dashed #e5e7eb',
        margin: '4px 0 14px',
      }}>
        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>1 bilet toplamı</span>
        <span style={{ fontSize: '20px', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
          {ticketPrice === 0 ? <span style={{ color: '#10b981' }}>Ücretsiz</span> : `${ticketPrice.toLocaleString('tr-TR')} TL`}
        </span>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
          padding: '10px 12px', fontSize: '13px', color: '#dc2626', marginBottom: '12px',
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        style={{
          width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
          background: '#4f46e5', color: 'white', fontSize: '14px', fontWeight: 700,
          fontFamily: 'Inter, -apple-system, sans-serif', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
        }}
      >
        {ticketPrice === 0 ? '🎫 Ücretsiz Bilet Al' : '🎫 Hemen Bilet Al'}
      </button>

      {/* Payment & rules */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '12px' }}>
          {['VISA', 'MC', 'TROY', '🍎 Pay'].map(p => (
            <span key={p} style={{
              fontSize: '10px', fontWeight: 700, color: '#6b7280',
              background: '#f3f4f6', borderRadius: '4px', padding: '3px 8px',
            }}>
              {p}
            </span>
          ))}
        </div>
        <div style={{ paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
          {['🔒 Güvenli ödeme · Shopier', '📧 QR kod e-posta ile gönderilir', '↩️ İade yapılmaz'].map(r => (
            <div key={r} style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {r}
            </div>
          ))}
        </div>
      </div>
    </form>
  )
}
