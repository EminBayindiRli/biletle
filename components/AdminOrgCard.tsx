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
    <div style={{
      background: type === 'pending' ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.04)',
      border: type === 'pending' ? '1px solid rgba(251,191,36,0.2)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px', padding: '16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.name}</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.email}</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '3px' }}>Kayıt: {createdAt}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {type === 'pending' ? (
          <>
            <button
              onClick={handleApprove}
              disabled={loading !== null}
              style={{
                fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '8px',
                background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.25)',
                color: '#34d399', cursor: 'pointer', opacity: loading !== null ? 0.5 : 1,
              }}
            >
              {loading === 'approve' ? '...' : '✓ Onayla'}
            </button>
            <button
              onClick={handleReject}
              disabled={loading !== null}
              style={{
                fontSize: '12px', fontWeight: 500, padding: '7px 14px', borderRadius: '8px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171', cursor: 'pointer', opacity: loading !== null ? 0.5 : 1,
              }}
            >
              {loading === 'reject' ? '...' : 'Reddet'}
            </button>
          </>
        ) : (
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px',
            background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)',
            color: '#34d399',
          }}>
            ✓ Onaylı
          </span>
        )}
      </div>
    </div>
  )
}
