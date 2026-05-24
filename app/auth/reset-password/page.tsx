'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.')
      return
    }
    if (password !== confirm) {
      setError('Şifreler eşleşmiyor.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Şifre güncellenemedi. Linkin süresi dolmuş olabilir.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
    padding: '11px 14px', fontSize: '14px', fontFamily: 'Inter, -apple-system, sans-serif',
    color: 'white', outline: 'none', background: 'rgba(255,255,255,0.06)',
    boxSizing: 'border-box',
  }

  const pageWrapper: React.CSSProperties = {
    minHeight: '100vh', background: '#07071a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px',
    backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(79,70,229,0.2), transparent)',
  }

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px', width: '100%', maxWidth: '400px',
    padding: '40px', backdropFilter: 'blur(20px)',
    boxShadow: '0 0 60px rgba(79,70,229,0.1)',
  }

  if (!ready) {
    return (
      <div style={pageWrapper}>
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>Link doğrulanıyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={pageWrapper}>
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#818cf8', letterSpacing: '-1px', marginBottom: '6px' }}>biletle.</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>Yeni şifre belirle</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: '6px', letterSpacing: '0.5px' }}>
              YENİ ŞİFRE
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="En az 6 karakter"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: '6px', letterSpacing: '0.5px' }}>
              ŞİFRE TEKRAR
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Aynı şifreyi tekrar gir"
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
            {loading ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>
    </div>
  )
}
