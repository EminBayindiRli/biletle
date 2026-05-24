'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Slug oluştur: "Emin Bayındırlı" → "emin-bayindirli"
      const slug = name
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      const { error: orgError } = await supabase.from('organizations').insert({
        user_id: data.user.id,
        name,
        slug: `${slug}-${Date.now()}`,
        email,
      })

      if (orgError) {
        setError('Organizasyon oluşturulamadı: ' + orgError.message)
        setLoading(false)
        return
      }
    }

    window.location.href = '/pending-approval'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">biletle</h1>
          <p className="text-gray-500 mt-1 text-sm">Ücretsiz hesap oluştur</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adınız / Organizasyon Adı</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Emin Bayındırlı"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sen@ornek.com"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 6 karakter"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            {loading ? 'Hesap oluşturuluyor...' : 'Kayıt Ol'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Zaten hesabın var mı?{' '}
          <Link href="/auth/login" className="text-indigo-600 font-medium hover:underline">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  )
}
