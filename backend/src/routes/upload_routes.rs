use actix_web::web;
use crate::handlers::upload_handler;

pub fn upload_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/upload")
            .route("", web::post().to(upload_handler::upload_image))
    );
}
