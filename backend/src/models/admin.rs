use serde::{Deserialize, Serialize};
use sqlx::types::Decimal;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Serialize)]
pub struct AdminDashboardStats {
    pub total_users: i64,
    pub total_revenue: Decimal,
    pub total_orders: i64,
    pub pending_verifications: i64,
    pub active_artworks: i64,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct RevenueTrend {
    pub period: String, // e.g., "2023-10"
    pub revenue: Decimal,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct OrderStatusCount {
    pub status: String,
    pub count: i64,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct UserRoleCount {
    pub role: String,
    pub count: i64,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct TopEntity {
    pub id: Uuid,
    pub name: String, 
    pub value: Decimal, 
    pub count: i64, 
}

#[derive(Serialize)]
pub struct AdminDashboardResponse {
    pub stats: AdminDashboardStats,
    pub recent_orders: Vec<crate::models::order::Order>,
    pub new_artists: Vec<crate::models::artist::ArtistProfile>,
    pub new_artworks: Vec<crate::models::artwork::ArtworkResponse>,
    pub revenue_trend: Vec<RevenueTrend>,
    pub orders_by_status: Vec<OrderStatusCount>,
    pub users_by_role: Vec<UserRoleCount>,
    pub top_artworks: Vec<TopEntity>,
    pub top_artists: Vec<TopEntity>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct UserListDto {
    pub id: Uuid,
    pub name: String, // derived from email or added name field
    pub email: String,
    pub role: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct RevenueReportItem {
    pub period: String,
    pub category: Option<String>,
    pub artist_name: Option<String>,
    pub revenue: Decimal,
    pub order_count: i64,
}

#[derive(Deserialize)]
pub struct UserListQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub search: Option<String>,
    pub role: Option<String>,
}

#[derive(Deserialize)]
pub struct ArtworkListQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub search: Option<String>,
    pub category: Option<String>,
    pub artist_id: Option<Uuid>,
    pub active: Option<bool>,
}

#[derive(Deserialize)]
pub struct OrderListQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub status: Option<String>,
}

#[derive(Deserialize)]
pub struct RevenueReportQuery {
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub group_by: Option<String>, // "period", "artist", "category"
}
