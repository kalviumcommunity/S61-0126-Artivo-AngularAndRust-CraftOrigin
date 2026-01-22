use actix_web::{App, HttpServer , web};
mod routes;
mod handlers;
mod models;
mod config;

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    dotenvy::dotenv().ok();

let database_url = std::env::var("DATABASE_URL")
    .expect("DATABASE_URL not set");

let pool = sqlx::PgPool::connect(&database_url)
    .await
    .expect("Failed to connect to DB");

sqlx::migrate!("./migrations")
    .run(&pool)
    .await
    .expect("Failed to run database migrations");

    HttpServer::new(move|| {
        App::new()
        
            .app_data(web::Data::new(pool.clone()))
            .configure(routes::user_routes::user_routes)
            .configure(routes::health_routes::health_routes)
    })
    
    .bind((std::env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string()), 8080))?
    .run()
    .await
    
}

