use actix_web::web;
use crate::handlers::cart_handlers::*;

pub fn cart_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/cart")
            .route("", web::get().to(get_cart))
            .route("", web::post().to(add_to_cart))
            .route("", web::delete().to(clear_cart))
            .route("/{artwork_id}", web::put().to(update_cart_item))
            .route("/{artwork_id}", web::delete().to(remove_from_cart))
    );
}
