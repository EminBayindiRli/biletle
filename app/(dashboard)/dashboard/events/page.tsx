import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('org_id', org?.id ?? '')
    .order('created_at', { ascending: false })

  const list = (events ?? []) as any[]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Etkinliklerim</h1>
          <p className="text-gray-500 text-sm mt-1">{list.length} etkinlik</p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Yeni Etkinlik
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <p className="text-4xl mb-4">🎭</p>
          <p className="text-gray-500 mb-6">Henüz etkinliğin yok.</p>
          <Link
            href="/dashboard/events/new"
            className="bg-indigo-600 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            İlk Etkinliğini Oluştur
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {list.map((event) => (
            <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:border-indigo-200 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-semibold text-gray-900">{event.title}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    event.status === 'active' ? 'bg-teal-50 text-teal-700' :
                    event.status === 'draft'  ? 'bg-gray-100 text-gray-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {event.status === 'active' ? 'Aktif' : event.status === 'draft' ? 'Taslak' : 'Bitti'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>📅 {new Date(event.starts_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  {event.location && <span>📍 {event.location}</span>}
                  <span>🎫 {event.sold_count}/{event.capacity} bilet</span>
                  <span>💰 {Number(event.ticket_price).toLocaleString('tr-TR')} TL</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {event.status === 'active' && (
                  <a
                    href={`/e/${event.slug}`}
                    target="_blank"
                    className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Sayfayı Gör ↗
                  </a>
                )}
                <Link
                  href={`/dashboard/events/${event.id}`}
                  className="text-xs text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Yönet →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
