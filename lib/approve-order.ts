import { supabaseAdmin } from './supabase-admin'
import { sendTicketEmail } from './send-ticket-email'
import { SignJWT } from 'jose'

/**
 * Bir siparişi onaylar: bilet oluşturur, DB'ye kaydeder, e-posta gönderir.
 * Ücretsiz etkinliklerde orders/route.ts tarafından otomatik çağrılır.
 * Ücretli etkinliklerde orders/[id]/approve/route.ts tarafından manuel çağrılır.
 */
export async function approveOrder(orderId: string, approvedByUserId?: string) {
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*, events(*)')
    .eq('id', orderId)
    .single()

  if (!order) throw new Error('Sipariş bulunamadı.')
  if (order.status !== 'pending') throw new Error('Sipariş zaten işlendi.')

  const eventData = order.events as any
  const secret = new TextEncoder().encode(process.env.QR_SECRET ?? 'biletle_secret')

  const { count: ticketCount } = await supabaseAdmin
    .from('tickets')
    .select('*', { count: 'exact', head: true })

  const year = new Date().getFullYear()
  const baseCount = ticketCount ?? 0

  const attendees: { name: string; email: string }[] = (order as any).attendees_data
    ?? Array.from({ length: order.quantity }, () => ({
      name: order.buyer_name,
      email: order.buyer_email,
    }))

  const ticketInserts: { qrToken: string; ticketNum: string; attendee: { name: string; email: string } }[] = []
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

    ticketInserts.push({ qrToken, ticketNum, attendee: attendees[i] })
  }

  // Siparişi paid yap
  await supabaseAdmin
    .from('orders')
    .update({
      status: 'paid',
      approved_at: new Date().toISOString(),
      ...(approvedByUserId ? { approved_by: approvedByUserId } : {}),
    })
    .eq('id', orderId)

  // Biletleri DB'ye ekle
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

  // E-posta gönder
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

  return ticketNumbers
}
