use actix_web::{web, HttpResponse, Responder};
use crate::models::user::{CreateUser, UserResponse};

pub async fn get_users() -> impl Responder {
    let users = vec![
        UserResponse {
            id: 1,
            name: "Alex".to_string(),
            email: "alex@test.com".to_string(),
        }
    ];

    HttpResponse::Ok().json(users)
}

pub async fn create_user(
    payload: web::Json<CreateUser>,
) -> impl Responder {
    let user = UserResponse {
        id: 1,
        name: payload.name.clone(),
        email: payload.email.clone(),
    };

    HttpResponse::Created().json(user)
}

pub async fn get_user_by_id(
    path: web::Path<i32>,
) -> impl Responder {
    let id = path.into_inner();

    let user = UserResponse {
        id,
        name: "Demo User".to_string(),
        email: "demo@test.com".to_string(),
    };

    HttpResponse::Ok().json(user)
}
