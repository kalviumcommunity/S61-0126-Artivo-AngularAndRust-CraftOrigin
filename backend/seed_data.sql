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
INSERT INTO artworks (
  id,
  artist_id,
  title,
  description,
  category,
  price,
  quantity_available,
  authenticity_ref,
  image_url,
  active,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  '4aad8b27-6940-48ee-be30-1e1600f8e258',
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
  SELECT 1
  FROM artworks
  WHERE artist_id = '4aad8b27-6940-48ee-be30-1e1600f8e258'
    AND title = 'Terracotta Vase'
);
