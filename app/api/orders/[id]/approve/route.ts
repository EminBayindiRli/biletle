import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendTicketEmail } from '@/lib/send-ticket-email'
import { SignJWT } from 'jose'
import { z } from 'zod'

const UUIDSchema = z.string().uuid()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params

  if (!UUIDSchema.safeParse(orderId).success) {
    return NextResponse.json({ error: 'Geçersiz sipariş ID.' }, { status: 400 })
  }

  // Kullanıcı kontrolü
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  // Siparişi + etkinliği paralel getir
  const [{ data: order }, { data: org }] = await Promise.all([
    supabaseAdmin.from('orders').select('*, events(*)').eq('id', orderId).single(),
    supabaseAdmin.from('organizations').select('id').eq('user_id', user.id).single(),
  ])

  if (!order) return NextResponse.json({ error: 'Sipariş bulunamadı.' }, { status: 404 })
  if (order.status !== 'pending') return NextResponse.json({ error: 'Sipariş zaten işlendi.' }, { status: 400 })
  if (!org || order.events?.org_id !== org.id) {
    return NextResponse.json({ error: 'Bu sipariş size ait değil.' }, { status: 403 })
  }

  const eventData = order.events
  const secret = new TextEncoder().encode(process.env.QR_SECRET ?? 'biletle_secret')

  // Kaç bilet varsa hesapla (mevcut ticket sayısını al)
  const { count: ticketCount } = await supabaseAdmin
    .from('tickets')
    .select('*', { count: 'exact', head: true })

  const year = new Date().getFullYear()
  const baseCount = ticketCount ?? 0

  // Katılımcı listesi — attendees_data varsa onu kullan, yoksa buyer bilgisiyle doldur
  const attendees: { name: string; email: string }[] = order.attendees_data
    ?? Array.from({ length: order.quantity }, () => ({
      name: order.buyer_name,
      email: order.buyer_email,
    }))

  // Her katılımcı için bilet oluştur
  const ticketInserts = []
  const ticketNumbers: string[] = []

  for (let i = 0; i < attendees.length; i++) {
    const ticketNum = `BLT-${year}-${String(baseCount + i + 1).padStart(6, '0')}`
    ticketNumbers.push(ticketNum)

    const qrToken = await new SignJWT({
      ticket_number: ticketNum,
      event_id: order.event_id,
      order_id: orderId,
      attendee_index: i,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .sign(secret)

    ticketInserts.push({
      qrToken,
      ticketNum,
      attendee: attendees[i],
    })
  }

  // Siparişi paid yap
  await supabaseAdmin
    .from('orders')
    .update({ status: 'paid', approved_by: user.id, approved_at: new Date().toISOString() })
    .eq('id', orderId)

  // Tüm biletleri DB'ye ekle
  const { data: createdTickets } = await supabaseAdmin
    .from('tickets')
    .insert(ticketInserts.map(t => ({
      order_id: orderId,
      event_id: order.event_id,
      qr_token: t.qrToken,
      ticket_number: t.ticketNum,
    })))
    .select('id, qr_token, ticket_number')

  // Katılımcıları DB'ye ekle
  if (createdTickets) {
    await supabaseAdmin.from('attendees').insert(
      createdTickets.map((ticket, i) => ({
        ticket_id: ticket.id,
        event_id: order.event_id,
        name: attendees[i].name,
        email: attendees[i].email,
      }))
    )
  }

  // sold_count artır
  await supabaseAdmin
    .from('events')
    .update({ sold_count: (eventData?.sold_count ?? 0) + order.quantity })
    .eq('id', order.event_id)

  // Her katılımcıya ayrı mail gönder
  const eventDate = eventData?.starts_at
    ? new Date(eventData.starts_at).toLocaleDateString('tr-TR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : ''

  await Promise.allSettled(
    ticketInserts.map((t, i) =>
      sendTicketEmail({
        to: attendees[i].email,
        buyerName: attendees[i].name,
        eventTitle: eventData?.title ?? '',
        eventDate,
        eventLocation: eventData?.location ?? null,
        ticketNumber: t.ticketNum,
        qrToken: t.qrToken,
        quantity: 1,
        totalAmount: Number(order.total_amount) / order.quantity,
      }).catch(err => console.error(`Mail gönderilemedi (${attendees[i].email}):`, err))
    )
  )

  return NextResponse.json({ success: true, ticket_numbers: ticketNumbers })
}
