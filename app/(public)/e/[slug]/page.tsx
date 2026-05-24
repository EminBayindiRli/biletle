import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import TicketForm from '@/components/TicketForm'

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: event } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!event) notFound()

  const kalan = event.capacity - event.sold_count
  const doluluk = Math.round((event.sold_count / event.capacity) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white py-3 text-center text-sm">
        <span className="font-medium">biletle</span>
        <span className="text-indigo-300"> · güvenli bilet platformu</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Etkinlik Kartı */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Renk bandı */}
          <div className="h-2 bg-indigo-600" />

          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{event.title}</h1>

            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>📅</span>
                <span>
                  {new Date(event.starts_at).toLocaleDateString('tr-TR', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                  {' · '}
                  {new Date(event.starts_at).toLocaleTimeString('tr-TR', {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📍</span>
                  <span>{event.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>🎫</span>
                <span>{Number(event.ticket_price).toLocaleString('tr-TR')} TL</span>
              </div>
            </div>

            {/* Kapasite */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{event.sold_count} bilet satıldı</span>
                <span>{kalan} kaldı</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${doluluk}%` }}
                />
              </div>
            </div>

            {event.description && (
              <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                {event.description}
              </p>
            )}
          </div>
        </div>

        {/* Bilet Formu */}
        {kalan > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bilet Al</h2>
            <TicketForm
              eventId={event.id}
              ticketPrice={Number(event.ticket_price)}
              shopierLink={event.shopier_link}
              maxCapacity={kalan}
            />
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-2xl mb-2">😔</p>
            <p className="font-semibold text-red-700">Biletler Tükendi</p>
            <p className="text-sm text-red-500 mt-1">Bu etkinlik için tüm biletler satılmıştır.</p>
          </div>
        )}
      </div>
    </div>
  )
}
