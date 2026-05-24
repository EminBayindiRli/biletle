'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Org = Database['public']['Tables']['organizations']['Row']

export default function DashboardSidebar({ org }: { org: Org | null }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/dashboard/events', label: 'Etkinlikler', icon: '🎪' },
    { href: '/dashboard/profile', label: 'Ayarlar', icon: '⚙️' },
  ]

  const isAdmin = org?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

  // İlk harfi büyük, avatar için
  const initials = org?.name?.charAt(0).toUpperCase() ?? '?'

  return (
    <aside style={{
      width: '240px', flexShrink: 0,
      background: 'white', borderRight: '1px solid #e5e7eb',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0, overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ fontSize: '20px', fontWeight: 900, color: '#4f46e5', letterSpacing: '-1px' }}>biletle.</div>
        {org && (
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {org.name}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9ca3af', padding: '8px 12px 4px' }}>
          Ana Menü
        </div>

        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '8px',
                fontSize: '13px', fontWeight: isActive ? 600 : 500,
                color: isActive ? '#4f46e5' : '#4b5563',
                background: isActive ? '#eef2ff' : 'transparent',
                textDecoration: 'none', marginBottom: '2px',
                transition: 'all 0.12s',
              }}
            >
              <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}

        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9ca3af', padding: '12px 12px 4px', marginTop: '4px' }}>
          Araçlar
        </div>

        <Link
          href="/dashboard/checkin"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '8px',
            fontSize: '13px', fontWeight: 500, color: '#4b5563',
            background: 'transparent', textDecoration: 'none', marginBottom: '2px',
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
              padding: '9px 12px', borderRadius: '8px',
              fontSize: '13px', fontWeight: 500, color: '#ef4444',
              background: 'transparent', textDecoration: 'none', marginBottom: '2px',
            }}
          >
            <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>🔧</span>
            Admin Panel
          </Link>
        )}
      </nav>

      {/* Bottom: user row + logout */}
      <div style={{ padding: '8px', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: '#4f46e5', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {org?.name ?? 'Organizasyon'}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Organizatör</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '8px', border: 'none',
            background: 'transparent', fontSize: '13px', fontWeight: 500,
            color: '#6b7280', cursor: 'pointer', marginTop: '2px',
          }}
        >
          <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>🚪</span>
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
