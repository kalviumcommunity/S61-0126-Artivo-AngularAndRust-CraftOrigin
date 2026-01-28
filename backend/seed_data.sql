-- Sample Data Insertion for Artworks
-- Usage:
-- docker exec -i backend_postgres psql -U postgres -d my_app_db < seed_data.sql

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
) VALUES 

-- Pottery & Ceramics
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
),

-- Handloom & Textiles
(
    gen_random_uuid(),
    '4aad8b27-6940-48ee-be30-1e1600f8e258',
    'Silk Saree',
    'Traditional handloom silk saree with gold border.',
    'Handloom & Textiles',
    120.00,
    5,
    'AUTH-HS-002',
    'https://images.unsplash.com/photo-1588140686379-1b76a52103dc?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    TRUE,
    NOW(),
    NOW()
),

-- Woodwork & Carving
(
    gen_random_uuid(),
    '4aad8b27-6940-48ee-be30-1e1600f8e258',
    'Carved Wooden Elephant',
    'Intricately carved wooden elephant figurine.',
    'Woodwork & Carving',
    85.50,
    8,
    'AUTH-WE-003',
    'https://images.unsplash.com/photo-1739281467979-813684cd2877?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    TRUE,
    NOW(),
    NOW()
),

-- Metalwork & Jewelry
(
    gen_random_uuid(),
    '4aad8b27-6940-48ee-be30-1e1600f8e258',
    'Silver Necklace',
    'Handcrafted silver necklace with tribal design.',
    'Metalwork & Jewelry',
    250.00,
    3,
    'AUTH-SN-004',
    'https://images.unsplash.com/photo-1636103952204-0b738c225264?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    TRUE,
    NOW(),
    NOW()
),

-- Painting
(
    gen_random_uuid(),
    '4aad8b27-6940-48ee-be30-1e1600f8e258',
    'Landscape Painting',
    'Oil painting of a peaceful rural landscape.',
    'Painting',
    300.00,
    1,
    'AUTH-LP-005',
    'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=800&q=80',
    TRUE,
    NOW(),
    NOW()
);
