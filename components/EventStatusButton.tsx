'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function EventStatusButton({ eventId, currentStatus }: { eventId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    const newStatus = currentStatus === 'active' ? 'ended' : 'active'
    const label = newStatus === 'active' ? 'yayınlamak' : 'sonlandırmak'
    if (!confirm(`Etkinliği ${label} istediğine emin misin?`)) return

    setLoading(true)
    await supabase.from('events').update({ status: newStatus }).eq('id', eventId)
    router.refresh()
    setLoading(false)
  }

  if (currentStatus === 'ended') return null

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
        currentStatus === 'active'
          ? 'border border-red-200 text-red-600 hover:bg-red-50'
          : 'bg-teal-600 text-white hover:bg-teal-700'
      }`}
    >
      {loading ? '...' : currentStatus === 'active' ? 'Sonlandır' : 'Yayınla'}
    </button>
  )
}
