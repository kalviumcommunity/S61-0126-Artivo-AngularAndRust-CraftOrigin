use actix_web::{web, HttpResponse, Responder};
use crate::models::user::{CreateUser, UserResponse};
use sqlx::{Pool, Row};

pub async fn get_users(pool: web::Data<Pool<sqlx::Postgres>>) -> impl Responder {
    let rows = sqlx::query("SELECT id, name, email FROM users ORDER BY id")
        .fetch_all(pool.get_ref())
        .await;
    match rows {
        Ok(rows) => {
            let users: Vec<UserResponse> = rows
                .into_iter()
                .map(|r| UserResponse {
                    id: r.get::<i32, _>("id"),
                    name: r.get::<String, _>("name"),
                    email: r.get::<String, _>("email"),
                })
                .collect();
            HttpResponse::Ok().json(users)
        }
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

pub async fn create_user(
    payload: web::Json<CreateUser>,
    pool: web::Data<Pool<sqlx::Postgres>>,
) -> impl Responder {
    let result = sqlx::query("INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id")
        .bind(&payload.name)
        .bind(&payload.email)
        .fetch_one(pool.get_ref())
        .await;
    match result {
        Ok(row) => {
            let id: i32 = row.get("id");
            let user = UserResponse {
                id,
                name: payload.name.clone(),
                email: payload.email.clone(),
            };
            HttpResponse::Created().json(user)
        }
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

pub async fn get_user_by_id(
    path: web::Path<i32>,
    pool: web::Data<Pool<sqlx::Postgres>>,
) -> impl Responder {
    let id = path.into_inner();
    let row = sqlx::query("SELECT id, name, email FROM users WHERE id = $1")
        .bind(id)
        .fetch_one(pool.get_ref())
        .await;
    match row {
        Ok(r) => {
            let user = UserResponse {
                id: r.get::<i32, _>("id"),
                name: r.get::<String, _>("name"),
                email: r.get::<String, _>("email"),
            };
            HttpResponse::Ok().json(user)
        }
        Err(sqlx::Error::RowNotFound) => HttpResponse::NotFound().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}
