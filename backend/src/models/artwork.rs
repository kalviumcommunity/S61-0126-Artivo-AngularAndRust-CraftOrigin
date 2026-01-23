use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use sqlx::types::Decimal;

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

#[derive(Serialize)]
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
