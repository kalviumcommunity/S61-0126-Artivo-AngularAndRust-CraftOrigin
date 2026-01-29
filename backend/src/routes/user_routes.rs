use actix_web::web;
use crate::handlers::user_handlers::*;

pub fn user_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/users") // Changed to /api/users to be consistent, or keep /users?
            // Assuming /users was legacy or internal. I'll stick to existing /users path but wrap it later in main.
            // Actually, let's keep it consistent with main.rs which uses .configure(user_routes)
            // I'll just leave this as is, but renamed scope if needed.
            // main.rs binds it to root.
            .route("", web::get().to(get_users))
            .route("", web::post().to(create_user))
            .route("/{id}", web::get().to(get_user_by_id))
    );
}
