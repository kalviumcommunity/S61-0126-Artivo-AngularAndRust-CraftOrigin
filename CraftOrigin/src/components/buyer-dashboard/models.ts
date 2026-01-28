export interface Profile {
  name: string;
  email: string;
  phone?: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  items: Array<{ name: string; price: number; quantity: number }>;
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
