import { createBrowserClient } from '@supabase/ssr'

// Client component'lerde kullanılır.
// createBrowserClient session'ı hem localStorage hem cookie'ye yazar,
// bu sayede sunucu taraflı proxy.ts da session'ı okuyabilir.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createBrowserClient<any>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
