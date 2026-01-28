use actix_web::web;
use crate::handlers::artwork_handlers::*;

pub fn artwork_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/artworks")
            .route("", web::get().to(list_artworks))
            .route("", web::post().to(create_artwork))
            .route("/{id}", web::get().to(get_artwork))
            .route("/{id}", web::put().to(update_artwork))
            .route("/{id}", web::delete().to(delete_artwork))
    );
}
