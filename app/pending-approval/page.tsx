import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PendingApprovalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('is_approved, name')
    .eq('user_id', user.id)
    .single()

  if ((org as any)?.is_approved) redirect('/dashboard')

  return (
    <div style={{
      minHeight: '100vh', background: '#07071a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(79,70,229,0.15), transparent)',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px', maxWidth: '440px', width: '100%',
        padding: '40px', textAlign: 'center',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 60px rgba(79,70,229,0.1)',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: '28px',
        }}>
          ⏳
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-1px', marginBottom: '10px' }}>
          Onay Bekleniyor
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: '24px' }}>
          Hesabın oluşturuldu! Organizatör panelinize erişmek için
          admin onayı gerekiyor. En kısa sürede incelenecek.
        </p>

        <div style={{
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)',
          borderRadius: '14px', padding: '16px', marginBottom: '24px', textAlign: 'left',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fbbf24', marginBottom: '6px' }}>📬 Ne Yapmalısın?</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
            Hesabın onaylandığında e-posta alacaksın. Onaylandıktan sonra
            bu sayfayı yenileyerek panele geçebilirsin.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a
            href="/pending-approval"
            style={{
              display: 'block', padding: '12px', borderRadius: '10px',
              background: '#4f46e5', color: 'white',
              fontSize: '14px', fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
            }}
          >
            Yenile
          </a>
          <Link
            href="/"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
          >
            Ana sayfaya dön
          </Link>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, textAlign: 'center' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)' }}>
          biletle,{' '}
          <a href="https://codeb.tech" target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgba(129,140,248,0.4)', textDecoration: 'none' }}>Codeb.tech</a>
          {' '}ürünüdür
        </span>
      </div>
    </div>
  )
}
