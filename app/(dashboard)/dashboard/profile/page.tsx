'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    iban: '',
    shopier_url: '',
  })
  const [orgId, setOrgId] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (org) {
        setOrgId(org.id)
        setForm({
          name: org.name ?? '',
          email: org.email ?? '',
          phone: org.phone ?? '',
          iban: org.iban ?? '',
          shopier_url: org.shopier_url ?? '',
        })
      }
    }
    load()
  }, [])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSaved(false)

    await supabase
      .from('organizations')
      .update({
        name: form.name,
        phone: form.phone || null,
        iban: form.iban || null,
        shopier_url: form.shopier_url || null,
      })
      .eq('id', orgId)

    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const surface = 'rgba(255,255,255,0.04)'
  const border = '1px solid rgba(255,255,255,0.08)'

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
    padding: '10px 13px', fontSize: '13px', fontFamily: 'Inter, -apple-system, sans-serif',
    color: 'white', outline: 'none', background: 'rgba(255,255,255,0.06)',
    boxSizing: 'border-box',
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
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>⚙️ Ayarlar</span>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: '580px' }}>
        <form onSubmit={handleSave} style={{ background: surface, border, borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div>
            <label style={labelStyle}>ORGANİZASYON / İSİM</label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>E-POSTA</label>
            <input
              type="email"
              value={form.email}
              disabled
              style={{
                ...inputStyle,
                background: 'rgba(255,255,255,0.03)',
                color: 'rgba(255,255,255,0.3)',
                cursor: 'not-allowed',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            />
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '5px' }}>
              E-posta değiştirilemez.
            </div>
          </div>

          <div>
            <label style={labelStyle}>TELEFON</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="05xx xxx xx xx"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>IBAN</label>
            <input
              type="text"
              value={form.iban}
              onChange={e => set('iban', e.target.value)}
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '1px' }}
            />
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '5px' }}>
              Shopier ödemelerinin aktarılacağı IBAN.
            </div>
          </div>

          <div>
            <label style={labelStyle}>SHOPİER HESAP URL</label>
            <input
              type="url"
              value={form.shopier_url}
              onChange={e => set('shopier_url', e.target.value)}
              placeholder="https://www.shopier.com/kullanici-adiniz"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '4px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '11px 24px', borderRadius: '10px', border: 'none',
                background: '#4f46e5', color: 'white', fontSize: '13px', fontWeight: 700,
                fontFamily: 'Inter, -apple-system, sans-serif', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            {saved && (
              <span style={{ fontSize: '13px', color: '#34d399', fontWeight: 600 }}>✓ Kaydedildi</span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
