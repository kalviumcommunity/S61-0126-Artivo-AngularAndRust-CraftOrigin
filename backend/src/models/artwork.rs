use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use sqlx::types::Decimal;

#[derive(Deserialize)]
pub struct ArtworkListQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub category: Option<String>,
    pub artist_id: Option<Uuid>,
    pub min_price: Option<Decimal>,
    pub max_price: Option<Decimal>,
}

#[derive(Deserialize)]
pub struct CreateArtworkRequest {
    pub artist_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub category: String,
    pub price: Decimal,
    pub quantity_available: i32,
    pub authenticity_ref: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateArtworkRequest {
    pub title: String,
    pub description: Option<String>,
    pub category: String,
    pub price: Decimal,
    pub quantity_available: i32,
    pub authenticity_ref: Option<String>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct ArtworkResponse {
    pub id: Uuid,
    pub artist_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub category: String,
    pub price: Decimal,
    pub quantity_available: i32,
    pub authenticity_ref: Option<String>,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
