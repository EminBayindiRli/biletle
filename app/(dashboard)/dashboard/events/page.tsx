import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

const GRADIENTS = [
  'linear-gradient(135deg, #4f46e5, #7c3aed)',
  'linear-gradient(135deg, #0ea5e9, #6366f1)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
  'linear-gradient(135deg, #8b5cf6, #3b82f6)',
]
const EMOJIS = ['🎵', '🎸', '🎹', '🎧', '🎤', '🎭', '🎪', '🥁']

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
    <div style={{ minHeight: '100vh', background: '#07071a' }}>
      {/* Topbar */}
      <div style={{
        background: 'rgba(14,14,36,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 32px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Etkinlikler</span>
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
            background: 'rgba(79,70,229,0.2)', color: '#818cf8', border: '1px solid rgba(79,70,229,0.3)',
          }}>
            {list.length}
          </span>
        </div>
        <Link href="/dashboard/events/new" style={{
          padding: '8px 16px', borderRadius: '8px', border: 'none',
          background: '#4f46e5', color: 'white', fontSize: '13px', fontWeight: 600,
          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
          boxShadow: '0 0 20px rgba(79,70,229,0.3)',
        }}>
          + Yeni Etkinlik
        </Link>
      </div>

      <div style={{ padding: '28px 32px' }}>
        {list.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1.5px dashed rgba(255,255,255,0.1)',
            borderRadius: '16px', padding: '64px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎪</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
              İlk etkinliğini oluştur
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '24px' }}>
              Bilet satmaya başlamak için bir etkinlik ekle.
            </div>
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
              const doluluk = event.capacity > 0 ? Math.round((event.sold_count / event.capacity) * 100) : 0
              const gradient = GRADIENTS[i % GRADIENTS.length]
              const emoji = EMOJIS[i % EMOJIS.length]
              const isActive = event.status === 'active'

              return (
                <div key={event.id} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px', overflow: 'hidden',
                }}>
                  {/* Card top */}
                  <div style={{
                    height: '96px', background: gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <span style={{ fontSize: '38px', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}>{emoji}</span>
                    <span style={{
                      position: 'absolute', top: '10px', right: '10px',
                      fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px',
                      background: isActive ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.12)',
                      color: isActive ? '#86efac' : 'rgba(255,255,255,0.65)',
                      border: isActive ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(255,255,255,0.15)',
                    }}>
                      {isActive ? 'Satışta' : event.status === 'draft' ? 'Taslak' : 'Tamamlandı'}
                    </span>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '5px' }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>
                      📅 {new Date(event.starts_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {event.location && ` · 📍 ${event.location}`}
                    </div>

                    {/* Progress */}
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', marginBottom: '5px' }}>
                      <div style={{
                        height: '100%', borderRadius: '2px',
                        background: doluluk >= 90 ? '#ef4444' : doluluk >= 70 ? '#f59e0b' : '#4f46e5',
                        width: `${doluluk}%`,
                      }} />
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginBottom: '14px' }}>
                      {event.sold_count} / {event.capacity} bilet (%{doluluk})
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{event.sold_count} bilet</div>
                        <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
                          ₺{(event.sold_count * Number(event.ticket_price)).toLocaleString('tr-TR')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {isActive && (
                          <a href={`/e/${event.slug}`} target="_blank" style={{
                            fontSize: '11px', padding: '5px 10px', borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)',
                            textDecoration: 'none', fontWeight: 500,
                          }}>
                            ↗
                          </a>
                        )}
                        <Link href={`/dashboard/events/${event.id}`} style={{
                          fontSize: '11px', padding: '5px 10px', borderRadius: '6px',
                          background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(79,70,229,0.3)',
                          color: '#818cf8', textDecoration: 'none', fontWeight: 600,
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
