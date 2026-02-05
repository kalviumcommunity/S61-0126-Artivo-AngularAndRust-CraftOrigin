use actix_web::{web, guard};
use crate::handlers::artwork_handlers::*;
use crate::middleware::auth_middleware::Auth;

pub fn artwork_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/artworks")
            // 1. /me endpoint (Protected) - Must be defined before /{id} to avoid capturing
            .service(
                web::resource("/me")
                    .wrap(Auth)
                    .route(web::get().to(get_my_artworks))
            )
            
            // 2. Collection Root (Mixed)
            .route("", web::get().to(list_artworks))
            .service(
                web::resource("")
                    .wrap(Auth)
                    .route(web::post().to(create_artwork))
            )

            // 3. Public GET /{id}
            .service(
                web::resource("/{id}")
                    .guard(guard::Get())
                    .to(get_artwork)
            )

            // 4. Protected /{id}/toggle-active
            .service(
                web::resource("/{id}/toggle-active")
                    .wrap(Auth)
                    .route(web::patch().to(toggle_artwork_active))
            )

            // 5. Protected /{id} - PATCH/DELETE
            // Note: This must come AFTER public GET /{id} or use distinct guards
            .service(
                web::resource("/{id}")
                    .wrap(Auth)
                    .route(web::patch().to(update_artwork))
                    .route(web::delete().to(delete_artwork))
            )
    );
}
