use actix_web::{web, HttpResponse, Responder, HttpMessage, HttpRequest};
use sqlx::{Pool, Postgres, Row, QueryBuilder};
use uuid::Uuid;
use crate::models::{
    artist::{CreateArtistRequest, UpdateArtistRequest, ArtistProfile, ArtistDashboardStats, SalesTrendItem, TopArtwork, RecentOrder},
    order::{UpdateOrderItemStatusRequest, ArtistOrderItemView, ArtistOrderListQuery, ArtistOrderDetailView},
    user::Claims,
};

// Helper to get user_id from claims
fn get_user_id(req: &HttpRequest) -> Result<Uuid, HttpResponse> {
    let claims = match req.extensions().get::<Claims>() {
        Some(c) => c.clone(),
        None => return Err(HttpResponse::Unauthorized().json(serde_json::json!({ "message": "Unauthorized" }))),
    };
    Uuid::parse_str(&claims.sub).map_err(|_| HttpResponse::Unauthorized().json(serde_json::json!({ "message": "Invalid user ID" })))
}

// Helper to get artist_id
async fn get_artist_id(pool: &Pool<Postgres>, user_id: Uuid) -> Result<Uuid, HttpResponse> {
    let artist = sqlx::query("SELECT id FROM artists WHERE user_id = $1")
        .bind(user_id)
        .fetch_optional(pool)
        .await
        .map_err(|_| HttpResponse::InternalServerError().json(serde_json::json!({ "message": "Database error" })))?;

    match artist {
        Some(row) => Ok(row.get("id")),
        None => Err(HttpResponse::NotFound().json(serde_json::json!({ "message": "Artist not found" }))),
    }
}

pub async fn register_artist(
    req: HttpRequest,
    pool: web::Data<Pool<Postgres>>,
    payload: web::Json<CreateArtistRequest>,
) -> impl Responder {
    let user_id = match get_user_id(&req) {
        Ok(id) => id,
        Err(e) => return e,
    };

    // Check if already artist
    let existing = sqlx::query("SELECT id FROM artists WHERE user_id = $1")
        .bind(user_id)
        .fetch_optional(pool.get_ref())
        .await;

    if let Ok(Some(_)) = existing {
        return HttpResponse::Conflict().json(serde_json::json!({ "message": "Artist profile already exists" }));
    }

    let mut tx = match pool.begin().await {
        Ok(tx) => tx,
        Err(_) => return HttpResponse::InternalServerError().json(serde_json::json!({ "message": "Transaction error" })),
    };

    // Create artist profile
    let artist_res = sqlx::query(
        "INSERT INTO artists (user_id, tribe_name, region, bio, verification_status) VALUES ($1, $2, $3, $4, 'PENDING') RETURNING id"
    )
    .bind(user_id)
    .bind(&payload.tribe_name)
    .bind(&payload.region)
    .bind(&payload.bio)
    .fetch_one(&mut *tx)
    .await;

    if let Err(e) = artist_res {
        eprintln!("Artist create error: {:?}", e);
        return HttpResponse::InternalServerError().json(serde_json::json!({ "message": "Failed to create artist profile" }));
    }

    // Update user role
    let user_res = sqlx::query("UPDATE users SET role = 'ARTIST', updated_at = now() WHERE id = $1")
        .bind(user_id)
        .execute(&mut *tx)
        .await;

    if let Err(e) = user_res {
        eprintln!("User role update error: {:?}", e);
        return HttpResponse::InternalServerError().json(serde_json::json!({ "message": "Failed to update user role" }));
    }

    if let Err(e) = tx.commit().await {
        eprintln!("Commit error: {:?}", e);
        return HttpResponse::InternalServerError().json(serde_json::json!({ "message": "Commit failed" }));
    }

    HttpResponse::Created().json(serde_json::json!({ "message": "Artist profile created. Awaiting admin review." }))
}

pub async fn get_artist_profile(
    req: HttpRequest,
    pool: web::Data<Pool<Postgres>>,
) -> impl Responder {
    let user_id = match get_user_id(&req) {
        Ok(id) => id,
        Err(e) => return e,
    };

    let profile = sqlx::query_as::<_, ArtistProfile>(
        "SELECT * FROM artists WHERE user_id = $1"
    )
    .bind(user_id)
    .fetch_optional(pool.get_ref())
    .await;

    match profile {
        Ok(Some(p)) => HttpResponse::Ok().json(p),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({ "message": "Artist profile not found" })),
        Err(e) => {
            eprintln!("Profile fetch error: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({ "message": "Database error" }))
        }
    }
}

pub async fn update_artist_profile(
    req: HttpRequest,
    pool: web::Data<Pool<Postgres>>,
    payload: web::Json<UpdateArtistRequest>,
) -> impl Responder {
    let user_id = match get_user_id(&req) {
        Ok(id) => id,
        Err(e) => return e,
    };

    let mut builder = QueryBuilder::new("UPDATE artists SET updated_at = now()");

    if let Some(name) = &payload.tribe_name {
        builder.push(", tribe_name = ").push_bind(name);
    }
    if let Some(region) = &payload.region {
        builder.push(", region = ").push_bind(region);
    }
    if let Some(bio) = &payload.bio {
        builder.push(", bio = ").push_bind(bio);
    }

    builder.push(" WHERE user_id = ").push_bind(user_id);
    builder.push(" RETURNING *");

    let query = builder.build_query_as::<ArtistProfile>();
    let result = query.fetch_optional(pool.get_ref()).await;

    match result {
        Ok(Some(p)) => HttpResponse::Ok().json(p),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({ "message": "Artist profile not found" })),
        Err(e) => {
            eprintln!("Profile update error: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({ "message": "Database error" }))
        }
    }
}

pub async fn get_artist_dashboard(
    req: HttpRequest,
    pool: web::Data<Pool<Postgres>>,
) -> impl Responder {
    let user_id = match get_user_id(&req) {
        Ok(id) => id,
        Err(e) => return e,
    };

    let artist_id = match get_artist_id(pool.get_ref(), user_id).await {
        Ok(id) => id,
        Err(res) => return res,
    };

    // Stats
    let stats_query = sqlx::query!(
        r#"
        SELECT
            (SELECT COUNT(*) FROM artworks WHERE artist_id = $1) as total_artworks,
            (SELECT COUNT(*) FROM artworks WHERE artist_id = $1 AND active = TRUE) as active_artworks,
            (SELECT COUNT(*) FROM order_items WHERE artist_id = $1 AND status != 'CANCELLED' AND status != 'PLACED') as total_sales,
            (SELECT COALESCE(SUM(unit_price * quantity), 0) FROM order_items WHERE artist_id = $1 AND status != 'CANCELLED') as total_revenue,
            (SELECT COUNT(*) FROM order_items WHERE artist_id = $1 AND status IN ('PLACED', 'PROCESSING')) as pending_orders
        "#,
        artist_id
    )
    .fetch_one(pool.get_ref())
    .await;

    let stats = match stats_query {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Stats error: {:?}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({ "message": "Database error" }));
        }
    };

    // Sales Trend (Last 6 months)
    let sales_trend = sqlx::query_as::<_, SalesTrendItem>(
        r#"
        SELECT 
            TO_CHAR(created_at, 'YYYY-MM') as month,
            COUNT(*) as sales,
            COALESCE(SUM(unit_price * quantity), 0) as revenue
        FROM order_items
        WHERE artist_id = $1 
          AND status != 'CANCELLED'
          AND created_at >= date_trunc('month', now()) - interval '5 months'
        GROUP BY 1
        ORDER BY 1
        "#
    )
    .bind(artist_id)
    .fetch_all(pool.get_ref())
    .await
    .unwrap_or_default();

    // Top Artworks
    let top_artworks = sqlx::query_as::<_, TopArtwork>(
        r#"
        SELECT 
            a.id,
            a.title,
            COUNT(oi.id) as total_sold,
            COALESCE(SUM(oi.unit_price * oi.quantity), 0) as revenue
        FROM artworks a
        JOIN order_items oi ON a.id = oi.artwork_id
        WHERE a.artist_id = $1 AND oi.status != 'CANCELLED'
        GROUP BY a.id, a.title
        ORDER BY total_sold DESC
        LIMIT 5
        "#
    )
    .bind(artist_id)
    .fetch_all(pool.get_ref())
    .await
    .unwrap_or_default();

    // Recent Orders
    // We want recent order items basically, but grouped by order? Or just list items?
    // User requirement: "Recent 5 orders".
    // Usually implies distinct orders.
    // Let's show order details for orders containing artist's items.
    // Note: If an order has multiple items from artist, it might appear once.
    let recent_orders = sqlx::query_as::<_, RecentOrder>(
        r#"
        SELECT DISTINCT ON (o.id)
            o.id,
            u.name as buyer_name,
            o.total_amount, -- This is total order amount, might be misleading if mixed. But requested schema has it.
            o.status,
            o.placed_at
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN users u ON o.buyer_id = u.id
        WHERE oi.artist_id = $1
        ORDER BY o.id, o.placed_at DESC
        LIMIT 5
        "#
    )
    .bind(artist_id)
    .fetch_all(pool.get_ref())
    .await
    .unwrap_or_default();

    let response = ArtistDashboardStats {
        total_artworks: stats.total_artworks.unwrap_or(0),
        active_artworks: stats.active_artworks.unwrap_or(0),
        total_sales: stats.total_sales.unwrap_or(0),
        total_revenue: stats.total_revenue.unwrap_or(sqlx::types::Decimal::ZERO),
        pending_orders: stats.pending_orders.unwrap_or(0),
        sales_trend,
        top_artworks,
        recent_orders,
    };

    HttpResponse::Ok().json(response)
}

pub async fn get_artist_orders(
    req: HttpRequest,
    pool: web::Data<Pool<Postgres>>,
    query: web::Query<ArtistOrderListQuery>,
) -> impl Responder {
    let user_id = match get_user_id(&req) {
        Ok(id) => id,
        Err(e) => return e,
    };

    let artist_id = match get_artist_id(pool.get_ref(), user_id).await {
        Ok(id) => id,
        Err(res) => return res,
    };

    let q = query.into_inner();
    let limit = q.limit.unwrap_or(10).max(1);
    let page = q.page.unwrap_or(1).max(1);
    let offset = (page - 1) * limit;

    let mut builder = QueryBuilder::new(
        r#"
        SELECT 
            oi.id, 
            oi.order_id, 
            oi.artwork_id, 
            a.title, 
            a.image_url, 
            oi.quantity, 
            oi.unit_price, 
            oi.status, 
            o.placed_at,
            u.name as buyer_name,
            u.email as buyer_email
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN artworks a ON oi.artwork_id = a.id
        JOIN users u ON o.buyer_id = u.id
        WHERE oi.artist_id = "#
    );
    builder.push_bind(artist_id);

    if let Some(status) = q.status {
        builder.push(" AND oi.status = ").push_bind(status);
    }

    if let Some(search) = q.search {
        let pattern = format!("%{}%", search);
        builder.push(" AND (a.title ILIKE ").push_bind(pattern.clone())
               .push(" OR u.name ILIKE ").push_bind(pattern)
               .push(")");
    }

    match q.sort.as_deref() {
        Some("oldest") => builder.push(" ORDER BY o.placed_at ASC"),
        Some("amount_desc") => builder.push(" ORDER BY (oi.quantity * oi.unit_price) DESC"),
        Some("amount_asc") => builder.push(" ORDER BY (oi.quantity * oi.unit_price) ASC"),
        _ => builder.push(" ORDER BY o.placed_at DESC"),
    };

    builder.push(" LIMIT ").push_bind(limit);
    builder.push(" OFFSET ").push_bind(offset);

    let items_query = builder.build_query_as::<ArtistOrderItemView>();
    let items = items_query.fetch_all(pool.get_ref()).await;

    match items {
        Ok(rows) => HttpResponse::Ok().json(rows),
        Err(e) => {
            eprintln!("Order fetch error: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({ "message": "Database error" }))
        }
    }
}

pub async fn get_order_detail_for_artist(
    req: HttpRequest,
    pool: web::Data<Pool<Postgres>>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let user_id = match get_user_id(&req) {
        Ok(id) => id,
        Err(e) => return e,
    };

    let artist_id = match get_artist_id(pool.get_ref(), user_id).await {
        Ok(id) => id,
        Err(res) => return res,
    };

    let order_id = path.into_inner();

    // Fetch order details first
    let order_row = sqlx::query(
        r#"
        SELECT o.id, o.placed_at, u.name as buyer_name, u.email as buyer_email
        FROM orders o
        JOIN users u ON o.buyer_id = u.id
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = $1 AND oi.artist_id = $2
        LIMIT 1
        "#
    )
    .bind(order_id)
    .bind(artist_id)
    .fetch_optional(pool.get_ref())
    .await;

    let (id, placed_at, buyer_name, buyer_email) = match order_row {
        Ok(Some(row)) => (
            row.get::<Uuid, _>("id"),
            row.get::<chrono::DateTime<chrono::Utc>, _>("placed_at"),
            row.get::<String, _>("buyer_name"),
            row.get::<String, _>("buyer_email"),
        ),
        Ok(None) => return HttpResponse::NotFound().json(serde_json::json!({ "message": "Order not found or unauthorized" })),
        Err(e) => {
            eprintln!("Order detail error: {:?}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({ "message": "Database error" }));
        }
    };

    // Fetch items for this artist in this order
    let items = sqlx::query_as::<_, ArtistOrderItemView>(
        r#"
        SELECT 
            oi.id, 
            oi.order_id, 
            oi.artwork_id, 
            a.title, 
            a.image_url, 
            oi.quantity, 
            oi.unit_price, 
            oi.status, 
            o.placed_at,
            u.name as buyer_name,
            u.email as buyer_email
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN artworks a ON oi.artwork_id = a.id
        JOIN users u ON o.buyer_id = u.id
        WHERE oi.order_id = $1 AND oi.artist_id = $2
        "#
    )
    .bind(order_id)
    .bind(artist_id)
    .fetch_all(pool.get_ref())
    .await;

    match items {
        Ok(rows) => {
            let detail = ArtistOrderDetailView {
                order_id: id,
                placed_at,
                buyer_name,
                buyer_email,
                items: rows,
            };
            HttpResponse::Ok().json(detail)
        },
        Err(e) => {
            eprintln!("Order items error: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({ "message": "Database error" }))
        }
    }
}

pub async fn update_order_item_status(
    req: HttpRequest,
    pool: web::Data<Pool<Postgres>>,
    path: web::Path<Uuid>,
    payload: web::Json<UpdateOrderItemStatusRequest>,
) -> impl Responder {
    let user_id = match get_user_id(&req) {
        Ok(id) => id,
        Err(e) => return e,
    };

    let artist_id = match get_artist_id(pool.get_ref(), user_id).await {
        Ok(id) => id,
        Err(res) => return res,
    };

    let order_item_id = path.into_inner();
    let new_status = payload.status.clone();

    // Verify item belongs to artist
    let item = sqlx::query("SELECT status FROM order_items WHERE id = $1 AND artist_id = $2")
        .bind(order_item_id)
        .bind(artist_id)
        .fetch_optional(pool.get_ref())
        .await;

    let current_status: String = match item {
        Ok(Some(row)) => row.get("status"),
        Ok(None) => return HttpResponse::NotFound().json(serde_json::json!({"message": "Order item not found or unauthorized"})),
        Err(_) => return HttpResponse::InternalServerError().json(serde_json::json!({"message": "Database error"})),
    };

    // Validate Transition
    let valid = match (current_status.as_str(), new_status.as_str()) {
        ("PLACED", "PROCESSING") => true,
        ("PROCESSING", "SHIPPED") => true, 
        ("SHIPPED", "DELIVERED") => true,
        (curr, next) if curr == next => true,
        _ => false,
    };

    if !valid {
         return HttpResponse::BadRequest().json(serde_json::json!({"message": format!("Invalid status transition from {} to {}", current_status, new_status)}));
    }

    // Check Tracking Number for SHIPPED
    if new_status == "SHIPPED" && current_status != "SHIPPED" {
        if payload.tracking_number.is_none() || payload.tracking_number.as_ref().unwrap().trim().is_empty() {
             return HttpResponse::BadRequest().json(serde_json::json!({"message": "Tracking number is required for SHIPPED status"}));
        }
    }

    let mut tx = match pool.begin().await {
        Ok(tx) => tx,
        Err(_) => return HttpResponse::InternalServerError().json(serde_json::json!({"message": "Transaction error"})),
    };

    // Update Status
    let update_res = sqlx::query("UPDATE order_items SET status = $1, updated_at = now() WHERE id = $2")
        .bind(&new_status)
        .bind(order_item_id)
        .execute(&mut *tx)
        .await;

    if let Err(e) = update_res {
        eprintln!("Update error: {:?}", e);
        return HttpResponse::InternalServerError().json(serde_json::json!({"message": "Update failed"}));
    }

    // Log Status Change
    let note = if new_status == "SHIPPED" {
        payload.tracking_number.clone().map(|t| format!("Tracking Number: {}", t))
    } else {
        None
    };

    let log_res = sqlx::query(
        "INSERT INTO order_status_logs (order_item_id, status, changed_by_user_id, note) VALUES ($1, $2, $3, $4)"
    )
    .bind(order_item_id)
    .bind(&new_status)
    .bind(user_id)
    .bind(note)
    .execute(&mut *tx)
    .await;

    if let Err(e) = log_res {
        eprintln!("Log error: {:?}", e);
        return HttpResponse::InternalServerError().json(serde_json::json!({"message": "Logging failed"}));
    }

    if let Err(e) = tx.commit().await {
        eprintln!("Commit error: {:?}", e);
        return HttpResponse::InternalServerError().json(serde_json::json!({"message": "Commit failed"}));
    }

    HttpResponse::Ok().json(serde_json::json!({"message": "Status updated", "status": new_status}))
}
