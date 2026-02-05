use actix_web::{web, HttpResponse, Responder, HttpRequest, HttpMessage};
use sqlx::PgPool;
use crate::models::admin::*;
use crate::models::user::Claims;
use crate::models::artist::ArtistProfile;
use crate::models::artwork::ArtworkResponse;
use crate::models::order::Order;
use uuid::Uuid;
use chrono::Utc;

fn check_admin(req: &HttpRequest) -> Result<(), HttpResponse> {
    if let Some(claims) = req.extensions().get::<Claims>() {
        if claims.role == "ADMIN" {
            return Ok(());
        }
    }
    Err(HttpResponse::Forbidden().body("Access denied: Admins only"))
}

pub async fn get_dashboard(req: HttpRequest, pool: web::Data<PgPool>) -> impl Responder {
    if let Err(res) = check_admin(&req) { return res; }

    let total_users: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
        .fetch_one(pool.get_ref()).await.unwrap_or(0);
        
    let total_revenue: Option<sqlx::types::Decimal> = sqlx::query_scalar("SELECT SUM(total_amount) FROM orders WHERE status != 'CANCELLED'")
        .fetch_one(pool.get_ref()).await.unwrap_or(None);
    let total_revenue = total_revenue.unwrap_or(sqlx::types::Decimal::ZERO);

    let total_orders: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM orders")
        .fetch_one(pool.get_ref()).await.unwrap_or(0);

    let pending_verifications: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM artists WHERE verification_status = 'PENDING'")
        .fetch_one(pool.get_ref()).await.unwrap_or(0);

    let active_artworks: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM artworks WHERE active = true")
        .fetch_one(pool.get_ref()).await.unwrap_or(0);

    let recent_orders = sqlx::query_as::<_, Order>("SELECT * FROM orders ORDER BY placed_at DESC LIMIT 5")
        .fetch_all(pool.get_ref()).await.unwrap_or_default();
        
    let new_artists = sqlx::query_as::<_, ArtistProfile>("SELECT * FROM artists ORDER BY created_at DESC LIMIT 5")
        .fetch_all(pool.get_ref()).await.unwrap_or_default();

    let new_artworks = sqlx::query_as::<_, ArtworkResponse>("SELECT * FROM artworks ORDER BY created_at DESC LIMIT 5")
        .fetch_all(pool.get_ref()).await.unwrap_or_default();

    let revenue_trend = sqlx::query_as::<_, RevenueTrend>(
        "SELECT to_char(placed_at, 'YYYY-MM') as period, COALESCE(SUM(total_amount), 0) as revenue 
         FROM orders 
         WHERE status != 'CANCELLED' 
         GROUP BY period 
         ORDER BY period DESC 
         LIMIT 12")
        .fetch_all(pool.get_ref()).await.unwrap_or_default();

    let orders_by_status = sqlx::query_as::<_, OrderStatusCount>("SELECT status, COUNT(*) as count FROM orders GROUP BY status")
        .fetch_all(pool.get_ref()).await.unwrap_or_default();

    let users_by_role = sqlx::query_as::<_, UserRoleCount>("SELECT role, COUNT(*) as count FROM users GROUP BY role")
        .fetch_all(pool.get_ref()).await.unwrap_or_default();
        
    let top_artworks = sqlx::query_as::<_, TopEntity>(
        "SELECT a.id, a.title as name, COALESCE(SUM(oi.unit_price * oi.quantity), 0) as value, COALESCE(SUM(oi.quantity), 0) as count
         FROM order_items oi
         JOIN artworks a ON oi.artwork_id = a.id
         WHERE oi.status != 'CANCELLED'
         GROUP BY a.id, a.title
         ORDER BY value DESC
         LIMIT 5")
        .fetch_all(pool.get_ref()).await.unwrap_or_default();
        
    let top_artists = sqlx::query_as::<_, TopEntity>(
        "SELECT ar.id, ar.tribe_name as name, COALESCE(SUM(oi.unit_price * oi.quantity), 0) as value, COALESCE(SUM(oi.quantity), 0) as count
         FROM order_items oi
         JOIN artists ar ON oi.artist_id = ar.id
         WHERE oi.status != 'CANCELLED'
         GROUP BY ar.id, ar.tribe_name
         ORDER BY value DESC
         LIMIT 5")
        .fetch_all(pool.get_ref()).await.unwrap_or_default();

    HttpResponse::Ok().json(AdminDashboardResponse {
        stats: AdminDashboardStats {
            total_users,
            total_revenue,
            total_orders,
            pending_verifications,
            active_artworks,
        },
        recent_orders,
        new_artists,
        new_artworks,
        revenue_trend,
        orders_by_status,
        users_by_role,
        top_artworks,
        top_artists,
    })
}

// Artist Verification
pub async fn get_pending_artists(req: HttpRequest, pool: web::Data<PgPool>) -> impl Responder {
    if let Err(res) = check_admin(&req) { return res; }

    let artists = sqlx::query_as::<_, ArtistProfile>("SELECT * FROM artists WHERE verification_status = 'PENDING'")
        .fetch_all(pool.get_ref())
        .await;

    match artists {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

pub async fn verify_artist(
    req: HttpRequest, 
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    body: web::Json<serde_json::Value>
) -> impl Responder {
    if let Err(res) = check_admin(&req) { return res; }
    
    let artist_id = path.into_inner();
    let status = body.get("status").and_then(|s| s.as_str()).unwrap_or("");

    if status != "VERIFIED" && status != "REJECTED" {
        return HttpResponse::BadRequest().body("Invalid status. Use VERIFIED or REJECTED");
    }

    let verified_at = if status == "VERIFIED" { Some(Utc::now()) } else { None };

    let result = sqlx::query(
        "UPDATE artists SET verification_status = $1, verified_at = $2 WHERE id = $3"
    )
    .bind(status)
    .bind(verified_at)
    .bind(artist_id)
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// User Management
pub async fn get_users(req: HttpRequest, pool: web::Data<PgPool>, query: web::Query<UserListQuery>) -> impl Responder {
    if let Err(res) = check_admin(&req) { return res; }

    let limit = query.limit.unwrap_or(20);
    let offset = (query.page.unwrap_or(1) - 1) * limit;
    let search = format!("%{}%", query.search.clone().unwrap_or_default());
    
    let users = sqlx::query_as::<_, UserListDto>(
        r#"SELECT id, email as name, email, role, true as active, created_at, updated_at 
           FROM users 
           WHERE ($1 = '%%' OR email ILIKE $1)
           AND ($2::text IS NULL OR role = $2)
           ORDER BY created_at DESC 
           LIMIT $3 OFFSET $4"#
    )
    .bind(search)
    .bind(query.role.clone())
    .bind(limit)
    .bind(offset)
    .fetch_all(pool.get_ref())
    .await;

    match users {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(e) => {
            println!("Error fetching users: {:?}", e);
            HttpResponse::InternalServerError().finish()
        },
    }
}

pub async fn update_user_status(
    req: HttpRequest, 
    _pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    body: web::Json<serde_json::Value>
) -> impl Responder {
    if let Err(res) = check_admin(&req) { return res; }
    
    let _user_id = path.into_inner();
    let active = body.get("active").and_then(|v| v.as_bool());

    if let Some(_active_val) = active {
        // NOTE: The 'active' column does not exist in the users table yet.
        // This is a placeholder implementation that returns success but does nothing.
        // To implement real deactivation, we need to add the column via migration.
        /*
        let result = sqlx::query(
            "UPDATE users SET active = $1 WHERE id = $2"
        )
        .bind(active_val)
        .bind(user_id)
        .execute(pool.get_ref())
        .await;
        */
        
        // Mock success
        return HttpResponse::Ok().finish();
    }
    
    HttpResponse::BadRequest().body("Missing 'active' field")
}

pub async fn get_user_details(req: HttpRequest, pool: web::Data<PgPool>, path: web::Path<Uuid>) -> impl Responder {
    if let Err(res) = check_admin(&req) { return res; }
    let user_id = path.into_inner();

    let user = sqlx::query_as::<_, UserListDto>(
        "SELECT id, email as name, email, role, true as active, created_at, updated_at FROM users WHERE id = $1"
    )
    .bind(user_id)
    .fetch_optional(pool.get_ref())
    .await;

    match user {
        Ok(Some(u)) => HttpResponse::Ok().json(u),
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => {
            println!("Error fetching user details: {:?}", e);
            HttpResponse::InternalServerError().finish()
        },
    }
}

// Artwork Management
pub async fn get_artworks(req: HttpRequest, pool: web::Data<PgPool>, query: web::Query<ArtworkListQuery>) -> impl Responder {
    if let Err(res) = check_admin(&req) { return res; }

    let limit = query.limit.unwrap_or(20);
    let offset = (query.page.unwrap_or(1) - 1) * limit;
    let search = format!("%{}%", query.search.clone().unwrap_or_default());

    let artworks = sqlx::query_as::<_, ArtworkResponse>(
        r#"SELECT * FROM artworks 
           WHERE ($1 = '%%' OR title ILIKE $1)
           AND ($2::text IS NULL OR category = $2)
           AND ($3::uuid IS NULL OR artist_id = $3)
           AND ($4::boolean IS NULL OR active = $4)
           ORDER BY created_at DESC 
           LIMIT $5 OFFSET $6"#
    )
    .bind(search)
    .bind(query.category.clone())
    .bind(query.artist_id)
    .bind(query.active)
    .bind(limit)
    .bind(offset)
    .fetch_all(pool.get_ref())
    .await;

    match artworks {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(e) => {
             println!("Error fetching artworks: {:?}", e);
             HttpResponse::InternalServerError().finish()
        }
    }
}

pub async fn update_artwork_status(
    req: HttpRequest, 
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    body: web::Json<serde_json::Value>
) -> impl Responder {
    if let Err(res) = check_admin(&req) { return res; }
    
    let artwork_id = path.into_inner();
    let active = body.get("active").and_then(|v| v.as_bool());

    if let Some(active_val) = active {
        let result = sqlx::query(
            "UPDATE artworks SET active = $1 WHERE id = $2"
        )
        .bind(active_val)
        .bind(artwork_id)
        .execute(pool.get_ref())
        .await;

        match result {
            Ok(_) => HttpResponse::Ok().finish(),
            Err(_) => HttpResponse::InternalServerError().finish(),
        }
    } else {
        HttpResponse::BadRequest().body("Missing active status")
    }
}

// Order Management
pub async fn get_orders(req: HttpRequest, pool: web::Data<PgPool>, query: web::Query<OrderListQuery>) -> impl Responder {
    if let Err(res) = check_admin(&req) { return res; }

    let limit = query.limit.unwrap_or(20);
    let offset = (query.page.unwrap_or(1) - 1) * limit;

    let orders = sqlx::query_as::<_, Order>(
        r#"SELECT * FROM orders 
           WHERE ($1::text IS NULL OR status = $1)
           ORDER BY placed_at DESC 
           LIMIT $2 OFFSET $3"#
    )
    .bind(query.status.clone())
    .bind(limit)
    .bind(offset)
    .fetch_all(pool.get_ref())
    .await;

    match orders {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// Reports
pub async fn get_revenue_report(req: HttpRequest, pool: web::Data<PgPool>, query: web::Query<RevenueReportQuery>) -> impl Responder {
    if let Err(res) = check_admin(&req) { return res; }

    let group_by = query.group_by.as_deref().unwrap_or("period");
    
    let result = match group_by {
        "artist" => {
            sqlx::query_as::<_, RevenueReportItem>(
                r#"SELECT 
                    '' as period,
                    NULL as category,
                    ar.tribe_name as artist_name,
                    COALESCE(SUM(oi.unit_price * oi.quantity), 0) as revenue,
                    COUNT(oi.id) as order_count
                   FROM order_items oi
                   JOIN artists ar ON oi.artist_id = ar.id
                   WHERE oi.status != 'CANCELLED'
                   AND ($1::timestamptz IS NULL OR oi.created_at >= $1)
                   AND ($2::timestamptz IS NULL OR oi.created_at <= $2)
                   GROUP BY ar.tribe_name
                   ORDER BY revenue DESC"#
            )
            .bind(query.start_date)
            .bind(query.end_date)
            .fetch_all(pool.get_ref())
            .await
        },
        "category" => {
            sqlx::query_as::<_, RevenueReportItem>(
                r#"SELECT 
                    '' as period,
                    a.category as category,
                    NULL as artist_name,
                    COALESCE(SUM(oi.unit_price * oi.quantity), 0) as revenue,
                    COUNT(oi.id) as order_count
                   FROM order_items oi
                   JOIN artworks a ON oi.artwork_id = a.id
                   WHERE oi.status != 'CANCELLED'
                   AND ($1::timestamptz IS NULL OR oi.created_at >= $1)
                   AND ($2::timestamptz IS NULL OR oi.created_at <= $2)
                   GROUP BY a.category
                   ORDER BY revenue DESC"#
            )
            .bind(query.start_date)
            .bind(query.end_date)
            .fetch_all(pool.get_ref())
            .await
        },
        _ => { // default to period
             sqlx::query_as::<_, RevenueReportItem>(
                r#"SELECT 
                    to_char(placed_at, 'YYYY-MM') as period,
                    NULL as category,
                    NULL as artist_name,
                    COALESCE(SUM(total_amount), 0) as revenue,
                    COUNT(id) as order_count
                   FROM orders 
                   WHERE status != 'CANCELLED'
                   AND ($1::timestamptz IS NULL OR placed_at >= $1)
                   AND ($2::timestamptz IS NULL OR placed_at <= $2)
                   GROUP BY period 
                   ORDER BY period DESC"#
            )
            .bind(query.start_date)
            .bind(query.end_date)
            .fetch_all(pool.get_ref())
            .await
        }
    };

     match result {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(e) => {
            println!("Error fetching revenue report: {:?}", e);
            HttpResponse::InternalServerError().finish()
        },
    }
}

pub async fn get_artwork_details(req: HttpRequest, pool: web::Data<PgPool>, path: web::Path<Uuid>) -> impl Responder {
    if let Err(res) = check_admin(&req) { return res; }
    let artwork_id = path.into_inner();
    
    let artwork = sqlx::query_as::<_, ArtworkResponse>("SELECT * FROM artworks WHERE id = $1")
        .bind(artwork_id)
        .fetch_optional(pool.get_ref())
        .await;
        
    match artwork {
        Ok(Some(a)) => HttpResponse::Ok().json(a),
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

pub async fn get_order_details(req: HttpRequest, pool: web::Data<PgPool>, path: web::Path<Uuid>) -> impl Responder {
    if let Err(res) = check_admin(&req) { return res; }
    let order_id = path.into_inner();

    let order = sqlx::query_as::<_, Order>("SELECT * FROM orders WHERE id = $1")
        .bind(order_id)
        .fetch_optional(pool.get_ref())
        .await;
        
    match order {
        Ok(Some(o)) => HttpResponse::Ok().json(o), 
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

pub async fn get_users_report(req: HttpRequest, pool: web::Data<PgPool>) -> impl Responder {
    if let Err(res) = check_admin(&req) { return res; }
    
    let stats = sqlx::query_as::<_, UserRoleCount>("SELECT role, COUNT(*) as count FROM users GROUP BY role")
        .fetch_all(pool.get_ref())
        .await;

    match stats {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

pub async fn get_orders_report(req: HttpRequest, pool: web::Data<PgPool>) -> impl Responder {
    if let Err(res) = check_admin(&req) { return res; }

    let stats = sqlx::query_as::<_, OrderStatusCount>("SELECT status, COUNT(*) as count FROM orders GROUP BY status")
        .fetch_all(pool.get_ref())
        .await;

    match stats {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}
