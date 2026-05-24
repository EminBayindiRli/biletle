import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import TicketForm from '@/components/TicketForm'
import Link from 'next/link'

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

  const dateStr = new Date(event.starts_at).toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const timeStr = new Date(event.starts_at).toLocaleTimeString('tr-TR', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#07071a' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(7,7,26,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 48px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '18px', fontWeight: 900, color: '#818cf8', letterSpacing: '-1px' }}>biletle.</span>
        <Link href="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
          ← Tüm Etkinlikler
        </Link>
      </nav>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
        padding: '56px 48px 48px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
          {kalan > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              color: 'white', fontSize: '11px', fontWeight: 700,
              padding: '5px 12px', borderRadius: '20px', marginBottom: '16px',
            }}>
              <span style={{ width: '6px', height: '6px', background: '#86efac', borderRadius: '50%', boxShadow: '0 0 8px #86efac', display: 'inline-block' }} />
              Satışta · {kalan} bilet kaldı
            </div>
          )}
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: 'white', letterSpacing: '-2px', lineHeight: 1.05, marginBottom: '20px' }}>
            {event.title}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {[
              `📅 ${dateStr} · ${timeStr}`,
              ...(event.location ? [`📍 ${event.location}`] : []),
              `🎫 ${Number(event.ticket_price) === 0 ? 'Ücretsiz' : `${Number(event.ticket_price).toLocaleString('tr-TR')} TL`}`,
            ].map(tag => (
              <span key={tag} style={{
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 500,
                padding: '7px 14px', borderRadius: '20px',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '40px 48px',
        display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start',
      }}>
        {/* Left */}
        <div>
          {event.description && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>🎵 Etkinlik Hakkında</div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>{event.description}</p>
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '14px' }}>📊 Kapasite</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>
              <span>{event.sold_count} bilet satıldı</span>
              <span>{kalan} kaldı</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '3px',
                background: doluluk >= 90 ? '#ef4444' : doluluk >= 70 ? '#f59e0b' : '#4f46e5',
                width: `${doluluk}%`,
              }} />
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '6px' }}>
              {event.capacity} kişilik kapasite · %{doluluk} dolu
            </div>
          </div>
        </div>

        {/* Ticket widget */}
        <div>
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px', overflow: 'hidden', position: 'sticky', top: '80px',
            boxShadow: '0 0 60px rgba(79,70,229,0.15)',
          }}>
            {/* Widget top */}
            <div style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              padding: '24px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
              <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.55)', marginBottom: '4px' }}>
                Kişi Başı Fiyat
              </div>
              <div style={{ fontSize: '40px', fontWeight: 900, color: 'white', letterSpacing: '-2.5px', lineHeight: 1 }}>
                {Number(event.ticket_price) === 0
                  ? <span style={{ fontSize: '26px' }}>Ücretsiz</span>
                  : <>{Number(event.ticket_price).toLocaleString('tr-TR')} <sub style={{ fontSize: '15px', fontWeight: 400, letterSpacing: 0 }}>TL</sub></>
                }
              </div>
              {kalan > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#86efac', boxShadow: '0 0 6px #86efac', display: 'inline-block' }} />
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{kalan} bilet kaldı</span>
                </div>
              )}
            </div>

            {/* Tear divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-10px', top: '-9px', width: '18px', height: '18px', background: '#07071a', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />
              <div style={{ position: 'absolute', right: '-10px', top: '-9px', width: '18px', height: '18px', background: '#07071a', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>

            {/* Form */}
            <div style={{ padding: '20px' }}>
              {kalan > 0 ? (
                <TicketForm
                  eventId={event.id}
                  ticketPrice={Number(event.ticket_price)}
                  shopierLink={event.shopier_link}
                  maxCapacity={kalan}
                />
              ) : (
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>😔</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#f87171', marginBottom: '4px' }}>Biletler Tükendi</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Tüm biletler satılmıştır.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
