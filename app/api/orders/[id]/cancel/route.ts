import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

const UUIDSchema = z.string().uuid()

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params

  if (!UUIDSchema.safeParse(orderId).success) {
    return NextResponse.json({ error: 'Geçersiz sipariş ID.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const [{ data: order }, { data: org }] = await Promise.all([
    supabaseAdmin.from('orders').select('*, events(org_id)').eq('id', orderId).single(),
    supabaseAdmin.from('organizations').select('id').eq('user_id', user.id).single(),
  ])

  if (!order) return NextResponse.json({ error: 'Sipariş bulunamadı.' }, { status: 404 })
  if (order.status === 'cancelled') return NextResponse.json({ error: 'Sipariş zaten iptal edildi.' }, { status: 400 })
  if (order.status === 'paid') return NextResponse.json({ error: 'Onaylanmış siparişler iptal edilemez.' }, { status: 400 })
  if (!org || (order.events as any)?.org_id !== org.id) {
    return NextResponse.json({ error: 'Bu sipariş size ait değil.' }, { status: 403 })
  }

  await supabaseAdmin
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)

  return NextResponse.json({ success: true })
}
