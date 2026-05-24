'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CancelButton({ orderId, eventId }: { orderId: string; eventId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    if (!confirm('Bu siparişi iptal etmek istediğine emin misin?')) return
    setLoading(true)

    const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'PATCH' })

    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error || 'İptal işlemi başarısız.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="text-xs text-red-500 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {loading ? '...' : 'İptal Et'}
    </button>
  )
}
