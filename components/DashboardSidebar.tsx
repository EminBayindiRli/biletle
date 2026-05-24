'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Org = Database['public']['Tables']['organizations']['Row']

const S = {
  sidebar: {
    width: '220px', flexShrink: 0,
    background: '#0e0e24',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', flexDirection: 'column',
    height: '100vh', position: 'sticky', top: 0, overflowY: 'auto',
  } as React.CSSProperties,
}

export default function DashboardSidebar({ org }: { org: Org | null }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠', exact: true },
    { href: '/dashboard/events', label: 'Etkinlikler', icon: '🎪', exact: false },
    { href: '/dashboard/profile', label: 'Ayarlar', icon: '⚙️', exact: true },
  ]

  const isAdmin = org?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
  const initials = org?.name?.charAt(0).toUpperCase() ?? '?'

  return (
    <aside style={S.sidebar}>
      {/* Brand */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '20px', fontWeight: 900, color: '#818cf8', letterSpacing: '-1px' }}>biletle.</div>
        {org && (
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {org.name}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.2)', padding: '8px 10px 4px' }}>
          Ana Menü
        </div>

        {links.map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 10px', borderRadius: '8px',
                fontSize: '13px', fontWeight: isActive ? 600 : 400,
                color: isActive ? 'white' : 'rgba(255,255,255,0.45)',
                background: isActive ? 'rgba(79,70,229,0.2)' : 'transparent',
                textDecoration: 'none', marginBottom: '2px',
                transition: 'all 0.12s',
                border: isActive ? '1px solid rgba(79,70,229,0.3)' : '1px solid transparent',
              }}
            >
              <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}

        <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.2)', padding: '12px 10px 4px', marginTop: '4px' }}>
          Araçlar
        </div>

        <Link
          href="/dashboard/checkin"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 10px', borderRadius: '8px',
            fontSize: '13px', fontWeight: 400, color: 'rgba(255,255,255,0.45)',
            background: 'transparent', textDecoration: 'none', marginBottom: '2px',
            border: '1px solid transparent',
          }}
        >
          <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>📷</span>
          QR Scanner
        </Link>

        {isAdmin && (
          <Link
            href="/admin"
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 10px', borderRadius: '8px',
              fontSize: '13px', fontWeight: 400, color: 'rgba(239,68,68,0.7)',
              background: 'transparent', textDecoration: 'none', marginBottom: '2px',
              border: '1px solid transparent',
            }}
          >
            <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>🔧</span>
            Admin Panel
          </Link>
        )}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(79,70,229,0.3)', border: '1px solid rgba(79,70,229,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: '#818cf8',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {org?.name ?? 'Organizasyon'}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>Organizatör</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 10px', borderRadius: '8px', border: 'none',
            background: 'transparent', fontSize: '12px', fontWeight: 400,
            color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>🚪</span>
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
