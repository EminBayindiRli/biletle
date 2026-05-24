'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ApproveButton({ orderId, eventId }: { orderId: string, eventId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleApprove() {
    if (!confirm('Bu siparişi onaylayıp bilet oluşturulsun mu?')) return
    setLoading(true)

    const res = await fetch(`/api/orders/${orderId}/approve`, { method: 'PATCH' })
    const data = await res.json()

    if (!res.ok) {
      alert('Hata: ' + data.error)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
    >
      {loading ? '...' : 'Onayla'}
    </button>
  )
}
