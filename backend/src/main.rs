use actix_web::{App, HttpServer , web};
use actix_cors::Cors;
use sqlx::postgres::PgPoolOptions;
use std::time::Duration;
mod routes;
mod handlers;
mod models;
mod config;
mod services;
mod middleware;

use middleware::auth_middleware::Auth;

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    dotenvy::dotenv().ok();

let database_url = std::env::var("DATABASE_URL")
    .expect("DATABASE_URL not set");

let pool = {
    let mut attempts = 0;
    loop {
        match PgPoolOptions::new()
            .max_connections(5)
            .acquire_timeout(Duration::from_secs(5))
            .connect(&database_url)
            .await
        {
            Ok(p) => break p,
            Err(_) if attempts < 10 => {
                attempts += 1;
                tokio::time::sleep(Duration::from_secs(1)).await;
            }
            Err(e) => panic!("Failed to connect to DB: {}", e),
        }
    }
};

sqlx::migrate!("./migrations")
    .run(&pool)
    .await
    .expect("Failed to run database migrations");

    // Ensure static/uploads directory exists
    std::fs::create_dir_all("./static/uploads")?;

    println!("🚀 Starting server on http://127.0.0.1:8080");
    println!("📡 CORS enabled for development");
    println!("🔗 Auth endpoints: POST /api/auth/register, POST /api/auth/login");

    HttpServer::new(move|| {
        // CORS configuration
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .supports_credentials()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
            .service(actix_files::Files::new("/static", "./static").show_files_listing())
            
            // Public Routes
            .configure(routes::health_routes::health_routes)
            .configure(routes::auth_routes::auth_routes)
            .configure(routes::artwork_routes::public_artwork_routes)

            // Protected Routes (require Authentication)
            .service(
                web::scope("")
                    .wrap(Auth)
                    .configure(routes::user_routes::user_routes)
                    .configure(routes::artwork_routes::protected_artwork_routes)
                    .configure(routes::upload_routes::upload_routes)
                    .configure(routes::cart_routes::cart_routes)
                    .configure(routes::order_routes::order_routes)
                    .configure(routes::buyer_routes::buyer_routes)
                    .configure(routes::artist_routes::config)
                    .configure(routes::admin_routes::config)
            )
    })
    
    .bind((std::env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string()), 8080))?
    .run()
    .await
    
}
