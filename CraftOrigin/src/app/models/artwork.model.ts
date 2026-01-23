// Artwork Model - matches the database schema
export interface Artwork {
  id?: string; // UUID
  artist_id: string; // UUID - will be set from logged-in user
  title: string;
  description?: string;
  category: string;
  price: number;
  quantity_available: number;
  authenticity_ref?: string;
  active?: boolean; // defaults to true
  created_at?: string; // TIMESTAMPTZ
  updated_at?: string; // TIMESTAMPTZ
  image_url?: string; // For file upload
}

// Artwork form data (for creating new artwork)
export interface ArtworkFormData {
  title: string;
  description: string;
  category: string;
  price: number;
  quantity_available: number;
  authenticity_ref: string;
  image?: File; // For file upload
}

// Artwork categories
export const ARTWORK_CATEGORIES = [
  'Pottery & Ceramics',
  'Handloom & Textiles',
  'Woodwork & Carving',
  'Metalwork & Jewelry',
  'Painting & Art',
  'Bamboo & Cane',
  'Leatherwork',
  'Stone Carving',
  'Paper Crafts',
  'Other'
] as const;
