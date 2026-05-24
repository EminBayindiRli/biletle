export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          email: string
          phone: string | null
          iban: string | null
          shopier_url: string | null
          plan: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          email: string
          phone?: string | null
          iban?: string | null
          shopier_url?: string | null
          plan?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
      }
      events: {
        Row: {
          id: string
          org_id: string
          title: string
          slug: string
          description: string | null
          location: string | null
          starts_at: string
          ends_at: string | null
          capacity: number
          ticket_price: number
          currency: string
          shopier_link: string | null
          status: 'draft' | 'active' | 'ended'
          sold_count: number
          cover_image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          title: string
          slug: string
          description?: string | null
          location?: string | null
          starts_at: string
          ends_at?: string | null
          capacity: number
          ticket_price: number
          currency?: string
          shopier_link?: string | null
          status?: 'draft' | 'active' | 'ended'
          sold_count?: number
          cover_image_url?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      orders: {
        Row: {
          id: string
          event_id: string
          buyer_name: string
          buyer_email: string
          buyer_phone: string | null
          quantity: number
          total_amount: number
          status: 'pending' | 'paid' | 'cancelled'
          shopier_ref: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          buyer_name: string
          buyer_email: string
          buyer_phone?: string | null
          quantity?: number
          total_amount: number
          status?: 'pending' | 'paid' | 'cancelled'
          shopier_ref?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      tickets: {
        Row: {
          id: string
          order_id: string
          event_id: string
          qr_token: string
          ticket_number: string
          checked_in_at: string | null
          checked_in_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          event_id: string
          qr_token: string
          ticket_number: string
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['tickets']['Insert']>
      }
      attendees: {
        Row: {
          id: string
          ticket_id: string
          event_id: string
          name: string
          email: string
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          event_id: string
          name: string
          email: string
          phone?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['attendees']['Insert']>
      }
    }
  }
}
