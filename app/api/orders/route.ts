import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { approveOrder } from '@/lib/approve-order'
import { z } from 'zod'

const AttendeeSchema = z.object({
  name:  z.string().min(2).max(100),
  email: z.string().email(),
})

const OrderSchema = z.object({
  event_id:       z.string().uuid('Geçersiz etkinlik ID.'),
  buyer_name:     z.string().min(2, 'İsim en az 2 karakter olmalı.').max(100),
  buyer_email:    z.string().email('Geçerli bir e-posta girin.'),
  buyer_phone:    z.string().optional().or(z.literal('')),
  quantity:       z.number().int().min(1).max(10).default(1),
  attendees_data: z.array(AttendeeSchema).optional(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }

  const parsed = OrderSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Geçersiz veri.'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const { event_id, buyer_name, buyer_email, buyer_phone, quantity, attendees_data } = parsed.data

  // Katılımcı sayısı bilet adediyle eşleşmeli
  if (attendees_data && attendees_data.length !== quantity) {
    return NextResponse.json({ error: 'Katılımcı bilgileri eksik.' }, { status: 400 })
  }

  // Etkinliği kontrol et
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id, ticket_price, capacity, sold_count, status')
    .eq('id', event_id)
    .single()

  if (!event) return NextResponse.json({ error: 'Etkinlik bulunamadı.' }, { status: 404 })
  if (event.status !== 'active') return NextResponse.json({ error: 'Etkinlik aktif değil.' }, { status: 400 })
  if (event.sold_count + quantity > event.capacity) {
    return NextResponse.json({ error: 'Yeterli kapasite yok.' }, { status: 400 })
  }

  const total_amount = Number(event.ticket_price) * quantity

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .insert({
      event_id,
      buyer_name: buyer_name.trim(),
      buyer_email: buyer_email.toLowerCase().trim(),
      buyer_phone: buyer_phone || null,
      quantity,
      total_amount,
      status: 'pending',
      attendees_data: attendees_data ?? [{ name: buyer_name, email: buyer_email }],
    })
    .select('id, total_amount')
    .single()

  if (error) return NextResponse.json({ error: 'Sipariş oluşturulamadı.' }, { status: 500 })

  // Ücretsiz etkinlik → otomatik onayla, Shopier'e gitme
  if (total_amount === 0) {
    try {
      await approveOrder(order.id)
    } catch (err) {
      console.error('Otomatik onay hatası:', err)
    }
    return NextResponse.json({ order_id: order.id, total_amount: 0, auto_approved: true })
  }

  return NextResponse.json({ order_id: order.id, total_amount: order.total_amount })
}
