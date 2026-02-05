-- Seed admin and artist accounts with known credentials for local/dev environments.
-- Admin: admin@example.com / password
-- Artist: artist@test.com / password

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
)
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
  updated_at = NOW();
