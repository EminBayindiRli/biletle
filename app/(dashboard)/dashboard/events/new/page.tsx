'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Yeni Etkinlik</h1>
        <p className="text-gray-500 text-sm mt-1">Etkinlik bilgilerini doldur, yayınla veya taslak olarak kaydet.</p>
      </div>

      <form className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

        {/* Başlık */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Etkinlik Adı *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="ör. Underground Parti – Haziran 2025"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Açıklama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Etkinlik hakkında kısa bir açıklama..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* Konum */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Konum</label>
          <input
            type="text"
            value={form.location}
            onChange={e => set('location', e.target.value)}
            placeholder="ör. Alsancak, İzmir"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Tarih */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç *</label>
            <input
              type="datetime-local"
              value={form.starts_at}
              onChange={e => set('starts_at', e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş</label>
            <input
              type="datetime-local"
              value={form.ends_at}
              onChange={e => set('ends_at', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Kapasite & Fiyat */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kapasite *</label>
            <input
              type="number"
              value={form.capacity}
              onChange={e => set('capacity', e.target.value)}
              placeholder="ör. 100"
              min="1"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bilet Fiyatı (TL) *</label>
            <input
              type="number"
              value={form.ticket_price}
              onChange={e => set('ticket_price', e.target.value)}
              placeholder="ör. 150"
              min="0"
              step="0.01"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Shopier Linki */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shopier Ödeme Linki</label>
          <input
            type="url"
            value={form.shopier_link}
            onChange={e => set('shopier_link', e.target.value)}
            placeholder="https://www.shopier.com/..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-400 mt-1">Shopier'den etkinlik için oluşturduğun ürün linki</p>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Butonlar */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={e => handleSubmit(e as any, 'draft')}
            disabled={loading}
            className="flex-1 border border-gray-300 text-gray-700 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Taslak Kaydet
          </button>
          <button
            type="button"
            onClick={e => handleSubmit(e as any, 'active')}
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : 'Yayınla'}
          </button>
        </div>
      </form>
    </div>
  )
}
