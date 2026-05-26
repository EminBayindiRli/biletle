'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const isFree = searchParams.get('free') === '1'

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '24px', maxWidth: '440px', width: '100%',
      padding: '40px', textAlign: 'center',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 0 60px rgba(79,70,229,0.1)',
    }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        background: isFree ? 'rgba(52,211,153,0.12)' : 'rgba(79,70,229,0.12)',
        border: isFree ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(79,70,229,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', fontSize: '28px',
      }}>
        🎉
      </div>

      {isFree ? (
        <>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-1px', marginBottom: '10px' }}>
            Biletiniz Hazır!
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: '24px' }}>
            QR kodlu biletiniz e-posta adresinize gönderildi.
            Birkaç dakika içinde gelmezse spam klasörünüzü kontrol edin.
          </p>
          <div style={{
            background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)',
            borderRadius: '14px', padding: '16px', marginBottom: '24px', textAlign: 'left',
          }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#34d399', marginBottom: '6px' }}>✅ Biletiniz Gönderildi</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
              E-postanızdaki QR kodu etkinlik girişinde göstermeniz yeterli.
            </div>
          </div>
        </>
      ) : (
        <>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-1px', marginBottom: '10px' }}>
            Ödeme Alındı!
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: '24px' }}>
            Ödemeniz başarıyla tamamlandı. Siparişiniz inceleniyor,
            biletiniz kısa süre içinde e-posta adresinize gönderilecek.
          </p>
          <div style={{
            background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)',
            borderRadius: '14px', padding: '16px', marginBottom: '24px', textAlign: 'left',
          }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fbbf24', marginBottom: '6px' }}>📬 Biletiniz Ne Zaman Gelir?</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
              Siparişler organizatör tarafından onaylandıktan sonra QR kodlu biletiniz
              e-posta adresinize gönderilir. Bu işlem genellikle birkaç saat sürer.
            </div>
          </div>
        </>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
          Spam klasörünüzü de kontrol etmeyi unutmayın.
        </div>
        <Link
          href="/"
          style={{ fontSize: '13px', color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}
        >
          biletle ana sayfasına dön →
        </Link>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#07071a',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(79,70,229,0.15), transparent)',
      position: 'relative',
    }}>
      <Suspense fallback={
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)' }}>Yükleniyor...</div>
      }>
        <SuccessContent />
      </Suspense>
      <div style={{ position: 'absolute', bottom: '16px', textAlign: 'center' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)' }}>
          biletle,{' '}
          <a href="https://codeb.tech" target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgba(129,140,248,0.4)', textDecoration: 'none' }}>Codeb.tech</a>
          {' '}ürünüdür
        </span>
      </div>
    </div>
  )
}
