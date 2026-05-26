import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: '#07071a', fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(7,7,26,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 48px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '20px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
          biletle<span style={{ color: '#818cf8' }}>.</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>Özellikler</span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>Nasıl Çalışır</span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>Fiyatlar</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="/auth/login" style={{
            padding: '8px 16px', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 500,
            textDecoration: 'none',
          }}>
            Giriş Yap
          </Link>
          <Link href="/auth/register" style={{
            padding: '8px 18px', borderRadius: '8px',
            background: '#4f46e5', color: 'white',
            fontSize: '13px', fontWeight: 600, textDecoration: 'none',
          }}>
            Ücretsiz Başla →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', padding: '120px 48px 100px', overflow: 'hidden' }}>
        {/* Gradient orbs */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(79,70,229,0.25) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 80% 60%, rgba(99,102,241,0.12) 0%, transparent 60%)',
        }} />
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black 0%, transparent 70%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(129,140,248,0.3)',
            color: '#818cf8', fontSize: '12px', fontWeight: 600,
            padding: '6px 14px', borderRadius: '20px', marginBottom: '28px',
          }}>
            <span style={{ width: '6px', height: '6px', background: '#818cf8', borderRadius: '50%', boxShadow: '0 0 8px #818cf8', display: 'inline-block' }} />
            Türkiye&apos;nin etkinlik platformu
          </div>

          <h1 style={{
            fontSize: 'clamp(48px, 7vw, 72px)', fontWeight: 900, lineHeight: 1,
            letterSpacing: '-4px', color: 'white', marginBottom: '24px',
          }}>
            Etkinliğini sat,<br />
            <span style={{ color: '#818cf8' }}>takibini yap.</span>
          </h1>

          <p style={{
            fontSize: '18px', color: 'rgba(255,255,255,0.45)', fontWeight: 400,
            lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 40px',
          }}>
            Parti, workshop, festival — ne düzenlersen düzenle. Dakikalar içinde bilet satışına başla. Komisyon yok, karmaşıklık yok.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register" style={{
              padding: '14px 28px', borderRadius: '10px', border: 'none',
              background: '#4f46e5', color: 'white', fontSize: '15px', fontWeight: 700,
              textDecoration: 'none', boxShadow: '0 0 32px rgba(79,70,229,0.4)',
              display: 'inline-block',
            }}>
              Hemen Başla — Ücretsiz
            </Link>
            <Link href="/auth/login" style={{
              padding: '14px 28px', borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)',
              fontSize: '15px', fontWeight: 600, textDecoration: 'none',
              display: 'inline-block',
            }}>
              Giriş Yap
            </Link>
          </div>

          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '16px' }}>
            Kredi kartı gerekmez · 2 dakikada hazır
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '48px', justifyContent: 'center', marginTop: '72px' }}>
            {[
              { num: '12K+', label: 'Satılan Bilet' },
              { num: '340+', label: 'Etkinlik' },
              { num: '98%', label: 'Memnuniyet' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: 'white', letterSpacing: '-2px' }}>{s.num}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 500, marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '0 48px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#818cf8', marginBottom: '12px' }}>
          Özellikler
        </div>
        <h2 style={{ fontSize: '40px', fontWeight: 800, color: 'white', letterSpacing: '-2px', marginBottom: '16px' }}>
          Her şey dahil
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', maxWidth: '480px', lineHeight: 1.6, marginBottom: '48px' }}>
          Bilet satışından check-in&apos;e, raporlamadan e-posta bildirimlerine — tek platform.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            { icon: '🎫', title: 'Kolay Bilet Satışı', desc: 'Etkinliğini oluştur, linki paylaş. Ziyaretçiler kredi kartıyla anında bilet alır.' },
            { icon: '📷', title: 'QR Kod Girişi', desc: 'Cep telefonu kamerası ile anlık QR tarama. Her bilet tek kullanımlık, güvenli.' },
            { icon: '📧', title: 'Otomatik E-posta', desc: 'Satın alma sonrası QR kodlu bilet otomatik gönderilir. Müşteri memnuniyeti garantili.' },
            { icon: '📊', title: 'Canlı İstatistikler', desc: 'Kaç bilet satıldı, kaçı giriş yaptı — anlık olarak görün.' },
            { icon: '📥', title: 'CSV Export', desc: 'Katılımcı listesini Excel\'e aktarın. Tüm bilet ve giriş bilgileri dahil.' },
            { icon: '🔒', title: 'Güvenli Ödeme', desc: 'Shopier entegrasyonu ile güvenli ödeme alın. VISA, MC, TROY desteği.' },
          ].map(f => (
            <div key={f.title} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px', padding: '28px', transition: 'all 0.2s',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', marginBottom: '16px',
              }}>
                {f.icon}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>{f.title}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '0 48px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#818cf8', marginBottom: '12px' }}>
          Nasıl Çalışır
        </div>
        <h2 style={{ fontSize: '40px', fontWeight: 800, color: 'white', letterSpacing: '-2px', marginBottom: '16px' }}>
          4 adımda başla
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', maxWidth: '480px', lineHeight: 1.6, marginBottom: '48px' }}>
          Teknik bilgi gerektirmez. 5 dakikada etkinliğin satışa açık.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: '28px', left: '10%', right: '10%', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(79,70,229,0.3) 20%, rgba(79,70,229,0.3) 80%, transparent)',
          }} />
          {[
            { n: '1', title: 'Kayıt Ol', desc: 'Organizatör hesabı aç, onay bekle' },
            { n: '2', title: 'Etkinlik Oluştur', desc: 'Tarih, fiyat, kapasite bilgilerini gir' },
            { n: '3', title: 'Linki Paylaş', desc: 'Sosyal medyada duyur, biletler satılsın' },
            { n: '4', title: 'Girişi Yönet', desc: 'QR okuyucu ile hızlı kapı kontrolü' },
          ].map(s => (
            <div key={s.n} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: 800, color: '#818cf8',
                margin: '0 auto 16px',
              }}>
                {s.n}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>{s.title}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '32px 48px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>biletle.</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
            biletle,{' '}
            <a href="https://codeb.tech" target="_blank" rel="noopener noreferrer"
              style={{ color: 'rgba(129,140,248,0.7)', textDecoration: 'none', fontWeight: 500 }}>
              Codeb.tech
            </a>
            {' '}ürünüdür.
          </span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>© 2025 biletle.shop</span>
        </div>
      </footer>
    </div>
  )
}
