use actix_web::{web, HttpResponse, HttpMessage};
use sqlx::PgPool;
use uuid::Uuid;
use crate::models::user::{UserResponse, Claims};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct UpdateProfileRequest {
    pub name: String,
}

pub async fn get_profile(
    pool: web::Data<PgPool>,
    req: actix_web::HttpRequest,
) -> HttpResponse {
    let claims = match req.extensions().get::<Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().finish(),
    };
    
    let user_id = match Uuid::parse_str(&claims.sub) {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().body("Invalid user ID"),
    };

    let row = sqlx::query!(
        "SELECT id, name, email, role FROM users WHERE id = $1",
        user_id
    )
    .fetch_optional(pool.get_ref())
    .await;

    match row {
        Ok(Some(r)) => {
            let user = UserResponse {
                id: r.id,
                name: r.name,
                email: r.email,
                role: r.role,
            };
            HttpResponse::Ok().json(user)
        }
        Ok(None) => HttpResponse::NotFound().body("User not found"),
        Err(e) => HttpResponse::InternalServerError().body(format!("DB Error: {}", e)),
    }
}

pub async fn update_profile(
    pool: web::Data<PgPool>,
    req: actix_web::HttpRequest,
    body: web::Json<UpdateProfileRequest>,
) -> HttpResponse {
    let claims = match req.extensions().get::<Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().finish(),
    };

    let user_id = match Uuid::parse_str(&claims.sub) {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().body("Invalid user ID"),
    };

    let result = sqlx::query!(
        "UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role",
        body.name,
        user_id
    )
    .fetch_optional(pool.get_ref())
    .await;

    match result {
        Ok(Some(r)) => {
            let user = UserResponse {
                id: r.id,
                name: r.name,
                email: r.email,
                role: r.role,
            };
            HttpResponse::Ok().json(user)
        }
        Ok(None) => HttpResponse::NotFound().body("User not found"),
        Err(e) => HttpResponse::InternalServerError().body(format!("DB Error: {}", e)),
    }
}
