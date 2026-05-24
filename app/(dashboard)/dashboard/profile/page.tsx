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

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
        <p className="text-gray-500 text-sm mt-1">Organizasyon bilgilerini güncelle.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organizasyon / İsim</label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
          <input
            type="email"
            value={form.email}
            disabled
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">E-posta değiştirilemez.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="05xx xxx xx xx"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
          <input
            type="text"
            value={form.iban}
            onChange={e => set('iban', e.target.value)}
            placeholder="TR00 0000 0000 0000 0000 0000 00"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
          <p className="text-xs text-gray-400 mt-1">Shopier ödemelerinin aktarılacağı IBAN.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shopier Hesap URL</label>
          <input
            type="url"
            value={form.shopier_url}
            onChange={e => set('shopier_url', e.target.value)}
            placeholder="https://www.shopier.com/kullanici-adiniz"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          {saved && <span className="text-sm text-teal-600">✓ Kaydedildi</span>}
        </div>
      </form>
    </div>
  )
}
