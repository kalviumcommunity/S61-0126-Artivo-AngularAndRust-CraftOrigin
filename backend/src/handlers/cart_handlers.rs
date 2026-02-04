use actix_web::{web, HttpResponse, HttpMessage};
use sqlx::PgPool;
use uuid::Uuid;
use crate::models::cart::{Cart, CartItemDetail, AddToCartRequest, CartResponse};
use crate::models::user::Claims;
use sqlx::types::Decimal;

pub async fn get_cart(
    pool: web::Data<PgPool>,
    req: actix_web::HttpRequest,
) -> HttpResponse {
    let claims = match req.extensions().get::<Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().finish(),
    };
    
    let buyer_id = match Uuid::parse_str(&claims.sub) {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().body("Invalid user ID"),
    };

    // 1. Get or Create Cart
    let cart_row = sqlx::query_as!(
        Cart,
        r#"
        INSERT INTO carts (buyer_id)
        VALUES ($1)
        ON CONFLICT (buyer_id) 
        DO UPDATE SET updated_at = now()
        RETURNING *
        "#,
        buyer_id
    )
    .fetch_one(pool.get_ref())
    .await;

    let cart = match cart_row {
        Ok(c) => c,
        Err(e) => return HttpResponse::InternalServerError().body(format!("DB Error: {}", e)),
    };

    // 2. Get Items
    let items_result = sqlx::query_as!(
        CartItemDetail,
        r#"
        SELECT 
            ci.id, ci.cart_id, ci.artwork_id, ci.quantity, ci.unit_price,
            a.title, a.image_url, ar.tribe_name as artist_name
        FROM cart_items ci
        JOIN artworks a ON ci.artwork_id = a.id
        JOIN artists ar ON a.artist_id = ar.id
        WHERE ci.cart_id = $1
        ORDER BY ci.created_at ASC
        "#,
        cart.id
    )
    .fetch_all(pool.get_ref())
    .await;

    let items: Vec<CartItemDetail> = match items_result {
        Ok(i) => i,
        Err(e) => return HttpResponse::InternalServerError().body(format!("DB Error items: {}", e)),
    };

    let total_amount: Decimal = items.iter().map(|i| i.unit_price * Decimal::from(i.quantity)).sum();

    HttpResponse::Ok().json(CartResponse {
        id: cart.id,
        buyer_id: cart.buyer_id,
        items,
        total_amount,
    })
}

pub async fn add_to_cart(
    pool: web::Data<PgPool>,
    req: actix_web::HttpRequest,
    item: web::Json<AddToCartRequest>,
) -> HttpResponse {
    let claims = match req.extensions().get::<Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().finish(),
    };
    let buyer_id = match Uuid::parse_str(&claims.sub) {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().body("Invalid user ID"),
    };

    // Get Cart ID
    let cart_id = match sqlx::query_scalar!(
        "SELECT id FROM carts WHERE buyer_id = $1",
        buyer_id
    )
    .fetch_optional(pool.get_ref())
    .await {
        Ok(Some(id)) => id,
        Ok(None) => {
             match sqlx::query_scalar!(
                "INSERT INTO carts (buyer_id) VALUES ($1) RETURNING id",
                buyer_id
            ).fetch_one(pool.get_ref()).await {
                Ok(id) => id,
                Err(e) => return HttpResponse::InternalServerError().body(format!("DB Error: {}", e)),
            }
        },
        Err(e) => return HttpResponse::InternalServerError().body(format!("DB Error: {}", e)),
    };

    // Get Artwork Price
    let artwork_price = match sqlx::query_scalar!(
        "SELECT price FROM artworks WHERE id = $1",
        item.artwork_id
    )
    .fetch_optional(pool.get_ref())
    .await {
        Ok(Some(p)) => p,
        Ok(None) => return HttpResponse::NotFound().body("Artwork not found"),
        Err(e) => return HttpResponse::InternalServerError().body(format!("DB Error: {}", e)),
    };

    // Insert or Update Item
    let result = sqlx::query!(
        r#"
        INSERT INTO cart_items (cart_id, artwork_id, quantity, unit_price)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (cart_id, artwork_id) 
        DO UPDATE SET quantity = cart_items.quantity + $3, unit_price = $4
        "#,
        cart_id,
        item.artwork_id,
        item.quantity,
        artwork_price
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => get_cart(pool, req).await,
        Err(e) => HttpResponse::InternalServerError().body(format!("DB Error: {}", e)),
    }
}

pub async fn remove_from_cart(
    pool: web::Data<PgPool>,
    req: actix_web::HttpRequest,
    path: web::Path<Uuid>, // artwork_id
) -> HttpResponse {
    let claims = match req.extensions().get::<Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().finish(),
    };
    let buyer_id = match Uuid::parse_str(&claims.sub) {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().body("Invalid user ID"),
    };

    let result = sqlx::query!(
        r#"
        DELETE FROM cart_items 
        WHERE cart_id = (SELECT id FROM carts WHERE buyer_id = $1)
        AND artwork_id = $2
        "#,
        buyer_id,
        path.into_inner()
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => get_cart(pool, req).await,
        Err(e) => HttpResponse::InternalServerError().body(format!("DB Error: {}", e)),
    }
}

pub async fn clear_cart(
    pool: web::Data<PgPool>,
    req: actix_web::HttpRequest,
) -> HttpResponse {
    let claims = match req.extensions().get::<Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().finish(),
    };
    let buyer_id = match Uuid::parse_str(&claims.sub) {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().body("Invalid user ID"),
    };

    let result = sqlx::query!(
        r#"
        DELETE FROM cart_items 
        WHERE cart_id = (SELECT id FROM carts WHERE buyer_id = $1)
        "#,
        buyer_id
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().body("Cart cleared"),
        Err(e) => HttpResponse::InternalServerError().body(format!("DB Error: {}", e)),
    }
}

pub async fn update_cart_item(
    pool: web::Data<PgPool>,
    req: actix_web::HttpRequest,
    path: web::Path<Uuid>, // artwork_id
    body: web::Json<crate::models::cart::UpdateCartItemRequest>,
) -> HttpResponse {
    let claims = match req.extensions().get::<Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().finish(),
    };
    let buyer_id = match Uuid::parse_str(&claims.sub) {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().body("Invalid user ID"),
    };
    let artwork_id = path.into_inner();
    let quantity = body.quantity;

    if quantity < 1 {
         return HttpResponse::BadRequest().body("Quantity must be >= 1");
    }

    let result = sqlx::query!(
        r#"
        UPDATE cart_items 
        SET quantity = $3
        WHERE cart_id = (SELECT id FROM carts WHERE buyer_id = $1)
        AND artwork_id = $2
        "#,
        buyer_id,
        artwork_id,
        quantity
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => get_cart(pool, req).await,
        Err(e) => HttpResponse::InternalServerError().body(format!("DB Error: {}", e)),
    }
}
