-- =============================================
-- BILETLE - Veritabani Semasi
-- Supabase SQL Editor'de calistir
-- =============================================

-- 1. ORGANIZATIONS
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  iban        TEXT,
  shopier_url TEXT,
  plan        TEXT DEFAULT 'free',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EVENTS
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  location        TEXT,
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ,
  capacity        INTEGER NOT NULL,
  ticket_price    DECIMAL(10,2) NOT NULL,
  currency        TEXT DEFAULT 'TRY',
  shopier_link    TEXT,
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended')),
  sold_count      INTEGER DEFAULT 0,
  cover_image_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID REFERENCES events(id),
  buyer_name      TEXT NOT NULL,
  buyer_email     TEXT NOT NULL,
  buyer_phone     TEXT,
  quantity        INTEGER DEFAULT 1,
  total_amount    DECIMAL(10,2) NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  shopier_ref     TEXT,
  approved_by     UUID,
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TICKETS
CREATE TABLE tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id),
  event_id        UUID REFERENCES events(id),
  qr_token        TEXT UNIQUE NOT NULL,
  ticket_number   TEXT UNIQUE NOT NULL,
  checked_in_at   TIMESTAMPTZ,
  checked_in_by   UUID,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ATTENDEES
CREATE TABLE attendees (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID REFERENCES tickets(id),
  event_id    UUID REFERENCES events(id),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

-- Organizations: sadece kendi organizasyonunu gor
CREATE POLICY "org_select" ON organizations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "org_insert" ON organizations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "org_update" ON organizations
  FOR UPDATE USING (user_id = auth.uid());

-- Events: organizator sadece kendi etkinliklerini gorur
CREATE POLICY "events_select" ON events
  FOR SELECT USING (
    org_id IN (SELECT id FROM organizations WHERE user_id = auth.uid())
  );

CREATE POLICY "events_insert" ON events
  FOR INSERT WITH CHECK (
    org_id IN (SELECT id FROM organizations WHERE user_id = auth.uid())
  );

CREATE POLICY "events_update" ON events
  FOR UPDATE USING (
    org_id IN (SELECT id FROM organizations WHERE user_id = auth.uid())
  );

CREATE POLICY "events_delete" ON events
  FOR DELETE USING (
    org_id IN (SELECT id FROM organizations WHERE user_id = auth.uid())
  );

-- Events: public etkinlik sayfasi icin herkese acik (active)
CREATE POLICY "events_public_select" ON events
  FOR SELECT USING (status = 'active');

-- Orders: organizator kendi etkinliginin siparislerini gor
CREATE POLICY "orders_select" ON orders
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE org_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "orders_insert" ON orders
  FOR INSERT WITH CHECK (true); -- Herkese acik (bilet alma)

CREATE POLICY "orders_update" ON orders
  FOR UPDATE USING (
    event_id IN (
      SELECT id FROM events WHERE org_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

-- Tickets: organizator kendi biletlerini gor
CREATE POLICY "tickets_select" ON tickets
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE org_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

-- Attendees: organizator kendi katilimcilarini gor
CREATE POLICY "attendees_select" ON attendees
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE org_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

-- =============================================
-- INDEXES (performans icin)
-- =============================================

CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_org_id ON events(org_id);
CREATE INDEX idx_orders_event_id ON orders(event_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_tickets_qr_token ON tickets(qr_token);
CREATE INDEX idx_tickets_order_id ON tickets(order_id);
CREATE INDEX idx_organizations_user_id ON organizations(user_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);
