use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Deserialize)]
pub struct CreateArtistRequest {
    pub tribe_name: String,
    pub region: String,
    pub bio: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateArtistRequest {
    pub tribe_name: Option<String>,
    pub region: Option<String>,
    pub bio: Option<String>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct ArtistProfile {
    pub id: Uuid,
    pub user_id: Uuid,
    pub tribe_name: String,
    pub region: String,
    pub bio: Option<String>,
    pub verification_status: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct SalesTrendItem {
    pub month: Option<String>, // "YYYY-MM" (nullable in SQL result)
    pub sales: Option<i64>,
    pub revenue: Option<sqlx::types::Decimal>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct TopArtwork {
    pub id: Uuid,
    pub title: String,
    pub total_sold: i64,
    pub revenue: sqlx::types::Decimal,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct RecentOrder {
    pub id: Uuid,
    pub buyer_name: String,
    pub total_amount: sqlx::types::Decimal, // Note: this might be total order amount, or artist's share? Usually artist sees their share.
    pub status: String,
    pub placed_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct ArtistDashboardStats {
    pub total_artworks: i64,
    pub active_artworks: i64,
    pub total_sales: i64, // count of sold items
    pub total_revenue: sqlx::types::Decimal,
    pub pending_orders: i64,
    pub sales_trend: Vec<SalesTrendItem>,
    pub top_artworks: Vec<TopArtwork>,
    pub recent_orders: Vec<RecentOrder>,
}
