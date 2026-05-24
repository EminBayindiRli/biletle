import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

const UUIDSchema = z.string().uuid()

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params

  if (!UUIDSchema.safeParse(orgId).success) {
    return NextResponse.json({ error: 'Geçersiz ID.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail || user.email !== adminEmail) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok.' }, { status: 403 })
  }

  // Org'u sil (cascade ile user da silinecek değil — sadece org kaydı silinir)
  const { error } = await supabaseAdmin
    .from('organizations')
    .delete()
    .eq('id', orgId)

  if (error) return NextResponse.json({ error: 'Silme başarısız.' }, { status: 500 })

  return NextResponse.json({ success: true })
}
