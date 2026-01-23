use actix_web::{web, HttpResponse, Responder};
use sqlx::Pool;
use uuid::Uuid;
use crate::models::artwork::{CreateArtworkRequest, UpdateArtworkRequest};
use crate::services::artwork_service;

fn map_error(e: artwork_service::ServiceError) -> HttpResponse {
    match e {
        artwork_service::ServiceError::NotFound => HttpResponse::NotFound().finish(),
        artwork_service::ServiceError::BadRequest(msg) => HttpResponse::BadRequest().body(msg),
        artwork_service::ServiceError::Db(_) => HttpResponse::InternalServerError().finish(),
    }
}

pub async fn create_artwork(
    pool: web::Data<Pool<sqlx::Postgres>>,
    payload: web::Json<CreateArtworkRequest>,
) -> impl Responder {
    match artwork_service::create_artwork(pool.get_ref(), payload.into_inner()).await {
        Ok(row) => HttpResponse::Created().json(row),
        Err(e) => map_error(e),
    }
}

pub async fn list_artworks(
    pool: web::Data<Pool<sqlx::Postgres>>,
) -> impl Responder {
    match artwork_service::list_artworks(pool.get_ref()).await {
        Ok(rows) => HttpResponse::Ok().json(rows),
        Err(e) => map_error(e),
    }
}

pub async fn get_artwork(
    pool: web::Data<Pool<sqlx::Postgres>>,
    path: web::Path<Uuid>,
) -> impl Responder {
    match artwork_service::get_artwork(pool.get_ref(), path.into_inner()).await {
        Ok(row) => HttpResponse::Ok().json(row),
        Err(e) => map_error(e),
    }
}

pub async fn update_artwork(
    pool: web::Data<Pool<sqlx::Postgres>>,
    path: web::Path<Uuid>,
    payload: web::Json<UpdateArtworkRequest>,
) -> impl Responder {
    match artwork_service::update_artwork(pool.get_ref(), path.into_inner(), payload.into_inner()).await {
        Ok(row) => HttpResponse::Ok().json(row),
        Err(e) => map_error(e),
    }
}

pub async fn delete_artwork(
    pool: web::Data<Pool<sqlx::Postgres>>,
    path: web::Path<Uuid>,
) -> impl Responder {
    match artwork_service::soft_delete_artwork(pool.get_ref(), path.into_inner()).await {
        Ok(()) => HttpResponse::NoContent().finish(),
        Err(e) => map_error(e),
    }
}
