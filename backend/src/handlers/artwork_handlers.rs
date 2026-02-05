use actix_web::{web, HttpResponse, Responder, HttpMessage, HttpRequest};
use sqlx::{Pool, Postgres, Row};
use uuid::Uuid;
use crate::models::{
    artwork::{CreateArtworkRequest, CreateArtworkDto, UpdateArtworkRequest, ArtworkListQuery},
    user::Claims,
};
use crate::services::artwork_service;

fn map_error(e: artwork_service::ServiceError) -> HttpResponse {
    match e {
        artwork_service::ServiceError::NotFound => HttpResponse::NotFound().finish(),
        artwork_service::ServiceError::BadRequest(msg) => HttpResponse::BadRequest().body(msg),
        artwork_service::ServiceError::Db(_) => HttpResponse::InternalServerError().finish(),
    }
}

async fn get_artist_id(pool: &Pool<Postgres>, user_id: Uuid) -> Result<Uuid, HttpResponse> {
    let artist = sqlx::query("SELECT id, verification_status FROM artists WHERE user_id = $1")
        .bind(user_id)
        .fetch_optional(pool)
        .await
        .map_err(|e| {
            eprintln!("Db error: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"message": "Database error"}))
        })?;

    match artist {
        Some(row) => {
            let status: String = row.get("verification_status");
            if status != "VERIFIED" {
                return Err(HttpResponse::Forbidden().json(serde_json::json!({"message": "Artist not verified"})));
            }
            Ok(row.get("id"))
        }
        None => Err(HttpResponse::Forbidden().json(serde_json::json!({"message": "Not an artist"}))),
    }
}

pub async fn create_artwork(
    req: HttpRequest,
    pool: web::Data<Pool<Postgres>>,
    payload: web::Json<CreateArtworkDto>,
) -> impl Responder {
    let claims = match req.extensions().get::<Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"message": "Unauthorized"})),
    };
    let user_id = Uuid::parse_str(&claims.sub).unwrap();

    let artist_id = match get_artist_id(pool.get_ref(), user_id).await {
        Ok(id) => id,
        Err(res) => return res,
    };

    let service_req = CreateArtworkRequest {
        artist_id,
        title: payload.title.clone(),
        description: payload.description.clone(),
        category: payload.category.clone(),
        price: payload.price,
        quantity_available: payload.quantity_available,
        authenticity_ref: payload.authenticity_ref.clone(),
        image_url: payload.image_url.clone(),
    };

    match artwork_service::create_artwork(pool.get_ref(), service_req).await {
        Ok(row) => HttpResponse::Created().json(row),
        Err(e) => map_error(e),
    }
}

pub async fn list_artworks(
    pool: web::Data<Pool<Postgres>>,
    query: web::Query<ArtworkListQuery>,
) -> impl Responder {
    match artwork_service::list_artworks(pool.get_ref(), query.into_inner()).await {
        Ok(rows) => HttpResponse::Ok().json(rows),
        Err(e) => map_error(e),
    }
}

pub async fn get_my_artworks(
    req: HttpRequest,
    pool: web::Data<Pool<Postgres>>,
    query: web::Query<ArtworkListQuery>, // Reuse query struct for sorting/filtering
) -> impl Responder {
    let claims = match req.extensions().get::<Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"message": "Unauthorized"})),
    };
    let user_id = Uuid::parse_str(&claims.sub).unwrap();

    // Don't need verification strictly to list own artworks, but maybe?
    // Let's just get artist_id without checking verification strictly for LISTING (artist might want to see their pending items),
    // but requirements say "Artwork Management (Verified Artists Only)".
    // I'll stick to verified for now, or just check existence.
    // Actually, "Artist must be VERIFIED" is under "Rules".
    
    let artist_id = match get_artist_id(pool.get_ref(), user_id).await {
        Ok(id) => id,
        Err(res) => return res,
    };

    // We can reuse list_artworks service but force artist_id
    let mut q = query.into_inner();
    q.artist_id = Some(artist_id);
    // Artist wants to see all their artworks (active and inactive)
    q.include_all = true;
    
    match artwork_service::list_artworks(pool.get_ref(), q).await {
        Ok(rows) => HttpResponse::Ok().json(rows),
        Err(e) => map_error(e),
    }
}

pub async fn get_artwork(
    pool: web::Data<Pool<Postgres>>,
    path: web::Path<Uuid>,
) -> impl Responder {
    match artwork_service::get_artwork(pool.get_ref(), path.into_inner()).await {
        Ok(row) => HttpResponse::Ok().json(row),
        Err(e) => map_error(e),
    }
}

pub async fn update_artwork(
    req: HttpRequest,
    pool: web::Data<Pool<Postgres>>,
    path: web::Path<Uuid>,
    payload: web::Json<UpdateArtworkRequest>,
) -> impl Responder {
    let claims = match req.extensions().get::<Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"message": "Unauthorized"})),
    };
    let user_id = Uuid::parse_str(&claims.sub).unwrap();
    let artwork_id = path.into_inner();

    let artist_id = match get_artist_id(pool.get_ref(), user_id).await {
        Ok(id) => id,
        Err(res) => return res,
    };

    // Check ownership
    let is_owner = sqlx::query("SELECT id FROM artworks WHERE id = $1 AND artist_id = $2")
        .bind(artwork_id)
        .bind(artist_id)
        .fetch_optional(pool.get_ref())
        .await
        .unwrap_or(None);

    if is_owner.is_none() {
        return HttpResponse::Forbidden().json(serde_json::json!({"message": "Not authorized to update this artwork"}));
    }

    match artwork_service::update_artwork(pool.get_ref(), artwork_id, payload.into_inner()).await {
        Ok(row) => HttpResponse::Ok().json(row),
        Err(e) => map_error(e),
    }
}

pub async fn delete_artwork(
    req: HttpRequest,
    pool: web::Data<Pool<Postgres>>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let claims = match req.extensions().get::<Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"message": "Unauthorized"})),
    };
    let user_id = Uuid::parse_str(&claims.sub).unwrap();
    let artwork_id = path.into_inner();

    let artist_id = match get_artist_id(pool.get_ref(), user_id).await {
        Ok(id) => id,
        Err(res) => return res,
    };

    // Check ownership
    let is_owner = sqlx::query("SELECT id FROM artworks WHERE id = $1 AND artist_id = $2")
        .bind(artwork_id)
        .bind(artist_id)
        .fetch_optional(pool.get_ref())
        .await
        .unwrap_or(None);

    if is_owner.is_none() {
        return HttpResponse::Forbidden().json(serde_json::json!({"message": "Not authorized to delete this artwork"}));
    }

    // Check active orders
    // "Cannot delete artwork with active orders"
    // Active orders: items in orders that are not DELIVERED (or CANCELLED).
    // Statuses: PLACED, PROCESSING, SHIPPED.
    let active_orders = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM order_items WHERE artwork_id = $1 AND status IN ('PLACED', 'PROCESSING', 'SHIPPED')"
    )
    .bind(artwork_id)
    .fetch_one(pool.get_ref())
    .await
    .unwrap_or(0);

    if active_orders > 0 {
        return HttpResponse::Conflict().json(serde_json::json!({"message": "Cannot delete artwork with active orders"}));
    }

    match artwork_service::soft_delete_artwork(pool.get_ref(), artwork_id).await {
        Ok(()) => HttpResponse::NoContent().finish(),
        Err(e) => map_error(e),
    }
}

pub async fn toggle_artwork_active(
    req: HttpRequest,
    pool: web::Data<Pool<Postgres>>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let claims = match req.extensions().get::<Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"message": "Unauthorized"})),
    };
    let user_id = Uuid::parse_str(&claims.sub).unwrap();
    let artwork_id = path.into_inner();

    let artist_id = match get_artist_id(pool.get_ref(), user_id).await {
        Ok(id) => id,
        Err(res) => return res,
    };

    // Check ownership
    let is_owner = sqlx::query("SELECT id FROM artworks WHERE id = $1 AND artist_id = $2")
        .bind(artwork_id)
        .bind(artist_id)
        .fetch_optional(pool.get_ref())
        .await
        .unwrap_or(None);

    if is_owner.is_none() {
        return HttpResponse::Forbidden().json(serde_json::json!({"message": "Not authorized"}));
    }

    // Toggle
    let result = sqlx::query("UPDATE artworks SET active = NOT active WHERE id = $1 RETURNING active")
        .bind(artwork_id)
        .fetch_one(pool.get_ref())
        .await;

    match result {
        Ok(row) => {
            let new_status: bool = row.get("active");
            HttpResponse::Ok().json(serde_json::json!({"active": new_status}))
        },
        Err(e) => {
            eprintln!("Toggle error: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"message": "Database error"}))
        }
    }
}
