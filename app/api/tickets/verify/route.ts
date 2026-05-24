import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { jwtVerify } from 'jose'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token || token.length > 2000) {
    return NextResponse.json({ error: 'Geçersiz token.' }, { status: 400 })
  }

  // Kullanıcı kontrolü
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  // JWT doğrula
  try {
    const secret = new TextEncoder().encode(process.env.QR_SECRET ?? 'biletle_secret')
    await jwtVerify(token, secret)
  } catch {
    return NextResponse.json({
      valid: false,
      reason: 'Geçersiz QR kod — sahte bilet.',
    }, { status: 200 })
  }

  // Bileti bul
  const { data: ticket } = await supabaseAdmin
    .from('tickets')
    .select('*, events(title, org_id), attendees(name, email)')
    .eq('qr_token', token)
    .single()

  if (!ticket) {
    return NextResponse.json({
      valid: false,
      reason: 'Bilet bulunamadı.',
    })
  }

  // Bu organizatörün etkinliği mi?
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!org || ticket.events?.org_id !== org.id) {
    return NextResponse.json({ error: 'Bu bilet size ait değil.' }, { status: 403 })
  }

  // Daha önce kullanılmış mı?
  if (ticket.checked_in_at) {
    return NextResponse.json({
      valid: false,
      reason: 'Bu bilet zaten kullanıldı.',
      checked_in_at: ticket.checked_in_at,
      attendee: ticket.attendees?.[0] ?? null,
    })
  }

  // Check-in yap
  await supabaseAdmin
    .from('tickets')
    .update({
      checked_in_at: new Date().toISOString(),
      checked_in_by: user.id,
    })
    .eq('id', ticket.id)

  return NextResponse.json({
    valid: true,
    ticket_number: ticket.ticket_number,
    attendee: ticket.attendees?.[0] ?? null,
    event_title: ticket.events?.title ?? '',
  })
}
