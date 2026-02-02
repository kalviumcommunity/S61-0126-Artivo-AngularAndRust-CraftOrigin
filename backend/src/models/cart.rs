use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use sqlx::types::Decimal;

#[derive(Serialize, sqlx::FromRow)]
pub struct Cart {
    pub id: Uuid,
    pub buyer_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[allow(dead_code)]
#[derive(Serialize, sqlx::FromRow)]
#[allow(dead_code)]
pub struct CartItem {
    pub id: Uuid,
    pub cart_id: Uuid,
    pub artwork_id: Uuid,
    pub quantity: i32,
    pub unit_price: Decimal,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// Joined struct for fetching cart details
#[derive(Serialize, sqlx::FromRow)]
pub struct CartItemDetail {
    pub id: Uuid,
    pub cart_id: Uuid,
    pub artwork_id: Uuid,
    pub quantity: i32,
    pub unit_price: Decimal,
    pub title: String,      // from artworks
    pub image_url: Option<String>, // from artworks
    pub artist_name: String, // from artists (tribe_name)
}

#[derive(Deserialize)]
pub struct AddToCartRequest {
    pub artwork_id: Uuid,
    pub quantity: i32,
}

#[derive(Deserialize)]
pub struct UpdateCartItemRequest {
    pub quantity: i32,
}

#[derive(Serialize)]
pub struct CartResponse {
    pub id: Uuid,
    pub buyer_id: Uuid,
    pub items: Vec<CartItemDetail>,
    pub total_amount: Decimal,
}
