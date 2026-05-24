import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #4f46e5, #7c3aed)',
  'linear-gradient(135deg, #0ea5e9, #6366f1)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
  'linear-gradient(135deg, #8b5cf6, #3b82f6)',
]

const CARD_EMOJIS = ['🎵', '🎸', '🎹', '🎧', '🎤', '🎭', '🎪', '🥁']

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
      {/* Top bar */}
      <div style={{
        background: 'white', borderBottom: '1px solid #e5e7eb',
        padding: '0 32px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Etkinlikler</span>
          <span style={{ fontSize: '13px', color: '#9ca3af', marginLeft: '8px' }}>{list.length} etkinlik</span>
        </div>
        <Link href="/dashboard/events/new" style={{
          padding: '8px 16px', borderRadius: '8px', border: 'none',
          background: '#4f46e5', color: 'white', fontSize: '13px', fontWeight: 600,
          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
        }}>
          + Yeni Etkinlik
        </Link>
      </div>

      <div style={{ padding: '28px 32px' }}>
        {list.length === 0 ? (
          <div style={{
            background: 'white', border: '1.5px dashed #e5e7eb', borderRadius: '16px',
            padding: '64px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎪</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>İlk etkinliğini oluştur</div>
            <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '24px' }}>Bilet satmaya başlamak için bir etkinlik ekle.</div>
            <Link href="/dashboard/events/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '10px 20px', borderRadius: '8px', background: '#4f46e5',
              color: 'white', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
            }}>
              + Etkinlik Oluştur
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {list.map((event, i) => {
              const kalan = event.capacity - event.sold_count
              const doluluk = event.capacity > 0 ? Math.round((event.sold_count / event.capacity) * 100) : 0
              const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length]
              const emoji = CARD_EMOJIS[i % CARD_EMOJIS.length]

              return (
                <div key={event.id} style={{
                  background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.15s, transform 0.15s',
                }}>
                  {/* Card header */}
                  <div style={{
                    height: '100px', background: gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <span style={{ fontSize: '40px', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>{emoji}</span>
                    <span style={{
                      position: 'absolute', top: '10px', right: '10px',
                      fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px',
                      background: event.status === 'active' ? 'rgba(16,185,129,0.15)' : event.status === 'draft' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.12)',
                      color: event.status === 'active' ? '#86efac' : 'rgba(255,255,255,0.7)',
                      border: event.status === 'active' ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.15)',
                    }}>
                      {event.status === 'active' ? 'Satışta' : event.status === 'draft' ? 'Taslak' : 'Tamamlandı'}
                    </span>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px' }}>
                      📅 {new Date(event.starts_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {event.location && ` · 📍 ${event.location}`}
                    </div>

                    {/* Progress */}
                    <div style={{ height: '4px', background: '#f3f4f6', borderRadius: '2px', overflow: 'hidden', marginBottom: '6px' }}>
                      <div style={{
                        height: '100%', background: '#4f46e5', borderRadius: '2px',
                        width: `${doluluk}%`,
                      }} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '14px' }}>
                      {event.sold_count} / {event.capacity} bilet satıldı (%{doluluk})
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{event.sold_count} bilet</div>
                        <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                          ₺{(event.sold_count * Number(event.ticket_price)).toLocaleString('tr-TR')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {event.status === 'active' && (
                          <a href={`/e/${event.slug}`} target="_blank" style={{
                            fontSize: '11px', padding: '5px 10px', borderRadius: '6px',
                            border: '1px solid #e5e7eb', color: '#6b7280', textDecoration: 'none', fontWeight: 500,
                          }}>
                            ↗
                          </a>
                        )}
                        <Link href={`/dashboard/events/${event.id}`} style={{
                          fontSize: '11px', padding: '5px 10px', borderRadius: '6px',
                          background: '#eef2ff', color: '#4f46e5', textDecoration: 'none', fontWeight: 600,
                        }}>
                          Yönet →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
