import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ApproveButton from '@/components/ApproveButton'
import EventStatusButton from '@/components/EventStatusButton'
import CancelButton from '@/components/CancelButton'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orgData } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  const orgId = (orgData as any)?.id ?? ''

  // Event, orders ve tickets paralel çek
  const [{ data: eventData }, { data: ordersData }, { data: ticketsData }] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, slug, status, starts_at, location, capacity, sold_count')
      .eq('id', id)
      .eq('org_id', orgId)
      .single(),
    supabase
      .from('orders')
      .select('id, buyer_name, buyer_email, quantity, total_amount, status, created_at')
      .eq('event_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tickets')
      .select('order_id, ticket_number, checked_in_at')
      .eq('event_id', id),
  ])

  if (!eventData) notFound()

  const event     = eventData as any
  const orderList = (ordersData ?? []) as any[]
  const tickets   = (ticketsData ?? []) as any[]

  const pending      = orderList.filter(o => o.status === 'pending').length
  const paid         = orderList.filter(o => o.status === 'paid').length
  const checkedIn    = tickets.filter(t => t.checked_in_at).length
  const totalTickets = tickets.length

  // order_id → ticket eşlemesi
  const ticketByOrder = new Map(tickets.map(t => [t.order_id, t]))

  const surface = 'rgba(255,255,255,0.04)'
  const border = '1px solid rgba(255,255,255,0.08)'
  const btnStyle: React.CSSProperties = {
    fontSize: '11px', padding: '6px 12px', borderRadius: '7px',
    border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none', fontWeight: 500, background: 'transparent',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07071a' }}>
      {/* Sticky header */}
      <div style={{
        background: 'rgba(14,14,36,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 32px', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <Link href="/dashboard/events" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>← Etkinlikler</Link>
        <div style={{ fontSize: '20px', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-1px', marginTop: '4px' }}>{event.title}</div>
        <div style={{ display: 'flex', gap: '20px', marginTop: '5px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
            📅 {new Date(event.starts_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          {event.location && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>📍 {event.location}</span>}
          <span style={{ fontSize: '12px', fontWeight: 600, color: event.status === 'active' ? '#34d399' : 'rgba(255,255,255,0.3)' }}>
            {event.status === 'active' ? '● Satışta' : '● Taslak'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
          {event.status === 'active' && (
            <a href={`/e/${event.slug}`} target="_blank" style={btnStyle}>Sayfayı Gör ↗</a>
          )}
          <Link href={`/dashboard/events/${id}/edit`} style={btnStyle}>✏️ Düzenle</Link>
          <EventStatusButton eventId={event.id} currentStatus={event.status} />
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>

      {/* İstatistikler */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Toplam Sipariş',  value: orderList.length,                 icon: '📋', accent: '#818cf8' },
          { label: 'Bekleyen Onay',   value: pending,                           icon: '⏳', accent: '#fbbf24', highlight: pending > 0 },
          { label: 'Onaylanan',       value: paid,                              icon: '✅', accent: '#34d399' },
          { label: 'Kalan Kapasite',  value: event.capacity - event.sold_count, icon: '🎫', accent: '#818cf8' },
          { label: 'Giriş Yapan',     value: `${checkedIn} / ${totalTickets}`,  icon: '🚪', accent: '#06b6d4', success: checkedIn > 0 },
        ].map(s => (
          <div key={s.label} style={{
            background: (s as any).highlight ? 'rgba(251,191,36,0.08)' : (s as any).success ? 'rgba(6,182,212,0.06)' : surface,
            border: (s as any).highlight ? '1px solid rgba(251,191,36,0.2)' : (s as any).success ? '1px solid rgba(6,182,212,0.15)' : border,
            borderRadius: '12px', padding: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{s.label}</span>
              <span style={{ fontSize: '16px' }}>{s.icon}</span>
            </div>
            <div style={{
              fontSize: '22px', fontWeight: 800, lineHeight: 1,
              color: (s as any).highlight ? '#fbbf24' : (s as any).success ? '#67e8f9' : 'rgba(255,255,255,0.9)',
            }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Sipariş Listesi */}
      <div style={{ background: surface, border, borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Siparişler</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {paid > 0 && (
              <a href={`/api/events/${id}/export`} style={btnStyle}>
                📥 CSV İndir
              </a>
            )}
            {event.status === 'active' && (
              <Link href={`/dashboard/events/${id}/checkin`} style={{
                ...btnStyle, background: 'rgba(6,182,212,0.15)',
                border: '1px solid rgba(6,182,212,0.25)', color: '#67e8f9',
              }}>
                📷 Check-in Başlat
              </Link>
            )}
          </div>
        </div>

        {orderList.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>
            Henüz sipariş yok.
          </div>
        ) : (
          <div>
            {orderList.map((order, i) => {
              const ticket = ticketByOrder.get(order.id)
              return (
                <div key={order.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px', gap: '12px', flexWrap: 'wrap',
                  borderBottom: i < orderList.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{order.buyer_name}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                      {order.buyer_email} · {Number(order.total_amount).toLocaleString('tr-TR')} TL
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '3px' }}>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>
                        {new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {ticket && (
                        <span style={{ fontSize: '10px', color: '#818cf8', fontFamily: 'monospace', letterSpacing: '1px' }}>{ticket.ticket_number}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {ticket && order.status === 'paid' && (
                      ticket.checked_in_at ? (
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '10px', background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)', color: '#67e8f9', padding: '3px 8px', borderRadius: '10px', fontWeight: 700 }}>
                            🚪 Giriş Yaptı
                          </span>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '2px' }}>
                            {new Date(ticket.checked_in_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          Girmedi
                        </span>
                      )
                    )}
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px',
                      background: order.status === 'paid' ? 'rgba(52,211,153,0.12)' : order.status === 'pending' ? 'rgba(251,191,36,0.12)' : 'rgba(239,68,68,0.1)',
                      color: order.status === 'paid' ? '#34d399' : order.status === 'pending' ? '#fbbf24' : '#f87171',
                      border: order.status === 'paid' ? '1px solid rgba(52,211,153,0.2)' : order.status === 'pending' ? '1px solid rgba(251,191,36,0.2)' : '1px solid rgba(239,68,68,0.15)',
                    }}>
                      {order.status === 'paid' ? 'Onaylı' : order.status === 'pending' ? 'Bekliyor' : 'İptal'}
                    </span>
                    {order.status === 'pending' && (
                      <>
                        <ApproveButton orderId={order.id} eventId={id} />
                        <CancelButton orderId={order.id} eventId={id} />
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
