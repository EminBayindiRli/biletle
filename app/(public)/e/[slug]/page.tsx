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
    <div style={{ minHeight: '100vh', background: 'white', fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* Nav */}
      <nav style={{
        background: 'white', borderBottom: '1px solid #e5e7eb',
        padding: '0 48px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '18px', fontWeight: 900, color: '#4f46e5', letterSpacing: '-1px' }}>biletle.</span>
        <Link href="/" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
          ← Tüm Etkinlikler
        </Link>
      </nav>

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
        padding: '56px 48px 48px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Dot grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
          {/* Badge */}
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

          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: 'white', letterSpacing: '-2.5px', lineHeight: 1.05, marginBottom: '20px' }}>
            {event.title}
          </h1>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 500,
              padding: '7px 14px', borderRadius: '20px',
            }}>
              📅 {dateStr} · {timeStr}
            </span>
            {event.location && (
              <span style={{
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 500,
                padding: '7px 14px', borderRadius: '20px',
              }}>
                📍 {event.location}
              </span>
            )}
            <span style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 500,
              padding: '7px 14px', borderRadius: '20px',
            }}>
              🎫 {Number(event.ticket_price) === 0 ? 'Ücretsiz' : `${Number(event.ticket_price).toLocaleString('tr-TR')} TL`}
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '40px 48px',
        display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start',
      }}>
        {/* Left column */}
        <div>
          {/* Description */}
          {event.description && (
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>
                🎵 Etkinlik Hakkında
              </div>
              <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.75 }}>
                {event.description}
              </p>
            </div>
          )}

          {/* Capacity info */}
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              📊 Kapasite
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
              <span>{event.sold_count} bilet satıldı</span>
              <span>{kalan} bilet kaldı</span>
            </div>
            <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '4px',
                background: doluluk >= 90 ? '#ef4444' : doluluk >= 70 ? '#f59e0b' : '#4f46e5',
                width: `${doluluk}%`, transition: 'width 0.5s',
              }} />
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
              {event.capacity} kişilik kapasite · %{doluluk} dolu
            </div>
          </div>
        </div>

        {/* Right column — ticket widget */}
        <div>
          <div style={{
            background: 'white', border: '1px solid #e5e7eb', borderRadius: '24px',
            overflow: 'hidden', position: 'sticky', top: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.04)',
          }}>
            {/* Widget top */}
            <div style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              padding: '24px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', right: '-20px', bottom: '-20px',
                width: '80px', height: '80px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%',
              }} />
              <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                Kişi Başı Fiyat
              </div>
              <div style={{ fontSize: '44px', fontWeight: 900, color: 'white', letterSpacing: '-3px', lineHeight: 1 }}>
                {Number(event.ticket_price) === 0
                  ? <span style={{ fontSize: '28px', fontWeight: 800 }}>Ücretsiz</span>
                  : <>{Number(event.ticket_price).toLocaleString('tr-TR')} <sub style={{ fontSize: '16px', fontWeight: 400, letterSpacing: 0 }}>TL</sub></>
                }
              </div>
              {kalan > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#86efac', boxShadow: '0 0 6px #86efac', display: 'inline-block' }} />
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{kalan} bilet kaldı</span>
                </div>
              )}
            </div>

            {/* Ticket tear divider */}
            <div style={{ height: '1px', background: '#f3f4f6', position: 'relative', margin: '0 -1px' }}>
              <div style={{ position: 'absolute', left: '-10px', top: '-9px', width: '18px', height: '18px', background: '#f9fafb', borderRadius: '50%', border: '1px solid #e5e7eb' }} />
              <div style={{ position: 'absolute', right: '-10px', top: '-9px', width: '18px', height: '18px', background: '#f9fafb', borderRadius: '50%', border: '1px solid #e5e7eb' }} />
            </div>

            {/* Form area */}
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
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#ef4444', marginBottom: '4px' }}>Biletler Tükendi</div>
                  <div style={{ fontSize: '13px', color: '#9ca3af' }}>Bu etkinlik için tüm biletler satılmıştır.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
