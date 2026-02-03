use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use sqlx::types::Decimal;

#[derive(Serialize, Deserialize, Debug, sqlx::Type)]
#[sqlx(type_name = "order_status", rename_all = "SCREAMING_SNAKE_CASE")]
#[allow(dead_code)]
pub enum OrderStatus {
    Placed,
    Processing,
    Shipped,
    Delivered,
    Cancelled,
}

#[derive(Deserialize)]
#[allow(dead_code)]
pub struct CreateOrderRequest {
    pub items: Vec<CreateOrderItemDto>,
}

#[derive(Deserialize)]
#[allow(dead_code)]
pub struct CreateOrderItemDto {
    pub artwork_id: Uuid,
    pub quantity: i32,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct Order {
    pub id: Uuid,
    pub buyer_id: Uuid,
    pub total_amount: Decimal,
    pub status: String, // Global status? Or we use items status.
    pub placed_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, sqlx::FromRow)]
#[allow(dead_code)]
pub struct OrderItem {
    pub id: Uuid,
    pub order_id: Uuid,
    pub artwork_id: Uuid,
    pub artist_id: Uuid,
    pub quantity: i32,
    pub unit_price: Decimal,
    pub status: String,
    pub updated_at: DateTime<Utc>,
}

#[derive(Deserialize)]
pub struct UpdateOrderItemStatusRequest {
    pub status: String,
    pub tracking_number: Option<String>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct ArtistOrderItemView {
    pub id: Uuid, // order_item_id
    pub order_id: Uuid,
    pub artwork_id: Uuid,
    pub title: String,
    pub image_url: Option<String>,
    pub quantity: i32,
    pub unit_price: Decimal,
    pub status: String,
    pub placed_at: DateTime<Utc>,
    pub buyer_name: String,
    pub buyer_email: String,
}

#[derive(Serialize)]
pub struct ArtistOrderDetailView {
    pub order_id: Uuid,
    pub placed_at: DateTime<Utc>,
    pub buyer_name: String,
    pub buyer_email: String,
    pub items: Vec<ArtistOrderItemView>,
}

#[derive(Deserialize)]
pub struct ArtistOrderListQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub search: Option<String>, // Search by title or buyer name
    pub status: Option<String>,
    pub sort: Option<String>, // "recent", "oldest", "amount_desc", "amount_asc"
}

#[derive(Serialize, sqlx::FromRow)]
pub struct OrderItemDetail {
    pub id: Uuid,
    pub order_id: Uuid,
    pub artwork_id: Uuid,
    pub artist_id: Uuid,
    pub quantity: i32,
    pub unit_price: Decimal,
    pub status: String,
    pub title: String,
    pub image_url: Option<String>,
    pub artist_name: String,
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
