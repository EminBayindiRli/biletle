import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

const UUIDSchema = z.string().uuid()

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params

  if (!UUIDSchema.safeParse(eventId).success) {
    return NextResponse.json({ error: 'Geçersiz etkinlik ID.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id, title, org_id')
    .eq('id', eventId)
    .single()

  if (!event || !org || (event as any).org_id !== org.id) {
    return NextResponse.json({ error: 'Etkinlik bulunamadı.' }, { status: 404 })
  }

  // Tüm biletleri katılımcı bilgileriyle çek
  const { data: tickets } = await supabaseAdmin
    .from('tickets')
    .select('ticket_number, checked_in_at, attendees(name, email)')
    .eq('event_id', eventId)
    .order('ticket_number', { ascending: true })

  const rows = (tickets ?? []).map((t: any) => {
    const att = t.attendees?.[0]
    const checkedIn = t.checked_in_at ? 'Evet' : 'Hayır'
    const checkedInAt = t.checked_in_at
      ? new Date(t.checked_in_at).toLocaleString('tr-TR')
      : ''
    return [
      att?.name ?? '',
      att?.email ?? '',
      t.ticket_number ?? '',
      checkedIn,
      checkedInAt,
    ]
  })

  const header = ['Ad Soyad', 'E-posta', 'Bilet No', 'Giriş Yaptı', 'Giriş Zamanı']
  const csvLines = [header, ...rows].map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  )
  const csv = '﻿' + csvLines.join('\r\n') // BOM → Excel'de Türkçe karakter desteği

  const filename = `katilimcilar-${eventId.slice(0, 8)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
