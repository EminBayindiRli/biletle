'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Org = {
  id: string
  name: string
  email: string
  created_at: string
  is_approved: boolean
}

export default function AdminOrgCard({ org, type }: { org: Org; type: 'pending' | 'approved' }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  async function handleApprove() {
    setLoading('approve')
    const res = await fetch(`/api/admin/organizations/${org.id}/approve`, { method: 'PATCH' })
    if (res.ok) {
      router.refresh()
    } else {
      alert('İşlem başarısız.')
      setLoading(null)
    }
  }

  async function handleReject() {
    if (!confirm(`"${org.name}" hesabını reddet ve sil?`)) return
    setLoading('reject')
    const res = await fetch(`/api/admin/organizations/${org.id}/reject`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      alert('İşlem başarısız.')
      setLoading(null)
    }
  }

  const createdAt = new Date(org.created_at).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className={`bg-white rounded-xl border p-4 flex items-center justify-between gap-4 ${
      type === 'pending' ? 'border-amber-200' : 'border-gray-200'
    }`}>
      <div className="min-w-0">
        <p className="font-medium text-gray-900 truncate">{org.name}</p>
        <p className="text-sm text-gray-500 truncate">{org.email}</p>
        <p className="text-xs text-gray-400 mt-0.5">Kayıt: {createdAt}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {type === 'pending' ? (
          <>
            <button
              onClick={handleApprove}
              disabled={loading !== null}
              className="text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 font-medium"
            >
              {loading === 'approve' ? '...' : '✓ Onayla'}
            </button>
            <button
              onClick={handleReject}
              disabled={loading !== null}
              className="text-sm border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {loading === 'reject' ? '...' : 'Reddet'}
            </button>
          </>
        ) : (
          <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full font-medium">
            ✓ Onaylı
          </span>
        )}
      </div>
    </div>
  )
}
