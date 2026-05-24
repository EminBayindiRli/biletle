import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function CheckinSelectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  const { data: events } = await supabase
    .from('events')
    .select('id, title, starts_at, location, sold_count')
    .eq('org_id', org?.id ?? '')
    .eq('status', 'active')
    .order('starts_at', { ascending: true })

  const list = (events ?? []) as any[]

  const surface = 'rgba(255,255,255,0.04)'
  const border = '1px solid rgba(255,255,255,0.08)'

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
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>📷 QR Check-in</span>
      </div>

      <div style={{ padding: '28px 32px' }}>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '20px' }}>
          Check-in başlatmak için aktif etkinliği seç:
        </div>

        {list.length === 0 ? (
          <div style={{
            background: surface, border,
            borderRadius: '16px', padding: '48px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📷</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>
              Aktif etkinlik yok
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>
              Check-in başlatmak için önce bir etkinliği aktifleştir.
            </div>
            <Link href="/dashboard/events" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px', borderRadius: '8px', background: '#4f46e5',
              color: 'white', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
            }}>
              Etkinliklere Git →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {list.map((event) => (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}/checkin`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: surface, border,
                  borderRadius: '14px', padding: '18px 20px',
                  textDecoration: 'none',
                  transition: 'background 0.12s',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '4px' }}>
                    {event.title}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                      📅 {new Date(event.starts_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    {event.location && (
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>📍 {event.location}</span>
                    )}
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>🎫 {event.sold_count} bilet</span>
                  </div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
                  fontSize: '13px', fontWeight: 600,
                  background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)',
                  color: '#67e8f9', padding: '8px 16px', borderRadius: '8px',
                }}>
                  📷 Check-in Başlat
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
