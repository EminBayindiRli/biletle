import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-600">biletle</h1>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">
            Giriş Yap
          </Link>
          <Link
            href="/auth/register"
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Ücretsiz Başla
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <span className="inline-block bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          Türkiye&apos;nin bilet platformu
        </span>
        <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Etkinliğini oluştur,<br />
          <span className="text-indigo-600">linki paylaş, bilet sat.</span>
        </h2>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Parti, workshop, festival — ne düzenlersen düzenle. Biletle ile dakikalar içinde bilet satışına başla.
          Komisyon yok, karmaşıklık yok.
        </p>
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white text-lg px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-200"
        >
          Ücretsiz Başla →
        </Link>
        <p className="text-sm text-gray-400 mt-4">Kredi kartı gerekmez · 2 dakikada hazır</p>
      </section>

      {/* Özellikler */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: '🔗',
            title: 'Link Paylaş',
            desc: 'Etkinlik sayfanı Instagram, WhatsApp veya sitenle paylaş. Müşterilerin direkt oradan bilet alsın.',
          },
          {
            icon: '💳',
            title: 'Komisyon Yok',
            desc: 'Eventbrite gibi bilet başına komisyon almıyoruz. Aylık sabit ücret, hepsi bu.',
          },
          {
            icon: '📱',
            title: 'QR Check-in',
            desc: 'Etkinlik günü telefonunla QR kodları okut. Sahte bilet imkansız, kalabalık yönetimi kolay.',
          },
        ].map((f) => (
          <div key={f.title} className="bg-gray-50 rounded-2xl p-6">
            <span className="text-3xl">{f.icon}</span>
            <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
