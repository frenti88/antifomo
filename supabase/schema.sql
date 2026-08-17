-- ─────────────────────────────────────────────
-- AntiFOMO — Supabase PostgreSQL Database Schema
-- Run this script in the Supabase SQL Editor to initialize
-- your database tables, security policies (RLS), and indexes.
-- ─────────────────────────────────────────────

-- 1. Create enum types for categories and statuses
CREATE TYPE event_price_type AS ENUM ('free', 'paid', 'donation', 'unknown');
CREATE TYPE event_status AS ENUM ('published', 'pending', 'archived', 'draft');

-- 2. Events Table (Main Radar Events)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT,
  start_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  venue TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT DEFAULT 'Medellín',
  latitude NUMERIC,
  longitude NUMERIC,
  category TEXT NOT NULL,
  subcategory TEXT,
  price_type event_price_type NOT NULL DEFAULT 'free',
  price_min NUMERIC DEFAULT 0,
  price_max NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'COP',
  organizer TEXT,
  image_url TEXT,
  sources JSONB DEFAULT '[]'::jsonb,
  source_count INT DEFAULT 1,
  verified BOOLEAN DEFAULT false,
  is_gem BOOLEAN DEFAULT false,
  is_newly_found BOOLEAN DEFAULT true,
  score INT DEFAULT 85,
  tags TEXT[] DEFAULT '{}',
  status event_status DEFAULT 'published',
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Community Submissions Table (/enviar Form)
CREATE TABLE IF NOT EXISTS submitted_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  source_url TEXT,
  event_date DATE,
  event_time TIME,
  venue TEXT,
  category TEXT,
  price TEXT,
  submitter_email TEXT,
  status TEXT DEFAULT 'pending_review', -- 'pending_review', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE submitted_events ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Public Access
-- Anyone can read published events
CREATE POLICY "Public events are viewable by everyone" 
  ON events FOR SELECT 
  USING (status = 'published');

-- Anyone can submit an event from the web form
CREATE POLICY "Anyone can insert community submissions" 
  ON submitted_events FOR INSERT 
  WITH CHECK (true);

-- 6. Indexes for Performance & Search
CREATE INDEX IF NOT EXISTS idx_events_date ON events(start_date, start_time);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_neighborhood ON events(neighborhood);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_is_gem ON events(is_gem) WHERE is_gem = true;

-- 7. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at BEFORE UPDATE
ON events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
