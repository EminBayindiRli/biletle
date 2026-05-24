import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import QRScanner from '@/components/QRScanner'

export default async function CheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  const { data: event } = await supabase
    .from('events')
    .select('id, title, starts_at, location, status')
    .eq('id', id)
    .eq('org_id', org?.id ?? '')
    .single()

  if (!event) notFound()

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a1f', display: 'flex', flexDirection: 'column', zIndex: 50 }}>
      {/* Header */}
      <div style={{
        background: 'rgba(14,14,36,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 20px', height: '56px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
            {event.title}
          </div>
          <div style={{ fontSize: '11px', color: '#34d399', marginTop: '1px' }}>● Check-in aktif</div>
        </div>
        <Link
          href={`/dashboard/events/${id}`}
          style={{
            fontSize: '12px', color: 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '6px 14px', borderRadius: '8px', textDecoration: 'none',
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          ✕ Kapat
        </Link>
      </div>

      {/* QR Scanner */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <QRScanner eventId={event.id} />
      </div>
    </div>
  )
}
