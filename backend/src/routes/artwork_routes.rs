use actix_web::web;
use crate::handlers::artwork_handlers::*;

pub fn public_artwork_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/artworks")
            .route("", web::get().to(list_artworks))
            // Enforce UUID format to allow specific paths like "me" to pass through to other route configs
            .route("/{id:[0-9a-fA-F\\-]{36}}", web::get().to(get_artwork))
    );
}

pub fn protected_artwork_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/artworks")
            .route("", web::post().to(create_artwork))
            .route("/me", web::get().to(get_my_artworks))
            .route("/{id}", web::patch().to(update_artwork)) // Using PATCH as per requirements (or PUT)
            .route("/{id}", web::delete().to(delete_artwork))
            .route("/{id}/toggle-active", web::patch().to(toggle_artwork_active))
    );
}
