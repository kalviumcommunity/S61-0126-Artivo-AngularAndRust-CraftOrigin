export interface CartItem {
    id: string;
    cart_id: string;
    artwork_id: string;
    quantity: number;
    unit_price: number;
    title: string;
    image_url?: string;
    artist_name: string;
}

export interface Cart {
    id: string;
    buyer_id: string;
    items: CartItem[];
    total_amount: number;
}
