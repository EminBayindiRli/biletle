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
  const eventIds: string[] = events.map(e => e.id)
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
    { label: 'Toplam Etkinlik', value: totalEvents ?? 0, icon: '🎪', color: '#eef2ff', iconColor: '#4f46e5' },
    { label: 'Satılan Bilet', value: totalTickets ?? 0, icon: '🎫', color: '#ecfdf5', iconColor: '#059669' },
    { label: 'Bekleyen Onay', value: pendingOrders ?? 0, icon: '⏳', color: (pendingOrders ?? 0) > 0 ? '#fffbeb' : '#f9fafb', iconColor: '#d97706', highlight: (pendingOrders ?? 0) > 0 },
  ]

  return (
    <div>
      {/* Top bar */}
      <div style={{
        background: 'white', borderBottom: '1px solid #e5e7eb',
        padding: '0 32px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
            Merhaba, {org?.name} 👋
          </span>
        </div>
        <Link href="/dashboard/events/new" style={{
          padding: '8px 16px', borderRadius: '8px', border: 'none',
          background: '#4f46e5', color: 'white', fontSize: '13px', fontWeight: 600,
          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
        }}>
          + Etkinlik Oluştur
        </Link>
      </div>

      <div style={{ padding: '28px 32px' }}>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{
              background: stat.highlight ? '#fffbeb' : 'white',
              border: `1px solid ${stat.highlight ? '#fde68a' : '#e5e7eb'}`,
              borderRadius: '16px', padding: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: stat.color, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '18px',
                }}>
                  {stat.icon}
                </div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: stat.highlight ? '#92400e' : '#111827', letterSpacing: '-1.5px', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500, marginTop: '4px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Recent events */}
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 20px', borderBottom: '1px solid #f3f4f6',
          }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Son Etkinlikler</span>
            <Link href="/dashboard/events" style={{ fontSize: '12px', color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
              Tümünü gör →
            </Link>
          </div>

          {events.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎪</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Henüz etkinliğin yok.</div>
              <Link href="/dashboard/events/new" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '9px 16px', borderRadius: '8px', background: '#4f46e5',
                color: 'white', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
              }}>
                + İlk Etkinliğini Oluştur
              </Link>
            </div>
          ) : (
            <div>
              {events.map((event, i) => (
                <div key={event.id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 20px',
                  borderBottom: i < events.length - 1 ? '1px solid #f9fafb' : 'none',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: '#eef2ff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                  }}>
                    🎵
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                      {new Date(event.starts_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {event.location && ` · ${event.location}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{event.sold_count} bilet</span>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px',
                      background: event.status === 'active' ? '#ecfdf5' : event.status === 'draft' ? '#f3f4f6' : '#f9fafb',
                      color: event.status === 'active' ? '#059669' : event.status === 'draft' ? '#6b7280' : '#9ca3af',
                    }}>
                      {event.status === 'active' ? 'Aktif' : event.status === 'draft' ? 'Taslak' : 'Bitti'}
                    </span>
                    <Link href={`/dashboard/events/${event.id}`} style={{ fontSize: '12px', color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
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
