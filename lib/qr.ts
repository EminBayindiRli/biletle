import QRCode from 'qrcode'

// E-posta attachment için Buffer üretir
export async function generateQRBuffer(token: string): Promise<Buffer> {
  return QRCode.toBuffer(token, {
    width: 300,
    margin: 2,
    color: {
      dark: '#1e1b4b',
      light: '#ffffff',
    },
  })
}
