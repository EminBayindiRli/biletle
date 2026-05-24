'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError('Bir hata oluştu. E-posta adresinizi kontrol edin.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">biletle</h1>
          <p className="text-gray-500 mt-1 text-sm">Şifre sıfırlama</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📬</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">E-posta Gönderildi</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              <strong>{email}</strong> adresine şifre sıfırlama linki gönderdik.
              Spam klasörünü de kontrol et.
            </p>
            <Link
              href="/auth/login"
              className="text-sm text-indigo-600 hover:underline"
            >
              ← Giriş sayfasına dön
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="sen@ornek.com"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white text-sm py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
            </button>

            <p className="text-center text-sm text-gray-500">
              <Link href="/auth/login" className="text-indigo-600 hover:underline">
                ← Giriş sayfasına dön
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
