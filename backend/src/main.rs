use actix_web::{App, HttpServer , web};
use sqlx::postgres::PgPoolOptions;
use std::time::Duration;
mod routes;
mod handlers;
mod models;
mod config;
mod services;

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

    HttpServer::new(move|| {
        App::new()
        
            .app_data(web::Data::new(pool.clone()))
            .configure(routes::user_routes::user_routes)
            .configure(routes::health_routes::health_routes)
            .configure(routes::artwork_routes::artwork_routes)
    })
    
    .bind((std::env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string()), 8080))?
    .run()
    .await
    
}

