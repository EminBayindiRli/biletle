'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const slug = name
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      const { error: orgError } = await supabase.from('organizations').insert({
        user_id: data.user.id,
        name,
        slug: `${slug}-${Date.now()}`,
        email,
      })

      if (orgError) {
        setError('Organizasyon oluşturulamadı: ' + orgError.message)
        setLoading(false)
        return
      }
    }

    window.location.href = '/pending-approval'
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#07071a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px', position: 'relative', overflow: 'hidden',
      fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      {/* Gradient bg */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(79,70,229,0.18) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-1.5px' }}>
            biletle<span style={{ color: '#818cf8' }}>.</span>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
            Ücretsiz hesap oluştur
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px', overflow: 'hidden', backdropFilter: 'blur(20px)',
        }}>
          {/* Tabs */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex' }}>
            <Link href="/auth/login" style={{
              flex: 1, padding: '14px', textAlign: 'center', fontSize: '13px', fontWeight: 600,
              color: 'rgba(255,255,255,0.35)', textDecoration: 'none', display: 'block',
            }}>
              Giriş Yap
            </Link>
            <div style={{
              flex: 1, padding: '14px', textAlign: 'center', fontSize: '13px', fontWeight: 600,
              color: 'white', borderBottom: '2px solid #4f46e5', marginBottom: '-1px',
            }}>
              Kayıt Ol
            </div>
          </div>

          <form onSubmit={handleRegister} style={{ padding: '28px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '6px', letterSpacing: '0.5px' }}>
                ORGANİZASYON ADI
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Etkinlik Ajansı / Adınız"
                required
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px',
                  padding: '11px 14px', color: 'white', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'Inter, -apple-system, sans-serif',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '6px', letterSpacing: '0.5px' }}>
                E-POSTA
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@gmail.com"
                required
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px',
                  padding: '11px 14px', color: 'white', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'Inter, -apple-system, sans-serif',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '6px', letterSpacing: '0.5px' }}>
                ŞİFRE
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 6 karakter"
                required
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px',
                  padding: '11px 14px', color: 'white', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'Inter, -apple-system, sans-serif',
                }}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#fca5a5',
                marginBottom: '16px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: '8px', border: 'none',
                background: '#4f46e5', color: 'white', fontSize: '14px', fontWeight: 700,
                fontFamily: 'Inter, -apple-system, sans-serif', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 16px rgba(79,70,229,0.3)',
              }}
            >
              {loading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
            </button>

            {/* Manuel onay notu */}
            <div style={{
              background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.15)',
              borderRadius: '8px', padding: '12px', marginTop: '16px',
              fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6,
            }}>
              <strong style={{ color: 'rgba(255,255,255,0.65)' }}>⏳ Manuel onay gerekiyor.</strong><br />
              Hesabınız oluşturulacak, admin onayından sonra erişim sağlanacak.
            </div>

            <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginTop: '20px' }}>
              Zaten hesabın var mı?{' '}
              <Link href="/auth/login" style={{ color: '#818cf8', textDecoration: 'none' }}>
                Giriş yap
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
