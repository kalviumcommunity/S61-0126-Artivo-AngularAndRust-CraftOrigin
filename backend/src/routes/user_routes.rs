use actix_web::web;
use crate::handlers::user_handlers::*;

pub fn user_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/users")
            .route("", web::get().to(get_users))
            .route("", web::post().to(create_user))
            .route("/{id}", web::get().to(get_user_by_id))
    );
}
