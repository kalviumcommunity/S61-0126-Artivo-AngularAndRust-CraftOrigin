use actix_web::{web, HttpResponse, HttpMessage};
use sqlx::PgPool;
use uuid::Uuid;
use crate::models::order::{Order, OrderItemDetail, OrderResponse};
use crate::models::user::Claims;
use sqlx::types::Decimal;

pub async fn checkout(
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

    let mut tx = match pool.begin().await {
        Ok(tx) => tx,
        Err(e) => return HttpResponse::InternalServerError().body(format!("DB Error: {}", e)),
    };

    // 1. Get Cart
    let cart_row = sqlx::query!(
        "SELECT id FROM carts WHERE buyer_id = $1",
        buyer_id
    )
    .fetch_optional(&mut *tx)
    .await;

    let cart_id = match cart_row {
        Ok(Some(row)) => row.id,
        Ok(None) => return HttpResponse::BadRequest().body("Cart not found"),
        Err(e) => return HttpResponse::InternalServerError().body(format!("DB Error: {}", e)),
    };

    // 2. Get Cart Items
    let items = match sqlx::query!(
        r#"
        SELECT ci.artwork_id, ci.quantity, ci.unit_price, a.artist_id, a.quantity_available
        FROM cart_items ci
        JOIN artworks a ON ci.artwork_id = a.id
        WHERE ci.cart_id = $1
        "#,
        cart_id
    )
    .fetch_all(&mut *tx)
    .await {
        Ok(i) => i,
        Err(e) => return HttpResponse::InternalServerError().body(format!("DB Error: {}", e)),
    };

    if items.is_empty() {
        return HttpResponse::BadRequest().body("Cart is empty");
    }

    // 3. Validate Inventory and Calculate Total
    let mut total_amount = Decimal::ZERO;
    for item in &items {
        if item.quantity > item.quantity_available {
            return HttpResponse::BadRequest().body(format!("Not enough stock for artwork ID {}", item.artwork_id));
        }
        total_amount += item.unit_price * Decimal::from(item.quantity);
    }

    // 4. Create Order
    let order_id = match sqlx::query_scalar!(
        r#"
        INSERT INTO orders (buyer_id, total_amount, status)
        VALUES ($1, $2, 'PLACED')
        RETURNING id
        "#,
        buyer_id,
        total_amount
    )
    .fetch_one(&mut *tx)
    .await {
        Ok(id) => id,
        Err(e) => return HttpResponse::InternalServerError().body(format!("DB Error: {}", e)),
    };

    // 5. Create Order Items and Update Inventory
    for item in items {
        // Insert Order Item
        let _ = sqlx::query!(
            r#"
            INSERT INTO order_items (order_id, artwork_id, artist_id, quantity, unit_price, status)
            VALUES ($1, $2, $3, $4, $5, 'PLACED')
            "#,
            order_id,
            item.artwork_id,
            item.artist_id,
            item.quantity,
            item.unit_price
        )
        .execute(&mut *tx)
        .await;

        // Decrease Inventory
        let _ = sqlx::query!(
            "UPDATE artworks SET quantity_available = quantity_available - $1 WHERE id = $2",
            item.quantity,
            item.artwork_id
        )
        .execute(&mut *tx)
        .await;
    }

    // 6. Clear Cart
    let _ = sqlx::query!(
        "DELETE FROM cart_items WHERE cart_id = $1",
        cart_id
    )
    .execute(&mut *tx)
    .await;

    // Commit
    if let Err(e) = tx.commit().await {
        return HttpResponse::InternalServerError().body(format!("Transaction Commit Error: {}", e));
    }

    HttpResponse::Ok().json(serde_json::json!({ "order_id": order_id, "message": "Order placed successfully" }))
}

pub async fn get_orders(
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

    let orders = match sqlx::query_as!(
        Order,
        "SELECT * FROM orders WHERE buyer_id = $1 ORDER BY placed_at DESC",
        buyer_id
    )
    .fetch_all(pool.get_ref())
    .await {
        Ok(o) => o,
        Err(e) => return HttpResponse::InternalServerError().body(format!("DB Error: {}", e)),
    };

    HttpResponse::Ok().json(orders)
}

pub async fn get_order_details(
    pool: web::Data<PgPool>,
    req: actix_web::HttpRequest,
    path: web::Path<Uuid>, // order_id
) -> HttpResponse {
    let claims = match req.extensions().get::<Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().finish(),
    };
    let buyer_id = match Uuid::parse_str(&claims.sub) {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().body("Invalid user ID"),
    };
    let order_id = path.into_inner();

    // Verify order belongs to user
    let order_exists = sqlx::query_scalar!(
        "SELECT 1 FROM orders WHERE id = $1 AND buyer_id = $2",
        order_id,
        buyer_id
    )
    .fetch_optional(pool.get_ref())
    .await
    .unwrap_or(None);

    if order_exists.is_none() {
        return HttpResponse::NotFound().body("Order not found or unauthorized");
    }

    let items = match sqlx::query_as!(
        OrderItemDetail,
        r#"
        SELECT 
            oi.id, oi.order_id, oi.artwork_id, oi.artist_id, oi.quantity, oi.unit_price, oi.status,
            a.title, a.image_url, ar.tribe_name as artist_name
        FROM order_items oi
        JOIN artworks a ON oi.artwork_id = a.id
        JOIN artists ar ON oi.artist_id = ar.id
        WHERE oi.order_id = $1
        "#,
        order_id
    )
    .fetch_all(pool.get_ref())
    .await {
        Ok(i) => i,
        Err(e) => return HttpResponse::InternalServerError().body(format!("DB Error: {}", e)),
    };

    let order = match sqlx::query_as!(
        Order,
        "SELECT * FROM orders WHERE id = $1",
        order_id
    )
    .fetch_one(pool.get_ref())
    .await {
        Ok(o) => o,
        Err(e) => return HttpResponse::InternalServerError().body(format!("DB Error: {}", e)),
    };

    HttpResponse::Ok().json(OrderResponse {
        id: order.id,
        buyer_id: order.buyer_id,
        total_amount: order.total_amount,
        status: order.status,
        placed_at: order.placed_at,
        items,
    })
}
