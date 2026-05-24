import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

const UUIDSchema = z.string().uuid()

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params

  if (!UUIDSchema.safeParse(orgId).success) {
    return NextResponse.json({ error: 'Geçersiz ID.' }, { status: 400 })
  }

  // Admin kontrolü
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail || user.email !== adminEmail) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok.' }, { status: 403 })
  }

  const { error } = await supabaseAdmin
    .from('organizations')
    .update({ is_approved: true })
    .eq('id', orgId)

  if (error) return NextResponse.json({ error: 'Onaylama başarısız.' }, { status: 500 })

  return NextResponse.json({ success: true })
}
