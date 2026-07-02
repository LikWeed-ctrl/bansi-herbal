-- ═══════════════════════════════════════════════════════════
-- Krishna's Herbal & Ayurveda — Supabase Database Setup SQL
-- Run this in Supabase > SQL Editor > New Query
-- ═══════════════════════════════════════════════════════════

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '🌿',
  image_url TEXT,
  sort_order INTEGER DEFAULT 99,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  mrp NUMERIC,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INSERT DEFAULT SETTINGS
INSERT INTO settings (key, value) VALUES
  ('whatsapp_number', '91XXXXXXXXXX'),
  ('phone_display', '+91 XXXXX XXXXX'),
  ('address', 'Your Shop Address, City'),
  ('shop_name', 'Krishna''s Herbal & Ayurveda'),
  ('tagline', 'Nature''s Healing, At Your Doorstep'),
  ('about_text', 'We provide authentic Ayurvedic products for natural wellness.'),
  ('free_delivery_min', '399'),
  ('delivery_areas', 'Local delivery available')
ON CONFLICT (key) DO NOTHING;

-- 5. INSERT SAMPLE CATEGORIES
INSERT INTO categories (name, emoji, description, sort_order) VALUES
  ('Brain Wellness', '🧠', 'Products for memory, focus and brain health', 1),
  ('Cardiac Wellness', '❤️', 'Heart health and cardiac support products', 2),
  ('Daily Wellness', '🌅', 'Everyday health and immunity products', 3),
  ('Diabetic Wellness', '🩸', 'Blood sugar management products', 4),
  ('Eye Wellness', '👁️', 'Vision care and eye health products', 5),
  ('Hair Wellness', '💆', 'Hair growth and scalp care products', 6),
  ('Women''s Wellness', '🌸', 'Products specially for women''s health', 7),
  ('Digestive Wellness', '🫁', 'Gut health and digestion support', 8)
ON CONFLICT DO NOTHING;

-- 6. ROW LEVEL SECURITY (RLS) - IMPORTANT!
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow PUBLIC to READ categories, products, settings (for the website)
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read settings" ON settings FOR SELECT USING (true);

-- Allow AUTHENTICATED users (admin) to do everything
CREATE POLICY "Admin full access categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access settings" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- 7. STORAGE BUCKET — Run this separately if needed
-- Go to Storage > Create bucket > Name: "images" > Toggle Public: ON
-- Or run:
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true)
ON CONFLICT DO NOTHING;

-- Allow public to view images
CREATE POLICY "Public can view images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
-- Allow authenticated (admin) to upload/delete
CREATE POLICY "Admin can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin can delete images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- ═══════════════════════════
-- DONE! Run the above SQL ✅
-- ═══════════════════════════
