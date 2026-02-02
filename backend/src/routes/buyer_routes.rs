use actix_web::web;
use crate::handlers::buyer_handlers::{get_profile, update_profile};

pub fn buyer_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/buyer")
            .route("/profile", web::get().to(get_profile))
            .route("/profile", web::put().to(update_profile)),
    );
}