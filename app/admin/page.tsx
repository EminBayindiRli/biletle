import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import AdminOrgCard from '@/components/AdminOrgCard'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const adminEmail = process.env.admin_email
  if (!adminEmail || user.email !== adminEmail) {
    redirect('/')
  }

  const { data: orgs } = await supabaseAdmin
    .from('organizations')
    .select('id, name, email, created_at, is_approved')
    .order('created_at', { ascending: false })

  const pending = (orgs ?? []).filter((o: any) => !o.is_approved)
  const approved = (orgs ?? []).filter((o: any) => o.is_approved)

  const surface = 'rgba(255,255,255,0.04)'
  const border = '1px solid rgba(255,255,255,0.08)'

  return (
    <div style={{ minHeight: '100vh', background: '#07071a' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(14,14,36,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 32px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: 900, color: '#818cf8', letterSpacing: '-1px' }}>biletle.</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>/</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Admin Panel</span>
        </div>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{user.email}</span>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          <div style={{
            background: pending.length > 0 ? 'rgba(251,191,36,0.08)' : surface,
            border: pending.length > 0 ? '1px solid rgba(251,191,36,0.2)' : border,
            borderRadius: '16px', padding: '20px',
          }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>Onay Bekleyen</div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: pending.length > 0 ? '#fbbf24' : 'rgba(255,255,255,0.9)', letterSpacing: '-2px', lineHeight: 1 }}>
              {pending.length}
            </div>
          </div>
          <div style={{ background: surface, border, borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>Onaylanan</div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#34d399', letterSpacing: '-2px', lineHeight: 1 }}>
              {approved.length}
            </div>
          </div>
        </div>

        {/* Pending */}
        {pending.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 8px #fbbf24', display: 'inline-block' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Onay Bekleyenler</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pending.map((org: any) => (
                <AdminOrgCard key={org.id} org={org} type="pending" />
              ))}
            </div>
          </div>
        )}

        {pending.length === 0 && (
          <div style={{
            background: surface, border, borderRadius: '14px',
            padding: '40px', textAlign: 'center',
            fontSize: '13px', color: 'rgba(255,255,255,0.25)', marginBottom: '32px',
          }}>
            Onay bekleyen hesap yok 🎉
          </div>
        )}

        {/* Approved */}
        {approved.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Onaylanan Hesaplar</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {approved.map((org: any) => (
                <AdminOrgCard key={org.id} org={org} type="approved" />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
