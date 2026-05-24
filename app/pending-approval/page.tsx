import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PendingApprovalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Zaten onaylandıysa dashboard'a gönder
  const { data: org } = await supabase
    .from('organizations')
    .select('is_approved, name')
    .eq('user_id', user.id)
    .single()

  if ((org as any)?.is_approved) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⏳</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Onay Bekleniyor</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Hesabın oluşturuldu! Organizatör panelinize erişmek için
          admin onayı gerekiyor. En kısa sürede incelenecek.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm font-medium text-amber-800 mb-1">📬 Ne Yapmalısın?</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Hesabın onaylandığında e-posta alacaksın. Onaylandıktan sonra
            bu sayfayı yenileyerek panele geçebilirsin.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href="/pending-approval"
            className="text-sm bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Yenile
          </a>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    </div>
  )
}
