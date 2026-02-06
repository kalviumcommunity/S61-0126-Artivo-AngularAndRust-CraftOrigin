WITH admin_user AS (
  INSERT INTO users (id, name, email, password_hash, role)
  VALUES (
    gen_random_uuid(),
    'Admin User',
    'admin@example.com',
    '$argon2id$v=19$m=19456,t=2,p=1$YAl6p/otVeHzmrR6yVLpcw$WAiTAGNbDTXIFG7acssA6erFns6tj2oKIDGnvSfYJtY',
    'ADMIN'
  )
  ON CONFLICT (email)
  DO UPDATE SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    updated_at = NOW()
  RETURNING id
),
artist_user AS (
  INSERT INTO users (id, name, email, password_hash, role)
  VALUES (
    gen_random_uuid(),
    'Demo Artist',
    'artist@test.com',
    '$argon2id$v=19$m=19456,t=2,p=1$YAl6p/otVeHzmrR6yVLpcw$WAiTAGNbDTXIFG7acssA6erFns6tj2oKIDGnvSfYJtY',
    'ARTIST'
  )
  ON CONFLICT (email)
  DO UPDATE SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    updated_at = NOW()
  RETURNING id
),
new_artist AS (
  INSERT INTO artists (
    id,
    user_id,
    tribe_name,
    region,
    verification_status
  )
  SELECT
    '4aad8b27-6940-48ee-be30-1e1600f8e258',
    id,
    'Demo Tribe',
    'Demo Region',
    'VERIFIED'
  FROM artist_user
  ON CONFLICT (user_id)
  DO UPDATE SET
    tribe_name = EXCLUDED.tribe_name,
    region = EXCLUDED.region,
    verification_status = EXCLUDED.verification_status,
    updated_at = NOW()
  RETURNING id
)
-- Insert multiple artworks (Terracotta Vase)
INSERT INTO artworks (
  id, artist_id, title, description, category, price, quantity_available,
  authenticity_ref, image_url, active, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid,
  'Terracotta Vase',
  'Handcrafted terracotta vase with traditional patterns.',
  'Pottery & Ceramics',
  45.00,
  10,
  'AUTH-TC-001',
  'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=800&q=80',
  TRUE,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM artworks
  WHERE artist_id = '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid
    AND title = 'Terracotta Vase'
);

-- Insert Handwoven Basket
INSERT INTO artworks (
  id, artist_id, title, description, category, price, quantity_available,
  authenticity_ref, image_url, active, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid,
  'Handwoven Basket',
  'Traditional handwoven basket made from natural fibers.',
  'Baskets & Weaving',
  35.00,
  15,
  'AUTH-BW-002',
  'https://images.unsplash.com/photo-1588854337221-4cf0b21756b2?auto=format&fit=crop&w=800&q=80',
  TRUE,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM artworks
  WHERE artist_id = '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid
    AND title = 'Handwoven Basket'
);

-- Insert Tribal Necklace
INSERT INTO artworks (
  id, artist_id, title, description, category, price, quantity_available,
  authenticity_ref, image_url, active, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid,
  'Tribal Necklace',
  'Beautiful beaded necklace with authentic tribal patterns.',
  'Jewelry & Accessories',
  55.00,
  8,
  'AUTH-JW-003',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
  TRUE,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM artworks
  WHERE artist_id = '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid
    AND title = 'Tribal Necklace'
);

-- Insert Wooden Sculpture
INSERT INTO artworks (
  id, artist_id, title, description, category, price, quantity_available,
  authenticity_ref, image_url, active, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid,
  'Wooden Sculpture',
  'Hand-carved wooden sculpture depicting traditional stories.',
  'Sculpture & Carvings',
  120.00,
  5,
  'AUTH-SC-004',
  'https://images.unsplash.com/photo-1580874080528-b41d6a0dd7cb?auto=format&fit=crop&w=800&q=80',
  TRUE,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM artworks
  WHERE artist_id = '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid
    AND title = 'Wooden Sculpture'
);

-- Insert Traditional Textile
INSERT INTO artworks (
  id, artist_id, title, description, category, price, quantity_available,
  authenticity_ref, image_url, active, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid,
  'Traditional Textile',
  'Handwoven textile with intricate geometric patterns.',
  'Textiles & Fabrics',
  85.00,
  12,
  'AUTH-TX-005',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
  TRUE,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM artworks
  WHERE artist_id = '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid
    AND title = 'Traditional Textile'
);

-- Insert Decorative Wall Hanging
INSERT INTO artworks (
  id, artist_id, title, description, category, price, quantity_available,
  authenticity_ref, image_url, active, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid,
  'Decorative Wall Hanging',
  'Stunning wall art featuring traditional motifs.',
  'Home Decor',
  75.00,
  10,
  'AUTH-HD-006',
  'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?auto=format&fit=crop&w=800&q=80',
  TRUE,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM artworks
  WHERE artist_id = '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid
    AND title = 'Decorative Wall Hanging'
);

-- Insert Painted Plate
INSERT INTO artworks (
  id, artist_id, title, description, category, price, quantity_available,
  authenticity_ref, image_url, active, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid,
  'Painted Plate',
  'Ceramic plate with hand-painted tribal designs.',
  'Pottery & Ceramics',
  40.00,
  20,
  'AUTH-PC-007',
  'https://images.unsplash.com/photo-1587828011382-d02dce0e6c0d?auto=format&fit=crop&w=800&q=80',
  TRUE,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM artworks
  WHERE artist_id = '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid
    AND title = 'Painted Plate'
);

-- Insert Beaded Bracelet Set
INSERT INTO artworks (
  id, artist_id, title, description, category, price, quantity_available,
  authenticity_ref, image_url, active, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid,
  'Beaded Bracelet Set',
  'Set of 3 handmade beaded bracelets in traditional colors.',
  'Jewelry & Accessories',
  30.00,
  25,
  'AUTH-JW-008',
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
  TRUE,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM artworks
  WHERE artist_id = '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid
    AND title = 'Beaded Bracelet Set'
);

-- Insert Clay Pot
INSERT INTO artworks (
  id, artist_id, title, description, category, price, quantity_available,
  authenticity_ref, image_url, active, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid,
  'Clay Pot',
  'Rustic clay pot perfect for cooking or display.',
  'Pottery & Ceramics',
  50.00,
  14,
  'AUTH-PC-009',
  'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
  TRUE,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM artworks
  WHERE artist_id = '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid
    AND title = 'Clay Pot'
);

-- Insert Woven Floor Mat
INSERT INTO artworks (
  id, artist_id, title, description, category, price, quantity_available,
  authenticity_ref, image_url, active, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid,
  'Woven Floor Mat',
  'Large handwoven mat made from natural materials.',
  'Baskets & Weaving',
  65.00,
  8,
  'AUTH-BW-010',
  'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80',
  TRUE,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM artworks
  WHERE artist_id = '4aad8b27-6940-48ee-be30-1e1600f8e258'::uuid
    AND title = 'Woven Floor Mat'
);
