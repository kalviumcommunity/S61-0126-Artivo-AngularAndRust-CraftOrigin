use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use sqlx::types::Decimal;

#[derive(Serialize, sqlx::FromRow)]
pub struct Order {
    pub id: Uuid,
    pub buyer_id: Uuid,
    pub total_amount: Decimal,
    pub status: String, // PLACED, PROCESSING, SHIPPED, DELIVERED
    pub placed_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct OrderItem {
    pub id: Uuid,
    pub order_id: Uuid,
    pub artwork_id: Uuid,
    pub artist_id: Uuid,
    pub quantity: i32,
    pub unit_price: Decimal,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct OrderItemDetail {
    pub id: Uuid,
    pub order_id: Uuid,
    pub artwork_id: Uuid,
    pub artist_id: Uuid,
    pub quantity: i32,
    pub unit_price: Decimal,
    pub status: String,
    pub title: String,       // from artworks
    pub image_url: Option<String>, // from artworks
    pub artist_name: String, // from artists
}

#[derive(Serialize)]
pub struct OrderResponse {
    pub id: Uuid,
    pub buyer_id: Uuid,
    pub total_amount: Decimal,
    pub status: String,
    pub placed_at: DateTime<Utc>,
    pub items: Vec<OrderItemDetail>,
}

#[allow(dead_code)]
#[derive(Deserialize)]
#[allow(dead_code)]
pub struct CreateOrderRequest {
    // Maybe payment method later? For now, just triggers checkout from cart
}
