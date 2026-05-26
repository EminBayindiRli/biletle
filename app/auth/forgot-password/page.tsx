'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError('Bir hata oluştu. E-posta adresinizi kontrol edin.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
    padding: '11px 14px', fontSize: '14px', fontFamily: 'Inter, -apple-system, sans-serif',
    color: 'white', outline: 'none', background: 'rgba(255,255,255,0.06)',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#07071a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(79,70,229,0.2), transparent)',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px', width: '100%', maxWidth: '400px',
        padding: '40px', backdropFilter: 'blur(20px)',
        boxShadow: '0 0 60px rgba(79,70,229,0.1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#818cf8', letterSpacing: '-1px', marginBottom: '6px' }}>biletle.</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>Şifre sıfırlama</div>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: '24px',
            }}>
              📬
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>E-posta Gönderildi</div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: '24px' }}>
              <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{email}</strong> adresine şifre sıfırlama linki gönderdik.
              Spam klasörünü de kontrol et.
            </p>
            <Link href="/auth/login" style={{ fontSize: '13px', color: '#818cf8', textDecoration: 'none' }}>
              ← Giriş sayfasına dön
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: '6px', letterSpacing: '0.5px' }}>
                E-POSTA
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="sen@ornek.com"
                required
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '8px', padding: '10px 12px',
                fontSize: '13px', color: '#f87171',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
                background: '#4f46e5', color: 'white', fontSize: '14px', fontWeight: 600,
                fontFamily: 'Inter, -apple-system, sans-serif', cursor: 'pointer',
                opacity: loading ? 0.6 : 1,
                boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
              }}
            >
              {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <Link href="/auth/login" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
                ← Giriş sayfasına dön
              </Link>
            </div>
          </form>
        )}
      </div>
      <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, textAlign: 'center' }}>
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
