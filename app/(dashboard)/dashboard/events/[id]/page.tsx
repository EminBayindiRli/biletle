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

  return (
    <div>
      {/* Başlık */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/dashboard/events" className="text-sm text-gray-400 hover:text-gray-600">← Etkinlikler</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{event.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span>📅 {new Date(event.starts_at).toLocaleDateString('tr-TR', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}</span>
            {event.location && <span>📍 {event.location}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {event.status === 'active' && (
            <a href={`/e/${event.slug}`} target="_blank"
              className="text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              Sayfayı Gör ↗
            </a>
          )}
          <Link
            href={`/dashboard/events/${id}/edit`}
            className="text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ✏️ Düzenle
          </Link>
          <EventStatusButton eventId={event.id} currentStatus={event.status} />
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Toplam Sipariş',  value: orderList.length,                 icon: '📋' },
          { label: 'Bekleyen Onay',   value: pending,                           icon: '⏳', highlight: pending > 0 },
          { label: 'Onaylanan',       value: paid,                              icon: '✅' },
          { label: 'Kalan Kapasite',  value: event.capacity - event.sold_count, icon: '🎫' },
          { label: 'Giriş Yapan',     value: `${checkedIn} / ${totalTickets}`,  icon: '🚪', success: checkedIn > 0 },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl border p-4 ${
            (s as any).highlight ? 'border-amber-300 bg-amber-50' :
            (s as any).success   ? 'border-teal-200 bg-teal-50'   :
            'border-gray-200'
          }`}>
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">{s.label}</p>
              <span>{s.icon}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${
              (s as any).highlight ? 'text-amber-700' :
              (s as any).success   ? 'text-teal-700'  :
              'text-gray-900'
            }`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sipariş Listesi */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-wrap gap-2">
          <h2 className="font-semibold text-gray-900">Siparişler</h2>
          <div className="flex items-center gap-2">
            {paid > 0 && (
              <a
                href={`/api/events/${id}/export`}
                className="text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                📥 CSV İndir
              </a>
            )}
            {event.status === 'active' && (
              <Link href={`/dashboard/events/${id}/checkin`}
                className="text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors">
                📱 Check-in Başlat
              </Link>
            )}
          </div>
        </div>

        {orderList.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Henüz sipariş yok.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orderList.map((order) => (
              {(() => {
                const ticket = ticketByOrder.get(order.id)
                return (
                  <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.buyer_name}</p>
                      <p className="text-xs text-gray-500">
                        {order.buyer_email} · {Number(order.total_amount).toLocaleString('tr-TR')} TL
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleDateString('tr-TR', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                        {ticket && (
                          <p className="text-xs text-gray-400 font-mono">{ticket.ticket_number}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {/* Check-in durumu */}
                      {ticket && order.status === 'paid' && (
                        ticket.checked_in_at ? (
                          <div className="text-right">
                            <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                              🚪 Giriş Yaptı
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(ticket.checked_in_at).toLocaleTimeString('tr-TR', {
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full">
                            Henüz Girmedi
                          </span>
                        )
                      )}
                      {/* Sipariş durumu */}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.status === 'paid'    ? 'bg-teal-50 text-teal-700' :
                        order.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-600'
                      }`}>
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
              })()}
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
