WITH new_user AS (
  INSERT INTO users (id, name, email, password_hash, role)
  VALUES (
    gen_random_uuid(),
    'Demo Artist',
    'artist@test.com',
    'dummy',
    'ARTIST'
  )
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
  FROM new_user
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
VALUES
  (
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
  );
