use actix_web::web;
use crate::handlers::admin_handlers;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/admin")
            .route("/dashboard", web::get().to(admin_handlers::get_dashboard))
            .route("/artists/pending", web::get().to(admin_handlers::get_pending_artists))
            .route("/artists/{id}/verify", web::patch().to(admin_handlers::verify_artist))
            .route("/users", web::get().to(admin_handlers::get_users))
            .route("/users/{id}", web::get().to(admin_handlers::get_user_details))
            .route("/users/{id}/status", web::patch().to(admin_handlers::update_user_status))
            .route("/artworks", web::get().to(admin_handlers::get_artworks))
            .route("/artworks/{id}", web::get().to(admin_handlers::get_artwork_details))
            .route("/artworks/{id}/status", web::patch().to(admin_handlers::update_artwork_status))
            .route("/orders", web::get().to(admin_handlers::get_orders))
            .route("/orders/{id}", web::get().to(admin_handlers::get_order_details))
            .route("/reports/revenue", web::get().to(admin_handlers::get_revenue_report))
            .route("/reports/users", web::get().to(admin_handlers::get_users_report))
            .route("/reports/orders", web::get().to(admin_handlers::get_orders_report))
    );
}
