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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Organizatör hesaplarını yönet</p>
        </div>

        {/* Özet */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-700 font-medium">Onay Bekleyen</p>
            <p className="text-3xl font-bold text-amber-800 mt-1">{pending.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-teal-200 bg-teal-50 p-4">
            <p className="text-sm text-teal-700 font-medium">Onaylanan</p>
            <p className="text-3xl font-bold text-teal-800 mt-1">{approved.length}</p>
          </div>
        </div>

        {/* Bekleyen hesaplar */}
        {pending.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Onay Bekleyenler
            </h2>
            <div className="space-y-3">
              {pending.map((org: any) => (
                <AdminOrgCard key={org.id} org={org} type="pending" />
              ))}
            </div>
          </div>
        )}

        {pending.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm mb-8">
            Onay bekleyen hesap yok 🎉
          </div>
        )}

        {/* Onaylanan hesaplar */}
        {approved.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
              Onaylanan Hesaplar
            </h2>
            <div className="space-y-3">
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
