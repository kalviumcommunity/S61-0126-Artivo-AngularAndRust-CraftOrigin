use actix_web::web;
use crate::handlers::order_handlers::*;

pub fn order_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/orders")
            .route("", web::get().to(get_orders))
            .route("", web::post().to(checkout)) // Checkout creates an order
            .route("/{id}", web::get().to(get_order_details))
    );
}
