import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import DashboardSidebar from '@/components/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (org && !(org as any).is_approved) {
    redirect('/pending-approval')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07071a', display: 'flex' }}>
      <DashboardSidebar org={org} />
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}
