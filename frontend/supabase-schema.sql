-- Elite AI Admin Dashboard - Supabase Schema
-- Paste this entire block into your Supabase SQL Editor:
-- https://bupwdgouuosohiecfvji.supabase.co/dashboard/new/sql

-- 1. LEADS - from demo form submissions
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  industry TEXT,
  question TEXT,
  source TEXT DEFAULT 'website_demo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PAGE_VIEWS - every page visit
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  session_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CALENDLY_CLICKS - "Book a Call" button clicks
CREATE TABLE IF NOT EXISTS calendly_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EVENTS - all user interactions
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security - allow anonymous INSERT for tracking
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendly_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert page_views" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert calendly_clicks" ON calendly_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert events" ON events FOR INSERT WITH CHECK (true);

-- Service role (admin dashboard) gets full access automatically
