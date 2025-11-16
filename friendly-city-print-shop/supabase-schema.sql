-- Supabase SQL Schema for Friendly City Print Shop
-- Run this in your Supabase SQL Editor
-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW (),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW ()
);

-- Forum messages table
CREATE TABLE IF NOT EXISTS forum_messages (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW ()
);

-- Orders table (optional - for tracking orders)
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    template_id UUID REFERENCES templates (id),
    customer_name TEXT,
    recipient_name TEXT,
    message TEXT,
    quantity INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    stripe_session_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW ()
);

-- Enable Row Level Security (RLS)
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

ALTER TABLE forum_messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Templates: readable by everyone
CREATE POLICY "Templates are viewable by everyone" ON templates FOR
SELECT
    USING (true);

-- Forum messages: readable by everyone, insertable by authenticated users
CREATE POLICY "Forum messages are viewable by everyone" ON forum_messages FOR
SELECT
    USING (true);

CREATE POLICY "Authenticated users can post messages" ON forum_messages FOR INSERT
WITH
    CHECK (true);

-- Orders: only service role can manage (for now)
CREATE POLICY "Service role can manage orders" ON orders FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_templates_price ON templates (price);

CREATE INDEX IF NOT EXISTS idx_forum_messages_created_at ON forum_messages (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);