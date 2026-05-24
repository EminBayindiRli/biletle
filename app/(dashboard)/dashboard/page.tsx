import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

type EventRow = {
  id: string
  title: string
  status: string
  sold_count: number
  starts_at: string
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

  // Son 5 etkinliği çek
  const { data: eventsData } = await supabase
    .from('events')
    .select('id, title, status, sold_count, starts_at')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(5)

  const events = (eventsData ?? []) as EventRow[]
  const eventIds: string[] = events.map(e => e.id)
  const safeIds = eventIds.length > 0 ? eventIds : ['']

  // 3 count sorgusunu paralel çalıştır
  const [
    { count: totalEvents },
    { count: pendingOrders },
    { count: totalTickets },
  ] = await Promise.all([
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .in('event_id', safeIds),
    supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .in('event_id', safeIds),
  ])

  const stats = [
    { label: 'Toplam Etkinlik', value: totalEvents ?? 0, icon: '🎭' },
    { label: 'Satılan Bilet',   value: totalTickets ?? 0, icon: '🎫' },
    { label: 'Bekleyen Onay',   value: pendingOrders ?? 0, icon: '⏳', highlight: (pendingOrders ?? 0) > 0 },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Merhaba, {org?.name} 👋</h1>
        <p className="text-gray-500 mt-1">İşte platformunun genel durumu.</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-5 ${stat.highlight ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className={`text-3xl font-bold mt-2 ${stat.highlight ? 'text-amber-700' : 'text-gray-900'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Son Etkinlikler */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Son Etkinlikler</h2>
          <Link href="/dashboard/events" className="text-sm text-indigo-600 hover:underline">
            Tümünü gör →
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-400 text-sm mb-4">Henüz etkinliğin yok.</p>
            <Link
              href="/dashboard/events/new"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + İlk Etkinliğini Oluştur
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(event.starts_at).toLocaleDateString('tr-TR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{event.sold_count} bilet</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    event.status === 'active' ? 'bg-teal-50 text-teal-700' :
                    event.status === 'draft'  ? 'bg-gray-100 text-gray-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {event.status === 'active' ? 'Aktif' : event.status === 'draft' ? 'Taslak' : 'Bitti'}
                  </span>
                  <Link href={`/dashboard/events/${event.id}`} className="text-xs text-indigo-600 hover:underline">
                    Detay →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
