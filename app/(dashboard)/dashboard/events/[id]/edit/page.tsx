'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
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

  useEffect(() => {
    async function loadEvent() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('user_id', user.id)
        .single()

      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('org_id', (org as any)?.id ?? '')
        .single()

      if (!event) { router.push('/dashboard/events'); return }

      const e = event as any
      // datetime-local input değeri: "2025-06-01T20:00"
      function toDatetimeLocal(iso: string | null) {
        if (!iso) return ''
        return iso.slice(0, 16)
      }

      setForm({
        title: e.title ?? '',
        description: e.description ?? '',
        location: e.location ?? '',
        starts_at: toDatetimeLocal(e.starts_at),
        ends_at: toDatetimeLocal(e.ends_at),
        capacity: String(e.capacity ?? ''),
        ticket_price: String(e.ticket_price ?? ''),
        shopier_link: e.shopier_link ?? '',
      })
      setFetching(false)
    }
    loadEvent()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: updateError } = await supabase
      .from('events')
      .update({
        title: form.title,
        description: form.description || null,
        location: form.location || null,
        starts_at: form.starts_at,
        ends_at: form.ends_at || null,
        capacity: parseInt(form.capacity),
        ticket_price: parseFloat(form.ticket_price),
        shopier_link: form.shopier_link || null,
      })
      .eq('id', id)

    if (updateError) {
      setError('Hata: ' + updateError.message)
      setLoading(false)
      return
    }

    router.push(`/dashboard/events/${id}`)
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin text-2xl">⏳</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href={`/dashboard/events/${id}`} className="text-sm text-gray-400 hover:text-gray-600">
          ← Etkinliğe Dön
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Etkinliği Düzenle</h1>
        <p className="text-gray-500 text-sm mt-1">Değişiklikler hemen yayınlanır.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Etkinlik Adı *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kapasite *</label>
            <input
              type="number"
              value={form.capacity}
              onChange={e => set('capacity', e.target.value)}
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
              min="0"
              step="0.01"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1">Ücretsiz etkinlik için 0 gir.</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shopier Ödeme Linki</label>
          <input
            type="url"
            value={form.shopier_link}
            onChange={e => set('shopier_link', e.target.value)}
            placeholder="https://www.shopier.com/..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-400 mt-1">Ücretsiz etkinlikte boş bırakabilirsin.</p>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href={`/dashboard/events/${id}`}
            className="flex-1 text-center border border-gray-300 text-gray-700 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}
