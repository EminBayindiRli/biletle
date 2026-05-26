'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    starts_at: '',
    ends_at: '',
    capacity: '',
    ticket_price: '',
    shopier_link: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  async function handleSubmit(e: React.FormEvent, status: 'draft' | 'active') {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Oturum bulunamadı.'); setLoading(false); return }

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!org) { setError('Organizasyon bulunamadı.'); setLoading(false); return }

    const slug = `${toSlug(form.title)}-${Date.now()}`

    const { data: event, error: insertError } = await supabase
      .from('events')
      .insert({
        org_id: org.id,
        title: form.title,
        slug,
        description: form.description || null,
        location: form.location || null,
        starts_at: form.starts_at,
        ends_at: form.ends_at || null,
        capacity: parseInt(form.capacity),
        ticket_price: parseFloat(form.ticket_price),
        shopier_link: form.shopier_link || null,
        status,
      })
      .select()
      .single()

    if (insertError) {
      setError('Hata: ' + insertError.message)
      setLoading(false)
      return
    }

    router.push(`/dashboard/events/${event.id}`)
  }

  const surface = 'rgba(255,255,255,0.04)'
  const border = '1px solid rgba(255,255,255,0.08)'

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
    padding: '10px 13px', fontSize: '13px', fontFamily: 'Inter, -apple-system, sans-serif',
    color: 'white', outline: 'none', background: 'rgba(255,255,255,0.06)',
    boxSizing: 'border-box', colorScheme: 'dark',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: 'rgba(255,255,255,0.4)', marginBottom: '6px', letterSpacing: '0.5px',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07071a' }}>
      {/* Topbar */}
      <div style={{
        background: 'rgba(14,14,36,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 32px', height: '60px',
        display: 'flex', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div>
          <Link href="/dashboard/events" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            ← Etkinlikler
          </Link>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginTop: '1px' }}>
            Yeni Etkinlik
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: '680px' }}>
        <div style={{ background: surface, border, borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div>
            <label style={labelStyle}>ETKİNLİK ADI *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="ör. Underground Parti – Haziran 2025"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>AÇIKLAMA</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Etkinlik hakkında kısa bir açıklama..."
              rows={3}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
            />
          </div>

          <div>
            <label style={labelStyle}>KONUM</label>
            <input
              type="text"
              value={form.location}
              onChange={e => set('location', e.target.value)}
              placeholder="ör. Alsancak, İzmir"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>BAŞLANGIÇ *</label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={e => set('starts_at', e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>BİTİŞ</label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={e => set('ends_at', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>KAPASİTE *</label>
              <input
                type="number"
                value={form.capacity}
                onChange={e => set('capacity', e.target.value)}
                placeholder="ör. 100"
                min="1"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>BİLET FİYATI (TL) *</label>
              <input
                type="number"
                value={form.ticket_price}
                onChange={e => set('ticket_price', e.target.value)}
                placeholder="ör. 150"
                min="0"
                step="0.01"
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>SHOPİER ÖDEME LİNKİ</label>
            <input
              type="url"
              value={form.shopier_link}
              onChange={e => set('shopier_link', e.target.value)}
              placeholder="https://www.shopier.com/..."
              style={inputStyle}
            />
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '5px' }}>
              Shopier'den etkinlik için oluşturduğun ürün linki
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px', padding: '10px 13px',
              fontSize: '13px', color: '#f87171',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={e => handleSubmit(e as any, 'draft')}
              disabled={loading}
              style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.12)', background: 'transparent',
                color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600,
                fontFamily: 'Inter, -apple-system, sans-serif', cursor: 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              Taslak Kaydet
            </button>
            <button
              type="button"
              onClick={e => handleSubmit(e as any, 'active')}
              disabled={loading}
              style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                border: 'none', background: '#4f46e5',
                color: 'white', fontSize: '13px', fontWeight: 700,
                fontFamily: 'Inter, -apple-system, sans-serif', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Kaydediliyor...' : '🚀 Yayınla'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
