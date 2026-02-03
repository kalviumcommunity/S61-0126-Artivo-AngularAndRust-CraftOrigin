use actix_web::web;
use crate::handlers::artist_handlers::{
    register_artist, get_artist_profile, update_artist_profile, get_artist_dashboard,
    get_artist_orders, get_order_detail_for_artist, update_order_item_status
};
use crate::handlers::artwork_handlers::get_my_artworks;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/api/artists/register")
            .route(web::post().to(register_artist))
    );
    cfg.service(
        web::resource("/api/artists/me")
            .route(web::get().to(get_artist_profile))
            .route(web::patch().to(update_artist_profile))
    );
    cfg.service(
        web::resource("/api/artists/me/dashboard")
            .route(web::get().to(get_artist_dashboard))
    );
    cfg.service(
        web::resource("/api/artists/me/orders")
            .route(web::get().to(get_artist_orders))
    );
    cfg.service(
        web::resource("/api/artists/me/orders/{id}")
            .route(web::get().to(get_order_detail_for_artist))
    );
    cfg.service(
        web::resource("/api/artists/me/order-items/{id}/status")
            .route(web::patch().to(update_order_item_status))
    );
    cfg.service(
        web::resource("/api/artists/me/artworks")
            .route(web::get().to(get_my_artworks))
            .route(web::post().to(crate::handlers::artwork_handlers::create_artwork))
    );
}
