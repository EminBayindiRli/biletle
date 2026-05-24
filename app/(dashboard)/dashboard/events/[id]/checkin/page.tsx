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
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
      {/* Üst bar */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-white font-semibold text-sm truncate max-w-[200px]">{event.title}</p>
          <p className="text-gray-400 text-xs">Check-in aktif</p>
        </div>
        <Link
          href={`/dashboard/events/${id}`}
          className="text-gray-400 text-sm border border-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          ✕ Kapat
        </Link>
      </div>

      {/* QR Scanner */}
      <div className="flex-1 overflow-hidden">
        <QRScanner eventId={event.id} />
      </div>
    </div>
  )
}
