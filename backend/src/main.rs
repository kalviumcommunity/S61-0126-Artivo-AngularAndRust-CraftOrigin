use actix_web::{App, HttpServer};
mod routes;
mod handlers;
mod models;
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .configure(routes::user_routes::user_routes)
            .configure(routes::health_routes::health_routes)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}

