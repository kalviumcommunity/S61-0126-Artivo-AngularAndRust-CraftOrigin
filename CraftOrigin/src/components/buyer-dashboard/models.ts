export interface Profile {
  name: string;
  email: string;
  phone?: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    artwork_id: string;
    artist_id: string;
    quantity: number;
    unit_price: number;
    status: string;
    title: string;
    image_url?: string;
    artist_name: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  total_amount: number;
  status: string;
  placed_at: string;
  items: OrderItem[];
}

export interface WishlistItem {
  id: string;
  name: string;
  image: string;
  price: number;
}

export interface Address {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}
