'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-posta veya şifre hatalı.')
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
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
            Organizatör paneline giriş yap
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px', overflow: 'hidden', backdropFilter: 'blur(20px)',
        }}>
          {/* Tab indicator */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex' }}>
            <div style={{
              flex: 1, padding: '14px', textAlign: 'center', fontSize: '13px', fontWeight: 600,
              color: 'white', borderBottom: '2px solid #4f46e5', marginBottom: '-1px',
            }}>
              Giriş Yap
            </div>
            <Link href="/auth/register" style={{
              flex: 1, padding: '14px', textAlign: 'center', fontSize: '13px', fontWeight: 600,
              color: 'rgba(255,255,255,0.35)', textDecoration: 'none', display: 'block',
            }}>
              Kayıt Ol
            </Link>
          </div>

          <form onSubmit={handleLogin} style={{ padding: '28px' }}>
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

            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.5px' }}>
                  ŞİFRE
                </label>
                <Link href="/auth/forgot-password" style={{ fontSize: '12px', color: '#818cf8', textDecoration: 'none' }}>
                  Şifremi unuttum
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                marginBottom: '16px', marginTop: '8px',
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
                opacity: loading ? 0.7 : 1, marginTop: '16px',
                boxShadow: '0 4px 16px rgba(79,70,229,0.3)',
              }}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginTop: '20px' }}>
              Hesabın yok mu?{' '}
              <Link href="/auth/register" style={{ color: '#818cf8', textDecoration: 'none' }}>
                Kayıt ol
              </Link>
            </p>
          </form>
        </div>
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
