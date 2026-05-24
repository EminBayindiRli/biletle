import { resend } from './resend'
import { generateQRBuffer } from './qr'

type TicketEmailParams = {
  to: string
  buyerName: string
  eventTitle: string
  eventDate: string
  eventLocation: string | null
  ticketNumber: string
  qrToken: string
  quantity: number
  totalAmount: number
}

export async function sendTicketEmail(params: TicketEmailParams) {
  const {
    to, buyerName, eventTitle, eventDate,
    eventLocation, ticketNumber, qrToken, quantity, totalAmount
  } = params

  // QR'ı Buffer olarak üret → attachment olarak gönder
  const qrBuffer = await generateQRBuffer(qrToken)

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Biletiniz Hazır</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#4f46e5;padding:24px;text-align:center;">
      <p style="color:white;font-size:22px;font-weight:700;margin:0;">biletle</p>
      <p style="color:#c7d2fe;font-size:13px;margin:4px 0 0;">biletiniz hazır 🎉</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 28px;">
      <p style="color:#374151;font-size:15px;margin:0 0 20px;">
        Merhaba <strong>${buyerName}</strong>,<br>
        <strong>${eventTitle}</strong> etkinliği için biletiniz onaylandı!
      </p>

      <!-- Etkinlik Bilgileri -->
      <div style="background:#f3f4f6;border-radius:10px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#111827;">${eventTitle}</p>
        <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">📅 ${eventDate}</p>
        ${eventLocation ? `<p style="margin:0 0 4px;font-size:13px;color:#6b7280;">📍 ${eventLocation}</p>` : ''}
        <p style="margin:0;font-size:13px;color:#6b7280;">🎫 ${quantity} bilet · ${totalAmount.toLocaleString('tr-TR')} TL</p>
      </div>

      <!-- Bilet Numarası -->
      <div style="border:2px dashed #e5e7eb;border-radius:10px;padding:16px;margin-bottom:24px;text-align:center;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">Bilet Numarası</p>
        <p style="margin:0;font-size:20px;font-weight:700;color:#4f46e5;letter-spacing:2px;">${ticketNumber}</p>
      </div>

      <!-- QR Kod -->
      <div style="text-align:center;margin-bottom:24px;">
        <div style="background:#f3f4f6;border-radius:12px;padding:16px;display:inline-block;">
          <p style="font-size:13px;color:#4f46e5;font-weight:600;margin:0 0 8px;">📎 QR Kodunuz Ektedir</p>
          <p style="font-size:12px;color:#6b7280;margin:0;">
            E-postanın ekindeki <strong>qr-bilet.png</strong> dosyasını açın.<br>
            Etkinlik girişinde bu kodu gösterin.
          </p>
        </div>
      </div>

      <!-- Uyarı -->
      <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px;">
        <p style="margin:0;font-size:12px;color:#92400e;">
          ⚠️ Bu bilet kişiye özeldir. Başkasıyla paylaşmayın.
          QR kod bir kez kullanılabilir.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:16px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#9ca3af;">
        biletle.shop · Güvenli etkinlik bilet platformu
      </p>
    </div>

  </div>
</body>
</html>
  `

  console.log(`[sendTicketEmail] Gönderiliyor: ${to} - ${ticketNumber}`)

  const { data, error } = await resend.emails.send({
    from: 'Biletle <bilet@biletle.shop>',
    to,
    subject: `🎫 Biletiniz Hazır: ${eventTitle}`,
    html,
    attachments: [
      {
        filename: 'qr-bilet.png',
        content: qrBuffer,
      },
    ],
  })

  if (error) {
    console.error('[sendTicketEmail] Resend hatası:', JSON.stringify(error))
    throw new Error(typeof error === 'object' ? JSON.stringify(error) : String(error))
  }

  console.log(`[sendTicketEmail] Başarılı: ${to} - id: ${(data as any)?.id}`)
  return data
}
