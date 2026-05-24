import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

type EventRow = {
  id: string
  title: string
  status: string
  sold_count: number
  starts_at: string
  location: string | null
}

const surface = 'rgba(255,255,255,0.04)'
const border = '1px solid rgba(255,255,255,0.08)'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orgData } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('user_id', user!.id)
    .single()

  const org = orgData as { id: string; name: string } | null
  const orgId: string = org?.id ?? ''

  const { data: eventsData } = await supabase
    .from('events')
    .select('id, title, status, sold_count, starts_at, location')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(5)

  const events = (eventsData ?? []) as EventRow[]
  const eventIds = events.map(e => e.id)
  const safeIds = eventIds.length > 0 ? eventIds : ['']

  const [
    { count: totalEvents },
    { count: pendingOrders },
    { count: totalTickets },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending').in('event_id', safeIds),
    supabase.from('tickets').select('*', { count: 'exact', head: true }).in('event_id', safeIds),
  ])

  const stats = [
    { label: 'Toplam Etkinlik', value: totalEvents ?? 0, icon: '🎪', accent: '#818cf8' },
    { label: 'Satılan Bilet', value: totalTickets ?? 0, icon: '🎫', accent: '#34d399' },
    { label: 'Bekleyen Onay', value: pendingOrders ?? 0, icon: '⏳', accent: '#fbbf24', highlight: (pendingOrders ?? 0) > 0 },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#07071a' }}>
      {/* Topbar */}
      <div style={{
        background: 'rgba(14,14,36,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 32px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
          Merhaba, {org?.name} 👋
        </span>
        <Link href="/dashboard/events/new" style={{
          padding: '8px 16px', borderRadius: '8px', border: 'none',
          background: '#4f46e5', color: 'white', fontSize: '13px', fontWeight: 600,
          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
          boxShadow: '0 0 20px rgba(79,70,229,0.3)',
        }}>
          + Etkinlik Oluştur
        </Link>
      </div>

      <div style={{ padding: '28px 32px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{
              background: stat.highlight ? 'rgba(251,191,36,0.08)' : surface,
              border: stat.highlight ? '1px solid rgba(251,191,36,0.2)' : border,
              borderRadius: '16px', padding: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: `${stat.accent}18`,
                  border: `1px solid ${stat.accent}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px',
                }}>
                  {stat.icon}
                </div>
              </div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: stat.highlight ? '#fbbf24' : 'white', letterSpacing: '-1.5px', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 500, marginTop: '5px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Recent events */}
        <div style={{ background: surface, border, borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Son Etkinlikler</span>
            <Link href="/dashboard/events" style={{ fontSize: '12px', color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>
              Tümünü gör →
            </Link>
          </div>

          {events.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎪</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>Henüz etkinliğin yok.</div>
              <Link href="/dashboard/events/new" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '9px 16px', borderRadius: '8px', background: '#4f46e5',
                color: 'white', fontSize: '12px', fontWeight: 600, textDecoration: 'none',
              }}>
                + İlk Etkinliğini Oluştur
              </Link>
            </div>
          ) : (
            <div>
              {events.map((event, i) => (
                <div key={event.id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '13px 20px',
                  borderBottom: i < events.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                    background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(79,70,229,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px',
                  }}>
                    🎵
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                      {new Date(event.starts_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {event.location && ` · ${event.location}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{event.sold_count} bilet</span>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px',
                      background: event.status === 'active' ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.06)',
                      color: event.status === 'active' ? '#34d399' : 'rgba(255,255,255,0.3)',
                      border: event.status === 'active' ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(255,255,255,0.08)',
                    }}>
                      {event.status === 'active' ? 'Aktif' : event.status === 'draft' ? 'Taslak' : 'Bitti'}
                    </span>
                    <Link href={`/dashboard/events/${event.id}`} style={{ fontSize: '11px', color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>
                      Detay →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
